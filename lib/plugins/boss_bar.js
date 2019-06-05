module.exports = inject

function inject (bot, { version }) {
  const ChatMessage = require('../chat_message')(version)

  const colors = [ 'pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white' ]
  const divisions = [ 0, 6, 10, 12, 20 ]
  const bars = {}

  function checkBarExistance (packet) {
    if (!bars.has(packet.entityUUID)) {
      console.log(' --- BAR DID NOT EXIST IN MAP --- ')
      bars[packet.entityUUID] = new BossBar(packet.entityUUID, packet.title, 1, 0, 5, false, false, false)
    }
  }

  bot._client.on('boss_bar', (packet) => {
    if (packet.action === 0) {
      bars[packet.entityUUID] = new BossBar(
        packet.entityUUID,
        packet.title,
        packet.health,
        packet.dividers,
        packet.color,
        packet.flags & 0x1,
        packet.flags & 0x2,
        packet.flags & 0x4
      )

      bot.emit('bossBarCreated', bars[packet.entityUUID])
    } else if (packet.action === 1) {
      bot.emit('bossBarDeleted', bars[packet.entityUUID])
      delete bars[packet.entityUUID]
    } else {
      checkBarExistance(packet)
      if (packet.action === 2) {
        bars[packet.entityUUID].setHealth(packet.health)
      }

      if (packet.action === 3) {
        bars[packet.entityUUID].setTitle(new ChatMessage(JSON.parse(packet.title)))
      }

      if (packet.action === 4) {
        bars[packet.entityUUID].setDividers(packet.dividers)
        bars[packet.entityUUID].setColor(colors[packet.color])
      }

      if (packet.action === 5) {
        bars[packet.entityUUID].setShouldDarkenSky(packet.flags & 0x1)
        bars[packet.entityUUID].setIsDragonBar(packet.flags & 0x2)
        bars[packet.entityUUID].setCreateFog(packet.flags & 0x4)
      }

      bot.emit('bossBarUpdated', bars[packet.entityUUID])
    }
  })

  Object.defineProperty(bot, 'bossBars', {
    get () {
      return Object.values(bars)
    }
  })

  function BossBar (uuid, title, health, dividers, color, shouldDarkenSky, isDragonBar, createFog) {
    this.entityUUID = uuid
    this.title = new ChatMessage(JSON.parse(title))
    this.health = health
    this.dividers = divisions[dividers]
    this.colors = colors[color]
    this.shouldDarkenSky = shouldDarkenSky
    this.isDragonBar = isDragonBar
    this.createFog = createFog

    this.setTitle = function (title) {
      this.title = new ChatMessage(JSON.parse(title))
    }
    this.setHealth = function (health) {
      this.health = health
    }
    this.setDividers = function (dividers) {
      this.dividers = divisions[dividers]
    }
    this.setColor = function (color) {
      this.colors = colors[color]
    }
    this.setShouldDarkenSky = function (shouldDarkenSky) {
      this.shouldDarkenSky = shouldDarkenSky
    }
    this.setIsDragonBar = function (isDragonBar) {
      this.isDragonBar = isDragonBar
    }
    this.setCreateFog = function (createFog) {
      this.createFog = createFog
    }

    this.getTitle = function () {
      return this.title
    }
    this.getHealth = function () {
      return this.health
    }
    this.getDividers = function () {
      return this.dividers
    }
    this.getColor = function () {
      return this.color
    }
    this.getShouldDarkenSky = function () {
      return this.shouldDarkenSky
    }
    this.getIsDragonBar = function () {
      return this.isDragonBar
    }
    this.getShouldCreateFog = function () {
      return this.createFog
    }
  }
}
