const vec3 = require('vec3')
const Vec3 = vec3.Vec3
const assert = require('assert')
const Painting = require('../painting')
const Location = require('../location')

module.exports = inject

const paintingFaceToVec = [
  new Vec3(0, 0, -1),
  new Vec3(-1, 0, 0),
  new Vec3(0, 0, 1),
  new Vec3(1, 0, 0)
]

function inject (bot, { version }) {
  const nbt = require('prismarine-nbt')
  const Chunk = require('prismarine-chunk')(version)
  const ChatMessage = require('../chat_message')(version)
  let columns = {}
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

    // Handle signs
    if (blockEntity.id === 'minecraft:sign' || blockEntity.id === 'Sign') {
      const prepareJson = (i) => {
        const json = JSON.parse(blockEntity[`Text${i}`])
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

  function addColumn (args) {
    const columnCorner = new Vec3(args.x * 16, 0, args.z * 16)
    const key = columnKeyXZ(columnCorner.x, columnCorner.z)
    if (!args.bitMap) {
      // stop storing the chunk column
      delete columns[key]
      bot.emit('chunkColumnUnload', columnCorner)
      return
    }
    let column = columns[key]
    if (!column) columns[key] = column = new Chunk()

    try {
      column.load(args.data, args.bitMap, args.skyLightSent)
    } catch (e) {
      bot.emit('error', e)
      return
    }

    bot.emit('chunkColumnLoad', columnCorner)
  }

  function findBlock (options) {
    let check
    if (typeof (options.matching) !== 'function') {
      if (!Array.isArray(options.matching)) {
        options.matching = [options.matching]
      }
      check = isMatchingType
    } else check = options.matching
    options.point = options.point || bot.entity.position
    options.maxDistance = options.maxDistance || 16
    const cursor = vec3()
    const point = options.point
    const max = options.maxDistance
    let found
    for (cursor.x = point.x - max; cursor.x < point.x + max; cursor.x++) {
      for (cursor.y = point.y - max; cursor.y < point.y + max; cursor.y++) {
        for (cursor.z = point.z - max; cursor.z < point.z + max; cursor.z++) {
          found = bot.blockAt(cursor)
          if (check(found)) return found
        }
      }
    }
    return null

    function isMatchingType (block) {
      return block === null ? false : options.matching.indexOf(block.type) >= 0
    }
  }

  function posInChunk (pos) {
    return pos.floored().modulus(new Vec3(16, 256, 16))
  }

  function blockAt (absolutePoint) {
    const loc = new Location(absolutePoint)
    const key = columnKeyXZ(loc.chunkCorner.x, loc.chunkCorner.z)

    const column = columns[key]
    // null column means chunk not loaded
    if (!column) return null

    const block = column.getBlock(posInChunk(absolutePoint))
    block.position = loc.floored
    block.signText = signs[loc.floored]
    block.painting = paintingsByPos[loc.floored]
    block.blockEntity = blockEntities[loc.floored]

    return block
  }

  function blockIsNotEmpty (pos) {
    const block = bot.blockAt(pos)
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

  function chunkColumn (x, z) {
    const key = columnKeyXZ(x, z)
    return columns[key]
  }

  function emitBlockUpdate (oldBlock, newBlock) {
    bot.emit('blockUpdate', oldBlock, newBlock)
    const position = oldBlock ? oldBlock.position
      : (newBlock ? newBlock.position : null)
    if (position) bot.emit(`blockUpdate:${newBlock.position}`, oldBlock, newBlock)
  }

  function updateBlock (point, type, metadata) {
    const oldBlock = blockAt(point)
    const loc = new Location(point)
    const key = columnKeyXZ(loc.chunkCorner.x, loc.chunkCorner.z)
    const column = columns[key]
    // sometimes minecraft server sends us block updates before it sends
    // us the column that the block is in. ignore this.
    if (!column) return
    column.setBlockType(posInChunk(point), type)
    column.setBlockData(posInChunk(point), metadata)

    const newBlock = blockAt(point)
    if (oldBlock.type !== newBlock.type) {
      delete blockEntities[loc.floored]
      delete signs[loc.floored]

      const painting = paintingsByPos[loc.floored]
      if (painting) deletePainting(painting)
    }

    emitBlockUpdate(oldBlock, newBlock)
  }

  bot._client.on('map_chunk', (packet) => {
    addColumn({
      x: packet.x,
      z: packet.z,
      bitMap: packet.bitMap,
      skyLightSent: bot.game.dimension === 'overworld',
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
    let i

    let record
    let metadata
    let type
    let blockX
    let blockZ
    let y
    let pt
    for (i = 0; i < packet.records.length; ++i) {
      record = packet.records[i]

      metadata = (record.blockId & 0x0f)
      type = (record.blockId) >> 4
      y = record.y
      blockZ = (record.horizontalPos & 0x0f)
      blockX = (record.horizontalPos >> 4) & 0x0f

      pt = new Vec3(packet.chunkX * 16 + blockX, y, packet.chunkZ * 16 + blockZ)
      updateBlock(pt, type, metadata)
    }
  })

  bot._client.on('block_change', (packet) => {
    // block change
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    updateBlock(pt, packet.type >> 4, packet.type & 0x0f)
  })

  bot._client.on('explosion', (packet) => {
    // explosion
    packet.affectedBlockOffsets.forEach((offset) => {
      const pt = vec3(offset).offset(packet.x, packet.y, packet.z)
      updateBlock(pt.floor(), 0, 0)
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
  bot._client.on('login', (packet) => {
    dimension = packet.dimension
  })
  bot._client.on('respawn', (packet) => {
    if (dimension === packet.dimension) return
    dimension = packet.dimension
    columns = {}
  })

  bot.findBlock = findBlock
  bot.canSeeBlock = canSeeBlock
  bot.blockAt = blockAt
  bot._chunkColumn = chunkColumn
  bot._updateBlock = updateBlock
}

function columnKeyXZ (x, z) {
  return `${x},${z}`
}

function onesInShort (n) {
  n = n & 0xffff
  let count = 0
  for (let i = 0; i < 16; ++i) {
    count = ((1 << i) & n) ? count + 1 : count
  }
  return count
}
