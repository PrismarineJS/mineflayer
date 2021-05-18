const { Vec3 } = require('vec3')

module.exports = inject

class Particle {
  constructor (id, count, location, offset) {
    this._id = id
    this._count = count
    this._location = new Vec3(...location)
    this._offset = new Vec3(...offset)
  }

  set id (id) {
    this._id = id
  }

  set count (count) {
    this._count = count
  }

  set location (location) {
    this._location = new Vec3(...location)
  }

  set offset (offset) {
    this._offset = new Vec3(...offset)
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
}

function inject (bot) {
  bot._client.on('world_particles', (data) => {
    console.log(data)
    const particle = new Particle(data.particleId, data.particles, [data.x, data.y, data.z], [data.offsetX, data.offsetY, data.offsetZ])
    bot.emit('particle', particle)
  })
}
