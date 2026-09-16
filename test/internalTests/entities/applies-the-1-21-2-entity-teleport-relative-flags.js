const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../../lib/promise_utils')

module.exports = async function (bot, server) {
  if (!bot.supportFeature('entityTeleportHasRelativeFlags')) {
    this.skip()
    return
  }
  const client = (await once(server, 'playerJoin'))[0]
  const spawned = once(bot, 'entitySpawn')
  client.write('spawn_entity', {
    entityId: 8,
    objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
    type: bot.registry.entitiesByName.creeper.id,
    x: 10,
    y: 11,
    z: 12,
    yaw: 0,
    pitch: 0,
    headPitch: 0,
    velocity: { x: 0, y: 0, z: 0 },
    objectData: 0
  })
  const entity = (await spawned)[0]
  const teleport = async (extra) => {
    const moved = once(bot, 'entityMoved')
    client.write('entity_teleport', { entityId: 8, x: 10, y: 11, z: 12, dx: 0, dy: 0, dz: 0, yaw: 0, pitch: 0, flags: {}, onGround: false, ...extra })
    await moved
  }
  entity.velocity.set(0.25, 0.5, 0)
  await teleport({ x: 1, y: 2, z: 3, dx: 0.5, dz: 0.125, yaw: 90, pitch: 10 })
  assert.deepStrictEqual(entity.position, vec3(1, 2, 3), 'absolute position')
  assert.deepStrictEqual(entity.velocity, vec3(0.5, 0, 0.125), 'absolute velocity from the packet')
  assert.ok(Math.abs(entity.yaw - Math.PI / 2) < 1e-6 && Math.abs(entity.pitch + 10 * Math.PI / 180) < 1e-6, 'float rotation')
  await teleport({ x: 1, y: -1, dx: 0.5, dy: 0.5, yaw: 90, flags: { x: true, y: true, dx: true, dy: true, yaw: true } })
  assert.deepStrictEqual(entity.position, vec3(2, 1, 12), 'flagged axes add to the current position')
  assert.deepStrictEqual(entity.velocity, vec3(1, 0.5, 0), 'flagged axes add to the current velocity, the rest are absolute')
  assert.ok(Math.abs(entity.yaw) < 1e-6, 'flagged yaw adds to the current yaw')
  await teleport({ yaw: 0 })
  entity.velocity.set(1, 0, 0)
  await teleport({ yaw: 90, flags: { yawDelta: true, dx: true, dz: true } })
  assert.ok(Math.abs(entity.velocity.x) < 1e-6 && Math.abs(entity.velocity.z - 1) < 1e-6, `yawDelta turns the velocity with the rotation change: ${entity.velocity}`)
}
