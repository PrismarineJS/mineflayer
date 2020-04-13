const assert = require('assert')

module.exports = () => (bot, done) => {
  const digger = cb => {
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
    }, cb)
  }

  const bee = cb => {
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
    }, cb)
  }

  const examplesTest = [
    digger,
    bee
  ]

  bot.test.callbackChain(examplesTest, done)
}
