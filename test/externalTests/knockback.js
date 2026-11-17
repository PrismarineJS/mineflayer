const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

const horizontal = (v) => Math.sqrt(v.x * v.x + v.z * v.z)

module.exports = () => {
  const tests = {}

  tests.hitByZombie = async (bot) => {
    const zombie = bot.registry.entitiesByName.zombie ? 'zombie' : 'Zombie'
    await bot.test.becomeSurvival()
    await bot.test.awaitCommandsProcessed('knockback-survival')

    // The first velocity the server gives the bot after a hit, read right after mineflayer applied it
    const hit = onceWithCleanup(bot._client, 'entity_velocity', {
      timeout: 20000,
      checkCondition: (packet) => packet.entityId === bot.entity.id && (packet.velocity.x !== 0 || packet.velocity.z !== 0)
    }).then(() => ({ velocity: bot.entity.velocity.clone(), position: bot.entity.position.clone() }))
    bot.chat(`/summon ${zombie} ~1 ~ ~`)
    const { velocity, position } = await hit
    await bot.waitForTicks(10)
    const moved = horizontal(bot.entity.position.minus(position))

    bot.chat(`/kill @e[type=${zombie}]`)
    await bot.test.becomeCreative()

    // A hit gives about 0.4 blocks a tick, sideways
    assert.ok(horizontal(velocity) > 0.1 && horizontal(velocity) < 2, `velocity after the hit: ${velocity}`)
    assert.ok(moved > 0.3, `moved ${moved} blocks in the 10 ticks after the hit`)
  }

  tests.spawnedEntity = async (bot) => {
    const snowball = bot.registry.entitiesByName.snowball ? 'snowball' : 'Snowball'
    let velocity = null
    // 1.8 sends no velocity with a snowball's spawn, only with the next entity_velocity
    const listener = (packet) => {
      const entity = bot.entities[packet.entityId]
      if (velocity === null && entity?.name?.toLowerCase() === 'snowball' && packet.velocity) velocity = entity.velocity.clone()
    }
    bot._client.on('spawn_entity', listener)
    bot._client.on('entity_velocity', listener)
    try {
      const spawned = onceWithCleanup(bot, 'entitySpawn', { timeout: 10000, checkCondition: (e) => e.name?.toLowerCase() === 'snowball' })
      bot.chat(`/summon ${snowball} ~ ~10 ~ {Motion:[0.0,0.0,0.5],NoGravity:1b}`)
      await spawned
      for (let i = 0; i < 40; i++) {
        if (velocity !== null) break
        await bot.waitForTicks(1)
      }
    } finally {
      bot._client.removeListener('spawn_entity', listener)
      bot._client.removeListener('entity_velocity', listener)
      bot.chat(`/kill @e[type=${snowball}]`)
    }
    // Summoned at 0.5 blocks a tick along z; drag takes a little off before the server sends it
    assert.ok(velocity !== null, 'no velocity for the snowball')
    assert.ok(velocity.z > 0.3 && velocity.z < 0.6, `snowball velocity: ${velocity}`)
  }

  return tests
}
