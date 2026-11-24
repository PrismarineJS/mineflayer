module.exports = inject

function inject (bot) {
  // A new player starts with full air. Since 1.19.3 the server only sends entity data that differs
  // from the default, so it says nothing about full air on login or after a respawn into a new body.
  function resetOxygenLevel () {
    if (bot.oxygenLevel === 20) return
    bot.oxygenLevel = 20
    bot.emit('breath')
  }

  bot._client.on('login', resetOxygenLevel)

  bot._client.on('respawn', (packet) => {
    // copyMetadata is a bool up to 1.20.4 and a bit field from 1.20.5 (0x02 keeps the entity data)
    const keepsEntityData = typeof packet.copyMetadata === 'number'
      ? (packet.copyMetadata & 0x02) !== 0
      : Boolean(packet.copyMetadata)
    if (!keepsEntityData) resetOxygenLevel()
  })

  if (bot.supportFeature('mcDataHasEntityMetadata')) {
    // this is handled inside entities.js. We don't yet have entity metadataKeys for all versions but once we do
    // we can delete the numerical checks here and in entities.js https://github.com/extremeheat/mineflayer/blob/eb9982aa04973b0086aac68a2847005d77f01a3d/lib/plugins/entities.js#L469
    return
  }
  bot._client.on('entity_metadata', (packet) => {
    if (!bot.entity) return
    if (bot.entity.id !== packet.entityId) return
    for (const metadata of packet.metadata) {
      if (metadata.key === 1) {
        bot.oxygenLevel = Math.round(metadata.value / 15)
        bot.emit('breath')
      }
    }
  })
}
