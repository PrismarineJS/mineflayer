const ChatMessage = require('prismarine-chat')
module.exports = inject
function inject (bot, { version }) {
  const ChatMsg = ChatMessage(version)
  bot._client.on('title', (packet) => {
    if (packet.action === 0 || packet.action === 1) {
      bot.emit('title', packet.text, "title")
    }
  })
  bot._client.on('set_title_text', packet => {
    bot.emit('title', ChatMsg.fromNotch(packet.text), "title")
  })
  bot._client.on('set_title_subtitle', packet => {
    bot.emit('title', ChatMsg.fromNotch(packet.text), "subtitle")
  })
}
