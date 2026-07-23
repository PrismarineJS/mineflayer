const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  // Test that activateItem sends the bot's actual rotation (PR #3840).
  // Only applies to versions that use the 'use_item' packet with rotation.
  if (!bot.supportFeature('useItemWithOwnPacket')) return

  await bot.test.becomeCreative()
  await bot.test.clearInventory()

  const snowballItem = bot.registry.itemsByName.snowball
  if (!snowballItem) return

  // Give the bot a snowball and switch to survival to throw it
  await bot.test.setInventorySlot(36, new Item(snowballItem.id, 16, 0))
  await bot.test.becomeSurvival()
  await bot.test.wait(250)

  // Look south (+Z direction): yaw = PI, pitch = 0
  await bot.look(Math.PI, 0, true)
  await bot.test.wait(250)

  // Intercept the outgoing use_item packet to verify rotation
  const sentPacket = await new Promise((resolve) => {
    const origWrite = bot._client.write
    bot._client.write = function (name, data) {
      origWrite.apply(bot._client, arguments)
      if (name === 'use_item') {
        bot._client.write = origWrite
        resolve(data)
      }
    }
    bot.activateItem()
  })

  // Verify the rotation was sent (not zeros)
  assert(sentPacket.rotation, 'use_item packet should have rotation field')
  const { x: sentYaw, y: sentPitch } = sentPacket.rotation

  // With pitch = 0, the notchian pitch should be ~0
  assert(Math.abs(sentPitch) < 1, `Pitch should be near 0 for level look, got ${sentPitch}`)

  // With yaw = PI (south), the notchian yaw should be ~0 (due to toNotchianYaw = degrees(PI - yaw))
  // toNotchianYaw(PI) = degrees(PI - PI) = 0
  assert(Math.abs(sentYaw) < 1, `Yaw should be near 0 for south-facing look, got ${sentYaw}`)

  // Now test a different direction: look east (yaw = PI/2 in mineflayer)
  await bot.look(Math.PI * 3 / 2, -0.5, true)
  await bot.test.wait(250)

  const sentPacket2 = await new Promise((resolve) => {
    const origWrite = bot._client.write
    bot._client.write = function (name, data) {
      origWrite.apply(bot._client, arguments)
      if (name === 'use_item') {
        bot._client.write = origWrite
        resolve(data)
      }
    }
    bot.activateItem()
  })

  const { x: sentYaw2, y: sentPitch2 } = sentPacket2.rotation

  // toNotchianYaw(3*PI/2) = degrees(PI - 3*PI/2) = degrees(-PI/2) = -90
  assert(Math.abs(sentYaw2 - (-90)) < 1, `Yaw should be near -90 for east-facing look, got ${sentYaw2}`)

  // toNotchianPitch(-0.5) = degrees(0.5) ≈ 28.65
  const expectedPitch = (0.5 * 180) / Math.PI
  assert(Math.abs(sentPitch2 - expectedPitch) < 1, `Pitch should be near ${expectedPitch}, got ${sentPitch2}`)

  await bot.test.becomeCreative()
  await bot.test.clearInventory()
}
