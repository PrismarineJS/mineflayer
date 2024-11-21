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

    bot.chat('/kill')

    await onceWithCleanup(bot, 'respawn', { timeout: 2000 })
    assert.strictEqual(bot.game.gameMode, 'creative', 'Wrong gamemode after respawn')
  })

  return tests
}
