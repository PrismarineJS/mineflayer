const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class Dispenser extends EventEmitter {
  constructor () {
    super()

    this.window = null
  }

  // this function is replaced by the inventory plugin
  close () {
    assert.ok(false, 'override')
  }

  deposit (itemType, metadata, count) {
    assert.ok(false, 'override')
  }

  withdraw (itemType, metadata, count) {
    assert.ok(false, 'override')
  }

  count (itemType, metadata) {
    assert.ok(this.window)
    return this.window.dispenserCount(itemType, metadata)
  }

  items () {
    assert.ok(this.window)
    return this.window.dispenserItems()
  }
}

Dispenser.matchWindowType = (type) => {
  return type === 'minecraft:dispenser'
}

module.exports = Dispenser
