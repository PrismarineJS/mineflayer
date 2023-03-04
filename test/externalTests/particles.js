const assert = require('assert')

module.exports = () => async (bot) => {
  const particleData = bot.registry.particles[0]

  return new Promise((resolve, reject) => {
    function onParticleEvent (particle) {
      assert.strictEqual(particle.id, particleData.id)
      assert.strictEqual(particle.name, particleData.name)
      assert.strictEqual(particle.position.x, bot.entity.position.x)
      assert.strictEqual(particle.position.y, bot.entity.position.y)
      assert.strictEqual(particle.position.z, bot.entity.position.z)
      assert.strictEqual(particle.offset.x, 5)
      assert.strictEqual(particle.offset.y, 5)
      assert.strictEqual(particle.offset.z, 5)
      assert.strictEqual(particle.count, 100)
      assert.strictEqual(particle.movementSpeed, 0.5)
      assert.strictEqual(particle.longDistanceRender, true)

      resolve()
    }

    bot.on('particle', onParticleEvent)

    bot.chat(`/particle ${particleData.name} ~ ~ ~ 5 5 5 0.5 100 force`)
  })
}
