module.exports = inject

function inject (bot) {
  bot.isRaining = false
  bot.thunderState = 0
  bot.rainState = 0
  bot._client.on('game_state_change', (packet) => {
    switch (packet.reason) {
      case 'start_raining':
        bot.isRaining = true
        bot.emit('rain')
        break
      case 'stop_raining':
        bot.isRaining = false
        bot.emit('rain')
        break
      case 'rain_level_change':
        bot.rainState = packet.gameMode
        bot.emit('weatherUpdate')
        break
      case 'thunder_level_change':
        bot.thunderState = packet.gameMode
        bot.emit('weatherUpdate')
        break
    }
  })
}
