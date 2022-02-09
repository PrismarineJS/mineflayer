module.exports = inject

function inject (bot) {
  const ChatMessage = require('prismarine-chat')(bot.version)

  bot._client.on('title', (packet) => {
    if (packet.action === 0 || packet.action === 1) {
      bot.emit('title', packet.text)
    }
  })

  bot._client.on('action_bar', (data) => {
    const msg = ChatMessage.fromNotch(data.text)
    bot.emit('actionBar', msg)
  })

  bot._client.on('set_title_text', (data) => {
    const msg = ChatMessage.fromNotch(data.text)
    bot.emit('title', msg.toString(), msg)
  })

  bot._client.on('set_title_subtitle', (data) => {
    const msg = ChatMessage.fromNotch(data.text)
    bot.emit('subtitle', msg)
  })

  bot._client.on('set_title_time', (data) => {
    bot.emit('titleTimes', data.fadeIn, data.stay, data.fadeOut)
  })

  bot._client.on('clear_titles', (data) => {
    if (data.reset) {
      bot.emit('titleReset')
    } else {
      bot.emit('titleClear')
    }
  })
}
