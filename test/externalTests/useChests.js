const { Vec3 } = require('vec3')
const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  bot.test.groundY = bot.supportFeature('tallWorld') ? -60 : 4

  const smallChestLocation = new Vec3(0, bot.test.groundY, -1)
  const largeChestLocations = [new Vec3(0, bot.test.groundY, 1), new Vec3(1, bot.test.groundY, 1)]
  const smallTrappedChestLocation = new Vec3(1, bot.test.groundY, 0)
  const largeTrappedChestLocations = [
    new Vec3(-1, bot.test.groundY, 1),
    new Vec3(-1, bot.test.groundY, 0)
  ]
  const chestSlot = 36
  const trappedChestSlot = 37
  const boneSlot = 38

  let blockItemsByName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    blockItemsByName = 'itemsByName'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    blockItemsByName = 'blocksByName'
  }

  const chestBlockId = bot.registry.blocksByName.chest.id
  const trappedChestBlockId = bot.registry.blocksByName.trapped_chest.id

  function itemByName (items, name) {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i]
      if (item && item.name === name) return item
    }
    return null
  }

  async function depositBones (chestLocation, count) {
    const chest = await bot.openContainer(bot.blockAt(chestLocation))
    assert(chest.containerItems().length === 0)
    assert(chest.items().length > 0)
    const name = 'bone'
    const item = itemByName(chest.items(), name)
    if (!item) {
      bot.test.sayEverywhere(`unknown item ${name}`)
      throw new Error(`unknown item ${name}`)
    }
    await chest.deposit(item.type, null, count)
    chest.close()
  }

  async function withdrawBones (chestLocation, count) {
    const chest = await bot.openContainer(bot.blockAt(chestLocation))
    const name = 'bone'
    const item = itemByName(chest.containerItems(), name)
    if (!item) {
      bot.test.sayEverywhere(`unknown item ${name}`)
      throw new Error(`unknown item ${name}`)
    }
    await chest.withdraw(item.type, null, count)
    assert(chest.containerItems().length === 0)
    assert(chest.items().length > 0)
    chest.close()
  }

  await bot.test.setInventorySlot(chestSlot, new Item(bot.registry[blockItemsByName].chest.id, 3, 0))
  await bot.test.setInventorySlot(trappedChestSlot, new Item(bot.registry[blockItemsByName].trapped_chest.id, 3, 0))
  await bot.test.setInventorySlot(boneSlot, new Item(bot.registry.itemsByName.bone.id, 3, 0))

  await bot.test.becomeSurvival()

  // place the chests around us
  await bot.test.placeBlock(chestSlot, largeChestLocations[0])
  await bot.test.placeBlock(chestSlot, largeChestLocations[1])
  await bot.test.placeBlock(chestSlot, smallChestLocation)
  await bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[0])
  await bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[1])
  await bot.test.placeBlock(trappedChestSlot, smallTrappedChestLocation)

  assert.strictEqual(bot.blockAt(largeChestLocations[0]).type, chestBlockId)
  assert.strictEqual(bot.blockAt(largeChestLocations[1]).type, chestBlockId)
  assert.strictEqual(bot.blockAt(smallChestLocation).type, chestBlockId)
  assert.strictEqual(bot.blockAt(largeTrappedChestLocations[0]).type, trappedChestBlockId)
  assert.strictEqual(bot.blockAt(largeTrappedChestLocations[1]).type, trappedChestBlockId)
  assert.strictEqual(bot.blockAt(smallTrappedChestLocation).type, trappedChestBlockId)

  // Test that "chestLidMove" is emitted only once when opening a double chest
  let emitted = false
  bot.on('chestLidMove', handler)
  async function handler (block, isOpen, block2) {
    if (emitted) {
      assert.fail(new Error('chestLidMove emitted twice'))
    } else {
      emitted = true

      let blockAssert = false; let block2Assert = false
      for (const location of largeChestLocations) {
        if (location.equals(block.position)) blockAssert = true
        if (location.equals(block2.position)) block2Assert = true
      }
      assert(blockAssert && block2Assert, new Error('The block instance emitted by chestLidMove is not part of the chest oppened'))
      assert.strictEqual(isOpen, 1, new Error('isOpen should be 1 when opened by one only player'))

      await bot.test.wait(500)

      bot.removeListener('chestLidMove', handler)
      chest.close()
    }
  }
  const chest = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
  await once(chest, 'close')

  await depositBones(smallChestLocation, 1)
  await depositBones(largeChestLocations[0], 2)

  assert(bot.inventory.items().length === 0)

  await withdrawBones(smallChestLocation, 1)
  await withdrawBones(largeChestLocations[0], 2)

  await depositBones(smallTrappedChestLocation, 1)
  await depositBones(largeTrappedChestLocations[0], 2)

  assert(bot.inventory.items().length === 0)

  await withdrawBones(smallTrappedChestLocation, 1)
  await withdrawBones(largeTrappedChestLocations[0], 2)

  const itemsWithStackSize = {
    64: ['stone', 'mycelium'],
    16: ['ender_pearl', 'egg'],
    1: ['fishing_rod', 'bow']
  }

  function getRandomStackableItem () {
    if (Math.random() < 0.75) {
      return itemsWithStackSize[64][~~(Math.random() * itemsWithStackSize[64].length)]
    } else {
      if (Math.random() < 0.5) {
        return itemsWithStackSize[16][~~(Math.random() * itemsWithStackSize[16].length)]
      } else {
        return itemsWithStackSize[1][~~(Math.random() * itemsWithStackSize[1].length)]
      }
    }
  }

  async function createRandomLayout (window, slotPopulationFactor) {
    await bot.test.becomeCreative()

    // Wait for the given item to show up in hotbar.0. Depending on version and
    // which container is open, the server syncs it either through the open
    // window or directly to the inventory, so listen on both.
    const waitHotbarItem = (item, timeout) => new Promise((resolve) => {
      const timer = setTimeout(() => {
        window.off('updateSlot', onWin)
        bot.inventory.off('updateSlot', onInv)
        resolve(false)
      }, timeout)
      const ok = newItem => newItem?.name === item
      const onWin = (slot, oldItem, newItem) => { if (slot === window.hotbarStart && ok(newItem)) done() }
      const onInv = (slot, oldItem, newItem) => { if (slot === 36 && ok(newItem)) done() }
      function done () {
        clearTimeout(timer)
        window.off('updateSlot', onWin)
        bot.inventory.off('updateSlot', onInv)
        resolve(true)
      }
      window.on('updateSlot', onWin)
      bot.inventory.on('updateSlot', onInv)
    })

    // The server silently drops chat commands sent too close together, so
    // resend if the item has not arrived shortly after the command.
    const sendItemToHotbar = async (name, count) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        bot.chat(`/item replace entity ${bot.username} hotbar.0 with ${name} ${count}`)
        if (await waitHotbarItem(name, 500)) return
      }
      throw new Error(`item ${name} never reached the hotbar`)
    }

    for (let slot = 0; slot < window.inventoryStart; slot++) {
      if (Math.random() < slotPopulationFactor) {
        const randomItem = getRandomStackableItem()
        const item = bot.registry.itemsByName[randomItem]
        const count = Math.ceil(Math.random() * item.stackSize)
        if (bot.registry.version['>=']('1.17')) {
          // /item replace lands the item in a specific slot deterministically,
          // so there is no race with the previous move (unlike /give, which
          // targets the first empty slot and needs a settle delay).
          await sendItemToHotbar(item.name, count)
        } else {
          bot.chat(`/give ${bot.username} ${item.name} ${count}`)
          if (!await waitHotbarItem(item.name, 5000)) throw new Error(`item ${item.name} never reached the hotbar`)
          await bot.test.wait(100)
        }

        // await bot.clickWindow(slot, 0, 2)
        await bot.moveSlotItem(window.hotbarStart, slot)
      }
    }

    await bot.test.becomeSurvival()
  }

  // Each left/right click resolves differently depending on whether the cursor
  // is holding something and what is in the target slot, so every case needs
  // its own precondition rather than another random click.
  async function testClickTransitions (window) {
    const held = () => window.selectedItem
    const find = (pred) => {
      for (let i = 0; i < window.inventoryStart; i++) {
        if (pred(window.slots[i], i)) return i
      }
      return -1
    }

    assert.ok(!held(), 'cursor must start empty')

    // Needs more than 2 so there is still something on the cursor after placing
    // one, and something left to merge back.
    const a = find(s => s !== null && s.count > 2)
    assert.notStrictEqual(a, -1, 'expected an occupied slot holding more than 2')
    const taken = { type: window.slots[a].type, count: window.slots[a].count }
    await bot.clickWindow(a, 0, 0)
    assert.ok(held(), 'left click on an occupied slot should take it')
    assert.strictEqual(held().type, taken.type)
    assert.strictEqual(held().count, taken.count)
    assert.strictEqual(window.slots[a], null)

    // holding + empty slot, right click -> place exactly one
    await bot.clickWindow(a, 1, 0)
    assert.ok(window.slots[a], 'right click on an empty slot should place one')
    assert.strictEqual(window.slots[a].count, 1)
    assert.strictEqual(held().count, taken.count - 1)

    // holding + occupied slot of the same type -> merge into it. The slot holds
    // 1 and the cursor the rest of the same stack, so all of it fits and the
    // cursor is left empty.
    await bot.clickWindow(a, 0, 0)
    assert.strictEqual(window.slots[a].type, taken.type)
    assert.strictEqual(window.slots[a].count, taken.count, 'the whole stack should merge back')
    assert.ok(!held(), 'a merge that fits should empty the cursor')

    // holding + occupied slot of a different type -> swap
    await bot.clickWindow(a, 0, 0)
    assert.ok(held(), 'expected to be holding the merged stack')
    const other = find((s, i) => s !== null && i !== a && s.type !== held().type)
    assert.notStrictEqual(other, -1, 'expected a slot holding a different item type')
    const there = { type: window.slots[other].type, count: window.slots[other].count }
    const cursor = { type: held().type, count: held().count }
    await bot.clickWindow(other, 0, 0)
    assert.strictEqual(window.slots[other].type, cursor.type, 'swap should leave the cursor item in the slot')
    assert.strictEqual(window.slots[other].count, cursor.count)
    assert.strictEqual(held().type, there.type, 'swap should leave the slot item on the cursor')
    assert.strictEqual(held().count, there.count)

    // holding + empty slot -> drop the whole stack
    await bot.clickWindow(a, 0, 0)
    assert.ok(!held(), 'left click on an empty slot should drop the whole stack')
    assert.strictEqual(window.slots[a].type, there.type)

    // empty cursor + occupied slot, right click -> take half
    const big = find(s => s !== null && s.count > 1)
    assert.notStrictEqual(big, -1, 'expected a slot holding more than 1')
    const whole = window.slots[big].count
    await bot.clickWindow(big, 1, 0)
    assert.ok(held(), 'right click on an occupied slot should take half')
    assert.strictEqual(held().count + (window.slots[big]?.count ?? 0), whole, 'the halves should account for the whole stack')
    await bot.clickWindow(big, 0, 0)
    assert.ok(!held(), 'putting the half back should empty the cursor')

    // shift click moves the stack out of the chest entirely
    const move = find(s => s !== null)
    assert.notStrictEqual(move, -1, 'expected an occupied slot to shift click')
    await bot.clickWindow(move, 0, 1)
    assert.strictEqual(window.slots[move], null, 'shift click should empty the chest slot')
  }

  async function testMouseClick (window, clicks) {
    // mouseButton/mode pairs. Mode 0 alone only reaches pick up, place, merge
    // and swap; quick move and collect-to-cursor are separate server paths.
    // Modes 5 and 6 are assert-unimplemented in prismarine-windows, and mode 3
    // is creative-only, so this is the reachable set from survival.
    const ops = [
      [0, 0], // left click: pick up / place / swap
      [1, 0], // right click: half stack / place one
      [0, 1] // shift click: quick move
    ]
    let iterations = 0
    while (iterations++ < clicks) {
      const [mouseButton, mode] = ops[iterations % ops.length]
      await bot.clickWindow(~~(Math.random() * window.inventoryStart), mouseButton, mode)
    }
  }

  function clearLargeChest () {
    bot.chat(`/setblock ${largeChestLocations[0].x} ${largeChestLocations[0].y} ${largeChestLocations[0].z} chest`)
    bot.chat(`/setblock ${largeChestLocations[1].x} ${largeChestLocations[1].y} ${largeChestLocations[1].z} chest`)
  }

  const window = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
  await createRandomLayout(window, 0.95)

  await testClickTransitions(window)
  await testMouseClick(window, 50)

  window.close()
  clearLargeChest()
}
