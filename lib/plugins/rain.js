module.exports = inject

function inject (bot) {
  bot.isRaining = false
  bot._client.on('game_state_change', (packet) => {
    let rainingBeginState, rainingEndState
    if (bot.supportFeature('rainingStateBeginsWithOne')) {
      rainingBeginState = 1
      rainingEndState = 2
    } else {
      rainingBeginState = 2
      rainingEndState = 1
    }

    if (packet.reason === rainingBeginState) {
      bot.isRaining = true
      bot.emit('rain')
    } else if (packet.reason === rainingEndState) {
      bot.isRaining = false
      bot.emit('rain')
    }
  })
}
