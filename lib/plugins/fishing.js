const { Vec3 } = require('vec3')
const { actionCreateDone, actions } = require('../actionUtil')

module.exports = inject

function inject (bot) {
  let bobberId = 90
  // Before 1.14 the bobber entity keep changing name at each version (but the id stays 90)
  // 1.14 changes the id, but hopefully we can stick with the name: fishing_bobber
  // the alternative would be to rename it in all version of mcData
  if (bot.supportFeature('fishingBobberCorrectlyNamed')) {
    bobberId = bot.registry.entitiesByName.fishing_bobber.id
  }

  let fishingAction = actionCreateDone()
  let lastBobber = null

  bot._client.on('spawn_entity', (packet) => {
    if (packet.type === bobberId && !fishingAction.done && !lastBobber) {
      lastBobber = bot.entities[packet.entityId]
    }
  })

  bot._client.on('world_particles', (packet) => {
    if (!lastBobber || fishingAction.done) return

    const pos = lastBobber.position
    const parts = bot.registry.particlesByName
    if (packet.particleId === (parts?.fishing ?? parts.bubble).id && packet.particles === 6 && pos.distanceTo(new Vec3(packet.x, pos.y, packet.z)) <= 1.23) {
      bot.activateItem()
      lastBobber = undefined
      fishingAction.finish()
    }
  })
  bot._client.on('entity_destroy', (packet) => {
    if (!lastBobber) return
    if (packet.entityIds.some(id => id === lastBobber.id)) {
      lastBobber = undefined
      fishingAction.cancel(new Error('Fishing cancelled'))
    }
  })

  async function fish () {
    if (!fishingAction.done) {
      fishingAction.cancel(new Error('Fishing cancelled due to calling bot.fish() again'))
    }

    // await actionWaitCompatibility(actions.fishing_fish)
    fishingAction = bot.actionCreateCompatible(actions.fishing_fish)

    bot.activateItem()

    await fishingAction.promise
  }

  bot.fish = fish
}
