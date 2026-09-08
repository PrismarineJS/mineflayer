/* eslint-env mocha */
const assert = require('assert')
const { EventEmitter } = require('events')
const { Vec3 } = require('vec3')
const inject = require('../lib/plugins/inventory')

describe('observed block inventories', () => {
  let bot, Item, position
  beforeEach(() => {
    bot = new EventEmitter()
    bot.version = '1.21.4'
    bot.registry = require('prismarine-registry')(bot.version)
    bot.supportFeature = name => bot.registry.supportFeature(name)
    bot._client = new EventEmitter()
    bot._client.write = () => {}
    bot.QUICK_BAR_START = 36
    bot.entity = { id: 1 }
    const World = require('prismarine-world')(bot.version)
    const Chunk = require('prismarine-chunk')(bot.version)
    bot.world = new World().sync
    bot.world.setColumn(0, 0, new Chunk())
    position = new Vec3(2, 64, 3)
    bot.world.setBlockStateId(position, bot.registry.blocksByName.chest.defaultState)
    Item = require('prismarine-item')(bot.registry)
    inject(bot, {})
  })

  function item (count) { return new Item(bot.registry.itemsByName.stone.id, count) }
  function contents (count = 3, size = 27) {
    const slots = Array(size + 36).fill(null)
    slots[0] = item(count)
    slots[size] = item(19)
    return slots.map(Item.toNotch)
  }
  function packet (name, fields) { bot._client.emit(name, fields) }
  async function open ({ buffered = false, size = 27 } = {}) {
    bot.activateBlock = () => setImmediate(() => {
      const data = { windowId: 1, stateId: 1, items: contents(3, size) }
      if (buffered) packet('window_items', data)
      packet('open_window', { windowId: 1, inventoryType: size === 54 ? 'minecraft:generic_9x6' : 'minecraft:generic_9x3', windowTitle: 'Chest' })
      if (!buffered) packet('window_items', data)
    })
    return bot.openBlock(bot.world.getBlock(position))
  }
  function observation () { return bot.world.getObservedBlockInventory(position) }

  for (const buffered of [false, true]) {
    it(`records server contents with buffered=${buffered}, excluding player slots`, async () => {
      assert.strictEqual(observation(), null)
      const raw = { value: { sentinel: { type: 'int', value: 123 } } }
      bot.world.setBlockEntity(position, raw)
      await open({ buffered })
      assert.strictEqual(observation().slots.length, 27)
      assert.strictEqual(observation().slots[0].count, 3)
      assert.strictEqual(observation().stale, false)
      assert.strictEqual(bot.world.getBlockEntity(position), raw)
      const copy = observation()
      copy.slots[0].count = 99
      assert.strictEqual(observation().slots[0].count, 3)
    })
  }

  it('records server slot changes but never optimistic clicks or player changes', async () => {
    const window = await open()
    window.updateSlot(0, item(42))
    assert.strictEqual(observation().slots[0].count, 3)
    packet('set_slot', { windowId: 1, stateId: 2, slot: 0, item: Item.toNotch(item(8)) })
    assert.strictEqual(observation().slots[0].count, 8)
    packet('set_slot', { windowId: 1, stateId: 3, slot: 27, item: Item.toNotch(item(55)) })
    assert.strictEqual(observation().slots.length, 27)
    window.updateSlot(0, item(44))
    packet('close_window', { windowId: 1 })
    assert.strictEqual(observation().slots[0].count, 8)
    assert.strictEqual(observation().stale, true)
    packet('set_slot', { windowId: 1, stateId: 4, slot: 0, item: Item.toNotch(item(9)) })
    assert.strictEqual(observation().slots[0].count, 8)
  })

  it('replaces its snapshot on a full server update and retains item components', async () => {
    await open()
    packet('window_items', { windowId: 1, stateId: 2, items: contents(11) })
    assert.strictEqual(observation().slots[0].count, 11)
    assert(observation().slots[0].componentMap instanceof Map)
    packet('set_slot', { windowId: 1, stateId: 3, slot: 0, item: Item.toNotch(null) })
    assert.strictEqual(observation().slots[0], null)
  })

  for (const invalidate of ['unload', 'replace', 'respawn', 'login', 'end', 'nbt']) {
    it(`forgets contents after ${invalidate} and ignores remaining packets`, async () => {
      await open()
      if (invalidate === 'unload') bot.world.unloadColumn(0, 0)
      else if (invalidate === 'replace') bot.world.setBlockStateId(position, bot.registry.blocksByName.stone.defaultState)
      else if (invalidate === 'nbt') bot.world.setBlockEntity(position, { value: {} })
      else if (invalidate === 'end') bot.emit('end')
      else packet(invalidate, {})
      assert.strictEqual(observation(), null)
      packet('window_items', { windowId: 1, stateId: 4, items: contents(12) })
      assert.strictEqual(observation(), null)
    })
  }

  it('stores a double chest window at the clicked position without guessing its other half', async () => {
    await open({ size: 54 })
    assert.strictEqual(observation().slots.length, 54)
    assert.strictEqual(bot.world.getObservedBlockInventory(position.offset(1, 0, 0)), null)
  })

  it('does not expose personal ender chest contents as block storage', async () => {
    bot.world.setBlockStateId(position, bot.registry.blocksByName.ender_chest.defaultState)
    await open()
    assert.strictEqual(observation(), null)
  })

  it('does not assign entity storage to a previously opened block', async () => {
    await open()
    bot.activateEntity = () => setImmediate(() => {
      packet('open_window', { windowId: 2, inventoryType: 'minecraft:generic_9x3', windowTitle: 'Minecart' })
      packet('window_items', { windowId: 2, stateId: 1, items: contents(22) })
    })
    await bot.openEntity({ id: 10 })
    assert.strictEqual(observation().slots[0].count, 3)
    assert.strictEqual(observation().stale, true)
  })

  it('rejects overlapping block and entity requests before attribution becomes ambiguous', async () => {
    const opening = open()
    await assert.rejects(bot.openEntity({ id: 10 }), /already being opened/)
    await opening
    assert.strictEqual(observation().slots[0].count, 3)
  })

  it('marks the previous observation stale when another window opens without a close packet', async () => {
    await open()
    packet('open_window', { windowId: 2, inventoryType: 'minecraft:generic_9x3', windowTitle: 'Other' })
    packet('window_items', { windowId: 2, stateId: 1, items: contents(7) })
    assert.strictEqual(observation().stale, true)
    assert.strictEqual(observation().slots[0].count, 3)
  })
})
