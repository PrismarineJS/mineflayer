const assert = require('assert')

module.exports = function (bot, server, done) {
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
}
