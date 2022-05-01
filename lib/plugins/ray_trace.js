const { Vec3 } = require('vec3')

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

  bot.blockAtEntityCursor = (entity = bot.entity, maxDistance = 256, matcher = null) => {
    if (!entity.position || !entity.height || !entity.pitch || !entity.yaw) return null
    const { position, height, pitch, yaw } = entity

    const eyePosition = position.offset(0, height, 0)
    const viewDirection = getViewDirection(pitch, yaw)

    return bot.world.raycast(eyePosition, viewDirection, maxDistance, matcher)
  }

  bot.entityInSight = (maxSteps = 256, vectorLength = 5 / 16) => {
    const { height, position, yaw, pitch } = bot.entity
    const cursor = position.offset(0, height, 0)
    const x = -Math.sin(yaw) * Math.cos(pitch)
    const y = Math.sin(pitch)
    const z = -Math.cos(yaw) * Math.cos(pitch)

    const step = new Vec3(x, y, z).scaled(vectorLength)

    function isPointInEntity (cursor, entity) {
      const entityPos = entity.position.offset(-entity.width / 2, 0, -entity.width / 2)
      return cursor.x >= entityPos.x && cursor.x < entityPos.x + entity.width &&
             cursor.y >= entityPos.y && cursor.y < entityPos.y + entity.height &&
             cursor.z >= entityPos.z && cursor.z < entityPos.z + entity.width
    }

    for (let i = 0; i < maxSteps; ++i) {
      cursor.add(step)

      // Checking for entity
      for (const entity of Object.values(bot.entities)) {
        if (entity === bot.entity) {
          continue
        }
        if (isPointInEntity(cursor, entity)) {
          return entity
        }
      }
    }
    return null
  }
}
