/* eslint-env mocha */

const mineflayer = require('../')
const vec3 = require('vec3')
const mc = require('minecraft-protocol')
const assert = require('assert')
const { sleep } = require('../lib/promise_utils')
const nbt = require('prismarine-nbt')

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
    beforeEach((done) => {
      server = mc.createServer({
        'online-mode': false,
        version: supportedVersion,
        // 25565 - local server, 25566 - proxy server
        port: 25567
      })
      server.on('listening', () => {
        bot = mineflayer.createBot({
          username: 'player',
          version: supportedVersion,
          port: 25567
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
        done()
      })
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

          if (registry.supportFeature('useChatSessions')) {
            client.write('player_chat', {
              plainMessage: 'hello',
              filterType: 0,
              type: 0,
              networkName,
              previousMessages: [],
              senderUuid: uuid,
              timestamp: Date.now(),
              index: 0,
              salt: 0n
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
              salt: 0n,
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
              salt: 0n,
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
          velocityX: 16,
          velocityY: 17,
          velocityZ: 18,
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

    describe('physics', () => {
      const pos = vec3(1, 65, 1)
      const pos2 = vec3(2, 65, 1)
      const goldId = 41
      it('no physics if there is no chunk', (done) => {
        let fail = 0
        const basePosition = {
          x: 1.5,
          y: 66,
          z: 1.5,
          pitch: 0,
          yaw: 0,
          flags: 0,
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
          const chunk = await bot.test.buildChunk()

          await chunk.setBlockType(pos, goldId)
          await chunk.setBlockType(pos2, goldId)
          await client.write('map_chunk', generateChunkPacket(chunk))
          let check = true
          let absolute = true
          const basePosition = {
            x: 1.5,
            y: 66,
            z: 1.5,
            pitch: 0,
            yaw: 0,
            flags: 0,
            teleportId: 0
          }
          client.on('packet', (data, meta) => {
            const packetName = meta.name
            switch (packetName) {
              case 'teleport_confirm': {
                assert.ok(basePosition.teleportId === data.teleportId)
                break
              }
              case 'position_look': {
                if (!check) return
                if (absolute) {
                  assert.ok(bot.entity.velocity.y === 0)
                } else {
                  assert.ok(bot.entity.velocity.y !== 0)
                }
                assert.ok(basePosition.x === data.x)
                assert.ok(basePosition.y === data.y)
                assert.ok(basePosition.z === data.z)
                assert.ok(basePosition.yaw === data.yaw)
                assert.ok(basePosition.pitch === data.pitch)
                check = false
                break
              }
              default:
                break
            }
          })
          // Absolute Position Tests
          // absolute position test
          check = true
          await client.write('position', basePosition)
          await bot.waitForTicks(5)
          // absolute position test 2
          basePosition.x = 2.5
          basePosition.teleportId = 1
          await bot.waitForTicks(1)
          check = true
          await client.write('position', basePosition)
          await bot.waitForTicks(2)
          // absolute position test 3
          basePosition.x = 1.5
          basePosition.teleportId = 2
          await bot.waitForTicks(1)
          check = true
          await client.write('position', basePosition)
          await bot.waitForTicks(2)

          // Relative Position Tests
          const relativePosition = {
            x: 1,
            y: 0,
            z: 0,
            pitch: 0,
            yaw: 0,
            flags: 31,
            teleportId: 3
          }
          absolute = false
          // relative position test 1
          basePosition.x = 2.5
          basePosition.teleportId = 3
          relativePosition.x = 1
          relativePosition.teleportId = 3
          await bot.waitForTicks(1)
          check = true
          await client.write('position', relativePosition)
          await bot.waitForTicks(2)
          // relative position test 2
          basePosition.x = 1.5
          basePosition.teleportId = 4
          relativePosition.x = -1
          relativePosition.teleportId = 4
          await bot.waitForTicks(1)
          check = true
          await client.write('position', relativePosition)
          await bot.waitForTicks(2)
          // relative position test 3
          basePosition.x = 2.5
          basePosition.teleportId = 5
          relativePosition.x = 1
          relativePosition.teleportId = 5
          await bot.waitForTicks(1)
          check = true
          await client.write('position', relativePosition)
          await bot.waitForTicks(2)
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
            flags: 0,
            teleportId: 0
          })
        })
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
            respawnPacket.worldName = 'minecraft:nether'
            if (bot.supportFeature('usesLoginPacket')) {
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
                action: 53,
                data: [{
                  uuid: '1-2-3-4',
                  player: {
                    name: 'bot5',
                    properties: []
                  },
                  gamemode: 0,
                  latency: 0,
                  displayName: chatText('wvffle')
                }]
              })
            } else {
              client.write('player_info', {
                id: 56,
                state: 'play',
                action: 3,
                length: 1,
                data: [{
                  UUID: '1-2-3-4',
                  name: 'bot5',
                  propertiesLength: 0,
                  properties: [],
                  gamemode: 0,
                  ping: 0,
                  hasDisplayName: true,
                  displayName: chatText('wvffle')
                }]
              })
            }
          })

          bot.once('playerUpdated', (player) => {
            assert.strictEqual('wvffle', player.displayName.toString())
            if (registry.supportFeature('playerInfoActionIsBitfield')) {
              client.write('player_info', {
                action: 53,
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
                id: 56,
                state: 'play',
                action: 3,
                length: 1,
                data: [{
                  UUID: '1-2-3-4',
                  name: 'bot5',
                  propertiesLength: 0,
                  properties: [],
                  gamemode: 0,
                  ping: 0,
                  hasDisplayName: false
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
              action: 53,
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
              id: 56,
              state: 'play',
              action: 0,
              length: 1,
              data: [{
                UUID: '1-2-3-4',
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
              action: 53,
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
              id: 56,
              state: 'play',
              action: 0,
              length: 1,
              data: [{
                UUID: '1-2-3-4',
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
            velocityX: 16,
            velocityY: 17,
            velocityZ: 18,
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
            velocityX: 0,
            velocityY: 0,
            velocityZ: 0
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
      if (mineflayer.supportFeature('oneBlockForSeveralVariations', version.majorVersion)) {
        bedBlock = blocks.bed
      } else if (mineflayer.supportFeature('blockSchemeIsFlat', version.majorVersion)) {
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
        bot.time.timeOfDay = 18000
        const loginPacket = bot.test.generateLoginPacket()
        client.write('login', loginPacket)

        const chunk = bot.test.buildChunk()

        for (const bed in beds) {
          chunk.setBlockType(beds[bed].head, bedId)
          chunk.setBlockType(beds[bed].foot, bedId)
        }

        if (mineflayer.supportFeature('blockStateId', version.majorVersion)) {
          chunk.setBlockStateId(beds[0].foot, 3 + bedBlock.minStateId) // { facing: north, occupied: false, part: foot }
          chunk.setBlockStateId(beds[0].head, 2 + bedBlock.minStateId) // { facing:north, occupied: false, part: head }

          chunk.setBlockStateId(beds[1].foot, 15 + bedBlock.minStateId) // { facing: east, occupied:false, part:foot }
          chunk.setBlockStateId(beds[1].head, 14 + bedBlock.minStateId) // { facing: east, occupied: false, part: head }

          chunk.setBlockStateId(beds[2].foot, 7 + bedBlock.minStateId) // { facing: south, occupied: false, part: foot }
          chunk.setBlockStateId(beds[2].head, 6 + bedBlock.minStateId) // { facing: south, occupied: false, part: head }

          chunk.setBlockStateId(beds[3].foot, 11 + bedBlock.minStateId) // { facing: west, occupied: false, part: foot }
          chunk.setBlockStateId(beds[3].head, 10 + bedBlock.minStateId) // { facing: west, occupied: false, part: head }
        } else if (mineflayer.supportFeature('blockMetadata', version.majorVersion)) {
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
          velocityX: 0,
          velocityY: 0,
          velocityZ: 0,
          metadata: []
        })

        client.write('map_chunk', generateChunkPacket(chunk))
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
  })
}
