const { onceWithCleanup } = require('../promise_utils')
const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  async function placeBlockWithOptions (referenceBlock, face, options) {
    let faceVector = face
    if (typeof face === 'string') {
      const directions = {
        top: new Vec3(0, 1, 0),
        bottom: new Vec3(0, -1, 0),
        east: new Vec3(1, 0, 0),
        west: new Vec3(-1, 0, 0),
        south: new Vec3(0, 0, 1),
        north: new Vec3(0, 0, -1)
      }
      if (!Object.keys(directions).includes(face)) throw new Error(`Invalid face : can only be ${Object.keys(directions).join(', ')}`)
      faceVector = directions[face]
    }

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
