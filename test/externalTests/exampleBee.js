const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.test.runExample('examples/bee.js', async (name) => {
    assert.strictEqual(name, 'bee')
    bot.chat('/op bee') // to counteract spawn protection
    await bot.test.wait(2000)
    await bot.test.tellAndListen(name, 'fly', (message) => {
      if (message !== 'My flight was amazing !') {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
  })
}
