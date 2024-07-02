const { Vec3 } = require('vec3')
const { createDoneTask, createTask } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  let bobberId = 90
  // Before 1.14 the bobber entity keep changing name at each version (but the id stays 90)
  // 1.14 changes the id, but hopefully we can stick with the name: fishing_bobber
  // the alternative would be to rename it in all version of mcData
  if (bot.supportFeature('fishingBobberCorrectlyNamed')) {
    bobberId = bot.registry.entitiesByName.fishing_bobber.id
  }

  let fishingTask = createDoneTask()
  let lastBobber = null

  bot._client.on('spawn_entity', (packet) => {
    if (packet.type === bobberId && !fishingTask.done && !lastBobber) {
      lastBobber = bot.entities[packet.entityId]
    }
  })

  bot._client.on('world_particles', (packet) => {
    if (!lastBobber || fishingTask.done) return

    const pos = lastBobber.position

    const bobberCondition = bot.registry.supportFeature('updatedParticlesPacket')
      ? ((packet.particle.type === 'fishing' || packet.particle.type === 'bubble') && packet.amount === 6 && pos.distanceTo(new Vec3(packet.x, pos.y, packet.z)) <= 1.23)
      // This "(particles.fishing ?? particles.bubble).id" condition doesn't make sense (these are both valid types)
      : (packet.particleId === (bot.registry.particlesByName.fishing ?? bot.registry.particlesByName.bubble).id && packet.particles === 6 && pos.distanceTo(new Vec3(packet.x, pos.y, packet.z)) <= 1.23)

    if (bobberCondition) {
      bot.activateItem()
      lastBobber = undefined
      fishingTask.finish()
    }
  })
  bot._client.on('entity_destroy', (packet) => {
    if (!lastBobber) return
    if (packet.entityIds.some(id => id === lastBobber.id)) {
      lastBobber = undefined
      fishingTask.cancel(new Error('Fishing cancelled'))
    }
  })

  async function fish () {
    if (!fishingTask.done) {
      fishingTask.cancel(new Error('Fishing cancelled due to calling bot.fish() again'))
    }

    fishingTask = createTask()

    bot.activateItem()

    await fishingTask.promise
  }

  bot.fish = fish
}
