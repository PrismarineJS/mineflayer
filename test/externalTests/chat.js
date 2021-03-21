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
    await once(bot, 'chat') // => <flatbot> starting chat test message event
  })

  addTest('test message event', async (bot) => {
    await bot.test.wait(500)
    bot.chat('/tellraw @p {"translate":"language.name"}')
    const [json] = await once(bot, 'message')
    const str = json.toString()
    console.log(str)
    assert.strictEqual(str, 'English')
  })

  return tests
}
