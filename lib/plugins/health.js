module.exports = inject

function inject (bot, options) {
  bot.isAlive = true

  bot._client.on('respawn', (packet) => {
    bot.isAlive = false
    clearPlayerLoadedWait() // a respawn supersedes any player_loaded wait still pending from the previous spawn
    bot.emit('respawn')
  })

  // 1.21.4+ servers ignore block and item interactions until the client has
  // sent player_loaded (or 60 ticks have passed). The vanilla client sends it once the
  // chunk it stands in has arrived (that is when its loading screen closes), so wait for
  // that chunk, with the same 60 tick fallback, instead of answering before any terrain.
  // Exactly one wait may be pending. A respawn (or reconnect) before the first chunk arrives would otherwise leave two
  // timers/listeners that both answer, so the server gets player_loaded twice. activeWait is the single owner: a new
  // wait, a respawn, leaving the play state, or the connection ending cancels the previous one, and a superseded wait's
  // callback is a no-op (the state === 'play' check alone cannot tell one spawn from the next).
  let activeWait = null
  function clearPlayerLoadedWait () {
    if (!activeWait) return
    clearTimeout(activeWait.timer)
    bot.removeListener('chunkColumnLoad', activeWait.onColumn)
    activeWait = null
  }
  function sendPlayerLoaded () {
    clearPlayerLoadedWait()
    const wait = {}
    const send = () => {
      if (activeWait !== wait) return // superseded by a newer spawn/session
      clearPlayerLoadedWait()
      if (bot._client.state === 'play') bot._client.write('player_loaded', {})
    }
    wait.onColumn = () => { if (bot.entity?.position && bot.blockAt(bot.entity.position) != null) send() }
    wait.timer = setTimeout(send, 3000)
    activeWait = wait
    bot.on('chunkColumnLoad', wait.onColumn)
    wait.onColumn()
  }
  bot._client.on('end', clearPlayerLoadedWait)
  bot._client.on('state', state => { if (state !== 'play') clearPlayerLoadedWait() })

  function spawn () {
    if (bot.supportFeature('sendsPlayerLoadedPacket')) sendPlayerLoaded()
    bot.emit('spawn')
  }

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
