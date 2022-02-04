const assert = require('assert')
const Vec3 = require('vec3')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)
  const lowerBlock = bot.world.getBlock(bot.entity.position.offset(0, -1, 0))

  let signItem = null
  for (const name in mcData.itemsByName) {
    if (name.includes('sign')) signItem = mcData.itemsByName[name]
  }
  assert.notStrictEqual(signItem, null)

  const p = new Promise((resolve, reject) => {
    bot._client.on('open_sign_entity', (packet) => {
      const sign = bot.world.getBlock(new Vec3(packet.location))
      bot.updateSign(sign, '1\n2\n3\n')

      setTimeout(() => {
        // Get updated sign
        const sign = bot.world.getBlock(bot.entity.position)

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

        resolve()
      }, 500)
    })
  })

  await bot.lookAt(lowerBlock.position, true)
  await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))
  return p
}
