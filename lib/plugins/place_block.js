module.exports = inject

function inject (bot) {
  function waitForBlockChange (location, timeout) {
    return new Promise((resolve, reject) => {
      const blockUpdateListener = (oldBlock, newBlock) => {
        if ((oldBlock || newBlock) && oldBlock.type === newBlock.type) return
        bot.off(`blockUpdate:${location}`, blockUpdateListener)
        clearTimeout(timeout)
        resolve()
      }

      const timeout = setTimeout(() => {
        bot.off(`blockUpdate:${location}`, blockUpdateListener)
        reject(new Error('No block change detected'))
      }, 5000)

      bot.on(`blockUpdate:${location}`, blockUpdateListener)
    })
  }

  async function placeBlockWithOptions (referenceBlock, faceVector, options) {
    const dest = referenceBlock.position.plus(faceVector)
    const oldBlock = bot.blockAt(dest)
    await bot._genericPlace(referenceBlock, faceVector, options)

    const newBlock = bot.blockAt(dest)
    if (oldBlock.type === newBlock.type) {
      await waitForBlockChange(dest, 5000)
      return
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
