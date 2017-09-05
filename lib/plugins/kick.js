module.exports = inject

function inject (bot) {
  bot._client.on('kick_disconnect', (packet) => {
    bot.emit('kicked', packet.reason, true)
  })
  bot._client.on('disconnect', (packet) => {
    bot.emit('kicked', packet.reason, false)
  })
  bot.quit = (reason) => {
    reason = reason || 'disconnect.quitting'
    bot._client.end(reason)
  }
}
