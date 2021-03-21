const assert = require('assert')
const { once } = require('events')

module.exports = () => {
  async function runTest (bot, testFunction) { // eslint-disable-line
    await testFunction(bot)
  }

  const tests = []

  function addTest (name, f) {
    tests[name] = bot => runTest(bot, f)
  }

  addTest('start tests', async (bot) => {
    await once(bot, 'message') // => <flatbot> starting chat test message event
  })

  addTest('test message event', async (bot) => {
    await bot.test.wait(500)
    bot.chat('/tellraw @p {"translate":"language.name"}')
    const [json] = await once(bot, 'message')
    const str = json.toString()
    assert.strictEqual(str, 'English')
  })

  addTest('test chatAddPattern', async (bot) => {
    await once(bot, 'message') // => starting chat test chatAddPattern
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "Hello World!"]}')
    const [username, message, messageType, chatMessage] = await once(bot, 'chat')
    assert.strictEqual(username, 'U9G')
    assert.strictEqual(message, 'Hello World!')
    assert.strictEqual(messageType, 'chat.type.text')
    assert.strictEqual(chatMessage.constructor.name, 'ChatMessage')
  })

  return tests
}
