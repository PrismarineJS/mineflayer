/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events').EventEmitter
const Vec3 = require('vec3').Vec3
const registryLoader = require('prismarine-registry')
const mc = require('minecraft-protocol')

// Drives bot.placeEntity far enough to see what it puts on the wire, and serializes every packet
// with the real protocol so a missing field fails here instead of killing a live connection.
function fakeBot (version) {
  const registry = registryLoader(version)
  const bot = new EventEmitter()
  bot.registry = registry
  bot.version = version
  bot.supportFeature = registry.supportFeature.bind(registry)
  bot.entity = { position: new Vec3(0, 64, 0), yaw: 0, pitch: 0 }
  bot.written = []
  const serializer = mc.createSerializer({ state: 'play', isServer: false, version })
  bot._client = {
    write (name, params) {
      // throws exactly as the real client would on an incomplete packet
      serializer.createPacketBuffer({ name, params })
      bot.written.push({ name, params })
    }
  }
  bot._genericPlace = async (referenceBlock) => referenceBlock.position
  require('../lib/plugins/place_entity')(bot)
  return bot
}

const versions = ['1.18.2', '1.19.4', '1.20.4', '1.21.4']

describe('placeEntity writes a use_item the protocol accepts', () => {
  for (const version of versions) {
    it(version, async () => {
      const bot = fakeBot(version)
      const Item = require('prismarine-item')(bot.registry)
      const boat = bot.registry.itemsByName.oak_boat || bot.registry.itemsByName.boat
      bot.heldItem = new Item(boat.id, 1)
      const reference = { position: new Vec3(0, 63, 0), name: 'water' }

      const placed = bot.placeEntity(reference, new Vec3(0, 1, 0))
      // the boat the server would spawn back
      setTimeout(() => bot.emit('entitySpawn', {
        name: bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'Boat' : 'boat',
        position: new Vec3(0, 64, 0)
      }), 20)
      await placed

      const useItem = bot.written.filter(p => p.name === 'use_item' || p.name === 'block_place')
      assert.strictEqual(useItem.length, 1, 'exactly one item-use packet')
      if (bot.supportFeature('useItemWithOwnPacket')) {
        assert.strictEqual(useItem[0].name, 'use_item')
        assert.strictEqual(useItem[0].params.hand, 0)
      }
    })
  }
})
