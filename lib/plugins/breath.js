module.exports = inject

function inject (bot) {
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
