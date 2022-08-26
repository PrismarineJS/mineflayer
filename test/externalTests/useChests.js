const { Vec3 } = require('vec3')
const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

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

  const chestBlockId = mcData.blocksByName.chest.id
  const trappedChestBlockId = mcData.blocksByName.trapped_chest.id

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

  await bot.test.setInventorySlot(chestSlot, new Item(mcData[blockItemsByName].chest.id, 3, 0))
  await bot.test.setInventorySlot(trappedChestSlot, new Item(mcData[blockItemsByName].trapped_chest.id, 3, 0))
  await bot.test.setInventorySlot(boneSlot, new Item(mcData.itemsByName.bone.id, 3, 0))

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
}
