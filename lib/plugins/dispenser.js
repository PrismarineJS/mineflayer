var version=require("../version");
var windows = require('prismarine-windows')(version).windows;
var assert = require('assert');
var Dispenser = require('../dispenser');

module.exports = inject;

function inject(bot) {

  function openDispenser(dispenserBlock) {
    assert.strictEqual(dispenserBlock.type, 23);
    var dispenser = bot.openBlock(dispenserBlock, Dispenser);
    dispenser.deposit = deposit;
    dispenser.withdraw = withdraw;
    return dispenser;
    function deposit(itemType, metadata, count, cb) {
      var options = {
        window: dispenser.window,
        itemType: itemType,
        metadata: metadata,
        count: count,
        sourceStart: dispenser.window.inventorySlotStart,
        sourceEnd: dispenser.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
        destStart: 0,
        destEnd: dispenser.window.inventorySlotStart
      };
      bot.transfer(options, cb);
    }

    function withdraw(itemType, metadata, count, cb) {
      var options = {
        window: dispenser.window,
        itemType: itemType,
        metadata: metadata,
        count: count,
        sourceStart: 0,
        sourceEnd: dispenser.window.inventorySlotStart,
        destStart: dispenser.window.inventorySlotStart,
        destEnd: dispenser.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT
      };
      bot.transfer(options, cb);
    }
  }

  bot.openDispenser = openDispenser;
}