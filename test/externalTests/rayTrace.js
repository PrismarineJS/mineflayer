const assert = require('assert')
const { BlockFace } = require('prismarine-world').iterators

module.exports = () => (bot, done) => {
  const { position } = bot.entity
  bot.lookAt(position.offset(0, 3, 0), true, () => {
    let block = bot.blockAtCursor()
    assert.strictEqual(block, null)

    block = bot.blockInSight()
    assert.strictEqual(block, undefined)

    bot.lookAt(position.offset(0, -3, 0), true, () => {
      let block = bot.blockAtCursor()
      const relBlock = bot.blockAt(position.offset(0, -1, 0))
      relBlock.face = BlockFace.TOP

      assert.deepStrictEqual(block, relBlock)

      block = bot.blockInSight()
      assert.deepStrictEqual(block, relBlock)

      done()
    })
  })
}
