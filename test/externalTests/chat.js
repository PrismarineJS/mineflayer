const assert = require('assert')
const { once } = require('events')

module.exports = () => {
  async function runTest (bot, testFunction) {
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
    const [username, message, translate, chatMessage] = await once(bot, 'chat')
    assert.strictEqual(username, 'U9G')
    assert.strictEqual(message, 'Hello World!')
    assert.strictEqual(translate, 'chat.type.text')
    assert.strictEqual(chatMessage.constructor.name, 'ChatMessage')
  })

  addTest('test addChatPattern', async (bot) => {
    await once(bot, 'message') // => starting chat test chatAddPattern
    bot.addChatPattern('theTest', /<.+> Hello World!!!!/, { repeat: false })
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "Hello World!!!!"]}')
    const [[match]] = await once(bot, 'chat:theTest')
    assert.strictEqual(match, '<U9G> Hello World!!!!')
  })

  addTest('test parse', async (bot) => {
    await once(bot, 'message') // => starting chat test chatAddPattern
    bot.addChatPattern('theTest', /<.+> Hello World(!!!!)/, { repeat: false, parse: true })
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "Hello World!!!!"]}')
    const [[matches]] = await once(bot, 'chat:theTest')
    assert.strictEqual(matches[0], '!!!!')
  })

  addTest('test addChatPatterns', async (bot) => {
    await once(bot, 'message') // => starting chat test chatAddPattern
    bot.addChatPatternSet('theTest', [/<.+> Hello/, /<.+> World/], { repeat: false })
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "Hello"]}')
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "World"]}')
    const [[partOne, partTwo]] = await once(bot, 'chat:theTest')
    assert.strictEqual(partOne, '<U9G> Hello')
    assert.strictEqual(partTwo, '<U9G> World')
  })

  return tests
}
