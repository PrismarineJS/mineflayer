var Vec3 = require('vec3').Vec3;

module.exports = Entity;

function Entity(id) {
  this.id = id;
  this.type = null;
  this.position = new Vec3(0, 0, 0);
  this.velocity = new Vec3(0, 0, 0);
  this.yaw = 0;
  this.pitch = 0;
  this.onGround = true;
  this.height = 0;
  this.effects = {};
  // 0 = held item, 1-4 = armor slot
  this.equipment = new Array(5);
  this.heldItem = this.equipment[0]; // shortcut to equipment[0]
  this.isValid = true;
}

Entity.prototype.setEquipment = function(index, item) {
  this.equipment[index] = item;
  this.heldItem = this.equipment[0];
};

