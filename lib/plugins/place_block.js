const { onceWithCleanup } = require('../promise_utils')

module.exports = inject

// Vanilla lets a placed block overwrite these; anything else at the target
// makes the server reject the placement and only echo the unchanged block.
const REPLACEABLE = new Set([
  'air', 'cave_air', 'void_air', 'water', 'lava', 'bubble_column', 'structure_void', 'light',
  'grass', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'dead_bush', 'seagrass', 'tall_seagrass',
  'vine', 'glow_lichen', 'sculk_vein', 'hanging_roots', 'nether_sprouts', 'crimson_roots', 'warped_roots',
  'fire', 'soul_fire', 'snow'
])

function inject (bot) {
  async function placeBlockWithOptions (referenceBlock, faceVector, options) {
    const dest = referenceBlock.position.plus(faceVector)
    let oldBlock = bot.blockAt(dest)
    if (oldBlock && !REPLACEABLE.has(oldBlock.name)) {
      throw new Error(`Cannot place block at ${dest}: it is occupied by ${oldBlock.name}`)
    }
    await bot._genericPlace(referenceBlock, faceVector, options)

    let newBlock = bot.blockAt(dest)
    if (oldBlock.type === newBlock.type) {
      [oldBlock, newBlock] = await onceWithCleanup(bot, `blockUpdate:${dest}`, {
        timeout: 5000,
        // Condition to wait to receive block update actually changing the block type, in case the bot receives block updates with no changes
        // oldBlock and newBlock will both be null when the world unloads
        checkCondition: (oldBlock, newBlock) => !oldBlock || !newBlock || oldBlock.type !== newBlock.type
      })
    }

    // blockUpdate emits (null, null) when the world unloads
    if (!oldBlock && !newBlock) {
      return
    }
    if (oldBlock?.type === newBlock.type) {
      throw new Error(`No block has been placed : the block is still ${oldBlock?.name}`)
    } else {
      bot.emit('blockPlaced', oldBlock, newBlock)
    }
  }

  async function placeBlock (referenceBlock, faceVector) {
    await placeBlockWithOptions(referenceBlock, faceVector, { swingArm: 'right' })
  }

  bot.placeBlock = placeBlock
  bot._placeBlockWithOptions = placeBlockWithOptions
}
