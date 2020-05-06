const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class EnchantmentTable extends EventEmitter {
  constructor () {
    super()

    this.window = null
  }

  // this function is replaced by the inventory plugin
  close () {
    assert.ok(false, 'override')
  }

  targetItem () {
    return this.window.slots[0]
  }

  enchant () {
    assert.ok(false, 'override')
  }

  takeTargetItem () {
    assert.ok(false, 'override')
  }

  putTargetItem () {
    assert.ok(false, 'override')
  }

  putLapis () {
    assert.ok(false, 'override')
  }
}

EnchantmentTable.matchWindowType = (type) => {
  return type.startsWith('minecraft:enchant')
}

module.exports = EnchantmentTable
