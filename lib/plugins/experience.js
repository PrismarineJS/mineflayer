module.exports = inject;

function inject(bot) {
  bot.experience = {
    level: null,
    points: null,
    progress: null
  };
  bot._client.on('experience', function(packet) {
    bot.experience.level = packet.level;
    bot.experience.points = packet.totalExperience;
    bot.experience.progress = packet.experienceBar;
    bot.emit('experience');
  });
}
