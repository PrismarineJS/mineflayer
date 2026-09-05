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
  const signOpen = onceWithCleanup(bot, 'signOpen', { timeout: 5000 })
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))

  // The server opens the sign editor once the sign is placed.
  const [sign] = await signOpen
  bot.updateSign(sign, '1\n2\n3\n')

  // Wait for the server to echo the new text back rather than polling: it
  // usually lands within a tick, but can take longer on slow CI.
  await onceWithCleanup(bot, 'blockEntityData', {
    timeout: 5000,
    checkCondition: (block) => block?.position?.equals(sign.position) && block.signText?.trimEnd() === '1\n2\n3'
  })
  const updated = bot.blockAt(sign.position)
  console.log('Updated sign', updated)

  assert.strictEqual(updated.signText.trimEnd(), '1\n2\n3')

  if (updated.blockEntity) {
    // Check block update
    bot.activateBlock(updated)
    assert.notStrictEqual(updated.blockEntity, undefined)
  }

  bot.chat(`/setblock ~ ~ ~ ${portalName}`)
  await onceWithCleanup(bot, 'spawn', { timeout: 30000 })
  // The respawn lands at origin, so the next reset skips its chunk wait; the
  // overworld column must be back before a later test reads blocks from it.
  await bot.waitForChunksToLoad()
}
