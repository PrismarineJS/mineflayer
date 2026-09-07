const { onceWithCleanup } = require('../promise_utils')

module.exports = inject

// Servers before 1.20 send no minecraft:replaceable block tag. These are the blocks whose
// Material.isReplaceable() holds, minus tall flowers, whose canBeReplaced() is false from
// 1.13 on. A name the version lacks is skipped.
const REPLACEABLE_LEGACY = ['air', 'flowing_water', 'water', 'flowing_lava', 'lava', 'tallgrass', 'deadbush', 'double_plant', 'vine', 'fire', 'snow_layer', 'structure_void']
const REPLACEABLE_FLAT = [
  'air', 'cave_air', 'void_air', 'water', 'lava', 'bubble_column', 'structure_void', 'light',
  'grass', 'tall_grass', 'fern', 'large_fern', 'dead_bush', 'seagrass', 'tall_seagrass',
  'vine', 'glow_lichen', 'hanging_roots', 'nether_sprouts', 'crimson_roots', 'warped_roots',
  'fire', 'soul_fire', 'snow'
]

function inject (bot) {
  const names = bot.supportFeature('blockSchemeIsFlat') ? REPLACEABLE_FLAT : REPLACEABLE_LEGACY
  let replaceable = new Set(names.map(name => bot.registry.blocksByName[name]?.id).filter(id => id !== undefined))

  // The server's tag is authoritative and reflects datapacks; it is resent on /reload.
  bot._client.on('tags', (packet) => {
    const blockTags = packet.tags?.find(group => group.tagType === 'minecraft:block')
    const tag = blockTags?.tags.find(t => t.tagName === 'minecraft:replaceable')
    if (tag) replaceable = new Set(tag.entries)
  })

  // Placements in flight per destination. The server's replies carry no
  // request id, so a reply can only be attributed when a single call is
  // waiting on that destination.
  const inFlight = new Map()

  async function placeBlockWithOptions (referenceBlock, faceVector, options) {
    const dest = referenceBlock.position.plus(faceVector)
    const oldBlock = bot.blockAt(dest)
    if (oldBlock && !replaceable.has(oldBlock.type)) {
      throw new Error(`Cannot place block at ${dest}: it is occupied by ${oldBlock.name}`)
    }
    await bot._genericPlace(referenceBlock, faceVector, options)

    // Whether or not it placed anything, the server answers block_place with a
    // block update for the reference block, then one for the block across the
    // face. Updates for dest that arrive before the reference one are stale
    // (sent before the server saw our packet) and say nothing about the result.
    // With several placements in flight the reply cannot be told apart, so a
    // call only settles on a type change and all of them share the outcome.
    const key = dest.toString()
    inFlight.set(key, (inFlight.get(key) ?? 0) + 1)
    let acked = false
    const onAck = () => { acked = true }
    bot.on(`blockUpdate:${referenceBlock.position}`, onAck)
    const [, newBlock] = await onceWithCleanup(bot, `blockUpdate:${dest}`, {
      timeout: 5000,
      // oldBlock and newBlock are both null when the world unloads
      checkCondition: (oldBlock, newBlock) => !oldBlock || !newBlock || oldBlock.type !== newBlock.type || (acked && inFlight.get(key) === 1)
    }).catch((err) => {
      throw acked ? err : new Error(`Server did not answer the placement at ${dest}: ${err.message}`)
    }).finally(() => {
      bot.removeListener(`blockUpdate:${referenceBlock.position}`, onAck)
      if (inFlight.get(key) === 1) inFlight.delete(key)
      else inFlight.set(key, inFlight.get(key) - 1)
    })

    if (!newBlock) return
    if (newBlock.type === oldBlock.type) {
      throw new Error(`Server refused to place ${bot.heldItem?.name ?? 'block'} at ${dest}: the block is still ${newBlock.name}`)
    }
    bot.emit('blockPlaced', oldBlock, newBlock)
  }

  async function placeBlock (referenceBlock, faceVector) {
    await placeBlockWithOptions(referenceBlock, faceVector, { swingArm: 'right' })
  }

  bot.placeBlock = placeBlock
  bot._placeBlockWithOptions = placeBlockWithOptions
}
