module.exports = inject

function inject (bot) {
  bot._client.on('entity_metadata', (packet) => {
    if (!bot?.entity?.id === packet?.entityId) return
    if (packet?.metadata[1]?.key === 1) {
      if (!packet?.metadata[1]?.value) return
      bot.oxygenLevel = Math.round(packet.metadata[1].value / 15)
      bot.emit('breath')
    }
    if (packet?.metadata[0]?.key === 1) {
      if (!packet?.metadata[0]?.value) return
      bot.oxygenLevel = Math.round(packet.metadata[0].value / 15)
      bot.emit('breath')
    }
  })
}
