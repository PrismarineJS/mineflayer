/**
 * Velocity proxy support for Minecraft 1.20.2+ configuration phase
 *
 * This plugin manages the re-configuration phase that occurs during
 * server transfers via Velocity proxy. It does NOT interfere with the
 * initial login configuration (handled by node-minecraft-protocol).
 *
 * During re-configuration:
 * - Gameplay packets (movement, physics) are not allowed
 * - Resource packs must be accepted for the transfer to complete
 *
 * Issue: https://github.com/PrismarineJS/mineflayer/issues/3764
 */

module.exports = inject

function inject (bot) {
  // Track whether we're in configuration phase
  bot.inConfigurationPhase = false

  // Only activate after the first spawn -- the initial login configuration
  // is already handled by node-minecraft-protocol and we must not interfere.
  let hasInitiallySpawned = false

  // Resource pack response codes
  const TEXTURE_PACK_RESULTS = {
    SUCCESSFULLY_LOADED: 0,
    DECLINED: 1,
    FAILED_DOWNLOAD: 2,
    ACCEPTED: 3
  }

  /**
   * Enter configuration phase (only for re-entry, not initial login)
   */
  function enterConfigurationPhase () {
    if (bot.inConfigurationPhase) return
    if (!hasInitiallySpawned) return

    bot.inConfigurationPhase = true

    // Disable physics during configuration to prevent movement packets
    if (bot.physicsEnabled !== undefined) {
      bot._physicsWasEnabled = bot.physicsEnabled
      bot.physicsEnabled = false
    }

    bot.emit('configurationPhase', 'start')
  }

  /**
   * Exit configuration phase
   */
  function exitConfigurationPhase () {
    if (!bot.inConfigurationPhase) return

    bot.inConfigurationPhase = false

    // Re-enable physics after a short delay to let the server finish setup
    setTimeout(() => {
      if (bot._physicsWasEnabled && !bot._ended) {
        bot.physicsEnabled = true
        delete bot._physicsWasEnabled
      }
    }, 2000)

    bot.emit('configurationPhase', 'end')
  }

  // Mark initial spawn complete -- after this, configuration phase events
  // are treated as Velocity re-configuration (server transfers).
  bot.once('spawn', () => {
    hasInitiallySpawned = true
  })

  // === CONFIGURATION PHASE DETECTION ===

  // start_configuration is sent by the server to re-enter config state (1.20.2+)
  bot._client.on('start_configuration', () => {
    enterConfigurationPhase()
  })

  // transfer event (1.20.5+) -- server is transferring us
  bot._client.on('transfer', () => {
    enterConfigurationPhase()
  })

  // === AUTOMATIC RESOURCE PACK ACCEPTANCE ===

  // Automatically accept resource packs during configuration phase.
  // This is required for Velocity transfers to complete -- the server
  // waits for SUCCESSFULLY_LOADED before sending finish_configuration.

  // Handle add_resource_pack (1.20.3+)
  bot._client.prependListener('add_resource_pack', (data) => {
    if (!bot.inConfigurationPhase) return

    bot._client.write('resource_pack_receive', {
      uuid: data.uuid,
      result: TEXTURE_PACK_RESULTS.ACCEPTED
    })

    bot._client.write('resource_pack_receive', {
      uuid: data.uuid,
      result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
    })
  })

  // Handle resource_pack_send (older versions with UUID support)
  bot._client.prependListener('resource_pack_send', (data) => {
    if (!bot.inConfigurationPhase) return
    if (!data.uuid) return

    const UUID = require('uuid-1345')
    const resourceUuid = new UUID(data.uuid)

    bot._client.write('resource_pack_receive', {
      uuid: resourceUuid,
      result: TEXTURE_PACK_RESULTS.ACCEPTED
    })

    bot._client.write('resource_pack_receive', {
      uuid: resourceUuid,
      result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
    })
  })

  // === EXIT CONFIGURATION ===

  // node-minecraft-protocol already writes the finish_configuration
  // acknowledgement and transitions to PLAY state. We just need to
  // track it so we can re-enable physics.
  bot._client.on('finish_configuration', () => {
    // Small delay to let the play state fully initialize
    setTimeout(() => {
      exitConfigurationPhase()
    }, 500)
  })

  // Fallback: exit on spawn if we're still in configuration phase
  bot.on('spawn', () => {
    if (bot.inConfigurationPhase) {
      exitConfigurationPhase()
    }
  })

  // Cleanup on end
  bot.on('end', () => {
    bot.inConfigurationPhase = false
    delete bot._physicsWasEnabled
  })
}
