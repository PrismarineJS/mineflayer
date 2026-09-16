const assert = require('assert')

module.exports = (bot, server, done) => {
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
}
