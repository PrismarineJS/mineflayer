const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const p = once(bot, 'teamMemberAdded')
  if (bot.supportFeature('teamUsesChatComponents')) {
    bot.test.sayEverywhere('/team add test "test"')
    bot.test.sayEverywhere('/team modify test color dark_green')
    bot.test.sayEverywhere(`/team join test ${bot.username}`)
  } else {
    bot.test.sayEverywhere('/scoreboard teams add test')
    bot.test.sayEverywhere('/scoreboard teams option test color dark_green')
    bot.test.sayEverywhere('/scoreboard teams join test')
  }

  await p

  assert.notStrictEqual(bot.teams.test, undefined)
  assert.notStrictEqual(bot.teamMap[bot.username], undefined, 'teamMap is not undefined')

  const { test } = bot.teams

  assert.strictEqual(test.name.toString(), 'test')
}
