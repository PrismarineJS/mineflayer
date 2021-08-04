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

  bot.playerAtCursor = (maxDistance = 3.5) => {
    const players = Object.keys(bot.players).map((key) => bot.players[key])
      .filter((player) => {
        return player.username !== bot.username && player.entity &&
          Math.abs(player.entity.position.x - bot.entity.position.x) <= maxDistance &&
          Math.abs(player.entity.position.y - bot.entity.position.y) <= maxDistance + 2 &&
          Math.abs(player.entity.position.z - bot.entity.position.z) <= maxDistance
      }).sort((player1, player2) =>
        (player1.entity.position.x - bot.entity.position.x) ** 2 + (player1.entity.position.z - bot.entity.position.z) ** 2 -
        ((player2.entity.position.x - bot.entity.position.x) ** 2 + (player2.entity.position.z - bot.entity.position.z) ** 2)
      )

    const dir = new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.yaw) * Math.cos(bot.entity.pitch))
    const iterator = new RaycastIterator(bot.entity.position.offset(0, bot.entity.height, 0), dir.normalize(), maxDistance)

    let pos = iterator.next()
    while (pos) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i].entity
        const w = player.width / 2

        const shapes = [[-w, 0, -w, w, player.height + 0.18, w]]

        if (iterator.intersect(shapes, player.position)) {
          return players[i]
        }
      }
      pos = iterator.next()
    }
    return null
  }
}
