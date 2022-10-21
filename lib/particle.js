const { Vec3 } = require("vec3")

module.exports = loader

function loader (registry) {
  class Particle {
    constructor (id, longDistanceRender, position, offset, speed, count, data) {
      this._id = id
      this._longDistanceRender = longDistanceRender
      this._position = position
      this._offset = offset
      this._speed = speed
      this._count = count
      this._data = data
    }
  
    set id (id) {
      this._id = id
    }
  
    set name (name) {
      this._id = registry.particlesByName[name].id
    }
  
    set longDistanceRender (longDistanceRender) {
      this._longDistanceRender = longDistanceRender
    }
  
    set position (position) {
      this._position = position
    }
  
    set offset (offset) {
      this._offset = offset
    }
  
    set speed (speed) {
      this._speed = speed
    }
  
    set count (count) {
      this._count = count
    }
  
    set data (data) {
      this.data = data
    }
  
    get id () {
      return this._id
    }
  
    get name () {
      return registry.particles[this._id].name
    }
  
    get longDistanceRender () {
      return this._longDistanceRender
    }
  
    get position () {
      return this._position
    }
  
    get offset () {
      return this._offset
    }
  
    get speed () {
      return this._particleData
    }
  
    get count () {
      return this._particles
    }
  
    get data () {
      return this._data
    }

    static fromNetwork(packet){
      return new Particle(packet.particleId, packet.longDistance, new Vec3(packet.x, packet.y, packet.z), new Vec3(packet.offsetX, packet.offsetY, packet.offsetZ), packet.particleData, packet.particles, packet.data || null)
    }
  }

  return Particle
}