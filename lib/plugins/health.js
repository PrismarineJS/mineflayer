module.exports = inject;

function inject(bot) {
  bot.isAlive = false;

  bot._client.on('respawn', function(packet) {
    bot.isAlive = false;
    bot.emit("respawn");
  });

  bot._client.on('update_health', function(packet) {
    bot.health = packet.health;
    bot.food = packet.food;
    bot.foodSaturation = packet.foodSaturation;
    bot.emit('health');
    if(bot.health <= 0) {
      bot.isAlive = false;
      bot.emit('death');
      bot._client.write('client_command', {payload: 0});
    } else if(bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true;
      bot.emit('spawn');
    }
  });
}
