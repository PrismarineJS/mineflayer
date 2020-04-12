const Chest = require('../chest')
const assert = require('assert')

module.exports = inject

function inject (bot, { version }) {
  const windows = require('prismarine-windows')(version).windows
  const mcData = require('minecraft-data')(version)

  function openChest (chestToOpen) {
    let chest
    if (chestToOpen.constructor.name === 'Block') {
      assert.ok(chestToOpen.type === mcData.blocksByName.chest.id ||
                chestToOpen.type === mcData.blocksByName.ender_chest.id ||
                chestToOpen.type === mcData.blocksByName.trapped_chest.id)
      chest = bot.openBlock(chestToOpen, Chest)
    } else if (chestToOpen.constructor.name === 'Entity') {
      assert.strictEqual(chestToOpen.entityType, 10)
      assert.strictEqual(chestToOpen.objectData.intField, 1)
      chest = bot.openEntity(chestToOpen, Chest)
    } else {
      assert.ok(false, 'chestToOpen is neither block nor entity')
    }
    chest.withdraw = withdraw
    chest.deposit = deposit
    return chest
    function deposit (itemType, metadata, count, cb) {
      const options = {
        window: chest.window,
        itemType,
        metadata,
        count,
        sourceStart: chest.window.inventorySlotStart,
        sourceEnd: chest.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
        destStart: 0,
        destEnd: chest.window.inventorySlotStart
      }
      bot.transfer(options, cb)
    }

    function withdraw (itemType, metadata, count, cb) {
      const options = {
        window: chest.window,
        itemType,
        metadata,
        count,
        sourceStart: 0,
        sourceEnd: chest.window.inventorySlotStart,
        destStart: chest.window.inventorySlotStart,
        destEnd: chest.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT
      }
      bot.transfer(options, cb)
    }
  }

  bot.openChest = openChest
}
