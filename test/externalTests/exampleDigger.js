const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/digger.js', (name, cb) => {
    assert.strictEqual(name, 'digger')
    bot.chat('/op digger') // to counteract spawn protection
    bot.chat('/give digger dirt 64')
    const diggerTest = [
      cb => {
        bot.test.tellAndListen(name, 'dig', (message) => {
          if (message.startsWith('starting')) {
            return false // continue to listen
          } else if (message.startsWith('finished')) {
            return true // stop listening
          } else {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      },
      cb => {
        bot.test.tellAndListen(name, 'equip dirt', (message) => {
          if (!message.startsWith('equipped dirt')) {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      },
      cb => {
        bot.test.tellAndListen(name, 'build', (message) => {
          if (message !== 'Placing a block was successful') {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      }
    ]
    setTimeout(() => {
      bot.test.callbackChain(diggerTest, cb)
    }, 2000)
  }, done)
}
