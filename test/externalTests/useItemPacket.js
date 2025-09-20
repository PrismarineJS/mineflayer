const assert = require('assert')

module.exports = () => async (bot) => {
  // Test for the use_item packet format issue in 1.21+
  // This test verifies that the correct packet format is used for different versions

  const Item = require('prismarine-item')(bot.registry)

  // Set up a consumable item to test with
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()

  let packetSent = false
  let lastPacket = null

  // Capture the use_item packet
  const originalWrite = bot._client.write
  bot._client.write = function (packetName, packet) {
    if (packetName === 'use_item') {
      packetSent = true
      lastPacket = packet
    }
    return originalWrite.call(this, packetName, packet)
  }

  try {
    // Test activateItem
    bot.activateItem()

    // Give time for packet to be sent
    await bot.test.wait(100)

    if (bot.supportFeature('useItemWithOwnPacket')) {
      assert.ok(packetSent, 'use_item packet should have been sent')
      assert.ok(lastPacket, 'packet data should be captured')

      // Check packet structure based on version
      const versionParts = bot.version.split('.').map(Number)
      const isVersion121OrLater = versionParts[0] > 1 || (versionParts[0] === 1 && versionParts[1] >= 21)

      if (isVersion121OrLater) {
        // New format: separate yaw and pitch fields
        assert.ok(typeof lastPacket.yaw === 'number', 'yaw should be a number in 1.21+')
        assert.ok(typeof lastPacket.pitch === 'number', 'pitch should be a number in 1.21+')
        assert.ok(lastPacket.rotation === undefined, 'rotation field should not exist in 1.21+')
      } else {
        // Old format: rotation object with x and y
        assert.ok(lastPacket.rotation !== undefined, 'rotation should exist in versions before 1.21')
        assert.ok(typeof lastPacket.rotation.x === 'number', 'rotation.x should be a number')
        assert.ok(typeof lastPacket.rotation.y === 'number', 'rotation.y should be a number')
        assert.ok(lastPacket.yaw === undefined, 'yaw field should not exist before 1.21')
        assert.ok(lastPacket.pitch === undefined, 'pitch field should not exist before 1.21')
      }
    }
  } finally {
    // Restore original write function
    bot._client.write = originalWrite
  }
}
