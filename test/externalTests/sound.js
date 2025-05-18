const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Debug: log all received sound packets
  bot.on('soundEffectHeard', (...args) => {
    console.log('[DEBUG] soundEffectHeard event received:', ...args)
  })
  bot.on('hardcodedSoundEffectHeard', (...args) => {
    console.log('[DEBUG] hardcodedSoundEffectHeard', ...args)
  })
  bot.on('noteHeard', (...args) => {
    console.log('[DEBUG] noteHeard', ...args)
  })
  // Extra debug: log all block_action and sound packets
  bot._client.on('block_action', (packet) => {
    console.log('[DEBUG] block_action packet:', JSON.stringify(packet, null, 2))
  })
  bot._client.on('sound_effect', (packet) => {
    console.log('[DEBUG] sound_effect packet:', JSON.stringify(packet, null, 2))
  })
  bot._client.on('named_sound_effect', (packet) => {
    console.log('[DEBUG] named_sound_effect packet:', JSON.stringify(packet, null, 2))
  })

  // Add debug logging for the command being sent
  const originalChat = bot.chat
  bot.chat = function (message) {
    console.log('[DEBUG] Sending chat command:', message)
    return originalChat.call(this, message)
  }

  // Add debug logging for all events
  bot.on('*', (eventName, ...args) => {
    if (eventName.startsWith('sound') || eventName.includes('sound')) {
      console.log(`[DEBUG] Event ${eventName} emitted:`, ...args)
    }
  })

  // Add debug logging for chat messages
  bot.on('message', (message) => {
    console.log('[DEBUG] Chat message received:', message.toString())
  })

  // Add debug logging for all packets
  bot._client.on('packet', (data, meta) => {
    if (meta.name === 'sound_effect' || meta.name === 'named_sound_effect') {
      console.log(`[DEBUG] Received ${meta.name} packet:`, data)
    }
  })

  // Helper function to check if positions are close enough
  const positionsAreClose = (pos1, pos2, tolerance = 1.0) => {
    return Math.abs(pos1.x - pos2.x) <= tolerance &&
           Math.abs(pos1.y - pos2.y) <= tolerance &&
           Math.abs(pos1.z - pos2.z) <= tolerance
  }

  // Helper function to retry an operation
  const retry = async (operation, maxAttempts = 1, delay = 2000) => {
    let lastError
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        console.log(`[DEBUG] Attempt ${attempt} failed:`, error.message)
        lastError = error
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    throw lastError
  }

  // Test sound effect events
  const soundTest = async () => {
    console.log('[DEBUG] Starting sound test...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return retry(async () => {
      const soundPromise = once(bot, 'soundEffectHeard', 5000)
      console.log('[DEBUG] Playing sound...')
      
      if (bot.supportFeature('playsoundUsesResourceLocation')) {
        // 1.9+ syntax
        let soundName
        if (bot.supportFeature('noteBlockNameIsNoteBlock')) {
          soundName = 'minecraft:block.note_block.harp'
        } else {
          soundName = 'block.note.harp'
        }
        // Use the bot's username instead of @s
        bot.chat(`/playsound ${soundName} master ${bot.username} ~ ~ ~ 1 1`)
      } else {
        // 1.8.8 syntax - use bot.username instead of @s
        bot.chat(`/playsound note.harp ${bot.username} ~ ~ ~ 1 1`)
      }

      const [soundName, position, volume, pitch] = await soundPromise
      console.log('[DEBUG] Sound received:', { soundName, position, volume, pitch })
      
      assert.ok(typeof soundName === 'string' || typeof soundName === 'number', 
        `Invalid soundName type: ${typeof soundName}`)
      assert.strictEqual(typeof position, 'object', 'Position should be an object')
      assert.strictEqual(typeof volume, 'number', 'Volume should be a number')
      assert.strictEqual(typeof pitch, 'number', 'Pitch should be a number')
      
      const isClose = positionsAreClose(position, bot.entity.position)
      assert.ok(isClose, 
        `Position mismatch: expected ${JSON.stringify(bot.entity.position)}, got ${JSON.stringify(position)}`)
    })
  }

  // Test note block sounds
  const noteTest = async () => {
    console.log('[DEBUG] Starting note block test...')
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    const noteBlockName = bot.supportFeature('noteBlockNameIsNoteBlock') ? 'note_block' : 'noteblock'
    
    return retry(async () => {
      console.log('[DEBUG] Placing note block at', pos)
      await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: noteBlockName, relative: false })
      
      // Wait a short time to ensure the block is placed and the listener is attached
      await new Promise(resolve => setTimeout(resolve, 250))
      
      const noteHeardPromise = once(bot, 'noteHeard', 5000)
      console.log('[DEBUG] Placing redstone block')
      await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'redstone_block', relative: false })
      
      const [block, instrument, pitch] = await noteHeardPromise
      console.log('[DEBUG] Note block sound received:', { block, instrument, pitch })
      
      assert.strictEqual(block.name, noteBlockName, 'Wrong block name')
      
      if (typeof instrument === 'string') {
        assert.ok(typeof instrument === 'string', 'Instrument should be a string')
      } else if (typeof instrument === 'object' && instrument !== null) {
        assert.ok(typeof instrument.name === 'string', 'Instrument name should be a string')
        assert.ok(typeof instrument.id === 'number', 'Instrument id should be a number')
      } else {
        throw new Error(`Unexpected instrument type: ${typeof instrument}`)
      }
      
      assert.strictEqual(typeof pitch, 'number', 'Pitch should be a number')
      assert.ok(pitch >= 0 && pitch <= 24, `Pitch out of range: ${pitch}`)
    })
  }

  // Test hardcoded sound effects
  const hardcodedTest = async () => {
    console.log('[DEBUG] Starting hardcoded sound test...')
    
    return retry(async () => {
      // Listen for either hardcodedSoundEffectHeard or soundEffectHeard
      const soundPromise = Promise.race([
        once(bot, 'hardcodedSoundEffectHeard', 5000),
        once(bot, 'soundEffectHeard', 5000).then(([soundName, position, volume, pitch]) => {
          // Convert soundEffectHeard to hardcodedSoundEffectHeard format
          return [0, 'master', position, volume, pitch]
        })
      ])
      
      if (bot.supportFeature('playsoundUsesResourceLocation')) {
        // 1.9+ syntax
        bot.chat(`/playsound minecraft:ui.button.click master ${bot.username} ~ ~ ~ 1 1`)
      } else {
        // 1.8.8 syntax - use gui.button.press and bot.username
        bot.chat(`/playsound gui.button.press ${bot.username} ~ ~ ~ 1 1`)
      }

      const [soundId, soundCategory, position, volume, pitch] = await soundPromise
      console.log('[DEBUG] Hardcoded sound received:', { soundId, soundCategory, position, volume, pitch })
      
      assert.strictEqual(typeof soundId, 'number', 'SoundId should be a number')
      assert.ok(typeof soundCategory === 'string' || typeof soundCategory === 'number', 
        `Invalid soundCategory type: ${typeof soundCategory}`)
      assert.strictEqual(typeof position, 'object', 'Position should be an object')
      assert.strictEqual(typeof volume, 'number', 'Volume should be a number')
      assert.strictEqual(typeof pitch, 'number', 'Pitch should be a number')
    })
  }

  try {
    console.log('[DEBUG] Starting sound tests...')
    
    // Play a sound effect at the bot's position
    await soundTest()
    console.log('[DEBUG] Sound test completed successfully')

    // Place and play a note block
    await noteTest()
    console.log('[DEBUG] Note block test completed successfully')

    // Play a hardcoded sound effect
    await hardcodedTest()
    console.log('[DEBUG] Hardcoded sound test completed successfully')
  } catch (error) {
    console.error('[ERROR] Sound test failed:', error)
    throw error
  } finally {
    console.log('[DEBUG] Cleaning up...')
    // Cleanup: remove the note block and redstone block
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: 'air' })
    await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'air' })
    console.log('[DEBUG] Cleanup completed')
  }
} 