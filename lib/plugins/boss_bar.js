module.exports = inject

function inject (bot, { version }) {
  const BossBar = require('../bossbar')(bot.registry)
  const bars = {}

  bot._client.on('boss_bar', (packet) => {
    if (packet.action === 0) {
      bars[packet.entityUUID] = new BossBar(
        packet.entityUUID,
        packet.title,
        packet.health,
        packet.dividers,
        packet.color,
        packet.flags
      )

      bot.emit('bossBarCreated', bars[packet.entityUUID])
    } else if (packet.action === 1) {
      bot.emit('bossBarDeleted', bars[packet.entityUUID])
      delete bars[packet.entityUUID]
    } else {
      if (!(packet.entityUUID in bars)) {
        return
      }
      if (packet.action === 2) {
        bars[packet.entityUUID].health = packet.health
      }

      if (packet.action === 3) {
        bars[packet.entityUUID].title = packet.title
      }

      if (packet.action === 4) {
        bars[packet.entityUUID].dividers = packet.dividers
        bars[packet.entityUUID].color = packet.color
      }

      if (packet.action === 5) {
        bars[packet.entityUUID].flags = packet.flags
      }

      bot.emit('bossBarUpdated', bars[packet.entityUUID])
    }
  })

  Object.defineProperty(bot, 'bossBars', {
    get () {
      return Object.values(bars)
    }
  })
}
