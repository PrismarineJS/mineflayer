const Vec3 = require('vec3').Vec3
const assert = require('assert')
const Painting = require('../painting')
const Location = require('../location')
const { callbackify, sleep } = require('../promise_utils')

const { OctahedronIterator } = require('prismarine-world').iterators

module.exports = inject

const paintingFaceToVec = [
  new Vec3(0, 0, -1),
  new Vec3(-1, 0, 0),
  new Vec3(0, 0, 1),
  new Vec3(1, 0, 0)
]

const dimensionNames = {
  '-1': 'minecraft:nether',
  0: 'minecraft:overworld',
  1: 'minecraft:end'
}

function inject (bot, { version, storageBuilder }) {
  const nbt = require('prismarine-nbt')
  const Block = require('prismarine-block')(version)
  const Chunk = require('prismarine-chunk')(version)
  const ChatMessage = require('prismarine-chat')(version)
  const World = require('prismarine-world')(version)
  const signs = {}
  const paintingsByPos = {}
  const paintingsById = {}

  const blockEntities = new Map()

  function addPainting (painting) {
    paintingsById[painting.id] = painting
    paintingsByPos[painting.position] = painting
  }

  function deletePainting (painting) {
    delete paintingsById[painting.id]
    delete paintingsByPos[painting.position]
  }

  function addBlockEntity (nbtData) {
    const blockEntity = nbt.simplify(nbtData)
    const absolutePoint = new Vec3(blockEntity.x, blockEntity.y, blockEntity.z)
    const loc = new Location(absolutePoint)
    // Set raw nbt of blockEntity
    blockEntity.raw = nbtData
    // Handle signs
    if (blockEntity.id === 'minecraft:sign' || blockEntity.id === 'Sign') {
      const prepareJson = (i) => {
        const data = blockEntity[`Text${i}`]

        if (data === null || data === '') return ''

        const json = JSON.parse(data)
        if (json === null || !('text' in json)) return ''

        json.text = json.text.replace(/^"|"$/g, '')
        return json
      }

      blockEntity.Text1 = new ChatMessage(prepareJson(1))
      blockEntity.Text2 = new ChatMessage(prepareJson(2))
      blockEntity.Text3 = new ChatMessage(prepareJson(3))
      blockEntity.Text4 = new ChatMessage(prepareJson(4))

      signs[loc.floored] = [
        blockEntity.Text1.toString(),
        blockEntity.Text2.toString(),
        blockEntity.Text3.toString(),
        blockEntity.Text4.toString()
      ].join('\n')
    }

    blockEntities[loc.floored] = blockEntity
  }

  function delColumn (chunkX, chunkZ) {
    const columnCorner = new Vec3(chunkX * 16, 0, chunkZ * 16)
    bot.world.unloadColumn(chunkX, chunkZ)
    bot.emit('chunkColumnUnload', columnCorner)
  }

  function addColumn (args) {
    const columnCorner = new Vec3(args.x * 16, 0, args.z * 16)
    if (!args.bitMap) {
      // stop storing the chunk column
      delColumn(args.x, args.z)
      return
    }
    let column = bot.world.getColumn(args.x, args.z)
    if (!column) {
      column = new Chunk()
      bot.world.setColumn(args.x, args.z, column)
    }

    try {
      column.load(args.data, args.bitMap, args.skyLightSent, args.groundUp)
      if (args.biomes !== undefined) {
        column.loadBiomes(args.biomes)
      }
    } catch (e) {
      bot.emit('error', e)
      return
    }

    bot.emit('chunkColumnLoad', columnCorner)
  }

  async function waitForChunksToLoad () {
    // check 5x5 chunks around us
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        if (bot.world.getColumnAt(bot.entity.position.plus(new Vec3(x, 0, y).scaled(16))) == null) {
          // keep wait
          await sleep(100)
          await waitForChunksToLoad()
        }
      }
    }
  }

  function getMatchingFunction (matching) {
    if (typeof (matching) !== 'function') {
      if (!Array.isArray(matching)) {
        matching = [matching]
      }
      return isMatchingType
    }
    return matching

    function isMatchingType (block) {
      return block === null ? false : matching.indexOf(block.type) >= 0
    }
  }

  function isBlockInSection (section, matcher) {
    if (!section) return false // section is empty, skip it (yay!)
    // If the chunk use a palette we can speed up the search by first
    // checking the palette which usually contains less than 20 ids
    // vs checking the 4096 block of the section. If we don't have a
    // match in the palette, we can skip this section.
    if (section.palette) {
      for (const stateId of section.palette) {
        if (matcher(Block.fromStateId(stateId, 0))) {
          return true // the block is in the palette
        }
      }
      return false // skip
    }
    return true // global palette, the block might be in there
  }

  function getFullMatchingFunction (matcher, useExtraInfo) {
    if (typeof (useExtraInfo) === 'boolean') {
      return fullSearchMatcher
    }

    return nonFullSearchMatcher

    function nonFullSearchMatcher (point) {
      const block = blockAt(point, true)
      return matcher(block) && useExtraInfo(block)
    }

    function fullSearchMatcher (point) {
      return matcher(bot.blockAt(point, useExtraInfo))
    }
  }

  bot.findBlocks = (options) => {
    const matcher = getMatchingFunction(options.matching)
    const point = (options.point || bot.entity.position).floored()
    const maxDistance = options.maxDistance || 16
    const count = options.count || 1
    const useExtraInfo = options.useExtraInfo || false
    const fullMatcher = getFullMatchingFunction(matcher, useExtraInfo)
    const start = new Vec3(Math.floor(point.x / 16), Math.floor(point.y / 16), Math.floor(point.z / 16))
    const it = new OctahedronIterator(start, Math.ceil((maxDistance + 8) / 16))
    // the octahedron iterator can sometime go through the same section again
    // we use a set to keep track of visited sections
    const visitedSections = new Set()

    let blocks = []
    let startedLayer = 0
    let next = start
    while (next) {
      const column = bot.world.getColumn(next.x, next.z)
      if (next.y >= 0 && next.y < 16 && column && !visitedSections.has(next.toString())) {
        const section = column.sections[next.y]
        if (useExtraInfo === true || isBlockInSection(section, matcher)) {
          const cursor = new Vec3(0, 0, 0)
          for (cursor.x = next.x * 16; cursor.x < next.x * 16 + 16; cursor.x++) {
            for (cursor.y = next.y * 16; cursor.y < next.y * 16 + 16; cursor.y++) {
              for (cursor.z = next.z * 16; cursor.z < next.z * 16 + 16; cursor.z++) {
                if (fullMatcher(cursor) && cursor.distanceTo(point) <= maxDistance) blocks.push(cursor.clone())
              }
            }
          }
        }
        visitedSections.add(next.toString())
      }
      // If we started a layer, we have to finish it otherwise we might miss closer blocks
      if (startedLayer !== it.apothem && blocks.length >= count) {
        break
      }
      startedLayer = it.apothem
      next = it.next()
    }
    blocks.sort((a, b) => {
      return a.distanceTo(point) - b.distanceTo(point)
    })
    // We found more blocks than needed, shorten the array to not confuse people
    if (blocks.length > count) {
      blocks = blocks.slice(0, count)
    }
    return blocks
  }

  function findBlock (options) {
    const blocks = bot.findBlocks(options)
    if (blocks.length === 0) return null
    return bot.blockAt(blocks[0])
  }

  function blockAt (absolutePoint, extraInfos = true) {
    const loc = new Location(absolutePoint)

    const block = bot.world.getBlock(absolutePoint)
    // null block means chunk not loaded
    if (!block) return null

    block.position = loc.floored
    if (extraInfos) {
      block.signText = signs[loc.floored]
      block.painting = paintingsByPos[loc.floored]
      block.blockEntity = blockEntities[loc.floored]
    }

    return block
  }

  function blockIsNotEmpty (pos) {
    const block = bot.blockAt(pos, false)
    return block !== null && block.boundingBox !== 'empty'
  }

  // maybe this should be moved to math.js instead?
  function visiblePosition (a, b) {
    let v = b.minus(a)
    const t = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    v = v.scaled(1 / t)
    v = v.scaled(1 / 5)
    const u = t * 5
    let na
    for (let i = 1; i < u; i++) {
      na = a.plus(v)
      // check that blocks don't inhabit the same position
      if (!na.floored().equals(a.floored())) {
        // check block is not transparent
        if (blockIsNotEmpty(na)) return false
      }
      a = na
    }
    return true
  }

  // if passed in block is within line of sight to the bot, returns true
  // also works on anything with a position value
  function canSeeBlock (block) {
    // this emits a ray from the center of the bots body to the block
    if (visiblePosition(bot.entity.position.offset(0, bot.entity.height * 0.5, 0), block.position)) {
      return true
    }
    return false
  }

  function emitBlockUpdate (oldBlock, newBlock) {
    bot.emit('blockUpdate', oldBlock, newBlock)
    const position = oldBlock
      ? oldBlock.position
      : (newBlock ? newBlock.position : null)
    if (position) bot.emit(`blockUpdate:${newBlock.position}`, oldBlock, newBlock)
  }

  bot._client.on('unload_chunk', (packet) => {
    delColumn(packet.chunkX, packet.chunkZ)
  })

  function updateBlockState (point, stateId) {
    const oldBlock = blockAt(point)
    const loc = new Location(point)
    bot.world.setBlockStateId(point, stateId)

    const newBlock = blockAt(point)
    // sometimes minecraft server sends us block updates before it sends
    // us the column that the block is in. ignore this.
    if (newBlock === null) {
      return
    }
    if (oldBlock.type !== newBlock.type) {
      delete blockEntities[loc.floored]
      delete signs[loc.floored]

      const painting = paintingsByPos[loc.floored]
      if (painting) deletePainting(painting)
    }

    emitBlockUpdate(oldBlock, newBlock)
  }

  bot._client.on('update_light', (packet) => {
    let column = bot.world.getColumn(packet.chunkX, packet.chunkZ)
    if (!column) {
      column = new Chunk()
      bot.world.setColumn(packet.chunkX, packet.chunkZ, column)
    }

    column.loadLight(packet.data, packet.skyLightMask, packet.blockLightMask, packet.emptySkyLightMask, packet.emptyBlockLightMask)
  })

  bot._client.on('map_chunk', (packet) => {
    addColumn({
      x: packet.x,
      z: packet.z,
      bitMap: packet.bitMap,
      heightmaps: packet.heightmaps,
      biomes: packet.biomes,
      skyLightSent: bot.game.dimension === 'minecraft:overworld',
      groundUp: packet.groundUp,
      data: packet.chunkData
    })

    if (typeof packet.blockEntities !== 'undefined') {
      for (const nbtData of packet.blockEntities) {
        addBlockEntity(nbtData)
      }
    }
  })

  bot._client.on('map_chunk_bulk', (packet) => {
    let offset = 0
    let meta
    let i
    let size
    for (i = 0; i < packet.meta.length; ++i) {
      meta = packet.meta[i]
      size = (8192 + (packet.skyLightSent ? 2048 : 0)) *
        onesInShort(meta.bitMap) + // block ids
        2048 * onesInShort(meta.bitMap) + // (two bytes per block id)
        256 // biomes
      addColumn({
        x: meta.x,
        z: meta.z,
        bitMap: meta.bitMap,
        heightmaps: packet.heightmaps,
        skyLightSent: packet.skyLightSent,
        groundUp: true,
        data: packet.data.slice(offset, offset + size)
      })
      offset += size
    }

    assert.strictEqual(offset, packet.data.length)
  })

  bot._client.on('multi_block_change', (packet) => {
    // multi block change
    for (let i = 0; i < packet.records.length; ++i) {
      const record = packet.records[i]

      let blockX, blockY, blockZ
      if (bot.supportFeature('usesMultiblockSingleLong')) {
        blockZ = (record >> 4) & 0x0f
        blockX = (record >> 8) & 0x0f
        blockY = record & 0x0f
      } else {
        blockZ = record.horizontalPos & 0x0f
        blockX = (record.horizontalPos >> 4) & 0x0f
        blockY = record.y
      }

      let pt
      if (bot.supportFeature('usesMultiblock3DChunkCoords')) {
        pt = new Vec3(packet.chunkCoordinates.x, packet.chunkCoordinates.y, packet.chunkCoordinates.z)
      } else {
        pt = new Vec3(packet.chunkX, 0, packet.chunkZ)
      }

      pt = pt.scale(16).offset(blockX, blockY, blockZ)

      if (bot.supportFeature('usesMultiblockSingleLong')) {
        updateBlockState(pt, record >> 12)
      } else {
        updateBlockState(pt, record.blockId)
      }
    }
  })

  bot._client.on('block_change', (packet) => {
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    updateBlockState(pt, packet.type)
  })

  bot._client.on('explosion', (packet) => {
    // explosion
    const p = new Vec3(packet.x, packet.y, packet.z)
    packet.affectedBlockOffsets.forEach((offset) => {
      const pt = p.offset(offset.x, offset.y, offset.z)
      updateBlockState(pt, 0)
    })
  })

  bot._client.on('spawn_entity_painting', (packet) => {
    const pos = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const painting = new Painting(packet.entityId,
      pos, packet.title, paintingFaceToVec[packet.direction])
    addPainting(painting)
  })

  bot._client.on('entity_destroy', (packet) => {
    // destroy entity
    packet.entityIds.forEach((id) => {
      const painting = paintingsById[id]
      if (painting) deletePainting(painting)
    })
  })

  bot._client.on('update_sign', (packet) => {
    const pos = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const oldBlock = blockAt(pos)

    const prepareString = (i) => {
      let text = packet[`text${i}`]

      if (text === 'null' || text === '') {
        text = '""'
      }

      const json = JSON.parse(text)
      if (json.text) {
        json.text = json.text.replace(/^"|"$/g, '')
      }

      return new ChatMessage(json)
    }

    signs[pos] = [
      prepareString(1),
      prepareString(2),
      prepareString(3),
      prepareString(4)
    ].join('\n')

    emitBlockUpdate(oldBlock, blockAt(pos))
  })

  bot._client.on('tile_entity_data', (packet) => {
    addBlockEntity(packet.nbtData)
  })

  bot.updateSign = (block, text) => {
    const lines = text.split('\n')
    if (lines.length > 4) {
      bot.emit('error', new Error('too many lines for sign text'))
      return
    }
    for (let i = 0; i < lines.length; ++i) {
      if (lines[i].length > 15) {
        bot.emit('error', new Error('signs have max line length 15'))
        return
      }
    }

    bot._client.write('update_sign', {
      location: block.position,
      text1: JSON.stringify(lines[0]),
      text2: JSON.stringify(lines[1]),
      text3: JSON.stringify(lines[2]),
      text4: JSON.stringify(lines[3])
    })
  }

  // if we get a respawn packet and the dimension is changed,
  // unload all chunks from memory.
  let dimension

  function dimensionToFolderName (dimension) {
    if (bot.supportFeature('dimensionIsAnInt')) {
      return dimensionNames[dimension]
    } else if (bot.supportFeature('dimensionIsAString') || bot.supportFeature('dimensionIsAWorld')) {
      return dimension
    }
  }
  bot._client.on('login', (packet) => {
    dimension = packet.dimension
    bot.world = new World(null, storageBuilder ? storageBuilder({ version: bot.version, worldName: dimensionToFolderName(packet.dimension) }) : null).sync
  })
  bot._client.on('respawn', (packet) => {
    if (dimension === packet.dimension) return
    dimension = packet.dimension
    bot.world = new World(null, storageBuilder ? storageBuilder({ version: bot.version, worldName: dimensionToFolderName(packet.dimension) }) : null).sync
  })

  bot.findBlock = findBlock
  bot.canSeeBlock = canSeeBlock
  bot.blockAt = blockAt
  bot._updateBlockState = updateBlockState
  bot._blockEntities = blockEntities
  bot.waitForChunksToLoad = callbackify(waitForChunksToLoad)
}

function onesInShort (n) {
  n = n & 0xffff
  let count = 0
  for (let i = 0; i < 16; ++i) {
    count = ((1 << i) & n) ? count + 1 : count
  }
  return count
}
