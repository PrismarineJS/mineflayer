const { onceWithCleanup } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  async function placeBlockWithOptions (referenceBlock, faceVector, options) {
    const dest = referenceBlock.position.plus(faceVector)
    let oldBlock = bot.blockAt(dest)
    await bot._genericPlace(referenceBlock, faceVector, options)

    let newBlock = bot.blockAt(dest)
    if (oldBlock.type === newBlock.type) {
      [oldBlock, newBlock] = await onceWithCleanup(bot, `blockUpdate:${dest}`, { timeout: 5000 })
    }

    if (oldBlock.type === newBlock.type) {
      throw new Error(`No block has been placed : the block is still ${oldBlock.name}`)
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
