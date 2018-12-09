module.exports = inject

const dimensionNames = {
  '-1': 'nether',
  0: 'overworld',
  1: 'end'
}

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']

function inject (bot) {
  bot.game = {}

  bot._client.on('login', (packet) => {
    bot.game.levelType = packet.levelType
    bot.game.gameMode = parseGameMode(packet.gameMode)
    bot.game.hardcore = parseHardcore(packet.gameMode)
    bot.game.dimension = dimensionNames[packet.dimension]
    bot.game.difficulty = difficultyNames[packet.difficulty]
    bot.game.maxPlayers = packet.maxPlayers
    bot.emit('login')
    bot.emit('game')
    bot._client.write('held_item_slot', { slotId: 0 })
    bot._client.write('custom_payload', {
      channel: bot.majorVersion === '1.13' ? 'brand' : 'MC|Brand',
      data: Buffer.from('\x07vanilla')
    }) // varint length-prefixed string TODO: encode varint, see GH-253

    // autoRespawn(bot);
  })

  bot._client.on('respawn', (packet) => {
    bot.game.levelType = packet.levelType
    bot.game.dimension = dimensionNames[packet.dimension]
    bot.game.difficulty = difficultyNames[packet.difficulty]
    bot.game.gameMode = parseGameMode(packet.gameMode)
    bot.game.hardcore = parseHardcore(packet.gameMode)
    bot.emit('game')
  })

  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === 3) {
      bot.game.gameMode = parseGameMode(packet.gameMode)
      bot.emit('game')
    }
  })
}

const gameModes = ['survival', 'creative', 'adventure']

function parseGameMode (gameModeBits) {
  return gameModes[(gameModeBits & 0x03)]
}

function parseHardcore (gameModeBits) {
  return !!(gameModeBits & 0x04)
}
