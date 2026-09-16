const assert = require('assert')

module.exports = function (bot, server, done) {
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
