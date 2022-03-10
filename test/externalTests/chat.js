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

  addTest('test removeChatPattern', async (bot) => {
    await once(bot, 'message') // => starting chat test removeChatPattern
    bot.addChatPattern('test', /<.+> Hello/)
    bot.removeChatPattern('test')
    let triggered = false
    const listener = () => { triggered = true }
    bot.once('chat:test', listener)
    bot.chat('/tellraw @p {"translate":"chat.type.text", "with":["U9G", "Hello"]}')
    await once(bot, 'message')
    assert.ok(triggered === false)
    bot.off('chat:test', listener)
  })

  addTest('test awaitMessage', async (bot) => {
    // let resolves = 0
    const p1 = bot.awaitMessage('<flatbot> hello')
    bot.chat('hello')
    await p1
    const p2 = bot.awaitMessage(['<flatbot> hello', '<flatbot> world'])
    bot.chat('world')
    await p2
    const p3 = bot.awaitMessage(/<.+> hello/)
    bot.chat('hello')
    await p3
    const p4 = bot.awaitMessage([/<.+> hello/, /<.+> world/])
    bot.chat('world')
    await p4
  })

  addTest('test removechatpattern with a number input', async (bot) => {
    const patternIndex = bot.addChatPattern('hello', /hello/)
    bot.chat('hello')
    await once(bot, 'chat:hello')
    bot.removeChatPattern(patternIndex)
    let listener
    await new Promise((resolve, reject) => {
      listener = (msg) => {
        console.log('reacting to msg: ')
        console.log(msg)
        reject(new Error("Hello event shouldn't work after removing it"))
      }
      bot.on('chat:hello', listener)
      bot.once('message', () => {
        // wait half a second to make sure we aren't going to react to the msg
        setTimeout(() => resolve(), 500)
      })
      bot.chat('hello')
    })
    bot.off('chat:hello', listener)
  })

  return tests
}
