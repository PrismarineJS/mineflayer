/**
 * Velocity proxy support for Minecraft 1.20.2+ configuration phase
 *
 * This plugin manages the configuration phase introduced in Minecraft 1.20.2
 * and extended in 1.21+, which is required for proper server transfers via
 * Velocity proxy.
 *
 * During the configuration phase:
 * - Gameplay packets (movement, physics) are not allowed
 * - Only configuration packets should be sent
 * - Resource packs must be handled correctly
 *
 * Issue: https://github.com/PrismarineJS/mineflayer/issues/3764
 */

module.exports = inject

function inject (bot) {
  // Track whether we're in configuration phase
  bot.inConfigurationPhase = false
  let configurationFinished = false

  // Resource pack response codes
  const TEXTURE_PACK_RESULTS = {
    SUCCESSFULLY_LOADED: 0,
    DECLINED: 1,
    FAILED_DOWNLOAD: 2,
    ACCEPTED: 3
  }

  /**
   * Enter configuration phase
   */
  function enterConfigurationPhase () {
    if (bot.inConfigurationPhase) return

    bot.inConfigurationPhase = true
    configurationFinished = false

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

    // Re-enable physics after configuration
    setTimeout(() => {
      if (bot._physicsWasEnabled && !bot._ended) {
        bot.physicsEnabled = true
        delete bot._physicsWasEnabled
      }
    }, 2000)

    bot.emit('configurationPhase', 'end')
  }

  // === CONFIGURATION PHASE DETECTION ===

  // Method 1: start_configuration event (1.20.2+)
  bot._client.on('start_configuration', () => {
    enterConfigurationPhase()
  })

  // Method 2: select_known_packs event (1.21+)
  bot._client.on('select_known_packs', (packet) => {
    enterConfigurationPhase()
    // Note: No response needed for select_known_packs
  })

  // Method 3: registry_data event (1.20.2+)
  bot._client.on('registry_data', (packet) => {
    // Only enter if not already in configuration phase
    // (registry_data can be sent multiple times)
    if (!bot.inConfigurationPhase) {
      enterConfigurationPhase()
    }
  })

  // Method 4: transfer event (1.20.5+)
  bot._client.on('transfer', (packet) => {
    enterConfigurationPhase()
  })

  // === AUTOMATIC RESOURCE PACK ACCEPTANCE ===

  /**
   * Automatically accept resource packs during configuration phase
   * This is required for Velocity transfers to complete successfully
   */

  // Handle add_resource_pack (1.20.3+)
  bot._client.prependListener('add_resource_pack', (data) => {
    if (!bot.inConfigurationPhase) return

    // Send ACCEPTED immediately
    bot._client.write('resource_pack_receive', {
      uuid: data.uuid,
      result: TEXTURE_PACK_RESULTS.ACCEPTED
    })

    // Send SUCCESSFULLY_LOADED immediately
    // Server needs this before sending finish_configuration
    bot._client.write('resource_pack_receive', {
      uuid: data.uuid,
      result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
    })
  })

  // Handle resource_pack_send (older versions with UUID support)
  bot._client.prependListener('resource_pack_send', (data) => {
    if (!bot.inConfigurationPhase) return
    if (!data.uuid) return // Only handle UUID-based resource packs

    const UUID = require('uuid-1345')
    const uuid = new UUID(data.uuid)

    // Send ACCEPTED immediately
    bot._client.write('resource_pack_receive', {
      uuid: uuid,
      result: TEXTURE_PACK_RESULTS.ACCEPTED
    })

    // Send SUCCESSFULLY_LOADED immediately
    bot._client.write('resource_pack_receive', {
      uuid: uuid,
      result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
    })
  })

  // === FINISH CONFIGURATION ===

  bot._client.on('finish_configuration', () => {
    configurationFinished = true

    // Acknowledge finish_configuration
    try {
      bot._client.write('finish_configuration', {})
    } catch (err) {
      // Ignore if packet doesn't exist for this version
    }

    // Exit configuration phase after a short delay
    setTimeout(() => {
      exitConfigurationPhase()
    }, 500)
  })

  // === FALLBACKS ===

  // Fallback: Exit on login if we're still in configuration phase
  bot.on('login', () => {
    if (bot.inConfigurationPhase && configurationFinished) {
      exitConfigurationPhase()
    }
  })

  // Fallback: Exit on spawn if we're still in configuration phase
  bot.on('spawn', () => {
    if (bot.inConfigurationPhase) {
      exitConfigurationPhase()
    }
  })

  // Cleanup on end
  bot.on('end', () => {
    bot.inConfigurationPhase = false
    configurationFinished = false
  })
}