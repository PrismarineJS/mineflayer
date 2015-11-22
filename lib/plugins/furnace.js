var Furnace = require('../furnace');
var assert = require('assert');
var version=require("../version");
var windows = require('prismarine-windows')(version).windows;

module.exports = inject;

function inject(bot) {
  function openFurnace(furnaceBlock) {
    assert.ok(furnaceBlock.type === 61 || furnaceBlock.type === 62);
    var furnace = bot.openBlock(furnaceBlock, Furnace);
    furnace.takeInput = takeInput;
    furnace.takeFuel = takeFuel;
    furnace.takeOutput = takeOutput;
    furnace.putInput = putInput;
    furnace.putFuel = putFuel;
    bot._client.on('craft_progress_bar', onUpdateWindowProperty);
    furnace.once("close", onClose);
    return furnace;
    function onClose() {
      bot._client.removeListener('craft_progress_bar', onUpdateWindowProperty);
    }

    function onUpdateWindowProperty(packet) {
      if(!furnace.window) return;
      if(packet.windowId !== furnace.window.id) return;
      if(packet.property === 0) {
        furnace.progress = packet.value / 200;
      } else if(packet.property === 1) {
        furnace.fuel = packet.value / 300;
      }
      furnace.emit("update");
    }

    function takeSomething(item, cb) {
      assert.ok(item);
      bot.putAway(item.slot, function(err) {
        if(err) {
          cb(err);
        } else {
          cb(null, item);
        }
      });
    }

    function takeInput(cb) {
      takeSomething(furnace.inputItem(), cb);
    }

    function takeFuel(cb) {
      takeSomething(furnace.fuelItem(), cb);
    }

    function takeOutput(cb) {
      takeSomething(furnace.outputItem(), cb);
    }

    function putSomething(destSlot, itemType, metadata, count, cb) {
      var options = {
        window: furnace.window,
        itemType: itemType,
        metadata: metadata,
        count: count,
        sourceStart: furnace.window.inventorySlotStart,
        sourceEnd: furnace.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
        destStart: destSlot
      };
      bot.transfer(options, cb);
    }

    function putInput(itemType, metadata, count, cb) {
      putSomething(0, itemType, metadata, count, cb);
    }

    function putFuel(itemType, metadata, count, cb) {
      putSomething(1, itemType, metadata, count, cb);
    }
  }

  bot.openFurnace = openFurnace;
}