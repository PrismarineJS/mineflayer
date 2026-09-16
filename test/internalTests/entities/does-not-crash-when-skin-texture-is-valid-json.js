const assert = require('assert')

module.exports = (bot, server, done) => {
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
}
