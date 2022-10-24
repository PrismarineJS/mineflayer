const { Vec3 } = require('vec3')

module.exports = loader

function loader (registry) {
  class Particle {
    constructor (id, position, offset, count = 1, movementSpeed = 0, longDistanceRender = false) {
      Object.assign(this, registry.particles[id])
      this.id = id
      this.position = position
      this.offset = offset
      this.count = count
      this.movementSpeed = movementSpeed
      this.longDistanceRender = longDistanceRender
    }

    static fromNetwork (packet) {
      return new Particle(
        packet.particleId,
        new Vec3(packet.x, packet.y, packet.z),
        new Vec3(packet.offsetX, packet.offsetY, packet.offsetZ),
        packet.particles,
        packet.particleData,
        packet.longDistance
      )
    }
  }

  return Particle
}
