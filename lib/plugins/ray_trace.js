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

  bot.blockAtCursor = (maxDistance = 256, matcher = null) => {
    const { position, height, pitch, yaw } = bot.entity

    const eyePosition = position.offset(0, height, 0)
    const viewDirection = getViewDirection(pitch, yaw)

    return bot.world.raycast(eyePosition, viewDirection, maxDistance, matcher)
  }

  bot.entityAtCursor = (maxDistance) => {
    maxDistance = maxDistance ?? 3.5
    const block = bot.blockAtCursor(maxDistance)
    maxDistance = block?.intersect.distanceTo(bot.entity.position) ?? maxDistance

    const entities = Object.values(bot.entities)
        .filter(entity => entity.type !== 'object' && entity.username !== bot.username && entity.position.distanceSquared(bot.entity.position) <= maxDistance ** 2)

    const dir = new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.yaw) * Math.cos(bot.entity.pitch))
    const iterator = new RaycastIterator(bot.entity.position.offset(0, bot.entity.height, 0), dir.normalize(), maxDistance)

    const intersectArr = []

    let pos = iterator.next()
    while (pos) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const w = entity.width / 2

        const shapes = [[-w, 0, -w, w, entity.height + (entity.type === 'player' ? 0.18 : 0), w]]
        const intersect = iterator.intersect(shapes, entity.position)
        if (intersect) {
          const dist = bot.entity.position.distanceTo(intersect.pos)
          intersectArr.push({ entity: entity, dist: dist })
        }
      }

      if (intersectArr.length) {
        return intersectArr.reduce((prev, curr) => prev.dist < curr.dist ? prev : curr).entity // There might be a better way to do this
      }
      pos = iterator.next()
    }
    return null
  }
}
