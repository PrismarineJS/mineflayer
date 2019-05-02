const assert = require('assert')
const Vec3 = require('vec3')

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)
  const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))

  bot._client.on('open_sign_entity', (packet) => {
    const sign = bot.blockAt(new Vec3(packet.location))
    bot.updateSign(sign, '1\n2\n3\n4')

    setTimeout(() => {
      // Get updated sign
      const sign = bot.blockAt(bot.entity.position)

      assert.strictEqual(sign.signText, '1\n2\n3\n4')

      if (sign.blockEntity && sign.blockEntity.Text1) {
        assert.strictEqual(sign.blockEntity.Text1.toString(), '1')
        assert.strictEqual(sign.blockEntity.Text2.toString(), '2')
        assert.strictEqual(sign.blockEntity.Text3.toString(), '3')
        assert.strictEqual(sign.blockEntity.Text4.toString(), '4')
      }

      if (sign.blockEntity) {
        // Check block update
        bot.activateBlock(sign)
        assert.notStrictEqual(sign.blockEntity, undefined)
      }

      done()
    }, 500)
  })

  bot.lookAt(lowerBlock.position, true, () => {
    bot.test.setInventorySlot(36, new Item(323, 1, 0), () => {
      bot.placeBlock(lowerBlock, new Vec3(0, 1, 0), () => {})
    })
  })
}
