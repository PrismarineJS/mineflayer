var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , assert = require('assert')

module.exports = Chest;

function Chest() {
  EventEmitter.call(this);

  this.window = null;
}
util.inherits(Chest, EventEmitter);

// this function is replaced by the inventory plugin
Chest.prototype.close = function() {
  assert.ok(false, "not open");
};

Chest.prototype.deposit = function(itemType, metadata, count) {
  assert.ok(false, "not open");
};

Chest.prototype.withdraw = function(itemType, metadata, count) {
  assert.ok(false, "not open");
};

Chest.prototype.count = function(itemType, metadata) {
  assert.ok(this.window);
  return this.window.chestCount(itemType, metadata);
};

Chest.prototype.items = function() {
  assert.ok(this.window);
  return this.window.chestItems();
};
