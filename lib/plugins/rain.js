module.exports = inject
const states = ['no_respawn_block_available', 'start_raining', 'stop_raining', 'change_game_mode', 'win_game', 'demo_event', 'play_arrow_hit_sound', 'rain_level_change', 'thunder_level_change', 'puffer_fish_sting', 'guardian_elder_effect', 'immediate_respawn', 'limited_crafting', 'level_chunks_load_start']

function inject (bot) {
  bot.isRaining = false
  bot.thunderState = 0
  bot.rainState = 0
  function setRaining (isRaining) {
    if (bot.isRaining === isRaining) return
    bot.isRaining = isRaining
    bot.emit('rain')
  }

  bot._client.on('game_state_change', (packet) => {
    const reason = states[packet.reason] ?? packet.reason
    if (reason === 'start_raining') {
      setRaining(true)
    } else if (reason === 'stop_raining') {
      setRaining(false)
    } else if (reason === 'rain_level_change') {
      const wasWet = bot.rainState > 0
      bot.rainState = packet.gameMode
      bot.emit('weatherUpdate')
      if (wasWet !== (packet.gameMode > 0)) setRaining(packet.gameMode > 0)
    } else if (reason === 'thunder_level_change') {
      bot.thunderState = packet.gameMode
      bot.emit('weatherUpdate')
    }
  })
}
