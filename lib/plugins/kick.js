module.exports = inject

function inject (bot) {
  const ChatMessage = require('prismarine-chat')(bot.registry)

  // packet.reason is the raw kick_disconnect/disconnect field: a JSON string on older
  // protocol versions, a decoded chat-component object on newer ones (never plain text).
  // Render it the same way chat.js renders incoming messages so `kicked`'s reason actually
  // matches its documented `string` type instead of stringifying to "[object Object]".
  function formatKickReason (reason) {
    let component = reason
    if (typeof component === 'string') {
      try {
        component = JSON.parse(component)
      } catch (e) {
        return component
      }
    }
    try {
      return new ChatMessage(component).toString()
    } catch (e) {
      return JSON.stringify(component)
    }
  }

  bot._client.on('kick_disconnect', (packet) => {
    bot.emit('kicked', formatKickReason(packet.reason), true)
  })
  bot._client.on('disconnect', (packet) => {
    bot.emit('kicked', formatKickReason(packet.reason), false)
  })
  bot.quit = (reason) => {
    reason = reason ?? 'disconnect.quitting'
    bot.end(reason)
  }
}
