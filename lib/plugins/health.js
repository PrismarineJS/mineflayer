module.exports = inject;

function inject(bot, options) {
  bot.isAlive = false;

  bot.client.on(0x09, function(packet) {
    bot.isAlive = false;
    bot.emit("respawn");
  });

  bot.client.on(0x08, function(packet) {
    bot.health = packet.health;
    bot.food = packet.food;
    bot.foodSaturation = packet.foodSaturation;
    bot.emit('health');
    if (bot.health <= 0) {
      bot.isAlive = false;
      bot.emit('death');
      bot.client.write(0xcd, { payload: 1 });
    } else if (bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true;
      bot.emit('spawn');
    }
  });
}
