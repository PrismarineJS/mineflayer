var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

module.exports = Furnace;

function Furnace() {
  EventEmitter.call(this);

  this.window = null;
  this.fuel = null;
  this.progress = null;
}
util.inherits(Furnace, EventEmitter);

Furnace.windowType = 2;

// this function is replaced by the inventory plugin
Furnace.prototype.close = function() {
  assert.ok(false, "override");
};

Furnace.prototype.takeInput = function(cb) {
  assert.ok(false, "override");
};
Furnace.prototype.takeFuel = function(cb) {
  assert.ok(false, "override");
};
Furnace.prototype.takeOutput = function(cb) {
  assert.ok(false, "override");
};
Furnace.prototype.putInput = function(itemType, metadata, cb) {
  assert.ok(false, "override");
};
Furnace.prototype.putFuel = function(itemType, metadata, cb) {
  assert.ok(false, "override");
};
Furnace.prototype.inputItem = function() {
  assert.notEqual(this.window, null);
  return this.window.slots[0];
};
Furnace.prototype.fuelItem = function() {
  assert.notEqual(this.window, null);
  return this.window.slots[1];
};
Furnace.prototype.outputItem = function() {
  assert.notEqual(this.window, null);
  return this.window.slots[2];
};
