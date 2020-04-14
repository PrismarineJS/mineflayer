const sortItems = (a, b) => {
  if (a.value > b.value) return -1
  if (a.value < b.value) return 1
  return 1
}

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

module.exports = ScoreBoard
