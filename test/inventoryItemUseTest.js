/* eslint-env mocha */

const assert = require('assert')
const { EventEmitter } = require('events')
const injectInventory = require('../lib/plugins/inventory')
const registry = require('prismarine-registry')('1.21.4')

function createBot () {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot._client.write = () => {}
  bot.registry = registry
  bot.version = registry.version.minecraftVersion
  bot.supportFeature = registry.supportFeature
  bot.entity = { id: 1, yaw: 0, pitch: 0 }
  bot.QUICK_BAR_START = 36
  bot.game = { gameMode: 'survival' }
  bot.food = 19
  injectInventory(bot, { hideErrors: false })
  bot.quickBarSlot = 0
  return bot
}

describe('inventory item use and entity status', () => {
  for (const entityStatus of [2, 3, 9, 29]) {
    it(`keeps using an item when another entity receives status ${entityStatus}`, () => {
      const bot = createBot()
      bot.activateItem()
      bot._client.emit('entity_status', { entityId: 2, entityStatus })
      assert.strictEqual(bot.usingHeldItem, true)
      bot.deactivateItem()
      assert.strictEqual(bot.usingHeldItem, false)
    })
  }

  it('finishes consuming only when the bot receives its completion status', async () => {
    const bot = createBot()
    const Item = require('prismarine-item')(registry)
    bot.inventory.slots[36] = new Item(registry.itemsByName.bread.id, 1)
    const consumed = bot.consume()
    assert.strictEqual(bot.usingHeldItem, true)
    bot._client.emit('entity_status', { entityId: 2, entityStatus: 9 })
    const usingAfterOtherEntity = bot.usingHeldItem
    bot._client.emit('entity_status', { entityId: bot.entity.id, entityStatus: 9 })
    await consumed
    assert.strictEqual(usingAfterOtherEntity, true)
    assert.strictEqual(bot.usingHeldItem, false)
  })
})
