const { Vec3 } = require('vec3')
const { RaycastIterator } = require('prismarine-world').iterators

module.exports = (bot) => {
  function getViewDirection (pitch, yaw) {
    const csPitch = Math.cos(pitch)
    const snPitch = Math.sin(pitch)
    const csYaw = Math.cos(yaw)
    const snYaw = Math.sin(yaw)
    return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
  }

  bot.blockInSight = (maxSteps = 256, vectorLength = 5 / 16) => {
    console.warn('[deprecated] use bot.blockAtCursor instead')
    const block = bot.blockAtCursor(maxSteps * vectorLength)
    if (block) return block
  }

  bot.blockAtCursor = (maxDistance = 256) => {
    const { position, height, pitch, yaw } = bot.entity

    const eyePosition = position.offset(0, height, 0)
    const viewDirection = getViewDirection(pitch, yaw)

    const iter = new RaycastIterator(eyePosition, viewDirection, maxDistance)
    let pos = iter.next()
    while (pos) {
      const block = bot.blockAt(new Vec3(pos.x, pos.y, pos.z))
      // TODO: Check boundingBox of block
      if (block && block.type !== 0) {
        block.face = pos.face
        return block
      }
      pos = iter.next()
    }
    return null
  }
}
