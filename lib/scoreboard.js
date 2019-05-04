module.exports = ScoreBoard

const sortItems = (a, b) => {
  if (a.value > b.value) return -1
  if (a.value < b.value) return 1
  return 1
}

function ScoreBoard (packet) {
  this.name = packet.name
  this.title = packet.displayText
  this.itemsMap = {}
}

ScoreBoard.prototype.add = function (name, value) {
  this.itemsMap[name] = { name, value }
  return this.itemsMap[name]
}

ScoreBoard.prototype.remove = function (name) {
  const removed = this.itemsMap[name]
  delete this.itemsMap[name]
  return removed
}

Object.defineProperty(ScoreBoard.prototype, 'items', {
  get () {
    return Object.values(this.itemsMap).sort(sortItems)
  }
})

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
