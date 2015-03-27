var Chest = require('../chest');
var assert = require('assert');
var windows = require('../windows');

module.exports = inject;

function inject(bot) {

  function openChest(chestBlock) {
    assert.ok(chestBlock.type === 54 || chestBlock.type === 130 || chestBlock.type === 146);
    var chest = bot.openBlock(chestBlock, Chest);
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