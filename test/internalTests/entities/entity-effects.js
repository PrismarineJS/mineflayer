const assert = require('assert')

module.exports = (bot, server, done) => {
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
}
