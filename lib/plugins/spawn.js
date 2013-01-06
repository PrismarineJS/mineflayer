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

  if (options.autoSpawn !== false) bot.on('login', spawn);
}

var gameModes = ['survival', 'creative', 'adventure'];

function parseGameMode(gameModeBits) {
  return gameModes[(gameModeBits & 0x03)];
}

function parseHardcore(gameModeBits) {
  return !!(gameModeBits & 0x04);
}
