var assert = require('assert');
var version=require("../version");
var windows = require('prismarine-windows')(version).windows;

module.exports = inject;

var QUICK_BAR_COUNT = 9;
var QUICK_BAR_START = 36;

var armorSlots = {
  head: 5,
  torso: 6,
  legs: 7,
  feet: 8
};

function noop(err) {
  if(err) throw err;
}

function inject(bot) {
  var nextQuickBarSlot = 0;

  function tossStack(item, cb) {
    cb = cb || noop;
    assert.ok(item);
    bot.clickWindow(item.slot, 0, 0, function(err) {
      if(err) return cb(err);
      bot.clickWindow(-999, 0, 0, cb);
      bot.closeWindow(bot.currentWindow || bot.inventory);
    });
  }

  function toss(itemType, metadata, count, cb) {
    var window = bot.currentWindow || bot.inventory;
    var options = {
      window: window,
      itemType: itemType,
      metadata: metadata,
      count: count,
      sourceStart: window.inventorySlotStart,
      sourceEnd: window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
      destStart: -999
    };
    bot.transfer(options, cb);
  }

  function unequip(destination, cb) {
    cb = cb || noop;
    if(destination === 'hand') {
      equipEmpty(cb);
    } else {
      disrobe(destination, cb);
    }
  }


  function setQuickBarSlot(slot) {
    assert.ok(slot >= 0);
    assert.ok(slot < 9);
    if(bot.quickBarSlot === slot) return;
    bot.quickBarSlot = slot;
    bot._client.write('held_item_slot', {
      slotId: slot
    });
    bot.updateHeldItem();
  }

  function equipEmpty(cb) {
    for(var i = 0; i < 9; ++i) {
      if(!bot.inventory.slots[QUICK_BAR_START + i]) {
        setQuickBarSlot(i);
        process.nextTick(cb);
        return;
      }
    }
    var slot = bot.inventory.firstEmptyInventorySlot();
    if(!slot) {
      bot.tossStack(bot.heldItem, cb);
      return;
    }
    var equipSlot = QUICK_BAR_START + bot.quickBarSlot;
    bot.clickWindow(equipSlot, 0, 0, function(err) {
      if(err) return cb(err);
      bot.clickWindow(slot, 0, 0, function(err) {
        if(err) return cb(err);
        if(bot.inventory.selectedItem) {
          bot.clickWindow(-999, 0, 0, cb);
        } else {
          cb();
        }
      });
    });
  }


  function disrobe(destination, cb) {
    assert.equal(bot.currentWindow, null);
    var destSlot = getDestSlot(destination);
    bot.putAway(destSlot, cb);
  }

  function equip(item, destination, cb) {
    cb = cb || noop;
    if(typeof item === 'number') {
      item = bot.inventory.findInventoryItem(item);
    }
    if(item == null || typeof item !== 'object') {
      return cb(new Error('Invalid item object in equip'));
    }
    var sourceSlot = item.slot;
    var destSlot = getDestSlot(destination);

    if(sourceSlot === destSlot) {
      // don't need to do anything
      process.nextTick(cb);
      return;
    }

    if(destSlot >= QUICK_BAR_START && sourceSlot >= QUICK_BAR_START) {
      // all we have to do is change the quick bar selection
      bot.setQuickBarSlot(sourceSlot - QUICK_BAR_START);
      process.nextTick(cb);
      return;
    }

    if(destination !== 'hand') {
      bot.moveSlotItem(sourceSlot, destSlot, cb);
      return;
    }

    // find an empty slot on the quick bar to put the source item in
    destSlot = bot.inventory.firstEmptySlotRange(QUICK_BAR_START, QUICK_BAR_START + QUICK_BAR_COUNT);
    if(destSlot == null) {
      // LRU cache for the quick bar items
      destSlot = QUICK_BAR_START + nextQuickBarSlot;
      nextQuickBarSlot = (nextQuickBarSlot + 1) % QUICK_BAR_COUNT;
    }
    setQuickBarSlot(destSlot - QUICK_BAR_START);
    bot.moveSlotItem(sourceSlot, destSlot, cb);
  }


  function getDestSlot(destination) {
    if(destination === 'hand') {
      return QUICK_BAR_START + bot.quickBarSlot;
    } else {
      var destSlot = armorSlots[destination];
      assert.ok(destSlot != null, "invalid destination: " + destination);
      return destSlot;
    }
  }


  bot.equip = equip;
  bot.unequip = unequip;
  bot.toss = toss;
  bot.tossStack = tossStack;
  bot.setQuickBarSlot = setQuickBarSlot;

  // constants
  bot.QUICK_BAR_START = QUICK_BAR_START;

}