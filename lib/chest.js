const EventEmitter = require('events').EventEmitter;
const util = require('util');
const assert = require('assert');

module.exports = Chest;

class Chest {
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
    return this.window.chestCount(itemType, metadata);
  }

  items() {
    assert.ok(this.window);
    return this.window.chestItems();
  }
}

util.inherits(Chest, EventEmitter);

Chest.windowType = 0;
