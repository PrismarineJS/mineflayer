const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  bot.spawnPoint = new Vec3(0, 0, 0)
  bot._client.on('spawn_position', (packet) => {
    bot.spawnPoint = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    bot.emit('game')
  })
}
