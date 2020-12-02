const assert = require('assert')

module.exports = () => (bot, done) => {
  const { position } = bot.entity
  bot.lookAt(position.offset(0, 3, 0), true, () => {
    const block = bot.blockAtCursor()
    assert.strictEqual(block, null)

    bot.lookAt(position.offset(0, -3, 0), true, () => {
      const block = bot.blockAtCursor()
      const relBlock = bot.blockAt(position.offset(0, -1, 0))

      assert.deepStrictEqual(block, relBlock)
      done()
    })
  })
}
