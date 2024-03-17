const colors = ['pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white']
const divisions = [0, 6, 10, 12, 20]

function loader (registry) {
  const ChatMessage = require('prismarine-chat')(registry)
  return class BossBar {
    constructor (uuid, title, health, dividers, color, flags) {
      this._entityUUID = uuid
      this._title = ChatMessage.fromNotch(title)
      this._health = health
      this._dividers = divisions[dividers]
      this._color = colors[color]
      this._shouldDarkenSky = flags & 0x1
      this._isDragonBar = flags & 0x2
      this._createFog = flags & 0x4
    }

    set entityUUID (uuid) {
      this._entityUUID = uuid
    }

    set title (title) {
      this._title = ChatMessage.fromNotch(title)
    }

    set health (health) {
      this._health = health
    }

    set dividers (dividers) {
      this._dividers = divisions[dividers]
    }

    set color (color) {
      this._color = colors[color]
    }

    set flags (flags) {
      this._shouldDarkenSky = flags & 0x1
      this._isDragonBar = flags & 0x2
      this._createFog = flags & 0x4
    }

    get flags () {
      return (this._shouldDarkenSky) | (this._isDragonBar << 1) | (this._createFog << 2)
    }

    set shouldDarkenSky (darkenSky) {
      this._shouldDarkenSky = darkenSky
    }

    set isDragonBar (dragonBar) {
      this._isDragonBar = dragonBar
    }

    get createFog () {
      return this._createFog
    }

    set createFog (createFog) {
      this._createFog = createFog
    }

    get entityUUID () {
      return this._entityUUID
    }

    get title () {
      return this._title
    }

    get health () {
      return this._health
    }

    get dividers () {
      return this._dividers
    }

    get color () {
      return this._color
    }

    get shouldDarkenSky () {
      return this._shouldDarkenSky
    }

    get isDragonBar () {
      return this._isDragonBar
    }

    get shouldCreateFog () {
      return this._createFog
    }
  }
}

module.exports = loader
