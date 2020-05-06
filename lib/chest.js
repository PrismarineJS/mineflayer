const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class Chest extends EventEmitter {
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
    return this.window.countRange(0, this.window.inventoryStart, itemType, metadata)
  }

  items () {
    assert.ok(this.window)
    return this.window.itemsRange(0, this.window.inventoryStart)
  }
}

module.exports = Chest

Chest.matchWindowType = (type) => {
  return type === 'minecraft:chest' || type.startsWith('minecraft:generic')
}
