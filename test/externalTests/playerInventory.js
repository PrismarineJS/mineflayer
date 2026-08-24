const { Vec3 } = require('vec3')
const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Closing a container while holding an item on the cursor makes the server
  // return it through Inventory.placeItemBackInInventory, synced on 1.21.3+
  // via set_player_inventory. Its slotId counts the vanilla player inventory
  // hotbar-first (0-8), which must be translated to the inventory menu slot
  // space. Applied raw, a return into hotbar slot 0 writes the crafting
  // result slot 0 instead of window slot 36.
  await bot.test.becomeCreative()
  await bot.test.clearInventory()
  await bot.test.wait(100)

  // A stone in hotbar slot 0 to pick up on the cursor
  const stoneId = bot.registry.itemsByName.stone.id
  await bot.test.setInventorySlot(bot.inventory.hotbarStart, new (require('prismarine-item')(bot.registry))(stoneId, 1))

  // Place a chest next to the bot and open it
  const chestPos = new Vec3(1, bot.test.groundY, 0)
  await bot.test.setBlock({ x: chestPos.x, y: chestPos.y, z: chestPos.z, blockName: 'chest' })
  const chest = await bot.openContainer(bot.blockAt(chestPos))

  // Pick the stone up onto the cursor (hotbar slot 0 = chest.hotbarStart)
  await bot.clickWindow(chest.hotbarStart, 0, 0)
  assert.ok(chest.selectedItem, 'stone should be on the cursor')

  // Closing with the cursor occupied makes the server return the stone via
  // set_player_inventory into hotbar slot 0 -> inventory slot 36
  const returned = onceWithCleanup(bot.inventory, 'updateSlot:36', {
    timeout: 5000,
    checkCondition: (oldItem, newItem) => newItem?.type === stoneId
  })
  bot.closeWindow(chest)
  await returned

  assert.strictEqual(bot.inventory.slots[bot.inventory.hotbarStart].type, stoneId, 'returned stone should be back in hotbar slot 0')
  assert.strictEqual(bot.inventory.slots[0], null, 'set_player_inventory slotId 0 must not write into the crafting result slot')
}
