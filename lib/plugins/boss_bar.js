module.exports = inject

function inject (bot, { version }) {
  const BossBar = require('../bossbar')(bot.registry)
  const bars = {}

  function handleBossBarPacket (packet) {
    if (packet.action === 0) {
      let title = packet.title
      if (title && typeof title === 'object' && 'value' in title) title = title.value
      bars[packet.entityUUID] = new BossBar(
        packet.entityUUID,
        title,
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
        let title = packet.title
        if (title && typeof title === 'object' && 'value' in title) title = title.value
        bars[packet.entityUUID].title = title
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
  }

  // Handle all possible packet names
  bot._client.on('boss_bar', (packet) => {
    console.log('[boss_bar plugin] Received boss_bar packet:', packet)
    handleBossBarPacket(packet)
  })
  bot._client.on('bossbar', (packet) => {
    console.log('[boss_bar plugin] Received bossbar packet:', packet)
    handleBossBarPacket(packet)
  })
  bot._client.on('boss_bar_update', (packet) => {
    console.log('[boss_bar plugin] Received boss_bar_update packet:', packet)
    handleBossBarPacket(packet)
  })

  Object.defineProperty(bot, 'bossBars', {
    get () {
      return Object.values(bars)
    }
  })
}
