const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.test.runExample('examples/inventory.js', async (name, cb) => {
    assert.strictEqual(name, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/give inventory dirt 64')
    await bot.test.wait(2000)
    await bot.test.tellAndListen(name, 'list', (message) => {
      if (!message.startsWith('dirt x 64')) {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
    await bot.test.tellAndListen(name, 'equip hand dirt', (message) => {
      if (!message.startsWith('equipped dirt')) {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
    await bot.test.tellAndListen(name, 'toss 64 dirt', (message) => {
      if (!message.startsWith('tossed 64 x dirt')) {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
    cb()
  })
}
