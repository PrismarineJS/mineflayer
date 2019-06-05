let ChatMessage
const colors = [ 'pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white' ]
const divisions = [ 0, 6, 10, 12, 20 ]

module.exports = loader

function loader (mcVersion) {
  ChatMessage = require('chat_message')(mcVersion)
  return BossBar
}

class BossBar {
  constructor (uuid, title, health, dividers, color, flags) {
    this.entityUUID = uuid
    this.title = new ChatMessage(JSON.parse(title))
    this.health = health
    this.dividers = divisions[dividers]
    this.color = colors[color]
    this.shouldDarkenSky = flags & 0x1
    this.isDragonBar = flags & 0x2
    this.createFog = flags & 0x4
  }

  setTitle (title) {
    this.title = new ChatMessage(JSON.parse(title))
  }
  setHealth (health) {
    this.health = health
  }
  setDividers (dividers) {
    this.dividers = divisions[dividers]
  }
  setColor (color) {
    this.color = colors[color]
  }
  setFlags (flags) {
    this.shouldDarkenSky = flags & 0x1
    this.isDragonBar = flags & 0x2
    this.createFog = flags & 0x4
  }

  getTitle () {
    return this.title
  }
  getHealth () {
    return this.health
  }
  getDividers () {
    return this.dividers
  }
  getColor () {
    return this.color
  }
  getShouldDarkenSky () {
    return this.shouldDarkenSky
  }
  getIsDragonBar () {
    return this.isDragonBar
  }
  getShouldCreateFog () {
    return this.createFog
  }
}
