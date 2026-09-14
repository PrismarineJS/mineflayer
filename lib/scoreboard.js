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

    // The wire shape of a title changes with the version: a plain string before 1.13, a JSON
    // component string up to 1.20.2, an NBT component after that. JSON.parse().text read only
    // the first of those correctly - it dropped everything a component kept in `extra`, and on
    // 1.20.3+ it threw on the NBT object and left the raw object as the title, so printing one
    // gave '[object Object]'. ChatMessage reads all three.
    setTitle (title) {
      this.title = ChatMessage.fromNotch(title)
    }

    add (name, value) {
      this.itemsMap[name] = { name, value }
      this.itemsMap[name] = {
        name,
        value,
        get displayName () {
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
