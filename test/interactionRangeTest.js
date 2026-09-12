/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events')
const Vec3 = require('vec3').Vec3
const registryLoader = require('prismarine-registry')

// entities.js only needs a registry, a packet source and an entity to hang the helpers off.
function fakeBot (version = '1.21.4') {
  const registry = registryLoader(version)
  const bot = new EventEmitter()
  bot.registry = registry
  bot.version = version
  bot.supportFeature = registry.supportFeature.bind(registry)
  bot._client = new EventEmitter()
  bot._client.write = () => {}
  bot.entities = {}
  bot.players = {}
  bot.entity = { id: 1, position: new Vec3(0.5, 64, 0.5), eyeHeight: 1.62, width: 0.6, height: 1.8 }
  require('../lib/plugins/entities')(bot, {})
  bot.entity = bot.entities[1] ?? bot.entity
  bot.entity.position = new Vec3(0.5, 64, 0.5)
  bot.entity.eyeHeight = 1.62
  return bot
}

const villagerAt = (x, y, z) => ({ position: new Vec3(x, y, z), width: 0.6, height: 1.95, name: 'villager' })

describe('interaction range', () => {
  it('falls back to the vanilla defaults when the server sends no attributes', () => {
    const bot = fakeBot()
    assert.strictEqual(bot.entityInteractionRange(), 3.0)
    assert.strictEqual(bot.blockInteractionRange(), 4.5)
  })

  it('reads the values the server sends, whatever key they arrive under', () => {
    const bot = fakeBot()
    bot.entity.attributes = {
      'player.entity_interaction_range': { value: 6, modifiers: [] },
      'minecraft:block_interaction_range': { value: 9.5, modifiers: [] }
    }
    assert.strictEqual(bot.entityInteractionRange(), 6)
    assert.strictEqual(bot.blockInteractionRange(), 9.5)
  })

  it('applies attribute modifiers', () => {
    const bot = fakeBot()
    bot.entity.attributes = { 'player.entity_interaction_range': { value: 3, modifiers: [{ operation: 0, amount: 2 }] } }
    assert.strictEqual(bot.entityInteractionRange(), 5)
  })

  it('measures from the eye to the target hitbox, as vanilla does', () => {
    // The live measurement this came from: a shopkeeper this bot could not open at 3.15 blocks of
    // feet-to-feet distance, and could at 2.80.
    const bot = fakeBot()
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    assert.strictEqual(bot.canInteractWithEntity(villagerAt(0.5, 64, 3.65)), true, '3.15 feet-to-feet is 2.85 eye-to-box')
    assert.strictEqual(bot.canInteractWithEntity(villagerAt(0.5, 64, 4.06)), false, '3.56 feet-to-feet is out of reach')
  })

  it('lets the caller ask with the slack the server allows itself', () => {
    const bot = fakeBot()
    const far = villagerAt(0.5, 64, 5.5)
    assert.strictEqual(bot.canInteractWithEntity(far), false)
    assert.strictEqual(bot.canInteractWithEntity(far, 3.0), true)
  })

  it('measures a block against its own cube', () => {
    const bot = fakeBot()
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    assert.strictEqual(bot.canInteractWithBlock({ position: new Vec3(0, 64, 4) }), true)
    assert.strictEqual(bot.canInteractWithBlock({ position: new Vec3(0, 64, 7) }), false)
  })
})
