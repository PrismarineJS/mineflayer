const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.sayEverywhere('/weather clear')
  setTimeout(() => {
    bot.test.sayEverywhere('/weather rain')

    let raining = true
    function rainListener () {
      if (raining) {
        assert.strictEqual(bot.isRaining, true)
        bot.test.sayEverywhere('/weather clear')
        raining = false
        return
      }

      assert.strictEqual(bot.isRaining, false)
      bot.removeListener('rain', rainListener)
      done()
    }

    bot.on('rain', rainListener)
  }, 1000)
}
