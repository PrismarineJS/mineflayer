module.exports = inject

function inject (bot) {
  bot.isRaining = false
  const rainingState = bot.supportFeature('rainingStateBeginsWithOne') ? [1, 2] : [2, 1]

  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === rainingState[1]) {
      bot.isRaining = true
      bot.emit('rain')
    } else if (packet.reason === rainingState[0]) {
      bot.isRaining = false
      bot.emit('rain')
    }
  })
}
