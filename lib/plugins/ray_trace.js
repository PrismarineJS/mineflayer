const { Vec3 } = require('vec3')

module.exports = (bot) => {
  function getViewDirection (pitch, yaw) {
    const csPitch = Math.cos(pitch)
    const snPitch = Math.sin(pitch)
    const csYaw = Math.cos(yaw)
    const snYaw = Math.sin(yaw)
    return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
  }

  const mcData = require('minecraft-data')(bot.version)
  const transparentBlocks = mcData.blocksArray.filter(e => e.transparent || e.boundingBox === 'empty').map(e => e.id)

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

  bot.canSeeEntity = (entity, vectorLength = 5 / 16) => {
    const { height, position } = bot.entity
    const entityPos = entity.position.offset(-entity.width / 2, 0, -entity.width / 2)

    // bounding box verticies (8 verticies)
    const targetBoundingBoxVertices = [
      entityPos.offset(0, 0, 0),
      entityPos.offset(entity.width, 0, 0),
      entityPos.offset(0, 0, entity.width),
      entityPos.offset(entity.width, 0, entity.width),
      entityPos.offset(0, entity.height, 0),
      entityPos.offset(entity.width, entity.height, 0),
      entityPos.offset(0, entity.height, entity.width),
      entityPos.offset(entity.width, entity.height, entity.width)
    ]

    // Check the line of sight for every vertex
    const lineOfSight = targetBoundingBoxVertices.map(bbVertex => {
      // cursor starts at bot's eyes
      const cursor = position.offset(0, height, 0)
      // a vector from a to b = b - a
      const step = bbVertex.minus(cursor).unit().scaled(vectorLength)
      // we shouldn't step farther than the distance to the entity, plus the longest line inside the bounding box
      const maxSteps = bbVertex.distanceTo(position) / vectorLength

      // check for obstacles
      for (let i = 0; i < maxSteps; ++i) {
        cursor.add(step)
        const block = bot.blockAt(cursor)

        // block must be air/null or a transparent block
        if (block !== null && !transparentBlocks.includes(block.type)) {
          return false
        }
      }

      return true
    })

    // must have at least 1 vertex in line-of-sight
    return lineOfSight.some(e => e)
  }
}
