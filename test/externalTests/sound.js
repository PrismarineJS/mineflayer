const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test sound effect events
  const soundTest = async () => {
    const [soundName, position, volume, pitch] = await once(bot, 'soundEffectHeard', 10000)
    assert.strictEqual(typeof soundName, 'string')
    assert.strictEqual(typeof position, 'object')
    assert.strictEqual(typeof volume, 'number')
    assert.strictEqual(typeof pitch, 'number')
    assert.strictEqual(position.x, bot.entity.position.x)
    assert.strictEqual(position.y, bot.entity.position.y)
    assert.strictEqual(position.z, bot.entity.position.z)
  }

  // Test note block sounds
  const noteTest = async () => {
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    // Attach listener before placing blocks
    const noteHeardPromise = once(bot, 'noteHeard', 5000)
    // Place note block
    await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: 'note_block' })
    // Place redstone block below to power it
    await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'redstone_block' })
    // Wait for the note sound
    const [block, instrument, pitch] = await noteHeardPromise
    assert.strictEqual(typeof block, 'object')
    assert.strictEqual(typeof instrument, 'object')
    assert.strictEqual(typeof instrument.id, 'number')
    assert.strictEqual(typeof pitch, 'number')
  }

  // Test hardcoded sound effects
  const hardcodedTest = async () => {
    const [soundId, soundCategory, position, volume, pitch] = await once(bot, 'hardcodedSoundEffectHeard', 5000)
    assert.strictEqual(typeof soundId, 'number')
    assert.strictEqual(typeof soundCategory, 'string')
    assert.strictEqual(typeof position, 'object')
    assert.strictEqual(typeof volume, 'number')
    assert.strictEqual(typeof pitch, 'number')
  }

  try {
    // Play a sound effect at the bot's position (block.note_block.harp)
    bot.chat('/playsound minecraft:block.note_block.harp master @s ~ ~ ~ 1 1')
    await soundTest()

    // Place and play a note block
    await noteTest()

    // Play a hardcoded sound effect
    bot.chat('/playsound minecraft:ui.button.click master @s ~ ~ ~ 1 1')
    await hardcodedTest()
  } finally {
    // Cleanup: remove the note block and redstone block
    const pos = bot.entity.position.offset(1, 0, 0).floored()
    await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName: 'air' })
    await bot.test.setBlock({ x: pos.x, y: pos.y - 1, z: pos.z, blockName: 'air' })
  }
} 