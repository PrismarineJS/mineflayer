var Item = require('../item');
var assert = require('assert');
var Vec3 = require('vec3').Vec3;
var windows = require('../windows');

module.exports = inject;


// ms to wait before clicking on a tool so the server can send the new
// damage information
var DIG_CLICK_TIMEOUT = 500;


function inject(bot) {
  var nextActionNumber = 0;
  var windowClickQueue = [];

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null;
  bot.inventory = new windows.InventoryWindow(0, "Inventory", 44);
  bot.currentWindow = null;
  bot.heldItem = null;

  function activateItem() {
    bot._client.write('block_place', {
      location:new Vec3(-1,255,-1),
      direction: -1,
      heldItem: Item.toNotch(bot.heldItem),
      cursorX: -1,
      cursorY: -1,
      cursorZ: -1
    });
  }

  function deactivateItem() {
    bot._client.write('block_dig', {
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
    bot._client.write('arm_animation', {
      entityId: bot.entity.id,
      animation: 1
    });
    // place block message
    bot._client.write('block_place', {
      location:block.position,
      direction: 1,
      heldItem: Item.toNotch(bot.heldItem),
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8
    });
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

  function placeBlock(referenceBlock, faceVector) {
    assert.ok(bot.heldItem, "must be holding an item to place a block");
    // TODO: tell the server that we are sneaking while doing this
    var pos = referenceBlock.position;
    bot._client.write('block_place', {
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


  function updateHeldItem() {
    bot.heldItem = bot.inventory.slots[bot.QUICK_BAR_START + bot.quickBarSlot];
  }

  function closeWindow(window) {
    bot._client.write('close_window', {
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
      bot._client.write('transaction', {
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
    if (slot >= bot.QUICK_BAR_START && bot.lastDigTime != null) {
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
    bot._client.write('window_click', {
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

  function putAway(slot, cb) {
    clickWindow(slot, 0, 0, function(err) {
      if (err) return cb(err);
      var window = bot.currentWindow || bot.inventory;
      var start = window.inventorySlotStart;
      var end = start + windows.INVENTORY_SLOT_COUNT;
      putSelectedItemRange(start, end, window, null, cb);
    });
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

  bot._client.on('transaction', function(packet) {
    // confirm transaction
    confirmTransaction(packet.windowId, packet.action, packet.accepted);
  });

  bot._client.on('held_item_slot', function(packet) {
    // held item change
    bot.quickBarSlot = packet.slot;
    updateHeldItem();
  });
  bot._client.on('open_window', function(packet) {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      packet.inventoryType, packet.windowTitle, packet.slotCount);
    // don't emit windowOpen until we have the slot data
    var window = bot.currentWindow;
    bot.once("setWindowItems:" + window.id, function() {
      bot.emit("windowOpen", window);
    });
  });
  bot._client.on('close_window', function(packet) {
    // close window
    var oldWindow = bot.currentWindow;
    bot.currentWindow = null;
    bot.emit("windowClose", oldWindow);
  });
  bot._client.on('set_slot', function(packet) {
    // set slot
    var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if (! window || window.id !== packet.windowId) return;
    var newItem = Item.fromNotch(packet.item);
    var oldItem = window.slots[packet.slot];
    window.updateSlot(packet.slot, newItem);
    updateHeldItem();
    bot.emit("setSlot:" + window.id, oldItem, newItem);
  });
  bot._client.on('window_items', function(packet) {
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

  bot.activateBlock = activateBlock;
  bot.placeBlock = placeBlock;
  bot.activateItem = activateItem;
  bot.deactivateItem = deactivateItem;

  // not really in the public API
  bot.clickWindow = clickWindow;
  bot.putSelectedItemRange = putSelectedItemRange;
  bot.putAway = putAway;
  bot.closeWindow = closeWindow;
  bot.transfer = transfer;
  bot.openBlock = openBlock;
  bot.moveSlotItem = moveSlotItem;
  bot.updateHeldItem = updateHeldItem;

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
