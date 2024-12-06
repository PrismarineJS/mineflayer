// test to see if bot retains creative gamemode in bot object on death

const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => {
  const tests = []

  function addTest (name, f) {
    tests[name] = (bot) => f(bot)
  }

  addTest('change', async (bot) => {
    await bot.test.becomeSurvival()
    assert.strictEqual(bot.game.gameMode, 'survival', 'Wrong gamemode after switching gamemode')
    await bot.test.becomeCreative()
    assert.strictEqual(bot.game.gameMode, 'creative', 'Wrong gamemode after switching gamemode')
  })

  addTest('after respawn', async (bot) => {
    await bot.test.becomeCreative()
    bot.test.selfKill()
    await onceWithCleanup(bot, 'respawn', { timeout: 5000 })
    // Respawn packets send the gamemode. If the bot is in creative mode, it should respawn in creative mode. Tested <1.20
    assert.strictEqual(bot.game.gameMode, 'creative', 'Wrong gamemode after respawn')
  })

  return tests
}
