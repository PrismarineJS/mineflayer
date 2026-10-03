const assert = require('assert')

const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  await bot.test.runExample('examples/digger.js', async (name) => {
    assert.strictEqual(name, 'digger')
    // Both commands must be confirmed before digging: the op counteracts
    // spawn protection and the dirt is needed by the later equip step.
    const opped = onceWithCleanup(bot, 'messagestr', {
      timeout: 5000,
      checkCondition: (msg) => msg.includes(`Opped ${name}`) || msg.includes(`Made ${name} a server operator`)
    })
    // Old versions render the give feedback with unsubstituted placeholders
    // ("Given [Dirt] * %d to 64"), so only the prefix can be matched.
    const given = onceWithCleanup(bot, 'messagestr', {
      timeout: 5000,
      checkCondition: (msg) => msg.startsWith('Given') || msg.startsWith('Gave')
    })
    bot.chat(`/op ${name}`) // to counteract spawn protection
    bot.chat(`/give ${name} dirt 64`)
    await Promise.all([opped, given])
    await bot.test.tellAndListen(name, 'dig', (message) => {
      if (message.startsWith('starting')) {
        return false // continue to listen
      } else if (message.startsWith('finished')) {
        return true // stop listening
      }
      assert.fail(`Unexpected message: ${message}`) // error
    })
    await bot.test.tellAndListen(name, 'equip dirt', (message) => {
      if (!message.startsWith('equipped dirt')) {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
    await bot.test.tellAndListen(name, 'build', (message) => {
      if (message !== 'Placing a block was successful') {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
  })
}
