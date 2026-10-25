const assert = require('assert')
const vec3 = require('vec3')
const { once, sleep } = require('../../lib/promise_utils')

module.exports = {
  'answers a teleport at the next tick instead of from inside the packet handler': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const writes = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => { writes.push(name); return write(name, params) }
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          writes.length = 0
          bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
          assert.deepStrictEqual(writes, [], 'the teleport must not be answered from inside the packet handler')
          await once(bot, 'forcedMove')
          assert.ok(writes.includes('position_look'), 'the teleport is answered on the next tick')
        } finally {
          bot._client.write = write
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'answers pings and teleports in the order the packets arrived': function (bot, server, done) {
    if (bot.supportFeature('transactionPacketExists')) {
      this.skip()
      return
    }
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const writes = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => { writes.push({ name, params }); return write(name, params) }
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          writes.length = 0
          // Between two ticks the server's ping, teleport and second ping arrive in that order.
          bot._client.emit('ping', { id: 1 })
          bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
          bot._client.emit('ping', { id: 2 })
          assert.deepStrictEqual(writes, [], 'nothing is answered from inside the packet handlers')
          await once(bot, 'forcedMove')
          const replies = writes
            .filter(w => ['pong', 'teleport_confirm', 'position_look'].includes(w.name))
            .map(w => (w.name === 'pong' ? `pong ${w.params.id}` : w.name))
          assert.deepStrictEqual(replies, ['pong 1', 'teleport_confirm', 'position_look', 'pong 2'])
        } finally {
          bot._client.write = write
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'answers every teleport queued for a tick, in arrival order': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const replies = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => {
          if (name === 'position_look') replies.push(params.y)
          return write(name, params)
        }
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          replies.length = 0
          bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
          bot._client.emit('position', { ...teleport, y: 100, teleportId: 2 })
          await new Promise(resolve => bot.once('physicsTick', resolve))
          assert.deepStrictEqual(replies, [90, 100], 'each queued teleport gets its own reply on the same tick')
        } finally {
          bot._client.write = write
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'a rotation arriving after a queued teleport is not overwritten by it': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const replies = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => {
          if (name === 'position_look') replies.push(params.yaw)
          return write(name, params)
        }
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          replies.length = 0
          bot._client.emit('position', { ...teleport, yaw: 30, teleportId: 1 })
          bot._client.emit('player_rotation', { yaw: 90, pitch: 0 })
          await once(bot, 'forcedMove')
          assert.deepStrictEqual(replies, [30], 'the teleport is answered with its own rotation')
          assert.strictEqual(bot.entity.yaw, require('../../lib/conversions').fromNotchianYaw(90), 'the later rotation wins')
        } finally {
          bot._client.write = write
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'drops a teleport queued before a respawn but still answers pings': function (bot, server, done) {
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const writes = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => { writes.push(name); return write(name, params) }
        let forcedMoves = 0
        const onForcedMove = () => { forcedMoves++ }
        bot.on('forcedMove', onForcedMove)
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          writes.length = 0
          const pings = !bot.supportFeature('transactionPacketExists')
          if (pings) bot._client.emit('ping', { id: 1 })
          bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
          bot.emit('respawn')
          await sleep(150)
          assert.ok(!writes.includes('teleport_confirm'), 'the old teleport is not confirmed')
          assert.ok(!writes.includes('position_look'), 'the old teleport is not answered')
          assert.strictEqual(forcedMoves, 0, 'physics is not re-enabled by the old teleport')
          if (pings) assert.ok(writes.includes('pong'), 'the ping is still answered')
        } finally {
          bot._client.write = write
          bot.off('forcedMove', onForcedMove)
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'drops queued replies when the client leaves the play state': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      try {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        await once(bot, 'chunkColumnLoad')
        const teleport = {
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
        }
        client.write('position', teleport)
        await once(bot, 'forcedMove')

        const writes = []
        const write = bot._client.write.bind(bot._client)
        bot._client.write = (name, params) => { writes.push(name); return write(name, params) }
        try {
          await new Promise(resolve => bot.once('physicsTick', resolve))
          writes.length = 0
          bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
          // Only the transition is simulated; the connection itself stays in play.
          bot._client.emit('state', 'configuration', 'play')
          await sleep(150)
          assert.ok(!writes.includes('position_look'), 'the teleport from the previous play session is not answered')
        } finally {
          bot._client.write = write
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  }
}
