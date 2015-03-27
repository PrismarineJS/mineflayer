var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

module.exports = Chest;

function Chest() {
  EventEmitter.call(this);

  this.window = null;
}
util.inherits(Chest, EventEmitter);

Chest.windowType = 0;

// this function is replaced by the inventory plugin
Chest.prototype.close = function() {
  assert.ok(false, "override");
};

Chest.prototype.deposit = function(itemType, metadata, count) {
  assert.ok(false, "override");
};

Chest.prototype.withdraw = function(itemType, metadata, count) {
  assert.ok(false, "override");
};

Chest.prototype.count = function(itemType, metadata) {
  assert.ok(this.window);
  return this.window.chestCount(itemType, metadata);
};

Chest.prototype.items = function() {
  assert.ok(this.window);
  return this.window.chestItems();
};
