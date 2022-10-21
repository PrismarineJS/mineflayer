module.exports = loader

function loader (registry) {
  function fromNetwork(packet){
    return {
      id: packet.particleId,
      name: registry.particlesByName[name].id,
      forceRender: packet.longDistance,
      position: new Vec3(packet.x, packet.y, packet.z),
      offset: new Vec3(packet.offsetX, packet.offsetY, packet.offsetZ),
      speed: packet.particleData,
      particles: packet.particles,
      data: packet.data || null
    }
  }

  return { fromNetwork }
}