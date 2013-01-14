var Vec3 = require('vec3').Vec3;

module.exports = Painting;

function Painting(id, pos, name, direction) {
  this.id = id;
  this.position = pos;
  this.name = name;
  this.direction = direction;
}
