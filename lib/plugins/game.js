module.exports = inject

const dimensionNames = {
  '-1': 'minecraft:nether',
  0: 'minecraft:overworld',
  1: 'minecraft:end'
}

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']

function inject (bot) {
  bot.game = {}

  bot._client.on('custom_payload', (packet) => {
    if (packet.channel === 'minecraft:brand') {
      bot.game.serverBrand = String.fromCharCode.apply(null, packet.data)
      bot.emit('game')
    }
  })

  bot._client.on('login', (packet) => {
    bot.game.levelType = (packet.levelType ? packet.levelType : (packet.isFlat ? 'flat' : 'default'))
    bot.game.gameMode = parseGameMode(packet.gameMode)
    bot.game.hardcore = parseHardcore(packet.gameMode)
    if (bot.supportFeature('dimensionIsAnInt')) {
      bot.game.dimension = dimensionNames[packet.dimension]
    } else if (bot.supportFeature('dimensionIsAString')) {
      bot.game.dimension = packet.dimension
    } else if (bot.supportFeature('dimensionIsAWorld')) {
      bot.game.dimension = packet.worldName
    }
    if (packet.viewDistance) {
      bot.game.serverViewDistance = packet.viewDistance
    }
    bot.game.difficulty = packet.difficulty ? difficultyNames[packet.difficulty] : bot.game.difficulty
    bot.game.maxPlayers = packet.maxPlayers
    bot.emit('login')
    bot.emit('game')
    bot._client.write('held_item_slot', { slotId: 0 })
    let channel
    if (bot.supportFeature('customChannelMCPrefixed')) {
      channel = 'MC|Brand'
    } else if (bot.supportFeature('customChannelNotPrefixed')) {
      channel = 'brand'
    }
    bot._client.write('custom_payload', {
      channel,
      data: Buffer.from('\x07vanilla')
    }) // varint length-prefixed string TODO: encode varint, see GH-253

    // autoRespawn(bot);
  })

  bot._client.on('respawn', (packet) => {
    bot.game.levelType = packet.levelType
    if (bot.supportFeature('dimensionIsAnInt')) {
      bot.game.dimension = dimensionNames[packet.dimension]
    } else if (bot.supportFeature('dimensionIsAString')) {
      bot.game.dimension = packet.dimension
    }
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

  bot._client.on('difficulty', (packet) => {
    bot.game.difficulty = difficultyNames[packet.difficulty]
  })
}

const gameModes = ['survival', 'creative', 'adventure']

function parseGameMode (gameModeBits) {
  return gameModes[(gameModeBits & 0x03)]
}

function parseHardcore (gameModeBits) {
  return !!(gameModeBits & 0x04)
}
