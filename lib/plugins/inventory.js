var Item = require('../item')
  , assert = require('assert')
  , Chest = require('../chest')
  , Furnace = require('../furnace')
  , Dispenser = require('../dispenser')
  , EnchantmentTable = require('../enchantment_table')
  , Vec3 = require('vec3').Vec3
  , windows = require('../windows');

module.exports = inject;

var QUICK_BAR_START = 36;
var QUICK_BAR_COUNT = 9;

// ms to wait before clicking on a tool so the server can send the new
// damage information
var DIG_CLICK_TIMEOUT = 500;

var armorSlots = {
  head: 5,
  torso: 6,
  legs: 7,
  feet: 8
};

function inject(bot) {
  var nextActionNumber = 0;
  var windowClickQueue = [];
  var nextQuickBarSlot = 0;

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null;
  bot.inventory = new windows.InventoryWindow(0, "Inventory", 44);
  bot.currentWindow = null;
  bot.heldItem = null;

  function activateItem() {
    bot.client.write('block_place', {
      location:new Vec3(-1,255,-1),
      direction: -1,
      heldItem: Item.toNotch(bot.heldItem),
      cursorX: -1,
      cursorY: -1,
      cursorZ: -1
    });
  }

  function deactivateItem() {
    bot.client.write('block_dig', {
      status: 5,
      location:new Vec3(0,0,0),
      face: 5
    });
  }


  function putSelectedItemRange(start, end, window, slot, cb) {
    // put the selected item back indow the slot range in window

    // try to put it in an item that already exists and just increase
    // the count.
    tryToJoin();

    function tryToJoin() {
      if (! window.selectedItem) {
        cb();
        return;
      }
      var item = window.findItemRange(start, end, window.selectedItem.type,
          window.selectedItem.metadata, true);
      if (item) {
        clickWindow(item.slot, 0, 0, onClick);
      } else {
        tryToFindEmpty();
      }

      function onClick(err) {
        if (err) {
          cb(err);
        } else {
          tryToJoin();
        }
      }
    }
    function tryToFindEmpty() {
      var emptySlot = window.firstEmptySlotRange(start, end);
      if (emptySlot == null) {
        // if there is still some leftover and slot is not null, click slot
        if (slot == null) {
          tossLeftover();
        } else {
          clickWindow(slot, 0, 0, tossLeftover);
        }
      } else {
        clickWindow(emptySlot, 0, 0, cb);
      }
    }
    function tossLeftover() {
      if (window.selectedItem) {
        clickWindow(-999, 0, 0, cb);
      } else {
        cb();
      }
    }
  }

  function activateBlock(block) {
    // TODO: tell the server that we are not sneaking while doing this
    bot.lookAt(block.position);
    // swing arm animation
    bot.client.write('arm_animation', {
      entityId: bot.entity.id,
      animation: 1
    });
    // place block message
    bot.client.write('block_place', {
      location:block.position,
      direction: 1,
      heldItem: Item.toNotch(bot.heldItem),
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8
    });
  }

  function openDispenser(dispenserBlock) {
    assert.strictEqual(dispenserBlock.type, 23);
    var dispenser = openBlock(dispenserBlock, Dispenser);
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
      transfer(options, cb);
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
      transfer(options, cb);
    }
  }

  function openFurnace(furnaceBlock) {
    assert.ok(furnaceBlock.type === 61 || furnaceBlock.type === 62);
    var furnace = openBlock(furnaceBlock, Furnace);
    furnace.takeInput = takeInput;
    furnace.takeFuel = takeFuel;
    furnace.takeOutput = takeOutput;
    furnace.putInput = putInput;
    furnace.putFuel = putFuel;
    bot.client.on('craft_progress_bar', onUpdateWindowProperty);
    furnace.once("close", onClose);
    return furnace;
    function onClose() {
      bot.client.removeListener('craft_progress_bar', onUpdateWindowProperty);
    }
    function onUpdateWindowProperty(packet) {
      if (!furnace.window) return;
      if (packet.windowId !== furnace.window.id) return;
      if (packet.property === 0) {
        furnace.progress = packet.value / 200;
      } else if (packet.property === 1) {
        furnace.fuel = packet.value / 300;
      }
      furnace.emit("update");
    }
    function takeSomething(item, cb) {
      assert.ok(item);
      putAway(item.slot, function(err) {
        if (err) {
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
      transfer(options, cb);
    }
    function putInput(itemType, metadata, count, cb) {
      putSomething(0, itemType, metadata, count, cb);
    }
    function putFuel(itemType, metadata, count, cb) {
      putSomething(1, itemType, metadata, count, cb);
    }
  }

  function openEnchantmentTable(enchantmentTableBlock) {
    assert.strictEqual(enchantmentTableBlock.type, 116);
    var ready = false;
    var enchantmentTable = openBlock(enchantmentTableBlock, EnchantmentTable);
    resetEnchantmentOptions();
    bot.client.on('craft_progress_bar', onUpdateWindowProperty);
    enchantmentTable.on('updateSlot', onUpdateSlot);
    enchantmentTable.once('close', onClose);
    enchantmentTable.enchant = enchant;
    enchantmentTable.takeTargetItem = takeTargetItem;
    enchantmentTable.putTargetItem = putTargetItem;
    return enchantmentTable;
    function onClose() {
      bot.client.removeListener('craft_progress_bar', onUpdateWindowProperty);
    }
    function onUpdateWindowProperty(packet) {
      if (!enchantmentTable.window) return;
      if (packet.windowId !== enchantmentTable.window.id) return;
      assert.ok(packet.property >= 0);
      assert.ok(packet.property < 3);
      var arr = enchantmentTable.enchantments;
      arr[packet.property].level = packet.value;
      if (arr[0].level && arr[1].level && arr[2].level && ! ready) {
        ready = true;
        enchantmentTable.emit("ready");
      }
    }
    function onUpdateSlot(oldItem, newItem) {
      resetEnchantmentOptions();
    }
    function resetEnchantmentOptions() {
      enchantmentTable.enchantments = [ {level: null}, {level: null}, {level: null} ];
      ready = false;
    }
    function enchant(choice, cb) {
      choice = parseInt(choice, 10); // allow string argument
      cb = cb || noop;
      assert.notEqual(enchantmentTable.enchantments[choice].level, null);
      bot.client.write('enchant_item', {
        windowId: enchantmentTable.window.id,
        enchantment: choice
      });
      enchantmentTable.once('updateSlot', function(oldItem, newItem) { cb(null, newItem); });
    }
    function takeTargetItem(cb) {
      cb = cb || noop;
      var item = enchantmentTable.targetItem();
      assert.ok(item);
      putAway(item.slot, function(err) {
        cb(err, item);
      });
    }
    function putTargetItem(item, cb) {
      cb = cb || noop;
      moveSlotItem(item.slot, 0, cb);
    }
  }

  function transfer(options, cb) {
    var window = options.window || bot.currentWindow || bot.inventory;
    var itemType = options.itemType;
    var metadata = options.metadata;
    var count = options.count == null ? 1 : options.count;
    cb = cb || noop;
    var firstSourceSlot = null;

    // ranges
    var sourceStart = options.sourceStart;
    var destStart = options.destStart;
    assert.notEqual(sourceStart, null);
    assert.notEqual(destStart, null);
    var sourceEnd = options.sourceEnd == null ? sourceStart + 1 : options.sourceEnd;
    var destEnd = options.destEnd == null ? destStart + 1 : options.destEnd;

    transferOne();

    function transferOne() {
      if (count === 0) {
        putSelectedItemRange(sourceStart, sourceEnd, window, firstSourceSlot, cb);
        return;
      }
      if (!window.selectedItem || window.selectedItem.type !== itemType ||
        (metadata != null && window.selectedItem.metadata !== metadata))
      {
        // we are not holding the item we need. click it.
        var sourceItem = window.findItemRange(sourceStart, sourceEnd, itemType, metadata);
        if (!sourceItem) return cb(new Error("missing source item"));
        if (firstSourceSlot == null) firstSourceSlot = sourceItem.slot;
        clickWindow(sourceItem.slot, 0, 0, function(err) {
          if (err) {
            cb(err);
          } else {
            clickDest();
          }
        });
      } else {
        clickDest();
      }

      function clickDest() {
        assert.notEqual(window.selectedItem.type, null);
        assert.notEqual(window.selectedItem.metadata, null);
        var destItem, destSlot;
        // special case for tossing
        if (destStart === -999) {
          destSlot = -999;
        } else {
          // find a non full item that we can drop into
          destItem = window.findItemRange(destStart, destEnd,
              window.selectedItem.type, window.selectedItem.metadata, true);
          // if that didn't work find an empty slot to drop into
          destSlot = destItem ? destItem.slot :
            window.firstEmptySlotRange(destStart, destEnd);
          // if that didn't work, give up
          if (destSlot == null) {
            cb(new Error("destination full"));
            return;
          }
        }
        clickWindow(destSlot, 1, 0, function(err) {
          if (err) {
            cb(err);
          } else {
            count -= 1;
            transferOne();
          }
        });
      }
    }
  }

  function openBlock(block, Class) {
    var session = new Class();
    session.close = close;
    bot.once("windowOpen", onWindowOpen);
    bot.activateBlock(block);
    return session;
    function onWindowOpen(window) {
      if (window.type !== Class.windowType) return;
      session.window = window;
      bot.once("windowClose", onClose);
      bot.on("setSlot:" + window.id, onSetSlot);
      session.emit("open");
    }
    function close() {
      assert.notEqual(session.window, null);
      closeWindow(session.window);
    }
    function onClose() {
      bot.removeListener("setSlot:" + session.window.id, onSetSlot);
      session.window = null;
      session.emit("close");
    }
    function onSetSlot(oldItem, newItem) {
      if (! Item.equal(oldItem, newItem)) {
        session.emit("updateSlot", oldItem, newItem);
      }
    }
  }

  function openChest(chestBlock) {
    assert.ok(chestBlock.type === 54 || chestBlock.type === 130 || chestBlock.type === 146);
    var chest = openBlock(chestBlock, Chest);
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
      transfer(options, cb);
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
      transfer(options, cb);
    }
  }

  function placeBlock(referenceBlock, faceVector) {
    assert.ok(bot.heldItem, "must be holding an item to place a block");
    // TODO: tell the server that we are sneaking while doing this
    var pos = referenceBlock.position;
    bot.client.write('block_place', {
      location: pos,
      direction: vectorToDirection(faceVector),
      heldItem: Item.toNotch(bot.heldItem),
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8
    });
    // update it immediately; the server will correct us if it did not work.
    var dest = pos.plus(faceVector);
    bot._updateBlock(dest, bot.heldItem.type, bot.heldItem.metadata);
  }

  function createActionNumber() {
    return nextActionNumber++;
  }

  function setQuickBarSlot(slot) {
    assert.ok(slot >= 0);
    assert.ok(slot < 9);
    if (bot.quickBarSlot === slot) return;
    bot.quickBarSlot = slot;
    bot.client.write('held_item_slot', {
      slotId: slot
    });
    updateHeldItem();
  }

  function updateHeldItem() {
    bot.heldItem = bot.inventory.slots[QUICK_BAR_START + bot.quickBarSlot];
  }

  function closeWindow(window) {
    bot.client.write('close_window', {
      windowId: window.id
    });
    bot.currentWindow = null;
    bot.emit("windowClose", window);
  }

  function confirmTransaction(windowId, actionId, accepted) {
    // drop the queue entries for all the clicks that the server did not send
    // transaction packets for.
    var click = windowClickQueue.shift();
    assert.ok(click.id <= actionId);
    while (actionId > click.id) {
      onAccepted();
      click = windowClickQueue.shift();
    }
    assert.ok(click);

    if (accepted) {
      onAccepted();
    } else {
      onRejected();
    }
    updateHeldItem();

    function onAccepted() {
      var window = windowId === 0 ? bot.inventory : bot.currentWindow;
      if (! window || window.id !== click.windowId) return;
      window.acceptClick(click);
      bot.emit("confirmTransaction" + click.id, true);
    }

    function onRejected() {
      bot.client.write('transaction', {
        windowId: 0,
        action: click.id,
        accepted: false
      });
      bot.emit("confirmTransaction" + click.id, false);
    }
  }

  function clickWindow(slot, mouseButton, mode, cb) {
    // if you click on the quick bar and have dug recently,
    // wait a bit
    if (slot >= QUICK_BAR_START && bot.lastDigTime != null) {
      var timeSinceLastDig = new Date() - bot.lastDigTime;
      if (timeSinceLastDig < DIG_CLICK_TIMEOUT) {
        setTimeout(function() {
          clickWindow(slot, mouseButton, mode, cb);
        }, DIG_CLICK_TIMEOUT - timeSinceLastDig);
        return;
      }
    }
    cb = cb || noop;
    var window = bot.currentWindow || bot.inventory;

    assert.ok(mouseButton === 0 || mouseButton === 1);
    assert.strictEqual(mode, 0);
    var actionId = createActionNumber();

    var click = {
      slot: slot,
      mouseButton: mouseButton,
      mode: mode,
      id: actionId,
      windowId: window.id
    };
    windowClickQueue.push(click);
    bot.client.write('window_click', {
      windowId: window.id,
      slot: slot,
      mouseButton: mouseButton,
      action: actionId,
      mode: mode,
      item: slot === -999 ? { blockId: -1 } : Item.toNotch(window.slots[slot])
    });
    bot.once("confirmTransaction" + actionId, function(success) {
      if (success) {
        cb();
      } else {
        cb(new Error("Server rejected transaction."));
      }
    });
    // notchian servers are assholes and only confirm certain transactions.
    if (! window.transactionRequiresConfirmation(click)) {
      // jump the gun and accept the click
      confirmTransaction(window.id, actionId, true);
    }
  }

  function tossStack(item, cb) {
    cb = cb || noop;
    assert.ok(item);
    clickWindow(item.slot, 0, 0, function(err) {
      if (err) return cb(err);
      clickWindow(-999, 0, 0, cb);
      closeWindow(bot.currentWindow || bot.inventory);
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
    transfer(options, cb);
  }

  function getDestSlot(destination) {
    if (! destination || destination === 'hand') {
      return QUICK_BAR_START + bot.quickBarSlot;
    } else {
      var destSlot = armorSlots[destination];
      assert.ok(destSlot != null, "invalid destination: " + destination);
      return destSlot;
    }
  }

  function unequip(destination, cb) {
    cb = cb || noop;
    if (destination === 'hand') {
      equipEmpty(cb);
    } else {
      disrobe(destination, cb);
    }
  }

  function equipEmpty(cb) {
    for (var i = 0; i < 9; ++i) {
      if (! bot.inventory.slots[QUICK_BAR_START + i]) {
        setQuickBarSlot(i);
        process.nextTick(cb);
        return;
      }
    }
    var slot = bot.inventory.firstEmptyInventorySlot();
    if (! slot) {
      bot.tossStack(bot.heldItem, cb);
      return;
    }
    var equipSlot = QUICK_BAR_START + bot.quickBarSlot;
    clickWindow(equipSlot, 0, 0, function(err) {
      if (err) return cb(err);
      clickWindow(slot, 0, 0, function(err) {
        if (err) return cb(err);
        if (bot.inventory.selectedItem) {
          clickWindow(-999, 0, 0, cb);
        } else {
          cb();
        }
      });
    });
  }

  function putAway(slot, cb) {
    clickWindow(slot, 0, 0, function(err) {
      if (err) return cb(err);
      var window = bot.currentWindow || bot.inventory;
      var start = window.inventorySlotStart;
      var end = start + windows.INVENTORY_SLOT_COUNT;
      putSelectedItemRange(start, end, window, null, cb);
    });
  }

  function disrobe(destination, cb) {
    assert.equal(bot.currentWindow, null);
    var destSlot = getDestSlot(destination);
    putAway(destSlot, cb);
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

    if (sourceSlot === destSlot) {
      // don't need to do anything
      process.nextTick(cb);
      return;
    }

    if (destSlot >= QUICK_BAR_START && sourceSlot >= QUICK_BAR_START) {
      // all we have to do is change the quick bar selection
      bot.setQuickBarSlot(sourceSlot - QUICK_BAR_START);
      process.nextTick(cb);
      return;
    }

    if (destination !== 'hand') {
      moveSlotItem(sourceSlot, destSlot, cb);
      return;
    }

    // find an empty slot on the quick bar to put the source item in
    destSlot = bot.inventory.firstEmptySlotRange(QUICK_BAR_START, QUICK_BAR_START + QUICK_BAR_COUNT);
    if (destSlot == null) {
      // LRU cache for the quick bar items
      destSlot = QUICK_BAR_START + nextQuickBarSlot;
      nextQuickBarSlot = (nextQuickBarSlot + 1) % QUICK_BAR_COUNT;
    }
    bot.setQuickBarSlot(destSlot - QUICK_BAR_START);
    moveSlotItem(sourceSlot, destSlot, cb);
  }

  function moveSlotItem(sourceSlot, destSlot, cb) {
    clickWindow(sourceSlot, 0, 0, function(err) {
      if (err) return cb(err);
      clickWindow(destSlot, 0, 0, function(err) {
        // if we're holding an item, put it back where the source item was.
        // otherwise we're done.
        if (err) {
          cb(err);
        } else if (bot.inventory.selectedItem) {
          clickWindow(sourceSlot, 0, 0, cb);
        } else {
          cb();
        }
      });
    });
  }

  bot.client.on('transaction', function(packet) {
    // confirm transaction
    confirmTransaction(packet.windowId, packet.action, packet.accepted);
  });

  bot.client.on('held_item_slot', function(packet) {
    // held item change
    bot.quickBarSlot = packet.slot;
    updateHeldItem();
  });
  bot.client.on('open_window', function(packet) {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      packet.inventoryType, packet.windowTitle, packet.slotCount);
    // don't emit windowOpen until we have the slot data
    var window = bot.currentWindow;
    bot.once("setWindowItems:" + window.id, function() {
      bot.emit("windowOpen", window);
    });
  });
  bot.client.on('close_window', function(packet) {
    // close window
    var oldWindow = bot.currentWindow;
    bot.currentWindow = null;
    bot.emit("windowClose", oldWindow);
  });
  bot.client.on('set_slot', function(packet) {
    // set slot
    var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if (! window || window.id !== packet.windowId) return;
    var newItem = Item.fromNotch(packet.item);
    var oldItem = window.slots[packet.slot];
    window.updateSlot(packet.slot, newItem);
    updateHeldItem();
    bot.emit("setSlot:" + window.id, oldItem, newItem);
  });
  bot.client.on('window_items', function(packet) {
    // set window items
    var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if (! window || window.id !== packet.windowId) return;
    var i, item;
    for (i = 0; i < packet.items.length; ++i) {
      item = Item.fromNotch(packet.items[i]);
      window.updateSlot(i, item);
    }
    updateHeldItem();
    bot.emit("setWindowItems:" + window.id);
  });

  bot.equip = equip;
  bot.unequip = unequip;
  bot.toss = toss;
  bot.tossStack = tossStack;
  bot.activateBlock = activateBlock;
  bot.placeBlock = placeBlock;
  bot.setQuickBarSlot = setQuickBarSlot;
  bot.openChest = openChest;
  bot.openFurnace = openFurnace;
  bot.openDispenser = openDispenser;
  bot.openEnchantmentTable = openEnchantmentTable;
  bot.activateItem = activateItem;
  bot.deactivateItem = deactivateItem;

  // not really in the public API
  bot.clickWindow = clickWindow;
  bot.putSelectedItemRange = putSelectedItemRange;
  bot.putAway = putAway;
  bot.closeWindow = closeWindow;
}

function noop(err) {
  if (err) throw err;
}

function vectorToDirection(v) {
  if (v.y < 0) {
    return 0;
  } else if (v.y > 0) {
    return 1;
  } else if (v.z < 0) {
    return 2;
  } else if (v.z > 0) {
    return 3;
  } else if (v.x < 0) {
    return 4;
  } else if (v.x > 0) {
    return 5;
  }
  assert.ok(false, "invalid direction vector " + v);
}
