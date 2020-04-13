const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/bee.js', (name, cb) => {
    assert.strictEqual(name, 'bee')
    bot.chat('/op bee') // to counteract spawn protection
    const beeTest = [
      cb => {
        bot.test.tellAndListen(name, 'fly', (message) => {
          if (message !== 'My flight was amazing !') {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      }
    ]
    setTimeout(() => {
      bot.test.callbackChain(beeTest, cb)
    }, 2000)
  }, done)
}
