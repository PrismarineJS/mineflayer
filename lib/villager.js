const EventEmitter = require('events').EventEmitter;
const util = require('util');
const assert = require('assert');

module.exports = Villager;

class Villager {
  constructor() {
    EventEmitter.call(this);

    this.window = null;
  }

  // this function is replaced by the inventory plugin
  close() {
    assert.ok(false, "override");
  }
}

util.inherits(Villager, EventEmitter);

Villager.windowType = 7;
