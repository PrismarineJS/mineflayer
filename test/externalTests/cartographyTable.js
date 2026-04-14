const assert = require('assert')

module.exports = () => async (bot) => {
  if (bot.registry.isOlderThan('1.14')) return

  const Item = require('prismarine-item')(bot.registry)

  const cartographyTablePos = bot.entity.position.offset(2, 0, 0).floored()
  const mapId = bot.registry.itemsByName.map.id
  const paperId = bot.registry.itemsByName.paper.id

  const cartographyTableBlockId = bot.registry.blocksByName.cartography_table.id

  let blockItemsByName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    blockItemsByName = 'itemsByName'
  } else {
    blockItemsByName = 'blocksByName'
  }

  // Test setup
  await bot.test.setInventorySlot(36, new Item(bot.registry[blockItemsByName].cartography_table.id, 1))
  await bot.test.placeBlock(36, cartographyTablePos)
  await bot.test.setInventorySlot(37, new Item(mapId, 1))
  await bot.test.setInventorySlot(38, new Item(paperId, 1))

  assert.strictEqual(bot.blockAt(cartographyTablePos).type, cartographyTableBlockId)

  // Open cartography table
  const cartographyTable = await bot.openCartographyTable(bot.blockAt(cartographyTablePos))

  await bot.test.wait(200)

  // Check initial state
  assert.strictEqual(cartographyTable.mapItem(), cartographyTable.slots[0])
  assert.strictEqual(cartographyTable.modifierItem(), cartographyTable.slots[1])
  assert.strictEqual(cartographyTable.outputItem(), cartographyTable.slots[2])
  assert.strictEqual(cartographyTable.mapItem(), null)
  assert.strictEqual(cartographyTable.modifierItem(), null)
  assert.strictEqual(cartographyTable.outputItem(), null)

  // Put map in slot 0
  await cartographyTable.putMap(mapId, null, 1)
  await bot.test.wait(200)
  assert.strictEqual(cartographyTable.mapItem().type, mapId)
  assert.strictEqual(cartographyTable.mapItem().count, 1)

  // Put paper in slot 1 (modifier)
  await cartographyTable.putModifier(paperId, null, 1)
  await bot.test.wait(200)
  assert.strictEqual(cartographyTable.modifierItem().type, paperId)
  assert.strictEqual(cartographyTable.modifierItem().count, 1)

  // Wait for the items to settle in the window
  await bot.test.wait(500)

  // Take items back
  await cartographyTable.takeModifier()
  await cartographyTable.takeMap()
  assert.strictEqual(cartographyTable.mapItem(), null)
  assert.strictEqual(cartographyTable.modifierItem(), null)

  cartographyTable.close()
  await bot.test.wait(500)

  // Check inventory - items should be back
  const mapCount = bot.inventory.count(mapId)
  const paperCount = bot.inventory.count(paperId)
  assert.strictEqual(mapCount, 1)
  assert.strictEqual(paperCount, 1)
}
