/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events')
const mc = require('minecraft-protocol')
const minecraftData = require('minecraft-data')
const mineflayer = require('../')
const inject = require('../lib/plugins/resource_pack')

describe('resource pack plugin', () => {
  const uuid = '9f41f8d8-5a3e-4ea6-8a4c-404400000001'
  const url = 'https://example.invalid/pack.zip'
  const hash = 'pack-hash'

  function createMockBot (supportFeature) {
    const writes = []
    const bot = new EventEmitter()
    bot._client = new EventEmitter()
    bot._client.write = (name, data) => writes.push({ name, data })
    bot.supportFeature = supportFeature
    inject(bot)
    return { bot, writes }
  }

  function emitResourcePack (bot, usesUUID) {
    if (usesUUID) {
      bot._client.emit('add_resource_pack', { uuid, url })
    } else {
      bot._client.emit('resource_pack_send', { url, hash })
    }
  }

  function serializeAndParse (version, usesUUID, write) {
    const state = usesUUID ? mc.states.CONFIGURATION : mc.states.PLAY
    const serializer = mc.createSerializer({ state, isServer: false, version })
    const deserializer = mc.createDeserializer({ state, isServer: true, version })
    return deserializer.parsePacketBuffer(serializer.createPacketBuffer({
      name: write.name,
      params: write.data
    })).data
  }

  function assertResponse (parsed, result, usesHash, usesUUID) {
    assert.strictEqual(parsed.name, 'resource_pack_receive')
    assert.strictEqual(parsed.params.result, result)
    if (usesHash) assert.strictEqual(parsed.params.hash, hash)
    if (usesUUID) assert.strictEqual(parsed.params.uuid, uuid)
  }

  for (const version of mineflayer.testedVersions) {
    const registry = minecraftData(version)

    it(`serializes one correctly shaped decline in ${version}`, () => {
      const usesHash = registry.supportFeature('resourcePackUsesHash')
      const usesUUID = registry.supportFeature('resourcePackUsesUUID')
      const { bot, writes } = createMockBot(registry.supportFeature)

      bot.once('resourcePack', () => bot.denyResourcePack())
      emitResourcePack(bot, usesUUID)

      assert.strictEqual(writes.length, 1)
      assert.strictEqual(writes[0].name, 'resource_pack_receive')
      assert.strictEqual(writes[0].data.result, 1)
      assert.strictEqual(writes[0].data.uuid, usesUUID ? uuid : undefined)
      assert.strictEqual(writes[0].data.hash, usesUUID ? undefined : hash)

      const parsed = serializeAndParse(version, usesUUID, writes[0])
      assertResponse(parsed, 1, usesHash, usesUUID)
    })

    it(`serializes both acceptance responses in ${version}`, () => {
      const usesHash = registry.supportFeature('resourcePackUsesHash')
      const usesUUID = registry.supportFeature('resourcePackUsesUUID')
      const { bot, writes } = createMockBot(registry.supportFeature)

      bot.once('resourcePack', () => bot.acceptResourcePack())
      emitResourcePack(bot, usesUUID)

      assert.deepStrictEqual(writes.map(write => write.data.result), [3, 0])
      for (const write of writes) {
        assert.strictEqual(write.data.uuid, usesUUID ? uuid : undefined)
        assert.strictEqual(write.data.hash, usesUUID ? undefined : hash)
        const parsed = serializeAndParse(version, usesUUID, write)
        assertResponse(parsed, write.data.result, usesHash, usesUUID)
      }
    })
  }
})
