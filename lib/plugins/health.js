module.exports = inject

function inject (bot, options) {
  bot.isAlive = true

  bot._client.on('respawn', (packet) => {
    bot.isAlive = false
    bot.emit('respawn')
  })

  // 1.21.4+ servers ignore block and item interactions until the client has
  // sent player_loaded (or 60 ticks have passed). The vanilla client sends it once the
  // chunk it stands in has arrived (that is when its loading screen closes), so wait for
  // that chunk, with the same 60 tick fallback, instead of answering before any terrain.
  function sendPlayerLoaded () {
    const send = () => {
      clearTimeout(timer)
      bot.removeListener('chunkColumnLoad', onColumn)
      if (bot._client.state === 'play') bot._client.write('player_loaded', {})
    }
    const onColumn = () => { if (bot.entity?.position && bot.blockAt(bot.entity.position) != null) send() }
    const timer = setTimeout(send, 3000)
    bot.on('chunkColumnLoad', onColumn)
    onColumn()
  }

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
