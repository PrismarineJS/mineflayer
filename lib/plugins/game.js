const nbt = require('prismarine-nbt')
module.exports = inject

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']
const gameModes = ['survival', 'creative', 'adventure']

const dimensionNames = {
  '-1': 'minecraft:nether',
  0: 'minecraft:overworld',
  1: 'minecraft:end'
}

function parseGameMode (gameModeBits) {
  return gameModes[(gameModeBits & 0x03)]
}

function parseHardcore (gameModeBits) {
  return !!(gameModeBits & 0x04)
}

function getBrandCustomChannelName(bot) {
  if (bot.supportFeature('customChannelMCPrefixed')) {
    return 'MC|Brand'
  } else if (bot.supportFeature('customChannelIdentifier')) {
    return 'minecraft:brand'
  }
  throw new Error("Unsupported brand channel name")
}

function determineHardcoreFlag(packet) {
  if (packet.isHardcore !== undefined) {
    return packet.isHardcore
  }
  return parseHardcore(packet.gameMode)
}

function determineLegacyLevelType(packet) {
  if (packet.levelType !== undefined) {
    return packet.levelType
  }
  if (packet.isFlat === true) {
    return 'flat'
  }
  return 'default'
}

function getDimensionNameFromPacket(bot, packet) {
  if (bot.supportFeature('dimensionIsAnInt')) {
    return dimensionNames[packet.dimension]
  } else if (bot.supportFeature('dimensionIsAString')) {
    return packet.dimension
  } else if (bot.supportFeature('dimensionIsAWorld')) {
    return packet.worldName
  }
  throw new Error("Unsupported dimension type in login packet")
}

function handleRespawnPacketData(bot, packet) {
  bot.game.levelType = determineLegacyLevelType(packet)
  bot.game.hardcore = determineHardcoreFlag(packet)
  bot.game.gameMode = parseGameMode(packet.gameMode)
  bot.game.dimension = getDimensionNameFromPacket(bot, packet)

  if (bot.supportFeature('dimensionDataIsAvailable')) {
    bot.game.dimensionData = nbt.simplify(packet.dimension)
  }
  if (packet.difficulty) {
    bot.game.difficulty = difficultyNames[packet.difficulty]
  }
}

function inject (bot) {
  bot.game = {}

  bot._client.on('login', (packet) => {
    handleRespawnPacketData(bot, packet)

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

    // varint length-prefixed string as data TODO: encode varint, see GH-253
    bot._client.write('custom_payload', {
      channel: getBrandCustomChannelName(bot),
      data: Buffer.from('\x07vanilla')
    })
  })

  bot._client.on('respawn', (packet) => {
    handleRespawnPacketData(bot, packet)
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

  bot._client.on('custom_payload', (packet) => {
    if (packet.channel === 'minecraft:brand') {
      bot.game.serverBrand = String.fromCharCode.apply(null, packet.data)
      bot.emit('game')
    }
  })
}
