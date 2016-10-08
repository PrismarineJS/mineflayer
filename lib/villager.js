var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

module.exports = Villager;

function Villager() {
  EventEmitter.call(this);

  this.window = null;
}
util.inherits(Villager, EventEmitter);

Villager.windowType = 7;

// this function is replaced by the inventory plugin
Villager.prototype.close = function() {
  assert.ok(false, "override");
};
