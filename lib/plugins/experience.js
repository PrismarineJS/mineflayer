module.exports = inject

function inject (bot) {
  bot.experience = {
    level: null,
    progress: null
  }
  bot.score = null

  bot._client.on('experience', (packet) => {
    bot.experience.level = packet.level
    bot.score = packet.totalExperience
    bot.experience.progress = packet.experienceBar
    bot.emit('experience')
  })
}
