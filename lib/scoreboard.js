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

    setTitle (title) {
      try {
        this.title = JSON.parse(title).text // version>1.13
      } catch {
        this.title = title
      }
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

  // The named slots alias the numeric ones and stay non-enumerable, so
  // Object.keys/values(bot.scoreboard) only ever yield displayed objectives.
  ScoreBoard.positions = Object.defineProperties({}, {
    list: { get () { return this[0] } },
    sidebar: { get () { return this[1] } },
    belowName: { get () { return this[2] } }
  })
  return ScoreBoard
}
