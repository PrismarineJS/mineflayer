const nbt = require('prismarine-nbt')
module.exports = inject

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']
const gameModes = ['survival', 'creative', 'adventure']

const dimensionNames = {
  '-1': 'minecraft:nether',
  0: 'minecraft:overworld',
  1: 'minecraft:end'
}

const parseGameMode = gameModeBits => gameModes[(gameModeBits & 0b11)] // lower two bits

function inject (bot, options) {
  function getBrandCustomChannelName () {
    if (bot.supportFeature('customChannelMCPrefixed')) {
      return 'MC|Brand'
    } else if (bot.supportFeature('customChannelIdentifier')) {
      return 'minecraft:brand'
    }
    throw new Error('Unsupported brand channel name')
  }

  function handleRespawnPacketData (packet) {
    bot.game.levelType = packet.levelType ?? (packet.isFlat ? 'flat' : 'default')
    bot.game.hardcore = packet.isHardcore ?? Boolean(packet.gameMode & 0b100)
    bot.game.gameMode = parseGameMode(packet.gameMode)
    if (bot.supportFeature('dimensionIsAnInt')) {
      bot.game.dimension = dimensionNames[packet.dimension]
    } else if (bot.supportFeature('dimensionIsAString')) {
      bot.game.dimension = packet.dimension
    } else if (bot.supportFeature('dimensionIsAWorld')) {
      bot.game.dimension = packet.worldName
    } else {
      throw new Error('Unsupported dimension type in login packet')
    }

    if (bot.supportFeature('dimensionDataIsAvailable')) {
      bot.game.dimensionData = nbt.simplify(packet.dimension)
    }
    if (packet.difficulty) {
      bot.game.difficulty = difficultyNames[packet.difficulty]
    }
  }

  bot.game = {}

  const brandChannel = getBrandCustomChannelName()
  bot._client.registerChannel(brandChannel, ['string', []])

  bot._client.on('login', (packet) => {
    handleRespawnPacketData(packet)

    bot.game.maxPlayers = packet.maxPlayers
    if (packet.enableRespawnScreen) {
      bot.game.enableRespawnScreen = packet.enableRespawnScreen
    }
    if (packet.viewDistance) {
      bot.game.serverViewDistance = packet.viewDistance
    }

    bot.emit('login')
    bot.emit('game')
    bot._client.write('held_item_slot', { slotId: 0 })

    // varint length-prefixed string as data
    bot._client.writeChannel(brandChannel, options.brand)
  })

  bot._client.on('respawn', (packet) => {
    handleRespawnPacketData(packet)
    bot.emit('game')
  })

  bot._client.on('game_state_change', (packet) => {
    if (packet?.reason === 4 && packet?.gameMode === 1) {
      bot._client.write('client_command', { action: 0 })
    }
    if (packet.reason === 3) {
      bot.game.gameMode = parseGameMode(packet.gameMode)
      bot.emit('game')
    }
  })

  bot._client.on('difficulty', (packet) => {
    bot.game.difficulty = difficultyNames[packet.difficulty]
  })

  bot._client.on(brandChannel, (serverBrand) => {
    bot.game.serverBrand = serverBrand
  })
}
