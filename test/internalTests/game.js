const assert = require('assert')
const { sleep, once, onceWithCleanup } = require('../../lib/promise_utils')
const vec3 = require('vec3')
const nbt = require('prismarine-nbt')

module.exports = {
  // only on 1.17
  'responds to ping / transaction packets': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      if (bot.supportFeature('transactionPacketExists')) {
        const transactionPacket = { windowId: 0, action: 42, accepted: false }
        client.once('transaction', (data, meta) => {
          assert.ok(meta.name === 'transaction')
          assert.ok(data.action === 42)
          assert.ok(data.accepted === true)
          done()
        })
        client.write('transaction', transactionPacket)
      } else {
        client.once('pong', (data) => {
          assert(data.id === 42)
          done()
        })
        client.write('ping', { id: 42 })
      }
    })
  },

  'window titles are ChatMessages whatever shape the server sends': async (bot, server) => {
    const Item = require('prismarine-item')(bot.registry)
    // A component title plus the bare-string form third-party servers send.
    const titles = bot.registry.supportFeature('chatPacketsUseNbtComponents')
      ? [nbt.comp({ text: nbt.string('Test Chest') }), nbt.string('Test Chest')]
      : [JSON.stringify({ text: 'Test Chest' }), 'Test Chest']
    const chest = bot.registry.supportFeature('village&pillageInventoryWindows')
      ? { inventoryType: 2 }
      : { inventoryType: 'minecraft:chest', slotCount: 27 }
    const [client] = await once(server, 'playerJoin')
    client.write('login', bot.test.generateLoginPacket())
    for (const [i, windowTitle] of titles.entries()) {
      const windowId = i + 1
      client.write('open_window', { windowId, windowTitle, ...chest })
      client.write('window_items', { windowId, stateId: 0, items: [], carriedItem: Item.toNotch(null) })
      const [window] = await once(bot, 'windowOpen')
      assert.strictEqual(window.id, windowId)
      assert.strictEqual(window.title.constructor.name, 'ChatMessage')
      assert.strictEqual(window.title.toString(), 'Test Chest')
    }
  },

  'pong is written at the next tick boundary, after the movement packet of the tick that received the ping': function (bot, server, done) {
    if (bot.supportFeature('transactionPacketExists')) {
      this.skip()
      return
    }
    const movementPackets = ['position', 'position_look', 'look', 'flying']
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), 41)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        client.write('position', {
          x: 1.5,
          y: 80,
          z: 1.5,
          dx: 0,
          dy: 0,
          dz: 0,
          pitch: 0,
          yaw: 0,
          flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0,
          teleportId: 0
        })
        await once(bot, 'forcedMove')

        // Falling takes a few ticks to leave the teleport height.
        await bot.waitForTicks(4)

        const seen = []
        client.on('packet', (data, meta) => seen.push({ name: meta.name, data }))

        // The ping is processed inside a tick: after the simulation, before
        // the movement packet carrying this tick's position.
        const { tickY, pingedAt } = await new Promise(resolve => {
          bot.once('physicsTick', () => {
            bot._client.emit('ping', { id: 123 })
            resolve({ tickY: bot.entity.position.y, pingedAt: Date.now() })
          })
        })
        assert.ok(tickY < 80, 'bot must be falling so every tick writes a movement packet')

        const [pong] = await onceWithCleanup(client, 'pong', { timeout: 200 })
        const pongedAt = Date.now()
        assert.strictEqual(pong.id, 123)
        assert.ok(pongedAt - pingedAt <= 200, `pong took ${pongedAt - pingedAt} ms`)

        await sleep(100)
        const pongs = seen.filter(p => p.name === 'pong')
        assert.strictEqual(pongs.length, 1, 'each ping is answered exactly once')
        const pongIndex = seen.indexOf(pongs[0])
        const before = seen.slice(0, pongIndex)
        // The pong is written at the tick boundary, after that tick's movement packet. On 1.21.2+ the tick also ends
        // with a tick_end packet, so tick_end (not the movement packet) is what immediately precedes the pong; only
        // tick_end may sit between the movement packet and the pong.
        const lastMovement = [...before].reverse().find(p => movementPackets.includes(p.name))
        assert.ok(lastMovement !== undefined, 'a movement packet precedes the pong')
        assert.strictEqual(lastMovement.data.y, tickY, 'the pong follows the movement packet of the tick that received the ping')
        const between = before.slice(before.lastIndexOf(lastMovement) + 1)
        assert.ok(between.every(p => p.name === 'tick_end'), `only tick_end may separate the movement packet from the pong, saw ${between.map(p => p.name).join(', ')}`)
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'pong is written within one tick when physics is not ticking': function (bot, server, done) {
    if (bot.supportFeature('transactionPacketExists')) {
      this.skip()
      return
    }
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        await once(bot, 'login')
        const pongs = []
        client.on('pong', (data) => pongs.push(data))
        const pingedAt = Date.now()
        client.write('ping', { id: 123 })
        const [pong] = await onceWithCleanup(client, 'pong', { timeout: 200 })
        const pongedAt = Date.now()
        assert.strictEqual(pong.id, 123)
        assert.ok(pongedAt - pingedAt <= 200, `pong took ${pongedAt - pingedAt} ms`)
        await sleep(100)
        assert.strictEqual(pongs.length, 1, 'each ping is answered exactly once')
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'closeWindow follows close_window with a no-op inventory click on pre-1.17 only': (bot, server, done) => {
    server.on('playerJoin', (client) => {
      const clicks = []
      let closed = false
      client.on('packet', (data, meta) => {
        if (meta.name === 'close_window') closed = true
        if (meta.name !== 'window_click') return
        clicks.push(data)
        assert.ok(closed, 'the sync click must follow close_window')
        client.write('transaction', { windowId: data.windowId, action: data.action, accepted: true })
      })
      const loggedIn = once(bot, 'login')
      client.write('login', bot.test.generateLoginPacket())
      loggedIn
        .then(() => bot.closeWindow(bot.inventory))
        .then(() => sleep(100))
        .then(() => {
          if (bot.supportFeature('stateIdUsed')) {
            assert.strictEqual(clicks.length, 0)
          } else {
            assert.strictEqual(clicks.length, 1)
            assert.strictEqual(clicks[0].windowId, 0)
            assert.strictEqual(clicks[0].slot, -999)
            assert.strictEqual(clicks[0].mode, 0)
            assert.strictEqual(clicks[0].mouseButton, 0)
          }
        })
        .then(done, done)
    })
  },

  'dimension type lookup uses worldType over worldName on 1.19-1.20.4': function (bot, server, done) {
    // On proxy/modded servers the worldName (level name) may differ from
    // the dimension type. For versions with dimensionDataInCodec but
    // without segmentedRegistryCodecData (1.19-1.20.4), the bot should
    // prefer worldType (login) / dimension (respawn) for the codec lookup.
    if (!bot.supportFeature('dimensionDataInCodec') || bot.supportFeature('segmentedRegistryCodecData')) {
      this.skip()
      return
    }

    const loginPacket = bot.test.generateLoginPacket()
    // Simulate a proxy/modded server: worldName is a custom level name
    // but worldType is still the real dimension type
    loginPacket.worldName = 'modded:custom_world'
    loginPacket.worldType = 'minecraft:overworld'

    server.on('playerJoin', (client) => {
      client.write('login', loginPacket)
      bot.once('login', () => {
        assert.strictEqual(bot.game.dimension, 'overworld',
          'should use worldType for dimension, not worldName')
        assert.ok(bot.game.minY !== undefined,
          'minY should be set from codec lookup')
        assert.ok(bot.game.height !== undefined,
          'height should be set from codec lookup')
        done()
      })
    })
  }
}
