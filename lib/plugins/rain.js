module.exports = inject

function inject (bot) {
  bot.isRaining = false
  bot.thunderState = 0
  bot.rainState = 0
  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === 1) {
      bot.isRaining = true
      bot.emit('rain')
    } else if (packet.reason === 2) {
      bot.isRaining = false
      bot.emit('rain')
    } else if (packet.reason === 7) {
      bot.rainState = packet.gameMode
      bot.emit('weatherUpdate')
    } else if (packet.reason === 8) {
      bot.thunderState = packet.gameMode
      bot.emit('weatherUpdate')
    }
  })
}
