module.exports = inject
function inject (bot) {
  if (bot.supportFeature('titleUsesLegacyPackets')) {
    bot._client.on('title', (packet) => {
      if (packet.action === 0) { // Title
        let text = packet.text
        try {
          const parsed = JSON.parse(text)
          text = typeof parsed === 'string' ? parsed : (parsed.text || text)
        } catch (e) {
          text = text.replace(/^"|"$/g, '')
        }
        bot.emit('title', text, 'title')
      } else if (packet.action === 1) { // Subtitle
        let text = packet.text
        try {
          const parsed = JSON.parse(text)
          text = typeof parsed === 'string' ? parsed : (parsed.text || text)
        } catch (e) {
          text = text.replace(/^"|"$/g, '')
        }
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
      let text = packet.text
      if (typeof text === 'object' && text.value !== undefined) text = text.value
      if (typeof text === 'string') {
        try {
          const parsed = JSON.parse(text)
          text = typeof parsed === 'string' ? parsed : (parsed.text || text)
        } catch (e) {
          text = text.replace(/^"|"$/g, '')
        }
      }
      bot.emit('title', text, 'title')
    })
    bot._client.on('set_title_subtitle', (packet) => {
      let text = packet.text
      if (typeof text === 'object' && text.value !== undefined) text = text.value
      if (typeof text === 'string') {
        try {
          const parsed = JSON.parse(text)
          text = typeof parsed === 'string' ? parsed : (parsed.text || text)
        } catch (e) {
          text = text.replace(/^"|"$/g, '')
        }
      }
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
