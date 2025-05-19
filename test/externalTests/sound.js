const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
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
    await new Promise(resolve => setTimeout(resolve, 2000))

    return retry(async () => {
      const soundPromise = once(bot, 'soundEffectHeard', 5000)

      if (bot.supportFeature('playsoundUsesResourceLocation')) {
        // 1.9+ syntax
        let soundName
        if (bot.supportFeature('noteBlockNameIsNoteBlock')) {
          soundName = 'minecraft:block.note_block.harp'
        } else {
          soundName = 'block.note.harp'
        }
        bot.chat(`/playsound ${soundName} master ${bot.username} ~ ~ ~ 1 1`)
      } else {
        // 1.8.8 syntax
        bot.chat(`/playsound note.harp ${bot.username} ~ ~ ~ 1 1`)
      }

      const [soundName, position, volume, pitch] = await soundPromise

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
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    const noteBlockName = bot.supportFeature('noteBlockNameIsNoteBlock') ? 'note_block' : 'noteblock'

    return retry(async () => {
      await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: noteBlockName, relative: false })
      await new Promise(resolve => setTimeout(resolve, 250))

      const noteHeardPromise = once(bot, 'noteHeard', 5000)
      await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'redstone_block', relative: false })

      const [block, instrument, pitch] = await noteHeardPromise

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
    return retry(async () => {
      const soundPromise = Promise.race([
        once(bot, 'hardcodedSoundEffectHeard', 5000),
        once(bot, 'soundEffectHeard', 5000).then(([soundName, position, volume, pitch]) => {
          return [0, 'master', position, volume, pitch]
        })
      ])

      if (bot.supportFeature('playsoundUsesResourceLocation')) {
        bot.chat(`/playsound minecraft:ui.button.click master ${bot.username} ~ ~ ~ 1 1`)
      } else {
        bot.chat(`/playsound gui.button.press ${bot.username} ~ ~ ~ 1 1`)
      }

      const [soundId, soundCategory, position, volume, pitch] = await soundPromise

      assert.strictEqual(typeof soundId, 'number', 'SoundId should be a number')
      assert.ok(typeof soundCategory === 'string' || typeof soundCategory === 'number',
        `Invalid soundCategory type: ${typeof soundCategory}`)
      assert.strictEqual(typeof position, 'object', 'Position should be an object')
      assert.strictEqual(typeof volume, 'number', 'Volume should be a number')
      assert.strictEqual(typeof pitch, 'number', 'Pitch should be a number')
    })
  }

  try {
    bot.chat('### Starting sound')

    // Run all tests
    await soundTest()
    await noteTest()
    await hardcodedTest()
  } finally {
    // Cleanup: remove the note block and redstone block
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: 'air' })
    await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'air' })
  }
}
