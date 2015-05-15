module.exports = inject;

var dimensionNames = {
  '-1': 'nether',
  '0': 'overworld',
  '1': 'end',
};

var difficultyNames = ['peaceful', 'easy', 'normal', 'hard'];

function inject(bot) {
  bot.game = {};

  bot._client.on('login', function(packet) {
    bot.game.levelType = packet.levelType;
    bot.game.gameMode = parseGameMode(packet.gameMode);
    bot.game.hardcore = parseHardcore(packet.gameMode);
    bot.game.dimension = dimensionNames[packet.dimension];
    bot.game.difficulty = difficultyNames[packet.difficulty];
    bot.game.maxPlayers = packet.maxPlayers;
    bot.emit('login');
    bot.emit('game');
    bot._client.write('held_item_slot', {slotId: 0});
    bot._client.write('custom_payload', {channel: 'MC|Brand', data: new Buffer('\x07vanilla')}); // varint length-prefixed string TODO: encode varint, see GH-253

    //autoRespawn(bot);
  });

  bot._client.on('respawn', function(packet) {
    bot.game.levelType = packet.levelType;
    bot.game.dimension = dimensionNames[packet.dimension];
    bot.game.difficulty = difficultyNames[packet.difficulty];
    bot.game.gameMode = parseGameMode(packet.gameMode);
    bot.game.hardcore = parseHardcore(packet.gameMode);
    bot.emit('game');
  });

  bot._client.on('game_state_change', function(packet) {
    if(packet.reason === 3) {
      bot.game.gameMode = parseGameMode(packet.gameMode);
      bot.emit('game');
    }
  });
}

var gameModes = ['survival', 'creative', 'adventure'];

function parseGameMode(gameModeBits) {
  return gameModes[(gameModeBits & 0x03)];
}

function parseHardcore(gameModeBits) {
  return !!(gameModeBits & 0x04);
}

/**
 * AutoRespawn if dead on login
 * Waits 2 seconds for the update_health packet,
 * on timeout of this packet it sends a respawn request
 * I can't think of a cleaner way to do this at the moment.
 * @param  {Bot} bot
 * @return {void}
 */
function autoRespawn(bot) {
  var timer = setTimeout(function() {
    bot._client.write('client_command', {payload: 0});
  }, 2000);
  bot._client.once('update_health', function() {
    clearTimeout(timer);
  })
}

