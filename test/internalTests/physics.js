const assert = require('assert')
const vec3 = require('vec3')
const { once, sleep } = require('../../lib/promise_utils')
const mc = require('minecraft-protocol')
const { EventEmitter } = require('events')

module.exports = {
  'no physics if there is no chunk': (bot, server, done) => {
    let fail = 0
    const basePosition = {
      x: 1.5,
      y: 66,
      z: 1.5,
      dx: 0, // 1.21.3
      dy: 0, // 1.21.3
      dz: 0, // 1.21.3
      pitch: 0,
      yaw: 0,
      flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
      teleportId: 0
    }
    server.on('playerJoin', async (client) => {
      await client.write('login', bot.test.generateLoginPacket())
      await client.write('position', basePosition)
      client.on('packet', (data, meta) => {
        const packetName = meta.name
        switch (packetName) {
          case 'position':
            fail++
            break
          case 'position_look':
            fail++
            break
          case 'look':
            fail++
            break
        }
        if (fail > 1) assert.fail('position packet sent')
      })
      await sleep(2000)
      done()
    })
  },

  'absolute position & relative position (velocity)': (bot, server, done) => {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    // forcedMove fires when the teleport is answered at the start of a physics tick, so the state
    // it produces has to be read then; awaiting the event resumes after that tick's simulation.
    const onForcedMove = () => new Promise(resolve => {
      bot.once('forcedMove', () => resolve({ velocity: bot.entity.velocity.clone(), position: bot.entity.position.clone() }))
    })
    server.on('playerJoin', async (client) => {
      try {
        await client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(pos, goldId)
        await client.write('map_chunk', bot.test.generateChunkPacket(chunk))

        await once(bot, 'chunkColumnLoad')

        // --- Test 1: Absolute Position ---
        const absolutePositionPacket = {
          x: 1.5,
          y: 80,
          z: 1.5,
          pitch: 0,
          yaw: 0,
          teleportId: 1,
          flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0
        }

        bot.entity.velocity.y = -1.0 // Give bot some velocity

        const p1 = onForcedMove()
        client.write('position', absolutePositionPacket)
        const afterAbsolute = await p1

        // Assertions for absolute teleport
        assert.strictEqual(afterAbsolute.velocity.y, 0, 'Velocity should be reset to 0 after an absolute teleport')
        assert.deepStrictEqual(afterAbsolute.position, vec3(1.5, 80, 1.5), 'Position should be set absolutely')

        // --- Test 2: Relative Position ---
        const relativePositionPacket = {
          x: 1.0,
          y: -2.0,
          z: 0.5,
          pitch: 0,
          yaw: 0,
          teleportId: 2,
          flags: bot.supportFeature('positionPacketHasBitflags') ? { x: true, y: true, z: true, yaw: false, pitch: false } : 7
        }

        // Set a known velocity *before* the relative update
        bot.entity.velocity.y = -1.0
        const initialPosition = bot.entity.position.clone()
        const expectedPosition = initialPosition.plus(vec3(1.0, -2.0, 0.5))

        const p2 = onForcedMove()
        client.write('position', relativePositionPacket)
        const afterRelative = await p2

        // Assertions for relative teleport
        assert.notStrictEqual(afterRelative.velocity.y, 0, 'Velocity should be preserved after a relative teleport')
        assert.deepStrictEqual(afterRelative.position, expectedPosition, 'Position should be updated relatively')

        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'drops the tick backlog after an event-loop stall instead of draining it': (bot, server, done) => {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    server.on('playerJoin', async (client) => {
      client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(pos, goldId)
      await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await client.write('position', {
        x: 1.5,
        y: 66,
        z: 1.5,
        dx: 0,
        dy: 0,
        dz: 0,
        pitch: 0,
        yaw: 0,
        teleportId: 1,
        flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0
      })
      await once(bot, 'physicsTick')
      await sleep(300)
      // No physics tick can run during the stall (30 ticks' worth).
      const stallUntil = Date.now() + 1500
      while (Date.now() < stallUntil) { /* busy wait */ }
      let ticks = 0
      const count = () => ticks++
      bot.on('physicsTick', count)
      await sleep(500)
      bot.off('physicsTick', count)
      // 10 ticks at 20 tps plus one burst of at most maxCatchupTicks (4).
      assert.ok(ticks <= 18, `${ticks} physics ticks in the 500 ms after a 1.5 s stall`)
      assert.ok(ticks >= 8, `only ${ticks} physics ticks in 500 ms`)
      done()
    })
  },

  'answers only the latest teleport when a second one lands inside the respawn reply delay': (bot, server, done) => {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    // After a death the reply to the next teleport waits 1.5 s. A teleport that arrives inside
    // that window replaces it: the deferred reply must not go out with the older coordinates.
    const teleport = (teleportId, x, y, z) => ({
      x,
      y,
      z,
      dx: 0,
      dy: 0,
      dz: 0,
      pitch: 0,
      yaw: 0,
      flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0,
      teleportId
    })
    server.on('playerJoin', async (client) => {
      try {
        await client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(pos, goldId)
        await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const replies = []
        client.on('packet', (data, meta) => {
          if (meta.name === 'position_look') replies.push([data.x, data.y, data.z])
        })
        await client.write('position', teleport(0, 1.5, 80, 1.5))
        while (replies.length === 0) await once(client, 'packet')
        replies.length = 0

        bot.emit('death')
        await client.write('position', teleport(1, 3.5, 80, 3.5))
        await sleep(100)
        await client.write('position', teleport(2, 1.5, 66, 1.5))
        // Outlive the 1.5 s reply delay.
        await sleep(1700)

        assert.deepStrictEqual(replies, [[1.5, 66, 1.5]], `teleport replies: ${JSON.stringify(replies)}`)
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'gravity + land on solid block + jump': (bot, server, done) => {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    let y = 80
    let landed = false
    bot.on('move', () => {
      if (landed) return
      assert.ok(bot.entity.position.y <= y)
      assert.ok(bot.entity.position.y >= pos.y)
      y = bot.entity.position.y
      if (bot.entity.position.y <= pos.y + 1) {
        assert.strictEqual(bot.entity.position.y, pos.y + 1)
        assert.strictEqual(bot.entity.onGround, true)
        landed = true
        done()
      } else {
        assert.strictEqual(bot.entity.onGround, false)
      }
    })
    server.on('playerJoin', (client) => {
      client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()

      chunk.setBlockType(pos, goldId)
      client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      client.write('position', {
        x: 1.5,
        y: 80,
        z: 1.5,
        pitch: 0,
        yaw: 0,
        flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0,
        teleportId: 0
      })
    })
  },

  'answers a teleport airborne and then reports the standing flag it had while physics is disabled': async function (bot, server) {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    const client = (await once(server, 'playerJoin'))[0]
    await client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    chunk.setBlockType(pos, goldId)
    await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
    await once(bot, 'chunkColumnLoad')
    const onBlock = { x: pos.x + 0.5, y: pos.y + 1, z: pos.z + 0.5, dx: 0, dy: 0, dz: 0, pitch: 0, yaw: 0, teleportId: 1, flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0 }
    const landed = once(bot, 'forcedMove')
    await client.write('position', onBlock)
    await landed
    await bot.waitForTicks(5)
    assert.strictEqual(bot.entity.onGround, true, 'standing on the block')
    bot.physicsEnabled = false
    const moves = []
    const onPacket = (data, meta) => {
      if (!['position', 'position_look', 'look', 'flying'].includes(meta.name)) return
      moves.push({ name: meta.name, onGround: data.onGround ?? data.flags?.onGround })
    }
    client.on('packet', onPacket)
    const pinned = once(bot, 'forcedMove')
    await client.write('position', { ...onBlock, teleportId: 2 })
    await pinned
    await sleep(1500)
    client.off('packet', onPacket)
    // The reply to the teleport is the only packet that is not grounded.
    const airborne = moves.filter(m => m.onGround !== true)
    assert.deepStrictEqual(airborne, [{ name: 'position_look', onGround: false }], `the teleport reply alone is airborne: ${JSON.stringify(moves)}`)
    const reminders = moves.slice(moves.indexOf(airborne[0]) + 1)
    assert.ok(reminders.length > 0, 'the position reminder goes out with physics disabled')
  },

  'no movement packets during a server transfer configuration phase': function (bot, server, done) {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    // Regression test for https://github.com/PrismarineJS/mineflayer/issues/3776
    // While the client is in the configuration phase (Velocity/BungeeCord server
    // transfer), sending play-state movement packets gets the bot kicked.
    // NOTE: the mock server's client.on('packet') cannot be used here, because
    // the server-side mock connection stays in the play state while only the
    // bot's client transitions to configuration — outbound movement packets then
    // fail to deserialize on the mock server and are silently dropped. Intercept
    // the bot's own client.write() instead, which directly captures what the bot
    // attempts to send, whatever the state.
    if (!bot.supportFeature('hasConfigurationState')) {
      this.skip()
      return
    }
    const positionPacket = {
      x: 1.5,
      y: 80,
      z: 1.5,
      dx: 0,
      dy: 0,
      dz: 0,
      pitch: 0,
      yaw: 0,
      flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
      teleportId: 0
    }
    const movementPackets = ['position', 'position_look', 'look', 'flying']
    let phase = 'play'
    let movementDuringConfig = 0
    server.on('playerJoin', async (client) => {
      const originalWrite = bot._client.write.bind(bot._client)
      bot._client.write = (name, params) => {
        if (phase === 'configuration' && movementPackets.includes(name)) {
          movementDuringConfig++
        }
        return originalWrite(name, params)
      }

      await client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(pos, goldId)
      await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await once(bot, 'chunkColumnLoad')
      // The initial position enables physics and movement packets
      const p1 = once(bot, 'forcedMove')
      await client.write('position', positionPacket)
      await p1

      // Wait until the in-flight teleport response has been sent so it is
      // not miscounted, then have the proxy pull the client back into the
      // configuration phase.
      await sleep(100)
      await client.write('start_configuration', {})
      // Confirm the client state actually flipped before observing.
      if (bot._client.state !== 'configuration') {
        await once(bot._client, 'state')
      }
      phase = 'configuration'
      await sleep(500)
      phase = 'play'

      assert.strictEqual(movementDuringConfig, 0,
        `physics loop sent ${movementDuringConfig} movement packet(s) during configuration phase`)
      done()
    })
  },

  'cancels the delayed respawn teleport reply when a transfer lands inside its delay': function (bot, server, done) {
    const pos = vec3(1, 65, 1)
    const goldId = 41

    // After a death the reply to the respawn teleport is deferred 1.5 s. A proxy transfer that
    // starts inside that window must not make the timer write a play packet in the
    // configuration state.
    if (!bot.supportFeature('hasConfigurationState')) {
      this.skip()
      return
    }
    const positionPacket = {
      x: 1.5,
      y: 80,
      z: 1.5,
      dx: 0,
      dy: 0,
      dz: 0,
      pitch: 0,
      yaw: 0,
      flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0,
      teleportId: 0
    }
    const movementPackets = ['position', 'position_look', 'look', 'flying']
    const sent = []
    server.on('playerJoin', async (client) => {
      try {
        const originalWrite = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => {
          if (movementPackets.includes(name)) sent.push(`${name} in ${bot._client.state}`)
          return originalWrite(name, params)
        }

        await client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(pos, goldId)
        await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const p1 = once(bot, 'forcedMove')
        await client.write('position', positionPacket)
        await p1

        bot.emit('death')
        sent.length = 0
        await client.write('position', { ...positionPacket, teleportId: 1 })
        await sleep(100)
        await client.write('start_configuration', {})
        if (bot._client.state !== 'configuration') {
          await once(bot._client, 'state')
        }
        // Outlive the 1.5 s reply delay.
        await sleep(1700)

        assert.deepStrictEqual(sent, [], `movement packets written after the transfer began: ${sent.join(', ')}`)
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'accepts a configuration-phase resource pack with the real UUID bytes': function (bot, server) {
    // The accept must carry the pack's real UUID bytes; a uuid-1345 object serializes to
    // 16 zero bytes.
    // The mock server never reaches the configuration phase, so the plugin is driven directly.
    if (!bot.registry.supportFeature('resourcePackUsesUUID')) {
      this.skip()
      return
    }
    const packUuid = '8ef4746b-93b7-3c32-9dcb-b375016c114d'
    const expectedBytes = Buffer.from(packUuid.replace(/-/g, ''), 'hex')
    const serializer = mc.createSerializer({ state: 'configuration', isServer: false, version: bot.version })

    const client = new EventEmitter()
    client.state = 'configuration'
    const writes = []
    client.write = (name, params) => { writes.push({ name, params }) }
    const fakeBot = new EventEmitter()
    fakeBot._client = client
    fakeBot.supportFeature = bot.registry.supportFeature.bind(bot.registry)
    require('../../lib/plugins/resource_pack')(fakeBot)

    client.emit('add_resource_pack', {
      uuid: packUuid,
      url: 'https://example.invalid/pack.zip',
      hash: '88b406352dc8a335b1050a4bf9577a878c812012',
      forced: false
    })

    const accept = writes.find((w) => w.name === 'resource_pack_receive')
    assert(accept, 'bot should answer the pack during the configuration phase')
    const buf = serializer.createPacketBuffer({ name: accept.name, params: accept.params })
    assert(buf.includes(expectedBytes),
      'resource_pack_receive must carry the pack UUID bytes, not a zero UUID')
  }
}
