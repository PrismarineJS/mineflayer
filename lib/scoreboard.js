const sortItems = (a, b) => {
  if (a.value > b.value) return -1
  if (a.value < b.value) return 1
  return 1
}

module.exports = (bot) => {
  const ChatMessage = require('prismarine-chat')(bot.registry)

  class ScoreBoard {
    constructor (packet) {
      this.name = packet.name
      this.setTitle(packet.displayText)
      this.itemsMap = {}
    }

    // displayText is a plain string before 1.13, a JSON string up to 1.20.2 and an NBT
    // component from 1.20.3 on; fromNotch reads all three.
    setTitle (title) {
      this.title = title == null ? new ChatMessage('') : ChatMessage.fromNotch(title)
    }

    // displayName, when the server sends one, is what vanilla renders for this entry instead of
    // the team-formatted entity name (1.20.3+).
    add (name, value, displayName) {
      const shown = displayName == null ? null : ChatMessage.fromNotch(displayName)
      this.itemsMap[name] = {
        name,
        value,
        get displayName () {
          if (shown !== null) return shown
          if (name in bot.teamMap) {
            return bot.teamMap[name].displayName(name)
          }
          return new ChatMessage(name)
        }
      }
      return this.itemsMap[name]
    }

    remove (name) {
      const removed = this.itemsMap[name]
      delete this.itemsMap[name]
      return removed
    }

    get items () {
      return Object.values(this.itemsMap).sort(sortItems)
    }
  }

  ScoreBoard.positions = {
    get list () {
      return this[0]
    },

    get sidebar () {
      return this[1]
    },

    get belowName () {
      return this[2]
    }
  }
  return ScoreBoard
}
