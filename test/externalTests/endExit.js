const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

// Into the End through a portal block and out again through another, twice: the first exit
// is the one with the credits ("win game"), the second goes straight back.
module.exports = () => async (bot) => {
  const inEnd = () => bot.game.dimension.includes('end')

  async function throughPortal (to) {
    const arrived = onceWithCleanup(bot._client, 'respawn', { timeout: 15000 })
    const placed = onceWithCleanup(bot, 'forcedMove', { timeout: 20000 })
    bot.chat('/setblock ~ ~ ~ end_portal')
    await arrived.catch(() => { throw new Error(`no respawn ${to}, still in ${bot.game.dimension}`) })
    await placed
    // the next command needs no chunks, so do not wait for them
    await bot.waitForTicks(10)
  }

  for (let trip = 1; trip <= 2; trip++) {
    // The bot comes back at the spawn point, so the portal into the End goes elsewhere
    await bot.test.teleport(bot.entity.position.offset(20, 0, 0))
    await bot.waitForChunksToLoad()
    const portal = bot.entity.position.floored()
    await throughPortal(`into the End, trip ${trip}`)
    assert.ok(inEnd(), `trip ${trip}: in ${bot.game.dimension}, not the End`)
    await throughPortal(`out of the End, trip ${trip}`)
    assert.ok(!inEnd(), `trip ${trip}: still in the End`)
    bot.chat(`/setblock ${portal.x} ${portal.y} ${portal.z} air`)
  }
}
