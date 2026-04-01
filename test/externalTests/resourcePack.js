const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = (version) => async (bot) => {
  const testUUID = 'd3527a0b-bc03-45d5-a878-2aafdd8c8a43'
  const testUrl = 'https://example.com/pack.zip'
  const testHash = 'abc123'

  // Helper: intercept bot._client.write to capture outgoing packets
  function interceptWrite () {
    const captured = []
    const origWrite = bot._client.write
    bot._client.write = function (name, data) {
      if (name === 'resource_pack_receive') {
        captured.push(data)
        // Don't actually send to server — the server didn't ask for this
        return
      }
      origWrite.apply(bot._client, arguments)
    }
    return {
      captured,
      restore () { bot._client.write = origWrite }
    }
  }

  // Helper: simulate the server sending a resource pack request
  function simulateResourcePackRequest () {
    if (bot.supportFeature('resourcePackUsesUUID')) {
      bot._client.emit('add_resource_pack', {
        uuid: testUUID,
        url: testUrl,
        hash: testHash,
        forced: false,
        promptMessage: undefined
      })
    } else {
      bot._client.emit('resource_pack_send', {
        url: testUrl,
        hash: testHash,
        uuid: testUUID
      })
    }
  }

  // Test 1: acceptResourcePack sends correct UUID format
  {
    const { captured, restore } = interceptWrite()
    try {
      const packPromise = once(bot, 'resourcePack')
      simulateResourcePackRequest()
      await packPromise

      bot.acceptResourcePack()

      // acceptResourcePack sends two packets: ACCEPTED (3) then SUCCESSFULLY_LOADED (0)
      assert.ok(captured.length >= 2, `Expected at least 2 resource_pack_receive packets, got ${captured.length}`)

      const acceptedPacket = captured.find(p => p.result === 3)
      const loadedPacket = captured.find(p => p.result === 0)
      assert.ok(acceptedPacket, 'Should have sent ACCEPTED (result=3) packet')
      assert.ok(loadedPacket, 'Should have sent SUCCESSFULLY_LOADED (result=0) packet')

      // The critical check: UUID must be a string, not a UUID object
      // The bug was that UUID objects were being sent, causing server kicks on 1.21+
      for (const pkt of captured) {
        assert.strictEqual(typeof pkt.uuid, 'string',
          `uuid should be a string, got ${typeof pkt.uuid}: ${pkt.uuid}`)
        if (pkt.uuid) {
          assert.strictEqual(pkt.uuid, testUUID,
            'uuid should match the one from the request')
        }
      }
    } finally {
      restore()
    }
  }

  // Test 2: denyResourcePack sends correct UUID format
  {
    const { captured, restore } = interceptWrite()
    try {
      const packPromise = once(bot, 'resourcePack')
      simulateResourcePackRequest()
      await packPromise

      bot.denyResourcePack()

      assert.ok(captured.length >= 1, `Expected at least 1 resource_pack_receive packet, got ${captured.length}`)

      const declinedPacket = captured.find(p => p.result === 1)
      assert.ok(declinedPacket, 'Should have sent DECLINED (result=1) packet')

      assert.strictEqual(typeof declinedPacket.uuid, 'string',
        `uuid should be a string, got ${typeof declinedPacket.uuid}: ${declinedPacket.uuid}`)
      if (declinedPacket.uuid) {
        assert.strictEqual(declinedPacket.uuid, testUUID,
          'uuid should match the one from the request')
      }
    } finally {
      restore()
    }
  }

  // Test 3: bot is still connected after resource pack operations
  assert.ok(bot.entity, 'Bot should still be connected after resource pack tests')
}
