const EventEmitter = require('events').EventEmitter
const assert = require('assert')

class Furnace extends EventEmitter {
  constructor () {
    super()

    this.window = null
    this.fuel = null
    this.progress = null
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
    assert.notEqual(this.window, null)
    return this.window.slots[0]
  }

  fuelItem () {
    assert.notEqual(this.window, null)
    return this.window.slots[1]
  }

  outputItem () {
    assert.notEqual(this.window, null)
    return this.window.slots[2]
  }
}

module.exports = Furnace

Furnace.windowType = 2
