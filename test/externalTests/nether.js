const assert = require('assert')
const Vec3 = require('vec3')
const { once } = require('events')

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

        assert.strictEqual(sign.signText, '1\n2\n3\n')

        if (sign.blockEntity && sign.blockEntity.Text1) {
          assert.strictEqual(sign.blockEntity.Text1.toString(), '1')
          assert.strictEqual(sign.blockEntity.Text2.toString(), '2')
          assert.strictEqual(sign.blockEntity.Text3.toString(), '3')
          assert.strictEqual(sign.blockEntity.Text4.toString(), '')
        }

        if (sign.blockEntity) {
          // Check block update
          bot.activateBlock(sign)
          assert.notStrictEqual(sign.blockEntity, undefined)
        }

        bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
        once(bot, 'spawn').then(resolve)
      }, 500)
    })
  })

  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
  await once(bot, 'spawn')
  bot.test.sayEverywhere('/setblock 0 10 0 dirt')
  bot.test.sayEverywhere('/fill 0 11 0 0 13 0 air')
  bot.test.sayEverywhere('/tp 0 11 0')
  await once(bot.world, 'blockUpdate:(0, 10, 0)')
  console.log('Updated world')
  const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  await bot.lookAt(lowerBlock.position, true)
  console.log('Looked at block')
  await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
  console.log('Inventory')
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))
  return p
}
