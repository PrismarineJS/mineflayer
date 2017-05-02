const EventEmitter = require('events').EventEmitter;
const util = require('util');
const assert = require('assert');

module.exports = Dispenser;

class Dispenser {
  constructor() {
    EventEmitter.call(this);

    this.window = null;
  }

  // this function is replaced by the inventory plugin
  close() {
    assert.ok(false, "override");
  }

  deposit(itemType, metadata, count) {
    assert.ok(false, "override");
  }

  withdraw(itemType, metadata, count) {
    assert.ok(false, "override");
  }

  count(itemType, metadata) {
    assert.ok(this.window);
    return this.window.dispenserCount(itemType, metadata);
  }

  items() {
    assert.ok(this.window);
    return this.window.dispenserItems();
  }
}

util.inherits(Dispenser, EventEmitter);

Dispenser.windowType = 3;
