// const assert = require('assert')
// const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // TODO: This is failing randomly, investigate and fix
  /* bot.test.sayEverywhere('/scoreboard objectives add test1 health')
  bot.test.sayEverywhere('/scoreboard objectives add test2 deathCount')
  bot.test.sayEverywhere('/scoreboard objectives add test3 dummy')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay sidebar test1')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay belowName test1')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay list test2')
  bot.test.sayEverywhere(`/scoreboard players add ${bot.username} test3 1`)
  bot.test.sayEverywhere(`/scoreboard players reset ${bot.username}`)

  let scoreboards = Object.keys(bot.scoreboards).length
  if (scoreboards !== 2) {
    await once(bot, 'scoreboardCreated')
    scoreboards++
    if (scoreboards !== 2) {
      await once(bot, 'scoreboardCreated')
    }
  }
  await bot.test.wait(500)

  assert.notStrictEqual(bot.scoreboards.test1, undefined)
  assert.notStrictEqual(bot.scoreboards.test2, undefined)

  const { test1, test2 } = bot.scoreboards
  assert.strictEqual(test2.name, test2.title)
  assert.strictEqual(test1, bot.scoreboard.sidebar)

  const promise = once(bot, 'scoreUpdated')
  bot.test.sayEverywhere(`/kill ${bot.username}`)
  const [scoreboard, updated] = await promise
  assert.strictEqual(scoreboard.itemsMap[bot.username], updated) */
}
