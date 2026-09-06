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

  // A player is on portal cooldown for 10 ticks after a dimension change, and
  // the server refreshes that cooldown every tick the player stands in any
  // portal, so the bot must be out of every portal for more than 10 ticks
  // before it steps into the next one. update_time arrives every 20 server
  // ticks, so two of them guarantee at least 20 ticks have passed.
  const awaitPortalCooldown = async () => {
    await onceWithCleanup(bot, 'time', { timeout: 10000 })
    await onceWithCleanup(bot, 'time', { timeout: 10000 })
  }

  // A failed attempt leaves its portal standing until the next reset's fills
  // remove it, and the reset teleports the bot to the origin first. Portals
  // therefore never go at the origin, and stay inside the fill area so the
  // reset removes them.
  const spots = [new Vec3(4, 0, 0), new Vec3(-4, 0, 0), new Vec3(0, 0, 4), new Vec3(0, 0, -4)]
  bot.test.netherAttempts ??= 0
  const spot = spots[bot.test.netherAttempts++ % spots.length]
  await bot.test.teleport(new Vec3(spot.x, bot.test.groundY, spot.z))
  await awaitPortalCooldown()
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

  await awaitPortalCooldown()
  bot.chat(`/setblock ~ ~ ~ ${portalName}`)
  await onceWithCleanup(bot, 'spawn', { timeout: 30000 })
  // The overworld column must be back before a later test reads blocks from it.
  await bot.waitForChunksToLoad()
}
