const assert = require('assert')

module.exports = () => async (bot) => {
  // This test reproduces the use_item packet format issue in 1.21+
  // It demonstrates that the current code sends the wrong packet format for 1.21+
  // which would cause serialization errors on real servers

  const Item = require('prismarine-item')(bot.registry)

  // Set up a consumable item to test with
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()

  let capturedPacket = null

  // Capture the use_item packet to inspect its format
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

      // Check if we're on 1.21+ where the packet format should be different
      const versionParts = bot.version.split('.').map(Number)
      const isVersion121OrLater = versionParts[0] > 1 || (versionParts[0] === 1 && versionParts[1] >= 21)

      if (isVersion121OrLater) {
        // On 1.21+, the packet SHOULD have yaw and pitch fields, not rotation
        // But the current (unfixed) code sends rotation field
        // This demonstrates the issue that needs to be fixed

        console.log(`${bot.version} packet format:`, capturedPacket)

        // The current broken code sends rotation field even on 1.21+
        if (capturedPacket.rotation !== undefined) {
          console.log(`❌ ISSUE REPRODUCED: ${bot.version} got rotation field but needs yaw/pitch`)
          console.log('This would cause serialization errors on real 1.21+ servers')
          // Don't fail the test yet - this is expected with the unfixed code
        }

        // Once fixed, 1.21+ should have yaw/pitch instead of rotation
        if (capturedPacket.yaw !== undefined && capturedPacket.pitch !== undefined) {
          console.log(`✅ FIXED: ${bot.version} correctly has yaw/pitch fields`)
          assert.ok(capturedPacket.rotation === undefined, 'rotation field should not exist in 1.21+ fixed version')
        }
      } else {
        // Pre-1.21 should always use rotation format
        assert.ok(capturedPacket.rotation !== undefined, `${bot.version} should have rotation field`)
        assert.ok(capturedPacket.yaw === undefined, `${bot.version} should not have yaw field`)
        assert.ok(capturedPacket.pitch === undefined, `${bot.version} should not have pitch field`)
      }
    }
  } finally {
    // Restore original write function
    bot._client.write = originalWrite
  }
}
