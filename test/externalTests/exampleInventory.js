const assert = require('assert')
// const { callbackify } = require('util')

const tests = [
  {
    command: 'list',
    wantedMessage: 'dirt x 64'
  },

  {
    command: 'equip hand dirt',
    wantedMessage: 'equipped dirt'
  },

  {
    command: 'toss 64 dirt',
    wantedMessage: 'tossed 64 x dirt'
  }
]

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/inventory.js', (ign, cb) => {
    assert.strictEqual(ign, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/give inventory dirt 64')
    const inventoryTest = Object.values(tests).map(testData => generateTest(testData, cb))
    // start test
    setTimeout(() => {
      bot.test.callbackChain(inventoryTest, cb)
    }, 2000)

    function generateTest ({ command, wantedMessage }, cb) {
      return () => bot.test.tellAndListen(ign, command, makeListener(wantedMessage), cb)
    }
  }, done)
}

function makeListener (wantedMessage) {
  return message => {
    if (!message.startsWith(wantedMessage)) {
      assert.fail(`Unexpected message: ${message}`) // error
    }
    return true // stop listening
  }
}
