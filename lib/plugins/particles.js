const { Vec3 } = require('vec3')

module.exports = inject

class Particle {
  constructor (id, count, location, offset) {
    this._id = id
    this._count = count
    this._location = location
    this._offset = offset
  }

  set id (id) {
    this._id = id
  }

  set count (count) {
    this._count = count
  }

  set location ({ x, y, z }) {
    this._location = new Vec3(x, y, z)
  }

  set offset ({ x, y, z }) {
    this._offset = new Vec3(x, y, z)
  }

  set data (data) {
    this._data = data
  }

  get id () {
    return this._id
  }

  get count () {
    return this._count
  }

  get location () {
    return this._location
  }

  get offset () {
    return this._offset
  }

  get data () {
    return this._data
  }
}

function inject (bot) {
  bot._client.on('world_particles', (data) => {
    const location = new Vec3(data.x, data.y, data.z)
    const offset = new Vec3(data.offsetX, data.offsetY, data.offsetZ)

    const particle = new Particle(data.particleId, data.particles, location, offset)

    if (typeof data.data === 'object') {
      particle.data = data.data
    }
    bot.emit('particle', particle)
  })
}
