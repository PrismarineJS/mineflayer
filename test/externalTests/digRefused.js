const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

// A dig the server refuses: in adventure mode vanilla puts the block back when the dig starts.
// From 1.19 bot.dig rejects it; before, it resolves as it always did. A normal dig resolves everywhere.
module.exports = () => async (bot) => {
  const feet = bot.entity.position.floored()
  const allowed = feet.offset(2, 0, 0)
  const refused = feet.offset(2, 0, 2)
  for (const spot of [allowed, refused]) await bot.test.setBlock({ x: spot.x, y: spot.y, z: spot.z, blockName: 'dirt' })
  const acknowledgeFields = bot.registry.protocol.play.toClient.types.packet_acknowledge_player_digging?.[1]
  const rejects = Array.isArray(acknowledgeFields) && acknowledgeFields.some(field => field.name === 'sequenceId')

  await bot.test.becomeSurvival()
  await bot.dig(bot.blockAt(allowed), true)
  await bot.test.wait(500)
  assert.strictEqual(bot.blockAt(allowed).type, 0)

  const adventure = onceWithCleanup(bot, 'game', { timeout: 5000, checkCondition: () => bot.game.gameMode === 'adventure' })
  bot.chat('/gamemode adventure')
  await adventure
  let error = null
  await bot.dig(bot.blockAt(refused), true).catch((err) => { error = err })
  if (rejects) {
    assert.strictEqual(error?.code, 'DigRefused')
    assert.strictEqual(error.block.position.toString(), refused.toString())
    assert.strictEqual(bot.blockAt(refused).name, 'dirt')
  } else {
    assert.strictEqual(error, null)
  }
}
