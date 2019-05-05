const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.sayEverywhere('/scoreboard objectives add test1 health')
  bot.test.sayEverywhere('/scoreboard objectives add test2 deathCount')
  bot.test.sayEverywhere('/scoreboard objectives add test3 dummy')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay sidebar test1')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay belowName test1')
  bot.test.sayEverywhere('/scoreboard objectives setdisplay list test2')
  bot.test.sayEverywhere(`/scoreboard players add ${bot.username} test3 1`)
  bot.test.sayEverywhere(`/scoreboard players reset ${bot.username}`)

  let scoreboards = Object.keys(bot.scoreboards).length
  if (scoreboards === 2) {
    setTimeout(test, 500)
  } else {
    bot.on('scoreboardCreated', (scoreboard) => {
      scoreboards += 1
      if (scoreboards === 2) test()
    })
  }

  function test () {
    bot.test.sayEverywhere('/kill')
    assert.notStrictEqual(bot.scoreboards.test1, undefined)
    assert.notStrictEqual(bot.scoreboards.test2, undefined)

    const { test1, test2 } = bot.scoreboards
    assert.strictEqual(test2.name, test2.title)
    assert.strictEqual(test1, bot.scoreboard.sidebar)

    bot.once('scoreUpdated', (scoreboard, updated) => {
      assert.strictEqual(scoreboard.itemsMap[bot.username], updated)
      done()
    })
  }
}
