/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events')
const mc = require('minecraft-protocol')
const minecraftData = require('minecraft-data')
const mineflayer = require('../')
const inject = require('../lib/plugins/resource_pack')

describe('resource pack plugin', () => {
  function createMockBot (supportFeature) {
    const writes = []
    const bot = new EventEmitter()
    bot._client = new EventEmitter()
    bot._client.write = (name, data) => writes.push({ name, data })
    bot.supportFeature = supportFeature
    inject(bot)
    return { bot, writes }
  }

  for (const version of mineflayer.testedVersions) {
    const registry = minecraftData(version)

    it(`serializes one correctly shaped decline in ${version}`, () => {
      const usesHash = registry.supportFeature('resourcePackUsesHash')
      const usesUUID = registry.supportFeature('resourcePackUsesUUID')
      const { bot, writes } = createMockBot(registry.supportFeature)
      const uuid = '9f41f8d8-5a3e-4ea6-8a4c-404400000001'

      if (usesHash) {
        bot._client.emit('resource_pack_send', { url: 'https://example.invalid/pack.zip', hash: 'pack-hash' })
      } else if (usesUUID) {
        bot._client.emit('add_resource_pack', { uuid, url: 'https://example.invalid/pack.zip' })
      }

      bot.denyResourcePack()

      assert.strictEqual(writes.length, 1)
      assert.strictEqual(writes[0].name, 'resource_pack_receive')
      assert.strictEqual(writes[0].data.result, 1)
      if (usesHash) {
        assert.deepStrictEqual(writes[0].data, { hash: 'pack-hash', result: 1 })
      } else if (usesUUID) {
        assert.deepStrictEqual(Object.keys(writes[0].data).sort(), ['result', 'uuid'])
        assert.strictEqual(writes[0].data.uuid, uuid)
      } else {
        assert.deepStrictEqual(writes[0].data, { result: 1 })
      }

      const state = usesUUID ? mc.states.CONFIGURATION : mc.states.PLAY
      const serializer = mc.createSerializer({ state, isServer: false, version })
      const packetBuffer = serializer.createPacketBuffer({
        name: writes[0].name,
        params: writes[0].data
      })
      const deserializer = mc.createDeserializer({ state, isServer: true, version })
      const parsed = deserializer.parsePacketBuffer(packetBuffer).data
      assert.strictEqual(parsed.name, 'resource_pack_receive')
      assert.strictEqual(parsed.params.result, 1)
      if (usesUUID) assert.strictEqual(parsed.params.uuid, uuid)
    })

    if (registry.supportFeature('resourcePackUsesUUID')) {
      it(`serializes the resource pack UUID when accepting in ${version}`, () => {
        const { bot, writes } = createMockBot(registry.supportFeature)
        const uuid = '9f41f8d8-5a3e-4ea6-8a4c-404400000001'
        bot._client.emit('add_resource_pack', { uuid, url: 'https://example.invalid/pack.zip' })

        bot.acceptResourcePack()

        assert.deepStrictEqual(writes.map(write => write.data), [
          { uuid, result: 3 },
          { uuid, result: 0 }
        ])
        const serializer = mc.createSerializer({ state: mc.states.CONFIGURATION, isServer: false, version })
        const deserializer = mc.createDeserializer({ state: mc.states.CONFIGURATION, isServer: true, version })
        for (const write of writes) {
          const parsed = deserializer.parsePacketBuffer(serializer.createPacketBuffer({
            name: write.name,
            params: write.data
          })).data
          assert.strictEqual(parsed.params.uuid, uuid)
          assert.strictEqual(parsed.params.result, write.data.result)
        }
      })
    }
  }
})
