const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.sayEverywhere('/weather clear')
  setTimeout(() => {
    bot.test.sayEverywhere('/weather rain')

    let raining = true
    bot.on('rain', () => {
      if (raining) {
        assert.strictEqual(bot.isRaining, true)
        bot.test.sayEverywhere('/weather clear')
        raining = false
        return
      }

      assert.strictEqual(bot.isRaining, false)
      done()
    })
  }, 1000)
}
