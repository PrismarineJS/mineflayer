module.exports = inject

function inject (bot) {
  bot.isAlive = true
  startRespawnListener(bot)

  bot._client.once('update_health', (packet) => {
    if (packet.health > 0) {
      bot.emit('spawn')
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
      bot._client.write('client_command', { payload: 0 })
    } else if (bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true
      bot.emit('spawn')
    }
  })
}

function startRespawnListener (bot) {
  // have to await two respawn events < 1.16
  if (bot.supportFeature('sendTwoRespawnPackets')) {
    bot._client.once('respawn', () => {
      bot._client.once('respawn', () => {
        bot.isAlive = false
        bot.emit('respawn')
        startRespawnListener()
      })
    })
  } else {
    bot._client.once('respawn', () => {
      bot.isAlive = false
      bot.emit('respawn')
      startRespawnListener()
    })
  }
}
