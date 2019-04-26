module.exports = inject

function inject (bot, { version }) {
  const ChatMessage = require('../chat_message')(version)

  const divisions = [ 0, 6, 10, 12, 20 ]
  const bars = {}

  const applyColors = (bar, flag) => {
    bar.isPink   = flag === 0
    bar.isBlue   = flag === 1
    bar.isRed    = flag === 2
    bar.isGreen  = flag === 3
    bar.isYellow = flag === 4
    bar.isPurple = flag === 5
    bar.isWhite  = flag === 6
  }

  bot._client.on('boss_bar', (packet) => {
    if (packet.action === 0) {
      bars[packet.entityUUID] = {
        entityUUID: packet.entityUUID,
        title: new ChatMessage(JSON.parse(packet.title)),
        health: packet.health,
        dividers: divisions[packet.dividers],
        shouldDarkenSky: packet.flags & 0x1,
        isDragonBar: packet.flags & 0x2,
        createFog: packet.flags & 0x4
      }

      applyColors(bars[packet.entityUUID], packet.color)
    }

    if (packet.action === 1) {
      delete bars[packet.entityUUID]
    }

    if (packet.action === 2) {
      bars[packet.entityUUID].health = packet.health
    }

    if (packet.action === 3) {
      bars[packet.entityUUID].title = new ChatMessage(JSON.parse(packet.title))
    }

    if (packet.action === 4) {
      bars[packet.entityUUID].dividers = divisions[packet.dividers]
      applyColors(bars[packet.entityUUID], packet.color)
    }

    if (packet.action === 5) {
      bars[packet.entityUUID].shouldDarkenSky = packet.flags & 0x1
      bars[packet.entityUUID].isDragonBar     = packet.flags & 0x2
      bars[packet.entityUUID].createFog       = packet.flags & 0x4
    }
  })

  Object.defineProperty(bot, 'bossBars', {
    get () {
      return Object.values(bars)
    }
  })
}
