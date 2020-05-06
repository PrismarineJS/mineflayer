const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class Villager extends EventEmitter {
  constructor () {
    super()

    this.window = null
  }

  // this function is replaced by the inventory plugin
  close () {
    assert.ok(false, 'override')
  }
}

Villager.matchWindowType = (type) => {
  return type === 'minecraft:villager' || type === 'minecraft:merchant'
}

module.exports = Villager
