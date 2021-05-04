module.exports = inject

function inject (bot) {
  bot._client.on('world_particles', (data) => {
    bot.emit('particles', data)
  })
}
