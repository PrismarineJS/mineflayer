const assert = require('assert')

// Breaks blocks in creative mode, one right after the other, and checks that the server itself
// reports each one gone: bot.dig sets the block to air on its own, so the bot's world proves nothing.
module.exports = () => async (bot) => {
  await bot.test.becomeCreative()
  const feet = bot.entity.position.floored()
  const spots = [feet.offset(2, 0, 0), feet.offset(2, 0, 1), feet.offset(2, 0, -1)]
  for (const spot of spots) await bot.test.setBlock({ x: spot.x, y: spot.y, z: spot.z, blockName: 'dirt' })

  // The positions the server sets to air, from block_change and from multi_block_change (several
  // blocks of one chunk section changed in one tick).
  const gone = new Set()
  const onBlockChange = (packet) => {
    if (packet.type === 0) gone.add(`${packet.location.x},${packet.location.y},${packet.location.z}`)
  }
  const onMultiBlockChange = (packet) => {
    for (const record of packet.records) {
      const single = bot.supportFeature('usesMultiblockSingleLong')
      const x = single ? (record >> 8) & 0x0f : (record.horizontalPos >> 4) & 0x0f
      const y = single ? record & 0x0f : record.y
      const z = single ? (record >> 4) & 0x0f : record.horizontalPos & 0x0f
      const stateId = single ? record >> 12 : record.blockId
      const origin = bot.supportFeature('usesMultiblock3DChunkCoords')
        ? packet.chunkCoordinates
        : { x: packet.chunkX, y: 0, z: packet.chunkZ }
      if (stateId === 0) gone.add(`${origin.x * 16 + x},${origin.y * 16 + y},${origin.z * 16 + z}`)
    }
  }
  bot._client.on('block_change', onBlockChange)
  bot._client.on('multi_block_change', onMultiBlockChange)
  try {
    for (const spot of spots) {
      assert.strictEqual(bot.digTime(bot.blockAt(spot)), 0)
      await bot.dig(bot.blockAt(spot), true)
    }
    await bot.test.wait(1000)
    for (const spot of spots) assert.ok(gone.has(`${spot.x},${spot.y},${spot.z}`), `the server did not break the block at ${spot}`)
  } finally {
    bot._client.removeListener('block_change', onBlockChange)
    bot._client.removeListener('multi_block_change', onMultiBlockChange)
  }
}
