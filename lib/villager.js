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

Villager.windowType = 7

module.exports = Villager
