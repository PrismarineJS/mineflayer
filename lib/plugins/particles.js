module.exports = inject

function inject (bot) {
  bot._client.on('world_particles', (packet) => {
    bot.emit('particle', packet)
  })
}
