var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , assert = require('assert')

module.exports = EnchantmentTable;

function EnchantmentTable() {
  EventEmitter.call(this);

  this.window = null;
}
util.inherits(EnchantmentTable, EventEmitter);

EnchantmentTable.windowType = 4;

// this function is replaced by the inventory plugin
EnchantmentTable.prototype.close = function() {
  assert.ok(false, "override");
};

EnchantmentTable.prototype.targetItem = function() {
  return this.window.slots[0];
};

EnchantmentTable.prototype.enchant = function() {
  assert.ok(false, "override");
};

EnchantmentTable.prototype.takeTargetItem = function() {
  assert.ok(false, "override");
};

EnchantmentTable.prototype.putTargetItem = function() {
  assert.ok(false, "override");
};
