const Vec3 = require('vec3')

module.exports = inject

function inject (bot) {
  const rayTraceBlock = (maxSteps = 256, vectorLength = 5 / 16) => {
    const { height, position, yaw, pitch } = bot.entity
    const cursor = position.offset(0, height, 0)

    const x = -Math.sin(yaw) * Math.cos(pitch)
    const y = Math.sin(pitch)
    const z = -Math.cos(yaw) * Math.cos(pitch)

    const step = new Vec3(x, y, z).scaled(vectorLength)

    for (let i = 0; i < maxSteps; ++i) {
      cursor.add(step)

      // TODO: Check boundingBox of block
      const block = bot.blockAt(cursor)
      if (block && block.type !== 0) {
        return block
      }
    }
  }

  bot.blockInSight = rayTraceBlock
}
