module.exports = inject

function inject (bot, { version }) {
  const BossBar = require('../bossbar')(bot.registry)
  const bars = {}

  function extractTitle (title) {
    if (!title) return ''
    if (typeof title === 'string') return title
    // Return the original object for BossBar to handle
    return title
  }

  function handleBossBarPacket (packet) {
    if (packet.action === 0) {
      bars[packet.entityUUID] = new BossBar(
        packet.entityUUID,
        extractTitle(packet.title),
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
      if (packet.action === 2 && packet.health !== undefined) {
        bars[packet.entityUUID].health = packet.health
      }
      if (packet.action === 3 && packet.title !== undefined) {
        bars[packet.entityUUID].title = extractTitle(packet.title)
      }
      if (packet.action === 4) {
        if (packet.dividers !== undefined) {
          bars[packet.entityUUID].dividers = packet.dividers
        }
        if (packet.color !== undefined) {
          bars[packet.entityUUID].color = packet.color
        }
      }
      if (packet.action === 5 && packet.flags !== undefined) {
        bars[packet.entityUUID].flags = packet.flags
      }
      bot.emit('bossBarUpdated', bars[packet.entityUUID])
    }
  }

  // Handle all possible packet names
  bot._client.on('boss_bar', handleBossBarPacket)
  bot._client.on('bossbar', handleBossBarPacket)
  bot._client.on('boss_bar_update', handleBossBarPacket)

  Object.defineProperty(bot, 'bossBars', {
    get () {
      return Object.values(bars)
    }
  })
}
