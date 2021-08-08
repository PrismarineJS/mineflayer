const { onceWithCleanup, callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  async function placeBlockWithOptions (referenceBlock, faceVector, options) {
    bot.swingArm()
    const pos = await bot._genericPlace(referenceBlock, faceVector, options)

    const dest = pos.plus(faceVector)
    const eventName = `blockUpdate:${dest}`

    const [oldBlock, newBlock] = await onceWithCleanup(bot, eventName, { timeout: 5000 })

    if (oldBlock.type === newBlock.type) {
      throw new Error(`No block has been placed : the block is still ${oldBlock.name}`)
    } else {
      bot.emit('blockPlaced', oldBlock, newBlock)
    }
  }

  async function placeBlock (referenceBlock, faceVector) {
    await placeBlockWithOptions(referenceBlock, faceVector, {})
  }

  bot.placeBlock = callbackify(placeBlock)
  bot._placeBlockWithOptions = placeBlockWithOptions
}
