const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  const [client] = await once(server, 'playerJoin')
  const abilitiesEvent = once(bot, 'abilities')
  client.write('login', bot.test.generateLoginPacket())
  await once(bot, 'login')
  // Abilities' own defaults hold until the server sends the packet
  assert.deepStrictEqual(bot.abilities, {
    invulnerable: false,
    flying: false,
    mayFly: false,
    instantBuild: false,
    flyingSpeed: 0.05,
    walkingSpeed: 0.1
  })
  client.write('abilities', { flags: 7, flyingSpeed: 0.05, walkingSpeed: 0.1 })
  const [abilities] = await abilitiesEvent
  assert.strictEqual(abilities.invulnerable, true)
  assert.strictEqual(abilities.flying, true)
  assert.strictEqual(abilities.mayFly, true)
  assert.strictEqual(abilities.instantBuild, false)
  assert.strictEqual(abilities.flyingSpeed, 0.05000000074505806)
  assert.strictEqual(abilities.walkingSpeed, 0.10000000149011612)
  assert.strictEqual(bot.abilities, abilities)
  // prismarine-physics reads the flight state off the entity
  assert.strictEqual(bot.entity.flying, true)
}
