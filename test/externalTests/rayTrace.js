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

  // Regression for #3935: a yaw or pitch of exactly 0 is a valid orientation
  // and must not be rejected by the validation in blockAtEntityCursor.
  // yaw=0, pitch=0 looks straight ahead along -Z. Build a small stone wall a
  // couple of blocks ahead at eye level (3 wide, to stay robust to the bot's
  // exact sub-block position), clear the path in front of it, then assert the
  // ray trace finds the wall instead of returning null.
  const pos = bot.entity.position
  const bx = Math.floor(pos.x)
  const bz = Math.floor(pos.z)
  const eyeY = Math.floor(pos.y + bot.entity.height)
  // clear the eye-level path in front of the bot (2 deep, 3 wide)
  for (const dz of [0, -1]) {
    for (const dx of [-1, 0, 1]) {
      await bot.test.setBlock({ x: bx + dx, y: eyeY, z: bz + dz, blockName: 'air' })
    }
  }
  // stone wall 2 blocks ahead
  for (const dx of [-1, 0, 1]) {
    await bot.test.setBlock({ x: bx + dx, y: eyeY, z: bz - 2, blockName: 'stone' })
  }
  bot.entity.yaw = 0
  bot.entity.pitch = 0
  const zeroBlock = bot.blockAtEntityCursor(bot.entity, 16)
  assert.ok(zeroBlock, 'blockAtEntityCursor returned null for zero yaw/pitch (#3935)')
  assert.strictEqual(zeroBlock.name, 'stone')
  // tidy up the wall
  for (const dx of [-1, 0, 1]) {
    await bot.test.setBlock({ x: bx + dx, y: eyeY, z: bz - 2, blockName: 'air' })
  }
}
