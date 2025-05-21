module.exports = inject
function inject (bot) {
  function parseTitle (text) {
    try {
      const parsed = JSON.parse(text)
      return typeof parsed === 'string' ? parsed : (parsed.text || text)
    } catch {
      return typeof text === 'string' ? text.replace(/^"|"$/g, '') : text
    }
  }

  if (bot.supportFeature('titleUsesLegacyPackets')) {
    bot._client.on('title', (packet) => {
      if (packet.action === 0) bot.emit('title', parseTitle(packet.text), 'title')
      else if (packet.action === 1) bot.emit('title', parseTitle(packet.text), 'subtitle')
      else if (packet.action === 2) bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
      else if (packet.action === 3) {
        if (packet.fadeIn !== undefined) bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
        else bot.emit('title_clear')
      } else if (packet.action === 4) bot.emit('title_clear')
    })
  } else if (bot.supportFeature('titleUsesNewPackets')) {
    function getText (packet) {
      let text = packet.text
      if (typeof text === 'object' && text.value !== undefined) text = text.value
      return parseTitle(text)
    }
    bot._client.on('set_title_text', (packet) => bot.emit('title', getText(packet), 'title'))
    bot._client.on('set_title_subtitle', (packet) => bot.emit('title', getText(packet), 'subtitle'))
    bot._client.on('set_title_time', (packet) => {
      if (typeof packet.fadeIn === 'number' && typeof packet.stay === 'number' && typeof packet.fadeOut === 'number') {
        bot.emit('title_times', packet.fadeIn, packet.stay, packet.fadeOut)
      }
    })
    bot._client.on('clear_titles', () => bot.emit('title_clear'))
  }
}
