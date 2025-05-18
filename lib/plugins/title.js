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
      } else if (packet.action === 2) { // Times
        bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
      } else if (packet.action === 3) { // Times or Clear
        if (packet.fadeIn !== undefined) { // Times
          bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
        } else { // Clear
          bot.emit('title_clear')
        }
      } else if (packet.action === 4) { // Clear
        bot.emit('title_clear')
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
    bot._client.on('set_title_time', (packet) => {
      if (typeof packet.fadeIn === 'number' && typeof packet.stay === 'number' && typeof packet.fadeOut === 'number') {
        bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
      }
    })
    bot._client.on('clear_titles', () => {
      bot.emit('title_clear')
    })
  }

}
