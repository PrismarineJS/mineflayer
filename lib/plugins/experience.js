module.exports = inject

function inject (bot) {
  bot.experience = {
    level: null,
    points: null,
    progress: null
  }
  bot._client.on('experience', (packet) => {
    bot.experience.level = packet.level
    bot.experience.points = packet.totalExperience
    bot.experience.progress = packet.experienceBar
    bot.emit('experience')
  })

  bot.experience.getXpPoints = function () {
    const levelToXpPoints = bot.experience.convertLevelsToXpPoints(bot.experience.level)
    const incrementedLevelToXpPoints = bot.experience.convertLevelsToXpPoints(bot.experience.level + 1)
    const xpForNextLevel = incrementedLevelToXpPoints - levelToXpPoints

    return Math.floor(levelToXpPoints + bot.experience.progress * xpForNextLevel)
  }
}
