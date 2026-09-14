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

    // The objective's title is a plain string on 1.8, a JSON component from 1.13 and an NBT
    // component from 1.20.3; only the middle one used to survive, and only its top-level text.
    setTitle (title) {
      this.title = ChatMessage.fromNotch(title)
    }

    add (name, value, display) {
      // 1.20.3+ may send the component to draw in place of the entry's own name.
      const displayed = display == null ? null : ChatMessage.fromNotch(display)
      this.itemsMap[name] = {
        name,
        value,
        get displayName () {
          if (displayed !== null) {
            return displayed
          }
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
