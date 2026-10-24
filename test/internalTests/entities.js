const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../lib/promise_utils')

module.exports = {
  'entity effects': (bot, server, done) => {
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
  },

  'entity id changes on login': (bot, server, done) => {
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
  },

  'player displayName': (bot, server, done) => {
    server.on('playerJoin', (client) => {
      bot.on('entitySpawn', (entity) => {
        const player = bot.players[entity.username]
        assert.strictEqual(entity.username, player.displayName.toString())
        if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
          client.write('player_info', {
            action: { update_display_name: true },
            data: [{
              uuid: '1-2-3-4',
              displayName: bot.test.chatText('wvffle')
            }]
          })
        } else {
          client.write('player_info', {
            action: 'update_display_name',
            data: [{
              uuid: '1-2-3-4',
              displayName: bot.test.chatText('wvffle')
            }]
          })
        }
      })

      bot.once('playerUpdated', (player) => {
        assert.strictEqual('wvffle', player.displayName.toString())
        if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
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

      if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
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
  },

  'does not crash when skin texture is mojangson format': (bot, server, done) => {
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

      if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
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
  },

  'does not crash when skin texture is valid JSON': (bot, server, done) => {
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

      if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
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
  },

  'sets players[player].entity to null upon despawn': (bot, server, done) => {
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

      if (bot.registry.supportFeature('playerInfoActionIsBitfield')) {
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
  },

  metadata: (bot, server, done) => {
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
  },

  'only updates oxygen level from bot metadata': function (bot, server, done) {
    if (!bot.registry.supportFeature('mcDataHasEntityMetadata')) this.skip()

    server.on('playerJoin', (client) => {
      client.write('login', bot.test.generateLoginPacket())
      bot.once('login', () => {
        bot.oxygenLevel = 20
        let breathEvents = 0
        bot.on('breath', () => { breathEvents++ })

        bot.once('entitySpawn', (entity) => {
          const airSupplyKey = bot.registry.entitiesByName[entity.name].metadataKeys.indexOf('air_supply')
          bot._client.once('entity_metadata', () => {
            try {
              assert.strictEqual(bot.oxygenLevel, 20)
              assert.strictEqual(breathEvents, 0)

              bot.once('breath', () => {
                try {
                  assert.strictEqual(bot.oxygenLevel, 10)
                  assert.strictEqual(breathEvents, 1)
                  done()
                } catch (err) {
                  done(err)
                }
              })
              client.write('entity_metadata', {
                entityId: bot.entity.id,
                metadata: [{ key: airSupplyKey, type: 'int', value: 150 }]
              })
            } catch (err) {
              done(err)
            }
          })
          client.write('entity_metadata', {
            entityId: entity.id,
            metadata: [{ key: airSupplyKey, type: 'int', value: 15 }]
          })
        })

        const cowId = bot.registry.entitiesByName.cow.id
        client.write(bot.registry.supportFeature('consolidatedEntitySpawnPacket') ? 'spawn_entity' : 'spawn_entity_living', {
          entityId: 8,
          entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
          objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
          type: cowId,
          x: 10,
          y: 11,
          z: 12,
          yaw: 13,
          pitch: 14,
          headPitch: 14,
          velocity: { x: 0, y: 0, z: 0 }
        })
      })
    })
  },

  'applies the 1.21.2+ entity_teleport relative flags': async function (bot, server) {
    if (!bot.supportFeature('entityTeleportHasRelativeFlags')) {
      this.skip()
      return
    }
    const client = (await once(server, 'playerJoin'))[0]
    const spawned = once(bot, 'entitySpawn')
    client.write('spawn_entity', {
      entityId: 8,
      objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
      type: bot.registry.entitiesByName.creeper.id,
      x: 10,
      y: 11,
      z: 12,
      yaw: 0,
      pitch: 0,
      headPitch: 0,
      velocity: { x: 0, y: 0, z: 0 },
      objectData: 0
    })
    const entity = (await spawned)[0]
    const teleport = async (extra) => {
      const moved = once(bot, 'entityMoved')
      client.write('entity_teleport', { entityId: 8, x: 10, y: 11, z: 12, dx: 0, dy: 0, dz: 0, yaw: 0, pitch: 0, flags: {}, onGround: false, ...extra })
      await moved
    }
    entity.velocity.set(0.25, 0.5, 0)
    await teleport({ x: 1, y: 2, z: 3, dx: 0.5, dz: 0.125, yaw: 90, pitch: 10 })
    assert.deepStrictEqual(entity.position, vec3(1, 2, 3), 'absolute position')
    assert.deepStrictEqual(entity.velocity, vec3(0.5, 0, 0.125), 'absolute velocity from the packet')
    assert.ok(Math.abs(entity.yaw - Math.PI / 2) < 1e-6 && Math.abs(entity.pitch + 10 * Math.PI / 180) < 1e-6, 'float rotation')
    await teleport({ x: 1, y: -1, dx: 0.5, dy: 0.5, yaw: 90, flags: { x: true, y: true, dx: true, dy: true, yaw: true } })
    assert.deepStrictEqual(entity.position, vec3(2, 1, 12), 'flagged axes add to the current position')
    assert.deepStrictEqual(entity.velocity, vec3(1, 0.5, 0), 'flagged axes add to the current velocity, the rest are absolute')
    assert.ok(Math.abs(entity.yaw) < 1e-6, 'flagged yaw adds to the current yaw')
    await teleport({ yaw: 0 })
    entity.velocity.set(1, 0, 0)
    await teleport({ yaw: 90, flags: { yawDelta: true, dx: true, dz: true } })
    assert.ok(Math.abs(entity.velocity.x) < 1e-6 && Math.abs(entity.velocity.z - 1) < 1e-6, `yawDelta turns the velocity with the rotation change: ${entity.velocity}`)
  },

  '\'itemDrop\' event': function (bot, server, done) {
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
  }
}
