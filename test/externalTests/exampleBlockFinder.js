const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.test.runExample('examples/blockfinder.js', async (name) => {
    assert.strictEqual(name, 'finder')
    // The example answers 'Ready!' only after its own waitForChunksToLoad,
    // so its world is already queryable here.
    await bot.test.tellAndListen(name, 'find dirt', (message) => {
      const matches = message.match(/I found ([0-9]+) (.+?) blocks in (.+?) ms/)
      if (matches.length !== 4 || matches[1] === '0' || matches[2] !== 'dirt' || parseFloat(matches[3]) > 500) {
        assert.fail(`Unexpected message: ${message}`) // error
      }
      return true // stop listening
    })
  })
}
