module.exports = inject

function inject (bot) {
  bot.isAlive = true

  bot._client.on('respawn', (packet) => {
    bot.isAlive = false
    bot.emit('respawn')
  })

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
      }
      bot._client.write('client_command', { payload: 0 })
    } else if (bot.health > 0 && !bot.isAlive) {
      bot.isAlive = true
      bot.emit('spawn')
    }
  })

  bot._client.on('death_combat_event', (eventData) => {
    eventData.message = JSON.parse(eventData.message)
    const deathType = eventData.message.translate
    let deathBy = null
    if (eventData.message.with.length > 1) {
      const thisWith = eventData.message.with[1]
      if (thisWith.hoverEvent.contents.type === 'minecraft:player') deathBy = thisWith.text
      else deathBy = thisWith.hoverEvent.contents.type
    }
    bot.emit('death', deathType, deathBy)
  })
}
