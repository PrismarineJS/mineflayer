module.exports = inject

function inject (bot) {
  bot.isRaining = false
  bot.weather = 'clear'
  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === 2) {
      bot.isRaining = false
      bot.weather = 'clear'
      bot.emit('rain')
    } else if (packet.reason === 7 && packet.value > 0) {
      bot.isRaining = true
      bot.weather = 'rain'
      bot.emit('rain')
    } else if (packet.reason === 8 && packet.value > 0) {
      bot.isRaining = true
      bot.weather = 'thunderstorm'
      bot.emit('rain')
    }
  })
}
