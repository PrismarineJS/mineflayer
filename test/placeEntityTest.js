/* global describe, it */
const assert = require('assert')
const { EventEmitter } = require('events')
const { Vec3 } = require('vec3')
const registry = require('prismarine-registry')('1.20.4')
const injectPlaceEntity = require('../lib/plugins/place_entity')

function createBot () {
  const bot = new EventEmitter()
  bot.registry = registry
  bot.heldItem = { name: 'armor_stand' }
  bot.entity = { yaw: 0, pitch: 0 }
  bot.supportFeature = () => false
  bot._genericPlace = async () => new Vec3(0, 0, 0)
  bot._client = { write: () => {} }
  return bot
}

describe('place entity', function () {
  it('keeps waiting when an unrelated entity spawns first', async function () {
    const bot = createBot()
    injectPlaceEntity(bot)

    const placed = bot._placeEntityWithOptions({}, new Vec3(0, 1, 0), {})
    await Promise.resolve()

    assert.strictEqual(bot.listenerCount('entitySpawn'), 1)

    bot.emit('entitySpawn', {
      name: 'zombie',
      position: new Vec3(0, 1, 0)
    })
    assert.strictEqual(bot.listenerCount('entitySpawn'), 1)

    const armorStand = {
      name: 'armor_stand',
      position: new Vec3(0, 1, 0)
    }
    bot.emit('entitySpawn', armorStand)

    assert.strictEqual(await placed, armorStand)
    assert.strictEqual(bot.listenerCount('entitySpawn'), 0)
  })
})
