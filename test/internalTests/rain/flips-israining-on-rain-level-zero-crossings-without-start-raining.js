const assert = require('assert')

module.exports = (bot, server, done) => {
  // Vanilla 26.1 can bring rain in with only rain_level_change ramps,
  // never sending start_raining/stop_raining (observed on a quick
  // weather flip), so level crossings alone must drive isRaining.
  const mapped = JSON.stringify(bot.registry.protocol.play.toClient.types.packet_game_state_change).includes('rain_level_change')
  const reason = mapped ? 'rain_level_change' : 7
  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    // Plugins inject after a deferred inject_allowed, so bot state is
    // only readable once the bot has seen login.
    bot.once('login', () => {
      assert.strictEqual(bot.isRaining, false)
      bot.once('rain', () => {
        assert.strictEqual(bot.isRaining, true)
        bot.once('rain', () => {
          assert.strictEqual(bot.isRaining, false)
          assert.strictEqual(bot.rainState, 0)
          done()
        })
        client.write('game_state_change', { reason, gameMode: 0 })
      })
      client.write('game_state_change', { reason, gameMode: 0.01 })
      // A second wet level must not emit again: if it did, the inner
      // once would run with isRaining still true and fail the assert.
      client.write('game_state_change', { reason, gameMode: 0.5 })
    })
  })
}
