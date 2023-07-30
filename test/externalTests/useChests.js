const { Vec3 } = require('vec3')
const assert = require('assert')
const { once } = require('events')
const { onceWithCleanup } = require('../../lib/promise_utils')

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

  const itemsWith64Stacks = bot.registry.itemsArray.filter(item => item.stackSize === 64)
  itemsWith64Stacks.length = 3

  const itemsWith16Stacks = bot.registry.itemsArray.filter(item => item.stackSize === 16)
  itemsWith64Stacks.length = 3

  const itemsWith1Stacks = bot.registry.itemsArray.filter(item => item.stackSize === 1)
  itemsWith64Stacks.length = 3

  function getRandomStackableItem () {
    if (Math.random() < 0.75) {
      return itemsWith64Stacks[~~(Math.random() * itemsWith64Stacks.length)]
    } else {
      if (Math.random() < 0.5) {
        return itemsWith16Stacks[~~(Math.random() * itemsWith16Stacks.length)]
      } else {
        return itemsWith1Stacks[~~(Math.random() * itemsWith1Stacks.length)]
      }
    }
  }

  async function createRandomLayout (window, slotPopulationFactor) {
    await bot.test.becomeCreative()

    for (let slot = 0; slot < window.slots.length; slot++) {
      if (Math.random() < slotPopulationFactor) {
        const item = getRandomStackableItem()
        bot.chat(`/give ${bot.username} ${item.name} ${Math.ceil(Math.random() * item.stackSize)}`)
        await onceWithCleanup(window, 'updateSlot', { checkCondition: (slot, oldItem, newItem) => newItem?.name === item.name })

        // await bot.clickWindow(slot, 0, 2)
        await bot.moveSlotItem(window.hotbarStart, slot)
      }
    }

    await bot.test.becomeSurvival()
  }

  async function testMouseClick (window, clicks) {
    let iterations = 0
    while (iterations++ < clicks) {
      const populatedSlots = window.slots.filter(stack => stack !== null).map(slot => slot.slot)
      const clickPopulated = Math.random() < 0.75
      await bot.clickWindow(clickPopulated ? populatedSlots[~~(Math.random() * populatedSlots.length)] : ~~(Math.random() * window.inventoryEnd), 0, 0)
    }
  }

  /*
  async function testShiftClick (window, clicks) {
    let iterations = 0
    while (iterations++ < clicks) {
      await bot.clickWindow(~~(Math.random() * window.inventoryEnd), 0, 1)
    }
  }

  async function testNumberClick (window, clicks) {
    let iterations = 0
    while (iterations++ < clicks) {
      await bot.clickWindow(~~(Math.random() * window.inventoryEnd), ~~(Math.random() * 8), 2)
    }
  }
  */

  function clearLargeChest () {
    bot.chat(`/setblock ${largeChestLocations[0].x} ${largeChestLocations[0].y} ${largeChestLocations[0].z} chest`)
    bot.chat(`/setblock ${largeChestLocations[1].x} ${largeChestLocations[1].y} ${largeChestLocations[1].z} chest`)
  }

  const window = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
  await createRandomLayout(window, 0.3)

  await testMouseClick(window, 250)

  window.close()
  clearLargeChest()
  // tests for more click modes
  /*
  window = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
  await bot.test.clearInventory()
  await createRandomLayout(window)

  await testShiftClick(window, 250)

  window.close()
  clearLargeChest()
  window = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
  await bot.test.clearInventory()
  await createRandomLayout(window)

  await testNumberClick(window, 250)

  window.close()
  clearLargeChest()
  */
}
