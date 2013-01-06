module.exports = inject;

function inject(bot, options) {
  bot.client.on(0x08, function(packet) {
    bot.health = packet.health;
    bot.food = packet.food;
    bot.foodSaturation = packet.foodSaturation;
    if (bot.health <= 0) {
      bot.emit('death');
    } else {
      bot.emit('health');
    }
  });
  if (options.autoSpawn !== false) {
    bot.on('death', function() {
      bot.spawn();
    });
  }
}
