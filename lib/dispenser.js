var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

module.exports = Dispenser;

function Dispenser() {
  EventEmitter.call(this);

  this.window = null;
}
util.inherits(Dispenser, EventEmitter);

Dispenser.windowType = 3;

// this function is replaced by the inventory plugin
Dispenser.prototype.close = function() {
  assert.ok(false, "override");
};

Dispenser.prototype.deposit = function(itemType, metadata, count) {
  assert.ok(false, "override");
};

Dispenser.prototype.withdraw = function(itemType, metadata, count) {
  assert.ok(false, "override");
};

Dispenser.prototype.count = function(itemType, metadata) {
  assert.ok(this.window);
  return this.window.dispenserCount(itemType, metadata);
};

Dispenser.prototype.items = function() {
  assert.ok(this.window);
  return this.window.dispenserItems();
};
