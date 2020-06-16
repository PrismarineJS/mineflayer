const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/blockfinder.js', (name, cb) => {
    assert.strictEqual(name, 'finder')
    const finderTest = [
      cb => {
        bot.test.tellAndListen(name, 'find dirt', (message) => {
          const matches = message.match(/I found ([0-9]+) (.+?) blocks in (.+?) ms/)
          if (matches.length !== 4 || matches[1] === '0' || matches[2] !== 'dirt' || parseFloat(matches[3]) > 500) {
            assert.fail(`Unexpected message: ${message}`) // error
          }
          return true // stop listening
        }, cb)
      }
    ]
    setTimeout(() => {
      bot.test.callbackChain(finderTest, cb)
    }, 2000)
  }, done)
}
