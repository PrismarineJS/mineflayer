module.exports = inject

function inject (bot, options) {
  bot.isAlive = true
  // Set when a dimension-change respawn is received so that the next
  // update_health packet re-emits spawn, matching the timing used for deaths.
  let spawnAfterDimensionChange = false

  bot._client.on('respawn', (packet) => {
    // The respawn packet is sent both on death and on dimension change. The
    // copyMetadata (Data To Keep) field is false on death and true when the
    // player is simply moving between dimensions. On a real death, mark the
    // bot dead so the next update_health re-emits spawn. On a dimension change
    // the bot is still alive, so keep isAlive true (so physics keeps updating
    // its position, see #3905) and schedule a spawn event for the next
    // update_health, since consumers (and the nether test) expect spawn to
    // fire when the bot re-enters a world. On versions before 1.16.1 the field
    // is absent (undefined), which keeps the previous always-false behaviour.
    if (packet.copyMetadata) {
      bot.isAlive = true
      spawnAfterDimensionChange = true
    } else {
      bot.isAlive = false
    }
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
        bot.emit('death')
      }
      if (!options.respawn) return
      bot.respawn()
    } else if (bot.health > 0 && (!bot.isAlive || spawnAfterDimensionChange)) {
      bot.isAlive = true
      spawnAfterDimensionChange = false
      bot.emit('spawn')
    }
  })

  const respawn = () => {
    if (bot.isAlive) return
    bot._client.write('client_command', bot.supportFeature('respawnIsPayload') ? { payload: 0 } : { actionId: 0 })
  }

  bot.respawn = respawn
}
