const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.sayEverywhere('/weather rain')
  bot.on('rain', () => {
    assert.strictEqual(bot.test.isRaining, true)

    bot.test.sayEverywhere('/weather clear')
    assert.strictEqual(bot.test.isRaining, false)

    done()
  })
}
