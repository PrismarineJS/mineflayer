module.exports = inject

function inject (bot) {
  bot._client.on('title', (packet) => {
    if (packet.action === 0 || packet.action === 1) {
      bot.emit('title', packet.text)
    }
  })
  bot._client.on('set_title_text', packet => {
    bot.emit('title', ChatMsg.fromNotch(packet.text))
    bot.emit('titles', "title", ChatMsg.fromNotch(packet.text))
  })
  bot._client.on('set_title_subtitle', packet => {
    bot.emit('titles', "subtitle", ChatMsg.fromNotch(packet.text))
  })
}
