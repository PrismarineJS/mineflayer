const Chest = require('../chest')
const assert = require('assert')

module.exports = inject

function inject (bot, { version }) {
  const mcData = require('minecraft-data')(version)

  function openChest (chestToOpen) {
    let chest
    if (chestToOpen.constructor.name === 'Block') {
      assert.ok(chestToOpen.type === mcData.blocksByName.chest.id ||
                chestToOpen.type === mcData.blocksByName.ender_chest.id ||
                chestToOpen.type === mcData.blocksByName.trapped_chest.id)
      chest = bot.openBlock(chestToOpen, Chest)
    } else if (chestToOpen.constructor.name === 'Entity') {
      assert.strictEqual(chestToOpen.entityType, mcData.entitiesByName.chest_minecart.id)
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
        sourceStart: chest.window.inventoryStart,
        sourceEnd: chest.window.inventoryEnd,
        destStart: 0,
        destEnd: chest.window.inventoryStart
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
        sourceEnd: chest.window.inventoryStart,
        destStart: chest.window.inventoryStart,
        destEnd: chest.window.inventoryEnd
      }
      bot.transfer(options, cb)
    }
  }

  bot.openChest = openChest
}
