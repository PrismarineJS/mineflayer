let mcdata

module.exports = loader

function loader (registry) {
  mcdata = registry
  return Particle
}

class Particle {
  constructor (id, longDistance, position, offset, particleData, particles, data) {
    this._id = id
    this._longDistance = longDistance
    this._position = position
    this._offset = offset
    this._particleData = particleData
    this._particles = particles
    this._data = data
  }

  set id (id) {
    this._id = id
  }

  set name (name) {
    this._id = mcdata.particlesByName[name].id
  }

  set longDistance (longDistance) {
    this._longDistance = longDistance
  }

  set position (position) {
    this._position = position
  }

  set offset (offset) {
    this._offset = offset
  }

  set particleData (particleData) {
    this._particleData = particleData
  }

  set particles (particles) {
    this._particles = particles
  }

  set data (data) {
    this.data = data
  }

  get id () {
    return this._id
  }

  get name () {
    return mcdata.particles[this._id].name
  }

  get longDistance () {
    return this._longDistance
  }

  get position () {
    return this._position
  }

  get offset () {
    return this._offset
  }

  get particleData () {
    return this._particleData
  }

  get particles () {
    return this._particles
  }

  get data () {
    return this._data
  }
}
