module.exports = inject
function inject (bot) {
  if (bot.supportFeature('titleUsesLegacyPackets')) {
    bot._client.on('title', (packet) => {
      if (packet.action === 0) { // Title
        const text = packet.text.replace(/^"|"$/g, '') // Remove surrounding quotes
        bot.emit('title', text, 'title')
      } else if (packet.action === 1) { // Subtitle
        const text = packet.text.replace(/^"|"$/g, '') // Remove surrounding quotes
        bot.emit('title', text, 'subtitle')
      }
    })
  } else if (bot.supportFeature('titleUsesNewPackets')) {
    bot._client.on('set_title_text', (packet) => {
      const text = typeof packet.text === 'object' && packet.text.value !== undefined ? packet.text.value : packet.text
      bot.emit('title', text, 'title')
    })
    bot._client.on('set_title_subtitle', (packet) => {
      const text = typeof packet.text === 'object' && packet.text.value !== undefined ? packet.text.value : packet.text
      bot.emit('title', text, 'subtitle')
    })
  }

  // Handle title times and clear titles - no need to emit events for these
  bot._client.on('packet_set_title_time', () => {})
  bot._client.on('packet_clear_titles', () => {})
}
