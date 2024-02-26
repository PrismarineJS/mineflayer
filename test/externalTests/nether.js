const assert = require('assert')
const Vec3 = require('vec3')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test spawn event on death
  const Item = require('prismarine-item')(bot.registry)

  let signItem = null
  for (const name in bot.registry.itemsByName) {
    if (name.includes('sign') && !name.includes('hanging')) signItem = bot.registry.itemsByName[name]
  }
  assert.notStrictEqual(signItem, null)

  const p = new Promise((resolve, reject) => {
    bot._client.on('open_sign_entity', (packet) => {
      const sign = bot.blockAt(new Vec3(packet.location))
      bot.updateSign(sign, '1\n2\n3\n')

      setTimeout(() => {
        // Get updated sign
        const sign = bot.blockAt(bot.entity.position)

        assert.strictEqual(sign.signText.trimEnd(), '1\n2\n3')

        if (sign.blockEntity) {
          // Check block update
          bot.activateBlock(sign)
          assert.notStrictEqual(sign.blockEntity, undefined)
        }

        bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
        bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
        once(bot, 'spawn').then(resolve)
      }, 500)
    })
  })

  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
  await once(bot, 'spawn')
  bot.test.sayEverywhere('/tp 0 128 0')

  await once(bot, 'forcedMove')
  await bot.waitForChunksToLoad()

  const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  await bot.lookAt(lowerBlock.position, true)
  await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))
  return p
}
