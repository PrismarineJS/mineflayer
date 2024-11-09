const nbt = require('prismarine-nbt')
module.exports = inject

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']
const gameModes = ['survival', 'creative', 'adventure', 'spectator']

const dimensionNames = {
  '-1': 'the_nether',
  0: 'overworld',
  1: 'the_end'
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
    bot.game.gameMode = packet.gamemode || parseGameMode(packet.gameMode)
    if (bot.supportFeature('segmentedRegistryCodecData')) { // 1.20.5
      if (typeof packet.dimension === 'number') {
        bot.game.dimension = bot.registry.dimensionsArray[packet.dimension]?.name?.replace('minecraft:', '')
      } else if (typeof packet.dimension === 'string') { // iirc, in 1.21 it's back to a string
        bot.game.dimension = packet.dimension.replace('minecraft:', '')
      }
    } else if (bot.supportFeature('dimensionIsAnInt')) {
      bot.game.dimension = dimensionNames[packet.dimension]
    } else if (bot.supportFeature('dimensionIsAString')) {
      bot.game.dimension = packet.dimension.replace('minecraft:', '')
    } else if (bot.supportFeature('dimensionIsAWorld')) {
      bot.game.dimension = packet.worldName.replace('minecraft:', '')
    } else {
      throw new Error('Unsupported dimension type in login packet')
    }

    if (packet.dimensionCodec) {
      bot.registry.loadDimensionCodec(packet.dimensionCodec)
    }

    bot.game.minY = 0
    bot.game.height = 256

    if (bot.supportFeature('dimensionDataInCodec')) { // 1.19+
      // pre 1.20.5 before we consolidated login and respawn's SpawnInfo structure into one type,
      // "dimension" was called "worldType" in login_packet's payload but not respawn.
      if (packet.worldType && !bot.game.dimension) {
        bot.game.dimension = packet.worldType.replace('minecraft:', '')
      }
      const dimData = bot.registry.dimensionsByName[bot.game.dimension]
      if (dimData) {
        bot.game.minY = dimData.minY
        bot.game.height = dimData.height
      }
    } else if (bot.supportFeature('dimensionDataIsAvailable')) { // 1.18
      const dimensionData = nbt.simplify(packet.dimension)
      bot.game.minY = dimensionData.min_y
      bot.game.height = dimensionData.height
    }

    if (packet.difficulty) {
      bot.game.difficulty = difficultyNames[packet.difficulty]
    }
  }

  bot.game = {}

  const brandChannel = getBrandCustomChannelName()
  bot._client.registerChannel(brandChannel, ['string', []])

  // 1.20.2
  bot._client.on('registry_data', (packet) => {
    bot.registry.loadDimensionCodec(packet.codec || packet)
  })

  bot._client.on('login', (packet) => {
    handleRespawnPacketData(packet.worldState || packet)

    bot.game.maxPlayers = packet.maxPlayers
    if (packet.enableRespawnScreen) {
      bot.game.enableRespawnScreen = packet.enableRespawnScreen
    }
    if (packet.viewDistance) {
      bot.game.serverViewDistance = packet.viewDistance
    }

    bot.emit('login')
    bot.emit('game')

    // varint length-prefixed string as data
    bot._client.writeChannel(brandChannel, options.brand)
  })

  bot._client.on('respawn', (packet) => {
    // in 1.20.5+ protocol we move the shared spawn data into one SpawnInfo type under .worldState
    handleRespawnPacketData(packet.worldState || packet)
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

  // mimic the vanilla 1.17 client to prevent anticheat kicks
  bot._client.on('ping', (data) => {
    bot._client.write('pong', {
      id: data.id
    })
  })
}
