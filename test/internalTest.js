/* eslint-env mocha */

const mineflayer = require('../')
const vec3 = require('vec3')
const mc = require('minecraft-protocol')
const assert = require('assert')
const { sleep } = require('../lib/promise_utils')
const nbt = require('prismarine-nbt')
const { once, onceWithCleanup } = require('../lib/promise_utils')
const { EventEmitter } = require('events')
const { getPort } = require('./common/util')

for (const supportedVersion of mineflayer.testedVersions) {
  const registry = require('prismarine-registry')(supportedVersion)
  const version = registry.version
  const Chunk = require('prismarine-chunk')(supportedVersion)

  const hasSignedChat = registry.supportFeature('signedChat')
  function chatText (text) {
    // TODO: move this to prismarine-chat in a new ChatMessage(text).toNotch(asNbt) method
    return registry.supportFeature('chatPacketsUseNbtComponents')
      ? nbt.comp({ text: nbt.string(text) })
      : JSON.stringify({ text })
  }

  function generateChunkPacket (chunk) {
    const lights = chunk.dumpLight()
    return {
      x: 0,
      z: 0,
      groundUp: true,
      biomes: chunk.dumpBiomes !== undefined ? chunk.dumpBiomes() : undefined,
      heightmaps: {
        type: 'compound',
        name: '',
        value: {
          MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) }
        }
      }, // send fake heightmap
      bitMap: chunk.getMask(),
      chunkData: chunk.dump(),
      blockEntities: [],
      trustEdges: false,
      skyLightMask: lights?.skyLightMask,
      blockLightMask: lights?.blockLightMask,
      emptySkyLightMask: lights?.emptySkyLightMask,
      emptyBlockLightMask: lights?.emptyBlockLightMask,
      skyLight: lights?.skyLight,
      blockLight: lights?.blockLight
    }
  }

  describe(`mineflayer_internal ${supportedVersion}v`, function () {
    this.timeout(10 * 1000)
    let bot
    let server
    let PORT
    beforeEach(async function () {
      PORT = await getPort()
      server = mc.createServer({
        'online-mode': false,
        version: supportedVersion,
        port: PORT
      })
      await once(server, 'listening')
      bot = mineflayer.createBot({
        username: 'player',
        version: supportedVersion,
        port: PORT
      })
      bot.test = {}

      bot.test.buildChunk = () => {
        if (bot.supportFeature('tallWorld')) {
          return new Chunk({ minY: -64, worldHeight: 384 })
        } else {
          return new Chunk()
        }
      }

      bot.test.generateLoginPacket = () => {
        let loginPacket
        if (bot.supportFeature('usesLoginPacket')) {
          loginPacket = registry.loginPacket
          loginPacket.entityId = 0 // Default login packet in minecraft-data 1.16.5 is 1, so set it to 0
        } else {
          loginPacket = {
            entityId: 0,
            levelType: 'fogetaboutit',
            gameMode: 0,
            previousGameMode: 255,
            worldNames: ['minecraft:overworld'],
            dimension: 0,
            worldName: 'minecraft:overworld',
            hashedSeed: [0, 0],
            difficulty: 0,
            maxPlayers: 20,
            reducedDebugInfo: 1,
            enableRespawnScreen: true
          }
        }
        return loginPacket
      }
    })
    afterEach((done) => {
      bot.on('end', () => {
        done()
      })
      server.close()
    })
    it('chat', (done) => {
      bot.once('chat', (username, message) => {
        assert.strictEqual(username, 'gary')
        assert.strictEqual(message, 'hello')
        bot.chat('hi')
      })
      server.on('playerJoin', (client) => {
        client.write('login', bot.test.generateLoginPacket())
        const message = hasSignedChat
          ? JSON.stringify({ text: 'hello' })
          : JSON.stringify({
            translate: 'chat.type.text',
            with: [{
              text: 'gary'
            },
            'hello'
            ]
          })

        if (hasSignedChat) {
          const uuid = 'd3527a0b-bc03-45d5-a878-2aafdd8c8a43' // random
          const networkName = chatText('gary')

          if (registry.supportFeature('incrementedChatType')) {
            client.write('player_chat', {
              plainMessage: 'hello',
              filterType: 0,
              type: { chatType: 0 },
              networkName,
              previousMessages: [],
              senderUuid: uuid,
              timestamp: Date.now(),
              index: 0,
              salt: 1n
            })
          } else if (registry.supportFeature('useChatSessions')) {
            client.write('player_chat', {
              plainMessage: 'hello',
              filterType: 0,
              type: { chatType: 0 },
              networkName,
              previousMessages: [],
              senderUuid: uuid,
              timestamp: Date.now(),
              index: 0,
              salt: 2n
            })
          } else if (registry.supportFeature('chainedChatWithHashing')) {
            client.write('player_chat', {
              plainMessage: 'hello',
              filterType: 0,
              type: 0,
              networkName,
              previousMessages: [],
              senderUuid: uuid,
              timestamp: Date.now(),
              salt: 3n,
              signature: Buffer.alloc(0)
            })
          } else {
            client.write('player_chat', {
              signedChatContent: '',
              unsignedChatContent: message,
              type: 0,
              senderUuid: uuid,
              senderName: JSON.stringify({ text: 'gary' }),
              senderTeam: undefined,
              timestamp: Date.now(),
              salt: 4n,
              signature: Buffer.alloc(0)
            })
          }
        } else {
          client.write('chat', { message, position: 0, sender: '0' })
        }
        function onChat (packet) {
          const msg = packet.message || packet.unsignedChatContent || packet.signedChatContent
          assert.strictEqual(msg, 'hi')
          done()
        }
        client.on('chat_message', onChat)
        client.on('chat', onChat)
      })
    })
    it('entity effects', (done) => {
      bot.once('entityEffect', (entity, effect) => {
        assert.strictEqual(entity.id, 8)
        assert.strictEqual(effect.id, 10)
        assert.strictEqual(effect.amplifier, 1)
        assert.strictEqual(effect.duration, 11)
        done()
      })
      // Versions prior to 1.11 have capital first letter
      const entities = bot.registry.entitiesByName
      const creeperId = entities.creeper ? entities.creeper.id : entities.Creeper.id
      server.on('playerJoin', (client) => {
        client.write(bot.registry.supportFeature('consolidatedEntitySpawnPacket') ? 'spawn_entity' : 'spawn_entity_living', {
          entityId: 8, // random
          entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
          objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
          type: creeperId,
          x: 10,
          y: 11,
          z: 12,
          yaw: 13,
          pitch: 14,
          headPitch: 14,
          velocity: { x: 15, y: 16, z: 17 },
          metadata: []
        })
        client.write('entity_effect', {
          entityId: 8,
          effectId: 10,
          amplifier: 1,
          duration: 11,
          hideParticles: false
        })
      })
    })
    it('blockAt', (done) => {
      const pos = vec3(1, 65, 1)
      const goldId = bot.registry.blocksByName.gold_block.id
      bot.on('chunkColumnLoad', (columnPoint) => {
        assert.strictEqual(columnPoint.x, 0)
        assert.strictEqual(columnPoint.z, 0)
        assert.strictEqual(bot.blockAt(pos).type, goldId)
        done()
      })
      server.on('playerJoin', (client) => {
        client.write('login', bot.test.generateLoginPacket())
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(pos, goldId)
        client.write('map_chunk', generateChunkPacket(chunk))
      })
    })

    describe('digTime', () => {
      it('should use eye-level water check instead of isInWater for dig speed', (done) => {
        const blockPos = vec3(1, 65, 1)
        const playerPos = vec3(1.5, 66, 1.5)
        // eyeHeight is 1.62, so eye level at y=67.62 -> block at y=67
        // A second position where eye level has water: player at y=70, eye at y=71.62 -> block y=71
        const playerPos2 = vec3(1.5, 70, 1.5)
        const eyeLevelBlockPos2 = vec3(1, 71, 1)
        const dirtId = bot.registry.blocksByName.dirt.id
        const waterId = bot.registry.blocksByName.water.id
        const blockPos2 = vec3(1, 69, 1)

        bot.on('chunkColumnLoad', () => {
          // Set bot entity properties
          bot.entity.eyeHeight = 1.62
          bot.entity.onGround = true
          bot.entity.isInWater = false
          bot.entity.effects = {}
          bot.game = bot.game || {}
          bot.game.gameMode = 'survival'

          // Test 1: No water at eye level -> normal dig speed
          bot.entity.position = playerPos
          const block1 = bot.blockAt(blockPos)
          const digTimeNoWater = bot.digTime(block1)

          // Test 2: Water at eye level -> slower dig speed
          bot.entity.position = playerPos2
          const block2 = bot.blockAt(blockPos2)
          const digTimeWithWater = bot.digTime(block2)

          // Digging in water should be slower (higher dig time)
          assert(digTimeWithWater > digTimeNoWater,
            `Dig time with water at eye level (${digTimeWithWater}) should be greater than without (${digTimeNoWater})`)

          // Test 3: isInWater=true but no water block at eye level should NOT slow digging
          // (this is the bug that was fixed - previously isInWater incorrectly affected dig speed)
          bot.entity.position = playerPos
          bot.entity.isInWater = true
          const digTimeFeetInWater = bot.digTime(block1)
          assert.strictEqual(digTimeFeetInWater, digTimeNoWater,
            'isInWater should not affect dig time when eye level is not in water')

          done()
        })
        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())
          const chunk = bot.test.buildChunk()
          // Place dirt blocks to dig at two locations
          chunk.setBlockType(blockPos, dirtId)
          chunk.setBlockType(blockPos2, dirtId)
          // Place water only at the second eye-level position
          chunk.setBlockType(eyeLevelBlockPos2, waterId)
          client.write('map_chunk', generateChunkPacket(chunk))
        })
      })
    })

    describe('physics', () => {
      const pos = vec3(1, 65, 1)
      const goldId = 41
      it('no physics if there is no chunk', (done) => {
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
      })
      it('absolute position & relative position (velocity)', (done) => {
        server.on('playerJoin', async (client) => {
          await client.write('login', bot.test.generateLoginPacket())
          const chunk = bot.test.buildChunk()
          chunk.setBlockType(pos, goldId)
          await client.write('map_chunk', generateChunkPacket(chunk))

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

          const p1 = once(bot, 'forcedMove')
          client.write('position', absolutePositionPacket)
          await p1

          // Assertions for absolute teleport
          assert.strictEqual(bot.entity.velocity.y, 0, 'Velocity should be reset to 0 after an absolute teleport')
          assert.deepStrictEqual(bot.entity.position, vec3(1.5, 80, 1.5), 'Position should be set absolutely')

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

          const p2 = once(bot, 'forcedMove')
          client.write('position', relativePositionPacket)
          await p2

          // Assertions for relative teleport
          assert.notStrictEqual(bot.entity.velocity.y, 0, 'Velocity should be preserved after a relative teleport')
          assert.deepStrictEqual(bot.entity.position, expectedPosition, 'Position should be updated relatively')

          done()
        })
      })
      it('gravity + land on solid block + jump', (done) => {
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
          client.write('map_chunk', generateChunkPacket(chunk))
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
      })
      it('no movement packets during a server transfer configuration phase', function (done) {
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
          await client.write('map_chunk', generateChunkPacket(chunk))
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
      })

      it('accepts a configuration-phase resource pack with the real UUID bytes', function () {
        // The accept must carry the pack's real UUID bytes; a uuid-1345 object serializes to
        // 16 zero bytes.
        // The mock server never reaches the configuration phase, so the plugin is driven directly.
        if (!registry.supportFeature('resourcePackUsesUUID')) {
          this.skip()
          return
        }
        const packUuid = '8ef4746b-93b7-3c32-9dcb-b375016c114d'
        const expectedBytes = Buffer.from(packUuid.replace(/-/g, ''), 'hex')
        const serializer = mc.createSerializer({ state: 'configuration', isServer: false, version: supportedVersion })

        const client = new EventEmitter()
        client.state = 'configuration'
        const writes = []
        client.write = (name, params) => { writes.push({ name, params }) }
        const fakeBot = new EventEmitter()
        fakeBot._client = client
        fakeBot.supportFeature = registry.supportFeature.bind(registry)
        require('../lib/plugins/resource_pack')(fakeBot)

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
      })
    })

    describe('world', () => {
      const pos = vec3(1, 65, 1)
      const goldId = 41
      it('switchWorld respawn', (done) => {
        const loginPacket = bot.test.generateLoginPacket()
        let respawnPacket
        if (bot.supportFeature('usesLoginPacket')) {
          loginPacket.worldName = 'minecraft:overworld'
          loginPacket.hashedSeed = [0, 0]
          loginPacket.entityId = 0
          respawnPacket = {
            // 1.19+ the `dimension` filed is a string in respawn packet and undefined in login packet, in previous versions it's same NBT data in login/respawn
            dimension: bot.supportFeature('dimensionDataInCodec') ? 'minecraft:overworld' : loginPacket.dimension,
            worldName: loginPacket.worldName,
            hashedSeed: loginPacket.hashedSeed,
            gamemode: 0,
            previousGamemode: 255,
            isDebug: false,
            isFlat: false,
            copyMetadata: true,
            death: {
              dimensionName: '',
              location: {
                x: 0,
                y: 0,
                z: 0
              }
            }
          }
          if (bot.supportFeature('spawnRespawnWorldDataField')) {
            respawnPacket = {
              worldState: respawnPacket
            }
            respawnPacket.worldState.name = loginPacket.worldName
            respawnPacket.worldState.dimension = loginPacket.dimension
          }
        } else {
          respawnPacket = {
            dimension: 0,
            hashedSeed: [0, 0],
            gamemode: 0,
            levelType: 'default'
          }
        }
        const chunk = bot.test.buildChunk()
        chunk.setBlockType(pos, goldId)
        const chunkPacket = generateChunkPacket(chunk)
        const positionPacket = {
          x: 1.5,
          y: 80,
          z: 1.5,
          pitch: 0,
          yaw: 0,
          flags: 0,
          teleportId: 0
        }
        server.on('playerJoin', async (client) => {
          bot.once('respawn', () => {
            assert.ok(bot.world.getColumn(0, 0) !== undefined)
            bot.once('respawn', () => {
              assert.ok(bot.world.getColumn(0, 0) === undefined)
              done()
            })
            if (bot.supportFeature('spawnRespawnWorldDataField')) {
              respawnPacket.worldState.name = 'minecraft:nether'
            } else {
              respawnPacket.worldName = 'minecraft:nether'
            }
            if (bot.supportFeature('spawnRespawnWorldDataField')) {
              respawnPacket.worldState.dimension = 1
            } else if (bot.supportFeature('usesLoginPacket')) {
              respawnPacket.dimension.name = 'e'
            } else {
              respawnPacket.dimension = 1
            }
            client.write('respawn', respawnPacket)
          })
          await client.write('login', loginPacket)
          await client.write('map_chunk', chunkPacket)
          await client.write('position', positionPacket)
          await client.write('update_health', {
            health: 20,
            food: 20,
            foodSaturation: 0
          })
          await bot.waitForTicks(1)
          await client.write('respawn', respawnPacket)
        })
      })
    })

    describe('game', () => {
      it('responds to ping / transaction packets', (done) => { // only on 1.17
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
      })

      it('closeWindow follows close_window with a no-op inventory click on pre-1.17 only', (done) => {
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
      })

      it('dimension type lookup uses worldType over worldName on 1.19-1.20.4', function (done) {
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
      })
    })

    describe('rain', () => {
      it('flips isRaining on rain level zero-crossings without start_raining', (done) => {
        // Vanilla 26.1 can bring rain in with only rain_level_change ramps,
        // never sending start_raining/stop_raining (observed on a quick
        // weather flip), so level crossings alone must drive isRaining.
        const mapped = JSON.stringify(registry.protocol.play.toClient.types.packet_game_state_change).includes('rain_level_change')
        const reason = mapped ? 'rain_level_change' : 7
        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())
          // Plugins inject after a deferred inject_allowed, so bot state is
          // only readable once the bot has seen login.
          bot.once('login', () => {
            assert.strictEqual(bot.isRaining, false)
            bot.once('rain', () => {
              assert.strictEqual(bot.isRaining, true)
              bot.once('rain', () => {
                assert.strictEqual(bot.isRaining, false)
                assert.strictEqual(bot.rainState, 0)
                done()
              })
              client.write('game_state_change', { reason, gameMode: 0 })
            })
            client.write('game_state_change', { reason, gameMode: 0.01 })
            // A second wet level must not emit again: if it did, the inner
            // once would run with isRaining still true and fail the assert.
            client.write('game_state_change', { reason, gameMode: 0.5 })
          })
        })
      })
    })

    describe('entities', () => {
      it('entity id changes on login', (done) => {
        const loginPacket = bot.test.generateLoginPacket()
        server.on('playerJoin', (client) => {
          if (bot.supportFeature('usesLoginPacket')) {
            loginPacket.entityId = 0 // Default login packet in minecraft-data 1.16.5 is 1, so set it to 0
          }
          client.write('login', loginPacket)
          bot.once('login', () => {
            assert.ok(bot.entity.id === 0)
            loginPacket.entityId = 42
            bot.once('login', () => {
              assert.ok(bot.entity.id === 42)
              done()
            })
            client.write('login', loginPacket)
          })
        })
      })

      it('player displayName', (done) => {
        server.on('playerJoin', (client) => {
          bot.on('entitySpawn', (entity) => {
            const player = bot.players[entity.username]
            assert.strictEqual(entity.username, player.displayName.toString())
            if (registry.supportFeature('playerInfoActionIsBitfield')) {
              client.write('player_info', {
                action: { update_display_name: true },
                data: [{
                  uuid: '1-2-3-4',
                  displayName: chatText('wvffle')
                }]
              })
            } else {
              client.write('player_info', {
                action: 'update_display_name',
                data: [{
                  uuid: '1-2-3-4',
                  displayName: chatText('wvffle')
                }]
              })
            }
          })

          bot.once('playerUpdated', (player) => {
            assert.strictEqual('wvffle', player.displayName.toString())
            if (registry.supportFeature('playerInfoActionIsBitfield')) {
              client.write('player_info', {
                action: { update_display_name: true },
                data: [{
                  uuid: '1-2-3-4',
                  displayName: null
                }]
              })
            } else {
              client.write('player_info', {
                action: 'update_display_name',
                data: [{
                  uuid: '1-2-3-4',
                  displayName: null
                }]
              })
            }

            bot.once('playerUpdated', (player) => {
              assert.strictEqual(player.entity.username, player.displayName.toString())
              done()
            })
          })

          if (registry.supportFeature('playerInfoActionIsBitfield')) {
            client.write('player_info', {
              action: { add_player: true },
              data: [{
                uuid: '1-2-3-4',
                player: {
                  name: 'bot5',
                  properties: []
                },
                gamemode: 0,
                latency: 0
              }]
            })
          } else {
            client.write('player_info', {
              action: 'add_player',
              data: [{
                uuid: '1-2-3-4',
                name: 'bot5',
                properties: [],
                gamemode: 0,
                ping: 0
              }]
            })
          }

          if (bot.registry.supportFeature('unifiedPlayerAndEntitySpawnPacket')) {
            client.write('spawn_entity', {
              entityId: 56,
              objectUUID: '1-2-3-4',
              type: bot.registry.entitiesByName.player.internalId,
              x: 1,
              y: 2,
              z: 3,
              pitch: 0,
              yaw: 0,
              headPitch: 0,
              objectData: 1,
              velocity: { x: 0, y: 0, z: 0 }
            })
          } else {
            client.write('named_entity_spawn', {
              entityId: 56,
              playerUUID: '1-2-3-4',
              x: 1,
              y: 2,
              z: 3,
              yaw: 0,
              pitch: 0,
              currentItem: -1,
              metadata: []
            })
          }
        })
      })

      it('does not crash when skin texture is mojangson format', (done) => {
        // Mojangson-style texture data (not valid JSON, but valid mojangson)
        const mojangsonStr = '{textures:{SKIN:{url:"http://textures.minecraft.net/texture/abc123",metadata:{model:"slim"}}}}'
        const mojangsonBase64 = Buffer.from(mojangsonStr).toString('base64')

        server.on('playerJoin', (client) => {
          bot.on('entitySpawn', (entity) => {
            const player = bot.players[entity.username]
            assert.ok(player, 'player should exist')
            assert.ok(player.skinData, 'skinData should be parsed from mojangson')
            assert.strictEqual(player.skinData.url, 'http://textures.minecraft.net/texture/abc123')
            assert.strictEqual(player.skinData.model, 'slim')
            assert.strictEqual(player.skinData.capeUrl, undefined)
            done()
          })

          if (registry.supportFeature('playerInfoActionIsBitfield')) {
            client.write('player_info', {
              action: { add_player: true },
              data: [{
                uuid: '1-2-3-4',
                player: {
                  name: 'bot5',
                  properties: [{
                    name: 'textures',
                    value: mojangsonBase64,
                    signature: ''
                  }]
                },
                gamemode: 0,
                latency: 0
              }]
            })
          } else {
            client.write('player_info', {
              action: 'add_player',
              data: [{
                uuid: '1-2-3-4',
                name: 'bot5',
                properties: [{
                  name: 'textures',
                  value: mojangsonBase64,
                  signature: ''
                }],
                gamemode: 0,
                ping: 0
              }]
            })
          }

          if (bot.registry.supportFeature('unifiedPlayerAndEntitySpawnPacket')) {
            client.write('spawn_entity', {
              entityId: 56,
              objectUUID: '1-2-3-4',
              type: bot.registry.entitiesByName.player.internalId,
              x: 1,
              y: 2,
              z: 3,
              pitch: 0,
              yaw: 0,
              headPitch: 0,
              objectData: 1,
              velocity: { x: 0, y: 0, z: 0 },
              velocityX: 0,
              velocityY: 0,
              velocityZ: 0
            })
          } else {
            client.write('named_entity_spawn', {
              entityId: 56,
              playerUUID: '1-2-3-4',
              x: 1,
              y: 2,
              z: 3,
              yaw: 0,
              pitch: 0,
              currentItem: -1,
              metadata: []
            })
          }
        })
      })

      it('does not crash when skin texture is valid JSON', (done) => {
        const validJson = JSON.stringify({
          textures: {
            SKIN: {
              url: 'http://textures.minecraft.net/texture/def456',
              metadata: { model: 'default' }
            },
            CAPE: {
              url: 'http://textures.minecraft.net/texture/cape789'
            }
          }
        })
        const jsonBase64 = Buffer.from(validJson).toString('base64')

        server.on('playerJoin', (client) => {
          bot.on('entitySpawn', (entity) => {
            const player = bot.players[entity.username]
            assert.ok(player, 'player should exist')
            assert.ok(player.skinData, 'skinData should be parsed from JSON')
            assert.strictEqual(player.skinData.url, 'http://textures.minecraft.net/texture/def456')
            assert.strictEqual(player.skinData.model, 'default')
            assert.strictEqual(player.skinData.capeUrl, 'http://textures.minecraft.net/texture/cape789')
            done()
          })

          if (registry.supportFeature('playerInfoActionIsBitfield')) {
            client.write('player_info', {
              action: { add_player: true },
              data: [{
                uuid: '1-2-3-4',
                player: {
                  name: 'bot6',
                  properties: [{
                    name: 'textures',
                    value: jsonBase64,
                    signature: ''
                  }]
                },
                gamemode: 0,
                latency: 0
              }]
            })
          } else {
            client.write('player_info', {
              action: 'add_player',
              data: [{
                uuid: '1-2-3-4',
                name: 'bot6',
                properties: [{
                  name: 'textures',
                  value: jsonBase64,
                  signature: ''
                }],
                gamemode: 0,
                ping: 0
              }]
            })
          }

          if (bot.registry.supportFeature('unifiedPlayerAndEntitySpawnPacket')) {
            client.write('spawn_entity', {
              entityId: 57,
              objectUUID: '1-2-3-4',
              type: bot.registry.entitiesByName.player.internalId,
              x: 1,
              y: 2,
              z: 3,
              pitch: 0,
              yaw: 0,
              headPitch: 0,
              objectData: 1,
              velocity: { x: 0, y: 0, z: 0 },
              velocityX: 0,
              velocityY: 0,
              velocityZ: 0
            })
          } else {
            client.write('named_entity_spawn', {
              entityId: 57,
              playerUUID: '1-2-3-4',
              x: 1,
              y: 2,
              z: 3,
              yaw: 0,
              pitch: 0,
              currentItem: -1,
              metadata: []
            })
          }
        })
      })

      it('sets players[player].entity to null upon despawn', (done) => {
        let serverClient = null
        bot.once('entitySpawn', (entity) => {
          if (bot.version !== '1.17') {
            serverClient.write('entity_destroy', {
              entityIds: [8]
            })
          } else {
            serverClient.write('destroy_entity', {
              entityIds: 8
            })
          }
        })
        bot.once('entityGone', (entity) => {
          assert.strictEqual(bot.players[entity.username], undefined)
          done()
        })
        server.on('playerJoin', (client) => {
          serverClient = client

          if (registry.supportFeature('playerInfoActionIsBitfield')) {
            client.write('player_info', {
              action: { add_player: true },
              data: [{
                uuid: '1-2-3-4',
                player: { name: 'bot5', properties: [] },
                gamemode: 0,
                latency: 0
              }]
            })
          } else {
            client.write('player_info', {
              id: 56,
              state: 'play',
              action: 'add_player',
              length: 1,
              data: [{
                uuid: '1-2-3-4',
                name: 'bot5',
                propertiesLength: 0,
                properties: [],
                gamemode: 0,
                ping: 0,
                hasDisplayName: false
              }]
            })
          }

          if (bot.registry.supportFeature('unifiedPlayerAndEntitySpawnPacket')) {
            client.write('spawn_entity', {
              entityId: 56,
              objectUUID: '1-2-3-4',
              type: bot.registry.entitiesByName.player.internalId,
              x: 1,
              y: 2,
              z: 3,
              pitch: 0,
              yaw: 0,
              headPitch: 0,
              objectData: 1,
              velocity: { x: 0, y: 0, z: 0 }
            })
          } else {
            client.write('named_entity_spawn', {
              entityId: 56,
              playerUUID: '1-2-3-4',
              x: 1,
              y: 2,
              z: 3,
              yaw: 0,
              pitch: 0,
              currentItem: -1,
              metadata: []
            })
          }
        })
      })

      it('metadata', (done) => {
        server.on('playerJoin', (client) => {
          bot.on('entitySpawn', (entity) => {
            assert.strictEqual(entity.displayName, 'Creeper')

            const lastMeta = entity.metadata
            bot.on('entityUpdate', (entity) => {
              assert.ok('0' in entity.metadata)
              assert.strictEqual(entity.metadata[0], 1)
              assert.strictEqual(entity.metadata[1], lastMeta[1])
              done()
            })

            client.write('entity_metadata', {
              entityId: 8,
              metadata: [
                { key: 0, type: bot.registry.supportFeature('mcDataHasEntityMetadata') ? 'int' : 0, value: 1 }
              ]
            })
          })

          // Versions prior to 1.11 have capital first letter
          const entities = bot.registry.entitiesByName
          const creeperId = entities.creeper ? entities.creeper.id : entities.Creeper.id
          client.write(bot.registry.supportFeature('consolidatedEntitySpawnPacket') ? 'spawn_entity' : 'spawn_entity_living', {
            entityId: 8, // random
            entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
            objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
            type: creeperId,
            x: 10,
            y: 11,
            z: 12,
            yaw: 13,
            pitch: 14,
            headPitch: 14,
            velocity: { x: 15, y: 16, z: 17 },
            metadata: [
              { type: 0, key: bot.registry.supportFeature('mcDataHasEntityMetadata') ? 'byte' : 0, value: 0 },
              { type: 0, key: bot.registry.supportFeature('mcDataHasEntityMetadata') ? 'int' : 1, value: 1 }
            ]
          })
        })
      })

      it('\'itemDrop\' event', function (done) {
        const itemData = {
          itemId: 149,
          itemCount: 5
        }

        server.on('playerJoin', (client) => {
          bot.on('itemDrop', (entity) => {
            const slotPosition = metadataPacket.metadata[0].key

            if (bot.supportFeature('itemsAreAlsoBlocks')) {
              assert.strictEqual(entity.metadata[slotPosition].blockId, itemData.itemId)
            } else if (bot.supportFeature('itemsAreNotBlocks')) {
              assert.strictEqual(entity.metadata[slotPosition].itemId, itemData.itemId)
            }
            assert.strictEqual(entity.metadata[slotPosition].itemCount, itemData.itemCount)

            done()
          })

          let entityType
          if (['1.8', '1.9', '1.10', '1.11', '1.12'].includes(bot.majorVersion)) {
            entityType = 2
          } else {
            entityType = bot.registry.entitiesArray.find(e => e.name.toLowerCase() === 'item' || e.name.toLowerCase() === 'item_stack').id
          }
          client.write('spawn_entity', {
            entityId: 16,
            objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
            type: Number(entityType),
            x: 0,
            y: 0,
            z: 0,
            pitch: 0,
            yaw: 0,
            headPitch: 0,
            objectData: 1,
            velocity: { x: 0, y: 0, z: 0 }
          })

          const metadataPacket = {
            entityId: 16,
            metadata: [
              { key: 7, type: 6, value: { itemCount: itemData.itemCount } }
            ]
          }
          // Versions prior to 1.13 use 5 as type field value of metadata for storing a slot. 1.13 and so on, use 6
          // Also the structure of a slot changes from 1.12 to 1.13
          if (bot.supportFeature('itemsAreAlsoBlocks')) {
            metadataPacket.metadata[0].key = 6
            metadataPacket.metadata[0].type = 5
            metadataPacket.metadata[0].value.blockId = itemData.itemId
            metadataPacket.metadata[0].value.itemDamage = 0
          } else if (bot.supportFeature('itemsAreNotBlocks')) {
            if (bot.majorVersion === '1.13') metadataPacket.metadata[0].key = 6
            metadataPacket.metadata[0].value.itemId = itemData.itemId
            metadataPacket.metadata[0].value.present = true
          }

          if (bot.supportFeature('entityMetadataHasLong')) {
            metadataPacket.metadata[0].type = 7
          }

          if (bot.registry.supportFeature('mcDataHasEntityMetadata')) {
            metadataPacket.metadata[0].type = 'item_stack'
          }
          metadataPacket.metadata[0].value.addedComponentCount = 0
          metadataPacket.metadata[0].value.removedComponentCount = 0
          metadataPacket.metadata[0].value.components = []
          metadataPacket.metadata[0].value.removeComponents = []

          client.write('entity_metadata', metadataPacket)
        })
      })
    })

    it('bed', (done) => {
      const blocks = bot.registry.blocksByName
      const entities = bot.registry.entitiesByName

      const playerPos = vec3(10, 0, 0)
      const zombiePos = vec3(0, 0, 0)
      const beds = [
        { head: vec3(10, 0, 3), foot: vec3(10, 0, 2), facing: 2, throws: false },
        { head: vec3(9, 0, 4), foot: vec3(10, 0, 4), facing: 3, throws: true, error: new Error('the bed is too far') },
        { head: vec3(8, 0, 0), foot: vec3(8, 0, 1), facing: 0, throws: true, error: new Error('there are monsters nearby') },
        { head: vec3(12, 0, 0), foot: vec3(11, 0, 0), facing: 1, throws: false }
      ]

      const zombieId = entities.zombie ? entities.zombie.id : entities.Zombie.id
      let bedBlock
      if (bot.supportFeature('oneBlockForSeveralVariations', version.majorVersion)) {
        bedBlock = blocks.bed
      } else if (bot.supportFeature('blockSchemeIsFlat', version.majorVersion)) {
        bedBlock = blocks.red_bed
      }
      const bedId = bedBlock.id

      bot.once('chunkColumnLoad', (columnPoint) => {
        for (const bed in beds) {
          const bedBock = bot.blockAt(beds[bed].foot)
          const bedBockMetadata = bot.parseBedMetadata(bedBock)
          assert.strictEqual(bedBockMetadata.facing, beds[bed].facing, 'The facing property seems to be wrong')
          assert.strictEqual(bedBockMetadata.part, false, 'The part property seems to be wrong') // Is the foot

          if (beds[bed].throws) {
            bot.sleep(bedBock).catch(err => assert.strictEqual(err, beds[bed].error))
          } else {
            bot.sleep(bedBock).catch(err => assert.ifError(err))
          }
        }

        done()
      })

      server.once('playerJoin', (client) => {
        const loginPacket = bot.test.generateLoginPacket()
        client.write('login', loginPacket)
        // Set timeOfDay after login is processed so bot.time is initialized
        bot.once('login', () => { bot.time.timeOfDay = 18000 })

        const chunk = bot.test.buildChunk()

        for (const bed in beds) {
          chunk.setBlockType(beds[bed].head, bedId)
          chunk.setBlockType(beds[bed].foot, bedId)
        }

        if (bot.supportFeature('blockStateId', version.majorVersion)) {
          chunk.setBlockStateId(beds[0].foot, 3 + bedBlock.minStateId) // { facing: north, occupied: false, part: foot }
          chunk.setBlockStateId(beds[0].head, 2 + bedBlock.minStateId) // { facing:north, occupied: false, part: head }

          chunk.setBlockStateId(beds[1].foot, 15 + bedBlock.minStateId) // { facing: east, occupied:false, part:foot }
          chunk.setBlockStateId(beds[1].head, 14 + bedBlock.minStateId) // { facing: east, occupied: false, part: head }

          chunk.setBlockStateId(beds[2].foot, 7 + bedBlock.minStateId) // { facing: south, occupied: false, part: foot }
          chunk.setBlockStateId(beds[2].head, 6 + bedBlock.minStateId) // { facing: south, occupied: false, part: head }

          chunk.setBlockStateId(beds[3].foot, 11 + bedBlock.minStateId) // { facing: west, occupied: false, part: foot }
          chunk.setBlockStateId(beds[3].head, 10 + bedBlock.minStateId) // { facing: west, occupied: false, part: head }
        } else if (bot.supportFeature('blockMetadata', version.majorVersion)) {
          chunk.setBlockData(beds[0].foot, 2) // { facing: north, occupied: false, part: foot }
          chunk.setBlockData(beds[0].head, 10) // { facing:north, occupied: false, part: head }

          chunk.setBlockData(beds[1].foot, 3) // { facing: east, occupied:false, part:foot }
          chunk.setBlockData(beds[1].head, 11) // { facing: east, occupied: false, part: head }

          chunk.setBlockData(beds[2].foot, 0) // { facing: south, occupied: false, part: foot }
          chunk.setBlockData(beds[2].head, 8) // { facing: south, occupied: false, part: head }

          chunk.setBlockData(beds[3].foot, 1) // { facing: west, occupied: false, part: foot }
          chunk.setBlockData(beds[3].head, 9) // { facing: west, occupied: false, part: head }
        }

        client.write('position', {
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
          yaw: 0,
          pitch: 0,
          flags: 0,
          teleportId: 1
        })

        client.write(bot.registry.supportFeature('consolidatedEntitySpawnPacket') ? 'spawn_entity' : 'spawn_entity_living', {
          entityId: 8,
          entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
          objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
          type: zombieId,
          x: zombiePos.x,
          y: zombiePos.y,
          z: zombiePos.z,
          yaw: 0,
          pitch: 0,
          headPitch: 0,
          velocity: { x: 0, y: 0, z: 0 },
          metadata: []
        })

        client.write('map_chunk', generateChunkPacket(chunk))
      })
    })

    describe('heldItemChanged', () => {
      it('emits heldItemChanged when the held slot is updated via set_slot', (done) => {
        const Item = require('prismarine-item')(supportedVersion)
        const QUICK_BAR_SLOT = 0
        const HOTBAR_START = 36
        const stoneId = registry.itemsByName.stone.id
        const stoneItem = new Item(stoneId, 1)
        const notchItem = Item.toNotch(stoneItem)

        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())
          client.write('held_item_slot', { slot: QUICK_BAR_SLOT })

          // Wait for the held_item_slot to be processed, then listen for the
          // heldItemChanged triggered by the set_slot update to the held slot
          setTimeout(() => {
            bot.once('heldItemChanged', (newItem) => {
              assert.ok(newItem, 'heldItemChanged should provide the new item')
              assert.strictEqual(newItem.type, stoneId)
              done()
            })
            client.write('set_slot', {
              windowId: 0,
              slot: HOTBAR_START + QUICK_BAR_SLOT,
              item: notchItem
            })
          }, 100)
        })
      })

      it('emits heldItemChanged via updateSlot on the inventory', (done) => {
        const Item = require('prismarine-item')(supportedVersion)
        const QUICK_BAR_SLOT = 0
        const stoneId = registry.itemsByName.stone.id
        const stoneItem = new Item(stoneId, 1)

        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())
          client.write('held_item_slot', { slot: QUICK_BAR_SLOT })

          setTimeout(() => {
            bot.once('heldItemChanged', (newItem) => {
              assert.ok(newItem, 'heldItemChanged should provide the new item')
              assert.strictEqual(newItem.type, stoneId)
              done()
            })
            // Directly call updateSlot on the inventory to simulate
            // the set_player_inventory code path
            bot.inventory.updateSlot(
              QUICK_BAR_SLOT + bot.inventory.hotbarStart,
              stoneItem
            )
          }, 100)
        })
      })
    })

    describe('windows', () => {
      const Item = require('prismarine-item')(supportedVersion)
      const pWindows = require('prismarine-windows')(supportedVersion)
      // legacy 'minecraft:chest' has a dynamic size resolved from the packet's
      // slotCount (container slots only); the modern equivalent is fixed
      const chestData = pWindows.windows['minecraft:generic_9x3'] ?? { type: 'minecraft:chest', slots: 63 }
      const merchantData = pWindows.windows['minecraft:merchant'] ?? pWindows.windows['minecraft:villager']
      const emptyItems = (n) => Array.from({ length: n }, () => Item.toNotch(null))
      const openWindowPacket = (windowId, winData) => ({
        windowId,
        inventoryType: winData.type,
        windowTitle: chatText(''),
        slotCount: winData.slots - 36,
        entityId: 0
      })
      const windowItemsPacket = (windowId, items) => ({
        windowId,
        stateId: 1,
        items,
        carriedItem: Item.toNotch(null)
      })

      it('opens a window whose early window_items reuses the id of a closed window', (done) => {
        const emeraldId = registry.itemsByName.emerald.id

        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())

          bot.once('windowOpen', () => {
            bot.closeWindow(bot.currentWindow)
          })
          client.on('close_window', () => {
            bot.once('windowOpen', (window) => {
              assert.strictEqual(window.type, merchantData.key)
              assert.strictEqual(window.slots[0]?.type, emeraldId)
              done()
            })
            // a villager window sends its contents before open_window, and
            // reuses the chest's id when a respawn reset the server's window
            // id counter in between
            const items = emptyItems(merchantData.slots)
            items[0] = Item.toNotch(new Item(emeraldId, 3))
            client.write('window_items', windowItemsPacket(1, items))
            client.write('open_window', openWindowPacket(1, merchantData))
          })

          client.write('open_window', openWindowPacket(1, chestData))
          client.write('window_items', windowItemsPacket(1, emptyItems(chestData.slots)))
        })
      })

      it('applies the player-inventory region of a trailing sync for a closed window', (done) => {
        const stoneId = registry.itemsByName.stone.id
        // chest slot 30 is in the window's player-inventory region and maps
        // back to inventory slot 12
        const chestSlot = 30
        const invSlot = 12

        server.on('playerJoin', (client) => {
          client.write('login', bot.test.generateLoginPacket())

          bot.once('windowOpen', () => {
            bot.closeWindow(bot.currentWindow)
          })
          client.on('close_window', () => {
            bot.inventory.once(`updateSlot:${invSlot}`, (oldItem, newItem) => {
              assert.strictEqual(newItem?.type, stoneId)
              done()
            })
            const items = emptyItems(chestData.slots)
            items[chestSlot] = Item.toNotch(new Item(stoneId, 5))
            client.write('window_items', windowItemsPacket(1, items))
          })

          client.write('open_window', openWindowPacket(1, chestData))
          client.write('window_items', windowItemsPacket(1, emptyItems(chestData.slots)))
        })
      })
    })

    describe('tablist', () => {
      it('handles newlines in header and footer', (done) => {
        const HEADER = 'asd\ndsa'
        const FOOTER = '\nas\nas\nas\n'
        bot._client.on('playerlist_header', (packet) => {
          setImmediate(() => {
            assert.strictEqual(bot.tablist.header.toString(), HEADER)
            assert.strictEqual(bot.tablist.footer.toString(), FOOTER)
            done()
          })
        })
        // TODO: figure out how the "extra" should be encoded in NBT so this branch can be removed
        if (registry.supportFeature('chatPacketsUseNbtComponents')) {
          server.on('playerJoin', (client) => {
            client.write('playerlist_header', {
              header: chatText(HEADER),
              footer: chatText(FOOTER)
            })
          })
        } else {
          server.on('playerJoin', (client) => {
            client.write('playerlist_header', {
              header: JSON.stringify({ text: '', extra: [{ text: HEADER, color: 'yellow' }] }),
              footer: JSON.stringify({ text: '', extra: [{ text: FOOTER, color: 'yellow' }] })
            })
          })
        }
      })
    })

    describe('activateItem rotation', () => {
      it('should send the bot rotation in the use_item packet', function (done) {
        // The rotation field in use_item was added in 1.21.1
        const useItemFields = registry.protocol?.play?.toServer?.types?.packet_use_item?.[1]
        const hasRotation = useItemFields && useItemFields.some(f => f.name === 'rotation')
        if (!hasRotation) {
          this.skip()
          return
        }
        const { toNotchianYaw, toNotchianPitch } = require('../lib/conversions')
        const testYaw = 1.5
        const testPitch = -0.3
        server.on('playerJoin', async (client) => {
          await client.write('login', bot.test.generateLoginPacket())
          await client.write('position', {
            x: 0,
            y: 66,
            z: 0,
            dx: 0,
            dy: 0,
            dz: 0,
            yaw: 0,
            pitch: 0,
            flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
            teleportId: 0
          })

          client.on('packet', (data, meta) => {
            if (meta.name === 'use_item') {
              const expectedYaw = toNotchianYaw(testYaw)
              const expectedPitch = toNotchianPitch(testPitch)
              assert.ok(data.rotation, 'use_item packet should have rotation field')
              assert.ok(Math.abs(data.rotation.x - expectedYaw) < 0.001,
                `Expected yaw ${expectedYaw}, got ${data.rotation.x}`)
              assert.ok(Math.abs(data.rotation.y - expectedPitch) < 0.001,
                `Expected pitch ${expectedPitch}, got ${data.rotation.y}`)
              done()
            }
          })

          await sleep(100)
          bot.entity.yaw = testYaw
          bot.entity.pitch = testPitch
          bot.activateItem()
        })
      })
    })

    describe('onceWithCleanup', () => {
      it('rejects instead of throwing out of emit when checkCondition throws', async () => {
        // A condition that throws used to unwind whatever was emitting. For a
        // client event that is the socket read path, which then stops delivering
        // packets entirely and the bot dies on the next keepalive.
        const emitter = new EventEmitter()
        const boom = new Error('condition blew up')
        const promise = onceWithCleanup(emitter, 'thing', {
          checkCondition: () => { throw boom }
        })
        assert.doesNotThrow(() => emitter.emit('thing'))
        await assert.rejects(promise, err => err === boom)
        assert.strictEqual(emitter.listenerCount('thing'), 0)
      })

      it('rejects and removes the listener when the signal is aborted', async () => {
        const emitter = new EventEmitter()
        const abort = new AbortController()
        const reason = new Error('no longer interested')
        const promise = onceWithCleanup(emitter, 'thing', { signal: abort.signal })
        abort.abort(reason)
        await assert.rejects(promise, err => err === reason)
        assert.strictEqual(emitter.listenerCount('thing'), 0)
      })
    })
  })
}
