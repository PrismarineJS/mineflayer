const EventEmitter = require('events').EventEmitter;
const util = require('util');
const assert = require('assert');

module.exports = EnchantmentTable;

class EnchantmentTable {
  constructor() {
    EventEmitter.call(this);

    this.window = null;
  }

  // this function is replaced by the inventory plugin
  close() {
    assert.ok(false, "override");
  }

  targetItem() {
    return this.window.slots[0];
  }

  enchant() {
    assert.ok(false, "override");
  }

  takeTargetItem() {
    assert.ok(false, "override");
  }

  putTargetItem() {
    assert.ok(false, "override");
  }

  putLapis() {
    assert.ok(false, "override");
  }
}

util.inherits(EnchantmentTable, EventEmitter);

EnchantmentTable.windowType = 4;
