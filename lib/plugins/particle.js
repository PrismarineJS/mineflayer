module.exports = inject

function inject (bot, { version }) {
  const Particle = require('../particle')(bot.registry)

  bot._client.on('world_particles', (packet) => {
    bot.emit('particle', Particle.fromNetwork(packet))
  })
}
