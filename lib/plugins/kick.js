module.exports = inject

function inject (bot) {
  const ChatMessage = require('prismarine-chat')(bot.registry)

  // packet.reason is the raw kick_disconnect/disconnect field: a JSON string on older
  // protocol versions, a decoded chat-component object on newer ones (never plain text).
  // fromNotch handles both shapes and mirrors how chat.js turns incoming messages into a
  // ChatMessage, so `kicked`'s reason is a stable object instead of stringifying to
  // "[object Object]". Consumers that want plain text get it for free via toString().
  bot._client.on('kick_disconnect', (packet) => {
    bot.emit('kicked', ChatMessage.fromNotch(packet.reason), true)
  })
  bot._client.on('disconnect', (packet) => {
    bot.emit('kicked', ChatMessage.fromNotch(packet.reason), false)
  })
  bot.quit = (reason) => {
    reason = reason ?? 'disconnect.quitting'
    bot.end(reason)
  }
}
