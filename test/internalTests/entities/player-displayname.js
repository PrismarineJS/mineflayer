const assert = require('assert')

module.exports = (bot, server, done) => {
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
}
