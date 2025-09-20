const assert = require('assert')

module.exports = () => async (bot) => {
  // Test for the use_item packet format issue in 1.21+
  // This test verifies that the correct packet format is used for different versions

  const Item = require('prismarine-item')(bot.registry)

  // Set up a consumable item to test with
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()

  const packetsReceived = []

  // Capture the use_item packet
  const originalWrite = bot._client.write
  bot._client.write = function (packetName, packet) {
    if (packetName === 'use_item') {
      packetsReceived.push({ name: packetName, data: { ...packet } })
    }
    return originalWrite.call(this, packetName, packet)
  }

  try {
    // Test activateItem
    bot.activateItem()

    // Give time for packet to be sent
    await bot.test.wait(100)

    if (bot.supportFeature('useItemWithOwnPacket')) {
      assert.ok(packetsReceived.length > 0, 'use_item packet should have been sent')

      const lastPacket = packetsReceived[packetsReceived.length - 1].data

      // Check packet structure based on version
      const versionParts = bot.version.split('.').map(Number)
      const isVersion121OrLater = versionParts[0] > 1 || (versionParts[0] === 1 && versionParts[1] >= 21)

      if (isVersion121OrLater) {
        // New format: separate yaw and pitch fields
        assert.ok(typeof lastPacket.yaw === 'number', 'yaw should be a number in 1.21+')
        assert.ok(typeof lastPacket.pitch === 'number', 'pitch should be a number in 1.21+')
        assert.strictEqual(lastPacket.yaw, 0, 'yaw should be 0')
        assert.strictEqual(lastPacket.pitch, 0, 'pitch should be 0')
        assert.ok(lastPacket.rotation === undefined, 'rotation field should not exist in 1.21+')
      } else {
        // Old format: rotation object with x and y
        assert.ok(lastPacket.rotation !== undefined, 'rotation should exist in versions before 1.21')
        assert.ok(typeof lastPacket.rotation.x === 'number', 'rotation.x should be a number')
        assert.ok(typeof lastPacket.rotation.y === 'number', 'rotation.y should be a number')
        assert.strictEqual(lastPacket.rotation.x, 0, 'rotation.x should be 0')
        assert.strictEqual(lastPacket.rotation.y, 0, 'rotation.y should be 0')
        assert.ok(lastPacket.yaw === undefined, 'yaw field should not exist before 1.21')
        assert.ok(lastPacket.pitch === undefined, 'pitch field should not exist before 1.21')
      }

      // All packets should have required fields
      assert.ok(typeof lastPacket.hand === 'number', 'hand should be a number')
      assert.ok(typeof lastPacket.sequence === 'number', 'sequence should be a number')
    }
  } finally {
    // Restore original write function
    bot._client.write = originalWrite
  }
}
