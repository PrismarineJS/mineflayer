const nbt = require('prismarine-nbt')
const { parseServerBrand, requiresHandshake } = require('../mod_loader_detection')
const { ModLoaderFactory } = require('../mod_loaders')
const { extendBotWithForgeRegistry } = require('../forge_registry_integration')
module.exports = inject

const difficultyNames = ['peaceful', 'easy', 'normal', 'hard']
const gameModes = ['survival', 'creative', 'adventure', 'spectator']

const dimensionNames = {
  '-1': 'the_nether',
  0: 'overworld',
  1: 'the_end'
}

const parseGameMode = gameModeBits => {
  if (gameModeBits < 0 || gameModeBits > 0b11) {
    return 'survival'
  }
  return gameModes[(gameModeBits & 0b11)] // lower two bits
}

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
    // Either a respawn packet or a login packet. Depending on the packet it can be "gamemode" or "gameMode"
    if (bot.supportFeature('spawnRespawnWorldDataField')) { // 1.20.5
      bot.game.gameMode = packet.gamemode
    } else {
      bot.game.gameMode = parseGameMode(packet.gamemode ?? packet.gameMode)
    }
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
    } else if (bot.supportFeature('dimensionDataIsAvailable')) { // 1.16.2+
      const dimensionData = nbt.simplify(packet.dimension)
      bot.game.minY = dimensionData.min_y
      bot.game.height = dimensionData.height
    }

    if (packet.difficulty) {
      bot.game.difficulty = difficultyNames[packet.difficulty]
    }
  }

  bot.game = {}
  bot.modLoader = null

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

    // Parse mod loader information from server brand
    const modLoaderInfo = parseServerBrand(serverBrand)
    bot.game.modLoader = modLoaderInfo.type
    bot.game.modLoaderVersion = modLoaderInfo.version
    bot.game.modLoaderRaw = modLoaderInfo.raw
    bot.game.isModded = modLoaderInfo.type !== 'vanilla'

    // Initialize mod loader if detected and enabled
    if (bot.game.isModded && options.modLoader && options.modLoader.enabled) {
      try {
        // Create mod loader instance
        bot.modLoader = ModLoaderFactory.create(modLoaderInfo.type, bot, options.modLoader || {})

        if (bot.modLoader) {
          // Set up mod loader event handlers
          bot.modLoader.on('handshakeComplete', () => {
            // Extend bot with Forge registry integration
            extendBotWithForgeRegistry(bot)
            bot.emit('modLoaderReady', bot.modLoader)
          })

          bot.modLoader.on('error', (err) => {
            // Check if error handler provided suggestions
            if (err.code && bot.modLoader.errorHandler) {
              const suggestions = bot.modLoader.errorHandler.getRecoverySuggestions(err)
              const userMessage = bot.modLoader.errorHandler.createUserMessage(err)
              console.error(userMessage)
              if (suggestions.length > 0) {
                console.error('Recovery suggestions:')
                suggestions.forEach(suggestion => console.error(`  - ${suggestion}`))
              }
            }
            bot.emit('error', new Error(`Mod loader error: ${err.message}`))
          })

          bot.modLoader.on('retryHandshake', (delay) => {
            console.log(`Retrying handshake in ${delay}ms...`)
          })

          bot.modLoader.on('fallbackToVanilla', () => {
            console.warn('Falling back to vanilla mode due to mod loader errors')
            bot.game.isModded = false
            bot.modLoader = null
          })

          bot.modLoader.on('modsReceived', (mods) => {
            bot.game.mods = mods
            bot.emit('modsReceived', mods)
          })

          bot.modLoader.on('registryMappingUpdated', (registryName, mapping) => {
            bot.emit('registryMappingUpdated', registryName, mapping)
          })

          bot.modLoader.on('compatibilityIssues', (issues) => {
            bot.emit('modCompatibilityIssues', issues)
          })
          
          bot.modLoader.on('compatibilityIssuesDetected', (report) => {
            console.warn(`\n=== MOD COMPATIBILITY ISSUES DETECTED ===`)
            const status = bot.modLoader.getCompatibilityStatus()
            console.warn(`Status: ${status.status} - ${status.message}`)
            
            if (report.summary.critical > 0) {
              console.error(`Critical Issues: ${report.summary.critical}`)
            }
            if (report.summary.errors > 0) {
              console.error(`Errors: ${report.summary.errors}`)
            }
            if (report.summary.warnings > 0) {
              console.warn(`Warnings: ${report.summary.warnings}`)
            }
            
            // Show first few critical issues
            report.issues.slice(0, 3).forEach(issue => {
              console.error(`❌ ${issue.message}`)
              if (issue.suggestions) {
                issue.suggestions.slice(0, 2).forEach(suggestion => {
                  console.error(`   💡 ${suggestion}`)
                })
              }
            })
            
            if (report.issues.length > 3) {
              console.warn(`   ... and ${report.issues.length - 3} more issues`)
            }
            
            bot.emit('modCompatibilityReport', report)
          })
          
          bot.modLoader.on('compatibilityReport', (report) => {
            bot.emit('modCompatibilityReport', report)
          })

          // Start handshake if required
          if (bot.modLoader.requiresHandshake()) {
            bot.modLoader.startHandshake().catch(err => {
              const errorResult = bot.modLoader.handleHandshakeError(err)
              if (!errorResult.shouldRetry && !errorResult.fallbackTreatment) {
                bot.emit('error', new Error(`Failed to start mod loader handshake: ${err.message}`))
              }
            })
          }
        }

        // Add helper methods to bot
        bot.getMod = (modId) => bot.modLoader ? bot.modLoader.getMod(modId) : null
        bot.getAllMods = () => bot.modLoader ? bot.modLoader.getAllMods() : new Map()
        bot.getModCount = () => bot.modLoader ? bot.modLoader.registry.getModCount() : 0
        bot.findMods = (pattern) => bot.modLoader ? bot.modLoader.registry.findMods(pattern) : []
        bot.resolveModdedId = (registryType, numericId) =>
          bot.modLoader ? bot.modLoader.resolveId(registryType, numericId) : null
        bot.getModStats = () => bot.modLoader ? bot.modLoader.registry.getStats() : {}
        
        // Add compatibility checking methods
        bot.checkModCompatibility = () => bot.modLoader ? bot.modLoader.checkModCompatibility() : null
        bot.getCompatibilityStatus = () => bot.modLoader ? bot.modLoader.getCompatibilityStatus() : { status: 'unknown', message: 'No mod loader available' }
        bot.formatCompatibilityReport = () => bot.modLoader ? bot.modLoader.formatCompatibilityReport() : 'No mod loader available'
        bot.addModIncompatibility = (modId, incompatibleMods, reason) => {
          if (bot.modLoader) bot.modLoader.addIncompatibility(modId, incompatibleMods, reason)
        }
        bot.markModAsDeprecated = (modId, alternatives) => {
          if (bot.modLoader) bot.modLoader.markAsDeprecated(modId, alternatives)
        }

        // Emit mod loader detected event
        bot.emit('modLoaderDetected', {
          type: modLoaderInfo.type,
          version: modLoaderInfo.version,
          requiresHandshake: requiresHandshake(modLoaderInfo.type),
          modLoader: bot.modLoader
        })
      } catch (err) {
        if (err.message.includes('not yet implemented')) {
          bot.emit('error', new Error(`${modLoaderInfo.type} mod loader support is not yet implemented`))
        } else {
          bot.emit('error', new Error(`Failed to initialize mod loader: ${err.message}`))
        }
      }
    }
  })

  // mimic the vanilla 1.17 client to prevent anticheat kicks
  bot._client.on('ping', (data) => {
    bot._client.write('pong', {
      id: data.id
    })
  })
}
