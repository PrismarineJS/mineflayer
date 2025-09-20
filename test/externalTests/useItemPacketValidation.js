const assert = require('assert')

module.exports = () => async (bot) => {
  // This test validates that the use_item packet fix works correctly
  // It ensures the correct packet format is used for each Minecraft version

  const Item = require('prismarine-item')(bot.registry)

  // Set up a consumable item to test with
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()

  let capturedPacket = null

  // Capture the use_item packet to validate its format
  const originalWrite = bot._client.write
  bot._client.write = function (packetName, packet) {
    if (packetName === 'use_item') {
      capturedPacket = { ...packet }
    }
    return originalWrite.call(this, packetName, packet)
  }

  try {
    // Test activateItem
    bot.activateItem()

    // Give time for packet to be sent
    await bot.test.wait(100)

    if (bot.supportFeature('useItemWithOwnPacket')) {
      assert.ok(capturedPacket, 'use_item packet should have been captured')

      // Check packet format based on Minecraft version
      const versionParts = bot.version.split('.').map(Number)
      const isVersion121OrLater = versionParts[0] > 1 || (versionParts[0] === 1 && versionParts[1] >= 21)

      // All packets should have required base fields
      assert.ok(typeof capturedPacket.hand === 'number', 'hand should be a number')
      assert.ok(typeof capturedPacket.sequence === 'number', 'sequence should be a number')

      if (isVersion121OrLater) {
        // 1.21+ should use separate yaw and pitch fields
        assert.ok(typeof capturedPacket.yaw === 'number', `${bot.version} should have yaw field`)
        assert.ok(typeof capturedPacket.pitch === 'number', `${bot.version} should have pitch field`)
        assert.ok(capturedPacket.rotation === undefined, `${bot.version} should not have rotation field`)
        console.log(`✅ ${bot.version}: Correctly using yaw/pitch format`)
      } else {
        // Pre-1.21 should use rotation object
        assert.ok(capturedPacket.rotation !== undefined, `${bot.version} should have rotation field`)
        assert.ok(typeof capturedPacket.rotation.x === 'number', `${bot.version} rotation.x should be a number`)
        assert.ok(typeof capturedPacket.rotation.y === 'number', `${bot.version} rotation.y should be a number`)
        assert.ok(capturedPacket.yaw === undefined, `${bot.version} should not have yaw field`)
        assert.ok(capturedPacket.pitch === undefined, `${bot.version} should not have pitch field`)
        console.log(`✅ ${bot.version}: Correctly using rotation format`)
      }
    }
  } finally {
    // Restore original write function
    bot._client.write = originalWrite
  }
}
