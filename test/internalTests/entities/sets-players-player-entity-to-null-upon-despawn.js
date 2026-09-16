const assert = require('assert')

module.exports = (bot, server, done) => {
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
}
