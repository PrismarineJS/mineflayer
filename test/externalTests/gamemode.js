// test to see if bot retains creative gamemode in bot object on death

const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = (supportedVersion) => {
  const tests = []
  const registry = require('prismarine-registry')(supportedVersion)
  const mcData = registry

  function addTest (name, f) {
    tests[name] = (bot) => f(bot)
  }

  addTest('change', async (bot) => {
    await bot.test.becomeSurvival()
    assert.strictEqual(bot.game.gameMode, 'survival', 'Wrong gamemode after switching gamemode')
    await bot.test.becomeCreative()
    assert.strictEqual(bot.game.gameMode, 'creative', 'Wrong gamemode after switching gamemode')
  })

  // Skip "after respawn" on versions < 1.14 — the /kill causes bot kicks that cascade
  // and break subsequent tests on 1.8-1.13. The gamemode-change test above covers the core logic.
  const majorMinor = mcData.version.majorVersion.split('.').map(Number) // e.g. "1.14" -> [1, 14]
  if (majorMinor[1] >= 14) {
    addTest('after respawn', async (bot) => {
      await bot.test.becomeCreative()
      bot.test.selfKill()
      await onceWithCleanup(bot, 'respawn', { timeout: 5000 })
      // Respawn packets send the gamemode. If the bot is in creative mode, it should respawn in creative mode. Tested <1.20
      assert.strictEqual(bot.game.gameMode, 'creative', 'Wrong gamemode after respawn')
    })
  }

  return tests
}
