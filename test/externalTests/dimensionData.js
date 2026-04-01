const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => {
  const tests = []

  function addTest (name, f) {
    tests[name] = (bot) => f(bot)
  }

  addTest('overworld properties', async (bot) => {
    // After spawn, bot.game.dimension should be set to 'overworld'
    assert.ok(bot.game.dimension, 'bot.game.dimension should be set after spawn')
    assert.strictEqual(bot.game.dimension, 'overworld', 'Dimension should be overworld on spawn')

    // minY and height should be populated from the dimension codec
    assert.strictEqual(typeof bot.game.minY, 'number', 'bot.game.minY should be a number')
    assert.strictEqual(typeof bot.game.height, 'number', 'bot.game.height should be a number')
    assert.ok(bot.game.height > 0, 'Height should be positive')

    // Overworld in modern versions has minY=-64, height=384; older versions have minY=0, height=256
    if (bot.supportFeature('dimensionDataInCodec')) {
      assert.strictEqual(bot.game.minY, -64, 'Overworld minY should be -64 for 1.18+')
      assert.strictEqual(bot.game.height, 384, 'Overworld height should be 384 for 1.18+')
    } else {
      assert.ok(bot.game.minY <= 0, 'minY should be <= 0')
      assert.ok(bot.game.height >= 256, 'Height should be at least 256')
    }
  })

  addTest('dimension change on respawn', async (bot) => {
    // After a /kill respawn, dimension data should still be correct
    bot.test.sayEverywhere(`/kill ${bot.username}`)
    await onceWithCleanup(bot, 'respawn', { timeout: 10000 })

    assert.ok(bot.game.dimension, 'bot.game.dimension should be set after respawn')
    assert.strictEqual(bot.game.dimension, 'overworld', 'Dimension should be overworld after respawn')
    assert.strictEqual(typeof bot.game.minY, 'number', 'minY should be a number after respawn')
    assert.strictEqual(typeof bot.game.height, 'number', 'height should be a number after respawn')
    assert.ok(bot.game.height > 0, 'Height should be positive after respawn')
  })

  return tests
}
