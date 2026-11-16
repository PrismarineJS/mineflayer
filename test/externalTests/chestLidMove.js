const assert = require('assert')

module.exports = () => async (bot) => {
  // openContainer turns to face the block before acting.
  bot.physics.yawSpeed = bot.physics.pitchSpeed = 1e3

  const chestPosition = bot.entity.position.floored().offset(1, 0, 0)
  await bot.test.setBlock({ x: 1, relative: true, blockName: 'chest' })
  // Before 1.17 an ender chest sends its viewer count every second, open or not.
  await bot.test.setBlock({ x: -1, relative: true, blockName: 'ender_chest' })

  const moves = []
  const onMove = (block, isOpen) => moves.push(`${block.name} ${isOpen}`)
  bot.on('chestLidMove', onMove)
  try {
    const chest = await bot.openContainer(bot.blockAt(chestPosition))
    await chest.close()
    // From 1.17 a chest's last scheduled recheck sends the closed count once
    // more, up to 5 ticks after the close.
    await bot.waitForTicks(25)
  } finally {
    bot.removeListener('chestLidMove', onMove)
  }

  assert.deepStrictEqual(moves, ['chest 1', 'chest 0'])
}
