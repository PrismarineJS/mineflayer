const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/inventory.js', (name, cb) => {
    assert.strictEqual(name, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/give inventory dirt 64')
    const inventoryTest = [
      cb => {
        bot.test.tellAndListen(name, 'list', (message) => {
          if (!message.startsWith('dirt x 64')) {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      },
      cb => {
        bot.test.tellAndListen(name, 'equip hand dirt', (message) => {
          if (!message.startsWith('equipped dirt')) {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      },
      cb => {
        bot.test.tellAndListen(name, 'toss 64 dirt', (message) => {
          if (!message.startsWith('tossed 64 x dirt')) {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      }
    ]
    setTimeout(() => {
      bot.test.callbackChain(inventoryTest, cb)
    }, 2000)
  }, done)
}
