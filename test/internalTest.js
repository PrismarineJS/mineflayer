/* eslint-env mocha */

const mineflayer = require('../')
const vec3 = require('vec3')
const mc = require('minecraft-protocol')
const assert = require('assert')

const { firstVersion, lastVersion } = require('./common/parallel')
mineflayer.testedVersions.forEach((supportedVersion, i) => {
  if (!(i >= firstVersion && i <= lastVersion)) {
    return
  }
  const mcData = require('minecraft-data')(supportedVersion)
  const version = mcData.version
  const Chunk = require('prismarine-chunk')(supportedVersion)

  describe(`mineflayer_internal ${version.minecraftVersion}`, function () {
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
        done()
      })
    })
    afterEach((done) => {
      bot.on('end', done)
      server.close()
    })
    it('chat', (done) => {
      bot.once('chat', (username, message) => {
        assert.strictEqual(username, 'gary')
        assert.strictEqual(message, 'hello')
        bot.chat('hi')
      })
      server.on('login', (client) => {
        const message = JSON.stringify({
          translate: 'chat.type.text',
          with: [{
            text: 'gary'
          },
          'hello'
          ]
        })
        client.write('chat', { message, position: 0 })
        client.on('chat', (packet) => {
          assert.strictEqual(packet.message, 'hi')
          done()
        })
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
      const entities = mcData.entitiesByName
      const creeperId = entities.creeper ? entities.creeper.id : entities.Creeper.id
      server.on('login', (client) => {
        client.write('spawn_entity_living', {
          entityId: 8, // random
          entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
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
      const goldId = 41
      bot.on('chunkColumnLoad', (columnPoint) => {
        assert.strictEqual(columnPoint.x, 0)
        assert.strictEqual(columnPoint.z, 0)
        assert.strictEqual(bot.blockAt(pos).type, goldId)
        done()
      })
      server.on('login', (client) => {
        client.write('login', {
          entityId: 0,
          levelType: 'fogetaboutit',
          hashedSeed: [0, 0],
          gameMode: 0,
          dimension: 0,
          difficulty: 0,
          maxPlayers: 20,
          reducedDebugInfo: true,
          enableRespawnScreen: true
        })
        const chunk = new Chunk()

        chunk.setBlockType(pos, goldId)
        client.write('map_chunk', {
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
          blockEntities: []
        })
      })
    })
    describe('physics', () => {
      const pos = vec3(1, 65, 1)
      const goldId = 41
      it('gravity + land on solid block + jump', (done) => {
        let y = 80
        const terminal = 10
        let hitTerminal = false
        bot.on('move', () => {
          assert.ok(bot.entity.position.y <= y)
          assert.ok(bot.entity.position.y >= pos.y)
          y = bot.entity.position.y
          if (bot.entity.velocity.y > -terminal) hitTerminal = true
          if (bot.entity.velocity.y === 0) {
            assert.ok(hitTerminal)
            assert.ok(bot.entity.onGround)
            assert.ok(bot.entity.position.y, pos.y)
            done()
          } else {
            assert.strictEqual(bot.entity.onGround, false)
          }
        })
        server.on('login', (client) => {
          client.write('login', {
            entityId: 0,
            levelType: 'fogetaboutit',
            hashedSeed: [0, 0],
            gameMode: 0,
            dimension: 0,
            difficulty: 0,
            maxPlayers: 20,
            reducedDebugInfo: true,
            enableRespawnScreen: true
          })
          const chunk = new Chunk()

          chunk.setBlockType(pos, goldId)
          client.write('map_chunk', {
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
            blockEntities: []
          })
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
    describe('entities', () => {
      it('player displayName', (done) => {
        server.on('login', (client) => {
          bot.on('entitySpawn', (entity) => {
            const player = bot.players[entity.username]
            assert.strictEqual(entity.username, player.displayName.toString())
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
                displayName: '{"text":"wvffle"}'
              }]
            })
          })

          bot.once('playerUpdated', (player) => {
            assert.strictEqual('wvffle', player.displayName.toString())
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

            bot.once('playerUpdated', (player) => {
              assert.strictEqual(player.entity.username, player.displayName.toString())
              done()
            })
          })

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
        })
      })
      it('sets players[player].entity to null upon despawn', (done) => {
        let serverClient = null
        bot.once('entitySpawn', (entity) => {
          serverClient.write('entity_destroy', {
            entityIds: [8]
          })
        })
        bot.once('entityGone', (entity) => {
          assert.strictEqual(bot.players[entity.username], undefined)
          done()
        })
        server.on('login', (client) => {
          serverClient = client

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
        })
      })

      it('metadata', (done) => {
        server.on('login', (client) => {
          bot.on('entitySpawn', (entity) => {
            assert.strictEqual(entity.mobType, 'Creeper')

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
                { type: 0, key: 0, value: 1 }
              ]
            })
          })

          // Versions prior to 1.11 have capital first letter
          const entities = mcData.entitiesByName
          const creeperId = entities.creeper ? entities.creeper.id : entities.Creeper.id
          client.write('spawn_entity_living', {
            entityId: 8, // random
            entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
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
              { type: 0, key: 0, value: 0 },
              { type: 0, key: 1, value: 1 }
            ]
          })
        })
      })
    })

    it('bed', (done) => {
      const blocks = mcData.blocksByName
      const entities = mcData.entitiesByName

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
            assert.throws(() => {
              bot.sleep(bedBock)
            }, beds[bed].error)
          } else {
            assert.doesNotThrow(() => {
              bot.sleep(bedBock)
            })
          }
        }

        done()
      })

      server.once('login', (client) => {
        bot.time.day = 18000
        client.write('login', {
          entityId: 0,
          hashedSeed: [0, 0],
          levelType: 'forgetaboutit',
          gameMode: 0,
          dimension: 0,
          difficulty: 0,
          maxPlayers: 20,
          reducedDebugInfo: true,
          enableRespawnScreen: true
        })

        const chunk = new Chunk()

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

        client.write('spawn_entity_living', {
          entityId: 8,
          entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
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

        client.write('map_chunk', {
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
          blockEntities: []
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

        server.on('login', (client) => {
          client.write('playerlist_header', {
            header: JSON.stringify({ text: '', extra: [{ text: HEADER, color: 'yellow' }] }),
            footer: JSON.stringify({ text: '', extra: [{ text: FOOTER, color: 'yellow' }] })
          })
        })
      })
    })
  })
})
