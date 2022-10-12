const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  const furnacePos = bot.entity.position.offset(2, 0, 0).floored()
  const coalId = bot.registry.itemsByName.coal.id
  const porkchopId = bot.registry.itemsByName.porkchop.id
  const cookedPorkchopId = bot.registry.itemsByName.cooked_porkchop.id
  const coalInputCount = 2
  const porkchopInputCount = 2

  // Test setup
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.furnace.id, 1))
  await bot.test.placeBlock(36, furnacePos)
  await bot.test.setInventorySlot(37, new Item(porkchopId, porkchopInputCount))
  await bot.test.setInventorySlot(38, new Item(coalId, coalInputCount)) // Get coal
  if (bot.supportFeature('itemsAreAlsoBlocks')) {
    assert.strictEqual(bot.blockAt(furnacePos).type, bot.registry.itemsByName.furnace.id)
  } else {
    assert.strictEqual(bot.blockAt(furnacePos).type, bot.registry.blocksByName.furnace.id)
  }

  // Put inputs
  const furnace = await bot.openFurnace(bot.blockAt(furnacePos))
  assert.strictEqual(furnace.inputItem(), furnace.slots[0])
  assert.strictEqual(furnace.fuelItem(), furnace.slots[1])
  assert.strictEqual(furnace.outputItem(), furnace.slots[2])
  assert.strictEqual(furnace.inputItem(), null)
  assert.strictEqual(furnace.fuelItem(), null)
  assert.strictEqual(furnace.outputItem(), null)

  await furnace.putFuel(coalId, null, coalInputCount)

  assert.strictEqual(furnace.fuelItem(), furnace.slots[1])
  assert.strictEqual(furnace.fuelItem().type, coalId)
  assert.strictEqual(furnace.fuelItem().count, coalInputCount)

  await furnace.putInput(porkchopId, null, porkchopInputCount)

  assert.strictEqual(furnace.inputItem(), furnace.slots[0])
  assert.strictEqual(furnace.inputItem().type, porkchopId)
  assert.strictEqual(furnace.inputItem().count, porkchopInputCount)

  // Wait and take the output and inputs
  await bot.test.wait(500)
  assert(furnace.fuel > 0 && furnace.fuel < 1)
  assert(furnace.progress > 0 && furnace.progress < 1)

  await bot.test.wait(furnace.progressSeconds * 1000 + 500)
  assert.strictEqual(furnace.outputItem(), furnace.slots[2])
  assert.strictEqual(furnace.outputItem().type, cookedPorkchopId)
  assert.strictEqual(furnace.outputItem().count, 1)

  assert.strictEqual(furnace.inputItem().type, porkchopId)
  assert.strictEqual(furnace.inputItem().count, porkchopInputCount - 1)

  assert.strictEqual(furnace.fuelItem().type, coalId)
  assert.strictEqual(furnace.fuelItem().count, coalInputCount - 1)

  await furnace.takeOutput()
  await furnace.takeInput()
  await furnace.takeFuel()
  furnace.close()

  await bot.test.wait(500)

  // Check inventory
  const cookedPorkchopCount = bot.inventory.count(cookedPorkchopId)
  const porkchopCount = bot.inventory.count(porkchopId)
  const coalCount = bot.inventory.count(coalId)

  assert.strictEqual(cookedPorkchopCount, 1)
  assert.strictEqual(porkchopCount, porkchopInputCount - 1)
  assert.strictEqual(coalCount, coalInputCount - 1)
}
