var Chest = require('../chest');
var assert = require('assert');

module.exports = inject;

function inject(bot,{version}) {
  var windows = require('prismarine-windows')(version).windows;

  function openChest(chestToOpen) {
    var chest;
    if (chestToOpen.constructor.name === 'Block') {
      assert.ok(chestToOpen.type === 54 || chestToOpen.type === 130 || chestToOpen.type === 146);
      chest = bot.openBlock(chestToOpen, Chest);
    } else if (chestToOpen.constructor.name === 'Entity') {
      assert.strictEqual(chestToOpen.entityType, 10);
      assert.strictEqual(chestToOpen.objectData.intField, 1);
      chest = bot.openEntity(chestToOpen, Chest);
    } else {
      assert.ok(false, 'chestToOpen is neither block nor entity');
    }
    chest.withdraw = withdraw;
    chest.deposit = deposit;
    return chest;
    function deposit(itemType, metadata, count, cb) {
      var options = {
        window: chest.window,
        itemType: itemType,
        metadata: metadata,
        count: count,
        sourceStart: chest.window.inventorySlotStart,
        sourceEnd: chest.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
        destStart: 0,
        destEnd: chest.window.inventorySlotStart
      };
      bot.transfer(options, cb);
    }

    function withdraw(itemType, metadata, count, cb) {
      var options = {
        window: chest.window,
        itemType: itemType,
        metadata: metadata,
        count: count,
        sourceStart: 0,
        sourceEnd: chest.window.inventorySlotStart,
        destStart: chest.window.inventorySlotStart,
        destEnd: chest.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT
      };
      bot.transfer(options, cb);
    }
  }

  bot.openChest = openChest;
}