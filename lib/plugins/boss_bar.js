module.exports = inject

function inject (bot, { version }) {
  const ChatMessage = require('../chat_message')(version)

  const colors = [ 'pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white' ]
  const divisions = [ 0, 6, 10, 12, 20 ]
  const bars = {}

  bot._client.on('boss_bar', (packet) => {
    if (packet.action === 0) {
      bars[packet.entityUUID] = {
        entityUUID: packet.entityUUID,
        title: new ChatMessage(JSON.parse(packet.title)),
        health: packet.health,
        dividers: divisions[packet.dividers],
        colors: colors[packet.color],
        shouldDarkenSky: packet.flags & 0x1,
        isDragonBar: packet.flags & 0x2,
        createFog: packet.flags & 0x4
      }

      bot.emit('bossBarCreated', bars[packet.entityUUID])
    } else if (packet.action === 1) {
      bot.emit('bossBarDeleted', bars[packet.entityUUID])
      delete bars[packet.entityUUID]
    } else {
      if (packet.action === 2) {
        bars[packet.entityUUID].health = packet.health
      }

      if (packet.action === 3) {
        bars[packet.entityUUID].title = new ChatMessage(JSON.parse(packet.title))
      }

      if (packet.action === 4) {
        bars[packet.entityUUID].dividers = divisions[packet.dividers]
        bars[packet.entityUUID].color = colors[packet.color]
      }

      if (packet.action === 5) {
        bars[packet.entityUUID].shouldDarkenSky = packet.flags & 0x1
        bars[packet.entityUUID].isDragonBar = packet.flags & 0x2
        bars[packet.entityUUID].createFog = packet.flags & 0x4
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
