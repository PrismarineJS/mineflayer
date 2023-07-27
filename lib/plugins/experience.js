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

  // SOURCE: https://minecraft.fandom.com/wiki/Experience#Leveling_up
  bot.experience.convertLevelsToXpPoints = function (level) {
    if (level < 0) return null;

    if (level >= 0 && level <= 16) return level ** 2 + 6 * level;

    if (level >= 17 && level <= 31) return 2.5 * level ** 2 - 40.5 * level + 360;

    if (level >= 32) return 4.5 * level ** 2 - 162.5 * level + 2220;
  }

  // SOURCE: https://minecraft.fandom.com/wiki/Experience#Leveling_up
  bot.experience.convertXpPointsToLevels = function(xpPoints) {
    if (xpPoints < 0) return null;

    if (xpPoints >= 0 && xpPoints <= 352) return Math.sqrt(xpPoints + 9) - 3;

    if (xpPoints >= 353 && xpPoints <= 1507) return 81 / 10 + Math.sqrt((2 / 5) * (xpPoints - 7839 / 40));

    if (xpPoints >= 1508) return 325 / 18 + Math.sqrt((2 / 9) * (xpPoints - 54215 / 72));
  }
  
}
