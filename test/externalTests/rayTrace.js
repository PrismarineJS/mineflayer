const assert = require('assert')
const { BlockFace } = require('prismarine-world').iterators

module.exports = () => async (bot) => {
  const { position } = bot.entity
  await bot.lookAt(position.offset(0, 3, 0), true)

  let block = bot.blockAtCursor()
  assert.strictEqual(block, null)

  block = bot.blockInSight()
  assert.strictEqual(block, undefined)

  await bot.lookAt(position.offset(0, -3, 0), true)

  block = bot.blockAtCursor()
  const relBlock = bot.blockAt(position.offset(0, -1, 0))
  relBlock.face = BlockFace.TOP

  assert.deepStrictEqual(block.position, relBlock.position)
  assert.deepStrictEqual(block.face, relBlock.face)

  block = bot.blockInSight()
  assert.deepStrictEqual(block.position, relBlock.position)
  assert.deepStrictEqual(block.face, relBlock.face)
}
