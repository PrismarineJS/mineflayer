module.exports = inject

function inject (bot, options) {
  bot.isAlive = true

  bot._client.on('respawn', (packet) => {
    bot.isAlive = false
    bot.emit('respawn')
  })

  // 1.21.4+ servers ignore block and item interactions until the client has
  // sent player_loaded (or 60 ticks have passed)
  function spawn () {
    sendPlayerLoadedWhenReady()
    bot.emit('spawn')
  }

  // player_loaded is sent at most once per level_chunks_load_start game event (join and every
  // respawn), never before it, and only once the column under the bot is loaded unless the bot
  // is outside the build height, a spectator or dead.
  let awaitingLoad = false
  let chunksAnnounced = false
  function sendPlayerLoadedWhenReady () {
    if (!bot.supportFeature('sendsPlayerLoadedPacket')) return
    awaitingLoad = true
    checkLoaded()
  }
  function checkLoaded () {
    if (!awaitingLoad || !chunksAnnounced) return
    const pos = bot.entity?.position
    if (!pos || !Number.isFinite(pos.x)) return
    const outsideBuildHeight = pos.y < bot.game.minY || pos.y >= bot.game.minY + bot.game.height
    if (!(outsideBuildHeight || bot.game.gameMode === 'spectator' || !bot.isAlive || bot.blockAt(pos) !== null)) return
    awaitingLoad = false
    chunksAnnounced = false
    bot._client.write('player_loaded', {})
  }
  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === 13 || packet.reason === 'level_chunks_load_start') {
      chunksAnnounced = true
      checkLoaded()
    }
  })
  bot.on('chunkColumnLoad', checkLoaded)
  bot.on('forcedMove', checkLoaded)

  bot._client.once('update_health', (packet) => {
    if (packet.health > 0) {
      spawn()
    }
  })

  bot._client.on('update_health', (packet) => {
    bot.health = packet.health
    bot.food = packet.food
    bot.foodSaturation = packet.foodSaturation
    bot.emit('health')
    if (bot.health <= 0) {
      if (bot.isAlive) {
        bot.isAlive = false
        bot.emit('death')
      }
      if (!options.respawn) return
      bot.respawn()
    } else if (bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true
      spawn()
    }
  })

  const respawn = () => {
    if (bot.isAlive) return
    bot._client.write('client_command', bot.supportFeature('respawnIsPayload') ? { payload: 0 } : { actionId: 0 })
  }

  bot.respawn = respawn
}
