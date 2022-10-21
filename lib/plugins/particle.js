const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot, { version }) {
  const Particle = require('../particle')(bot.registry)

  bot._client.on('world_particles', (packet) => {
    bot.emit('particle', new Particle(
        packet.particleId,
        packet.longDistance,
        new Vec3(packet.x, packet.y, packet.z),
        new Vec3(packet.offsetX, packet.offsetY, packet.offsetZ),
        packet.particleData,
        packet.particles,
        packet.data || null
    ))
  })
}
