const assert = require('assert')
const vec3 = require('vec3')
const mc = require('minecraft-protocol')
const { sleep, once } = require('../../lib/promise_utils')

module.exports = {
  'shares one pre-incremented counter across use_item and use_item_on, 0 on release': function (bot, server, done) {
    const Item = require('prismarine-item')(bot.registry)
    const useItemFields = bot.registry.protocol?.play?.toServer?.types?.packet_use_item?.[1]
    if (!useItemFields?.some(f => f.name === 'sequence')) {
      this.skip()
      return
    }
    server.on('playerJoin', async (client) => {
      await bot.test.pluginsLoaded
      const loggedIn = once(bot, 'login')
      await client.write('login', bot.test.generateLoginPacket())
      await loggedIn
      const writes = []
      bot._client.write = (name, params) => { writes.push([name, params.sequence]) }
      bot.quickBarSlot = 0
      bot.inventory.updateSlot(bot.QUICK_BAR_START, new Item(bot.registry.itemsByName.stone.id, 1))

      bot.activateItem()
      bot.deactivateItem()
      await bot._genericPlace({ position: vec3(1, 65, 1) }, vec3(0, 1, 0), { forceLook: 'ignore' })
      bot.activateItem()

      try {
        assert.deepStrictEqual(writes, [
          ['use_item', 1],
          ['block_dig', 0],
          ['block_place', 2],
          ['use_item', 3]
        ])
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'gives both packets of a boat placement their own value, interleaved with use_item': function (bot, server, done) {
    const Item = require('prismarine-item')(bot.registry)
    const useItemFields = bot.registry.protocol?.play?.toServer?.types?.packet_use_item?.[1]
    if (!useItemFields?.some(f => f.name === 'sequence')) {
      this.skip()
      return
    }
    server.on('playerJoin', async (client) => {
      await bot.test.pluginsLoaded
      const loggedIn = once(bot, 'login')
      await client.write('login', bot.test.generateLoginPacket())
      await loggedIn
      // serialize every packet with the real protocol, so a missing field throws here
      const serializer = mc.createSerializer({ state: 'play', isServer: false, version: bot.version })
      const writes = []
      bot._client.write = (name, params) => {
        serializer.createPacketBuffer({ name, params })
        writes.push([name, params.sequence])
      }
      bot.lookAt = async () => {}
      bot.quickBarSlot = 0
      const boat = bot.registry.itemsByName.oak_boat ?? bot.registry.itemsByName.boat
      bot.inventory.updateSlot(bot.QUICK_BAR_START, new Item(boat.id, 1))

      try {
        bot.activateItem()
        bot.deactivateItem()
        const placed = bot.placeEntity({ position: vec3(1, 64, 1) }, vec3(0, 1, 0))
        await sleep(0)
        bot.emit('entitySpawn', { name: bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'Boat' : 'boat', position: vec3(1.5, 65, 1.5) })
        await placed
        bot.activateItem()

        assert.deepStrictEqual(writes.filter(([name]) => name !== 'arm_animation'), [
          ['use_item', 1],
          ['block_dig', 0],
          ['block_place', 2],
          ['use_item', 3],
          ['use_item', 4]
        ])
        done()
      } catch (err) {
        done(err)
      }
    })
  }
}
