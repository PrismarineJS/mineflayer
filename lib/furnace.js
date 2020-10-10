const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class Furnace extends EventEmitter {
  constructor () {
    super()

    this.window = null
    this.totalFuel = null
    this.fuel = null
    this.fuelSeconds = null
    this.totalProgress = null
    this.progress = null
    this.progressSeconds = null
  }

  // this function is replaced by the inventory plugin
  close () {
    assert.ok(false, 'override')
  }

  takeInput (cb) {
    assert.ok(false, 'override')
  }

  takeFuel (cb) {
    assert.ok(false, 'override')
  }

  takeOutput (cb) {
    assert.ok(false, 'override')
  }

  putInput (itemType, metadata, cb) {
    assert.ok(false, 'override')
  }

  putFuel (itemType, metadata, cb) {
    assert.ok(false, 'override')
  }

  inputItem () {
    assert.notStrictEqual(this.window, null)
    return this.window.slots[0]
  }

  fuelItem () {
    assert.notStrictEqual(this.window, null)
    return this.window.slots[1]
  }

  outputItem () {
    assert.notStrictEqual(this.window, null)
    return this.window.slots[2]
  }
}

module.exports = Furnace

Furnace.matchWindowType = (type) => {
  return type === 'minecraft:furnace'
}
