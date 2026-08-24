const assert = require('assert')
const Vec3 = require('vec3')
const { once, sleep, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test spawn event on death
  const Item = require('prismarine-item')(bot.registry)
  const portalName = bot.registry.blocksByName.nether_portal ? 'nether_portal' : 'portal'

  let signItem = null
  for (const name in bot.registry.itemsByName) {
    if (name.includes('sign') && !name.includes('hanging')) signItem = bot.registry.itemsByName[name]
  }
  assert.notStrictEqual(signItem, null)

  // A portal's link goes inert after a failed attempt at the same spot, so
  // each retry must use a fresh location or it is guaranteed to time out.
  bot.test.netherAttempts ??= 0
  const attempt = ++bot.test.netherAttempts
  await bot.test.teleport(new Vec3((attempt - 1) * 4, bot.test.groundY, 0))
  bot.chat(`/setblock ~ ~ ~ ${portalName}`)
  await onceWithCleanup(bot, 'spawn', { timeout: 30000 })
  bot.test.sayEverywhere('/tp 0 128 0')

  await once(bot, 'forcedMove')
  await bot.waitForChunksToLoad()

  // Poll until the block below is loaded and non-air before placing.
  // On slow CI, chunks may report as loaded before block data is ready.
  let lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  while (!lowerBlock || lowerBlock.name === 'air') {
    await sleep(100)
    lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  }

  await bot.lookAt(lowerBlock.position, true)
  await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))

  // By the time placeBlock's block update echo has arrived, the server has
  // already opened the sign editor for us, so the text can be sent right away.
  const sign = bot.blockAt(lowerBlock.position.offset(0, 1, 0))
  bot.updateSign(sign, '1\n2\n3\n')

  // Poll for the server echoing the new text back rather than sleeping a
  // fixed time: it usually lands within a tick, but can take longer on
  // slow CI.
  const deadline = Date.now() + 5000
  let updated = bot.blockAt(sign.position)
  while (updated.signText?.trimEnd() !== '1\n2\n3' && Date.now() < deadline) {
    await sleep(50)
    updated = bot.blockAt(sign.position)
  }
  console.log('Updated sign', updated)

  assert.strictEqual(updated.signText.trimEnd(), '1\n2\n3')

  if (updated.blockEntity) {
    // Check block update
    bot.activateBlock(updated)
    assert.notStrictEqual(updated.blockEntity, undefined)
  }

  bot.chat(`/setblock ~ ~ ~ ${portalName}`)
  await onceWithCleanup(bot, 'spawn', { timeout: 30000 })
}
