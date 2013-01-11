module.exports = inject;

function inject(bot, options) {
  var respawn = false;
  function spawn() {
    bot.client.write(0xcd, { payload: +respawn });
    respawn = true;
  }

  bot.isAlive = false;
  bot.spawn = spawn;

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
      bot.emit('respawn');
    } else if (bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true;
      bot.emit('spawn');
    }
  });

  if (options.autoSpawn !== false) {
    bot.client.once(0x01, function() {
      bot.spawn();
    });
    bot.on('death', function() {
      bot.spawn();
    });
  }
}
