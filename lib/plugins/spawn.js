module.exports = inject;

var dimensionNames = {
  '-1': 'nether',
  '0': 'overworld',
  '1': 'end',
};

var difficultyNames = ['peaceful', 'easy', 'normal', 'hard'];

function inject(bot, options) {
  var respawn = false;

  function spawn() {
    bot.client.write(0xcd, { payload: +respawn });
    respawn = true;
  }

  // we share bot.game with entities plugin
  bot.game = bot.game || {};

  bot.spawn = spawn;
  
  bot.client.on(0x01, function(packet) {
    bot.game.levelType = packet.levelType;
    bot.game.gameMode = parseGameMode(packet.gameMode);
    bot.game.hardcore = parseHardcore(packet.gameMode);
    bot.game.dimension = dimensionNames[packet.dimension];
    bot.game.difficulty = difficultyNames[packet.difficulty];
    bot.game.maxPlayers = packet.maxPlayers;
    bot.emit('login');
  });

  bot.client.on(0x09, function(packet) {
    bot.game.levelType = packet.levelType;
    bot.game.dimension = dimensionNames[packet.dimension];
    bot.game.difficulty = difficultyNames[packet.difficulty];
    bot.game.gameMode = parseGameMode(packet.gameMode);
    bot.game.hardcore = parseHardcore(packet.gameMode);
    bot.game.worldHeight = packet.worldHeight;
    bot.emit('spawn');
  });

  bot.client.on(0x46, function(packet) {
    if (packet.reason === 3) bot.game.gameMode = parseGameMode(packet.gameMode);
    bot.emit('game');
  });

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
    // respawn when we die
    bot.on('death', function() {
      bot.spawn();
    });
    // call the initializing spawn, and emit the
    // 'spawn' event exactly once after login.
    bot.client.once(0x0d, function(packet) {
      bot.client.write(0x0d, packet);
      spawn();

      // if we receive a health packet and not a respawn packet,
      // we are alive and should emit the spawn event.
      bot.client.once(0x08, emitSpawn);
      bot.client.once(0x09, function(socket) {
        bot.client.removeListener(0x08, emitSpawn);
      });
      function emitSpawn() {
        bot.emit('spawn');
      }
    });
  }
}

var gameModes = ['survival', 'creative', 'adventure'];

function parseGameMode(gameModeBits) {
  return gameModes[(gameModeBits & 0x03)];
}

function parseHardcore(gameModeBits) {
  return !!(gameModeBits & 0x04);
}
