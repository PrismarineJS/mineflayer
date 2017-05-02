const assert = require('assert');
const Vec3 = require('vec3').Vec3;

module.exports = inject;


// ms to wait before clicking on a tool so the server can send the new
// damage information
const DIG_CLICK_TIMEOUT = 500;


function inject(bot,{version}) {
  const Item = require("prismarine-item")(version);
  const windows = require('prismarine-windows')(version).windows;

  const nextActionNumber = 0;
  const windowClickQueue = [];
  const windowItems;

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null;
  bot.inventory = new windows.InventoryWindow(0, "Inventory", 44);
  bot.currentWindow = null;
  bot.heldItem = null;

  function activateItem() {
    if(bot.majorVersion=="1.8") {
      bot._client.write('block_place', {
        location: new Vec3(-1, 255, -1),
        direction: -1,
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: -1,
        cursorY: -1,
        cursorZ: -1
      });
    }
    if(bot.majorVersion=="1.9" || bot.majorVersion=="1.10" || bot.majorVersion=="1.11") {
      bot._client.write('use_item', {
        hand:0
      });
    }
  }

  function deactivateItem() {
    bot._client.write('block_dig', {
      status: 5,
      location: new Vec3(0, 0, 0),
      face: 5
    });
  }


  function putSelectedItemRange(start, end, window, slot, cb) {
    // put the selected item back indow the slot range in window

    // try to put it in an item that already exists and just increase
    // the count.
    tryToJoin();

    function tryToJoin() {
      if(!window.selectedItem) {
        cb();
        return;
      }
      const item = window.findItemRange(start, end, window.selectedItem.type,
        window.selectedItem.metadata, true);
      if(item) {
        clickWindow(item.slot, 0, 0, onClick);
      } else {
        tryToFindEmpty();
      }

      function onClick(err) {
        if(err) {
          cb(err);
        } else {
          tryToJoin();
        }
      }
    }

    function tryToFindEmpty() {
      const emptySlot = window.firstEmptySlotRange(start, end);
      if(emptySlot == null) {
        // if there is still some leftover and slot is not null, click slot
        if(slot == null) {
          tossLeftover();
        } else {
          clickWindow(slot, 0, 0, tossLeftover);
        }
      } else {
        clickWindow(emptySlot, 0, 0, cb);
      }
    }

    function tossLeftover() {
      if(window.selectedItem) {
        clickWindow(-999, 0, 0, cb);
      } else {
        cb();
      }
    }
  }

  function activateBlock(block, cb) {
    // ToDo: tell the server that we are not sneaking while doing this
    bot.lookAt(block.position.offset(0.5, 0.5, 0.5),false,function(){
      // place block message
      if(bot.majorVersion=="1.8") {
        bot._client.write('block_place', {
          location: block.position,
          direction: 1,
          heldItem: Item.toNotch(bot.heldItem),
          cursorX: 8,
          cursorY: 8,
          cursorZ: 8
        });
      }

      if(bot.majorVersion=="1.9" || bot.majorVersion=="1.10") {
        bot._client.write('block_place', {
          location: block.position,
          direction: 1,
          hand:0,
          cursorX: 8,
          cursorY: 8,
          cursorZ: 8
        });
      }

      if(bot.majorVersion=="1.11") {
        bot._client.write('block_place', {
          location: block.position,
          direction: 1,
          hand:0,
          cursorX: 0.5,
          cursorY: 0.5,
          cursorZ: 0.5
        });
      }

      // swing arm animation
      bot._client.write('arm_animation', {hand:0});
      
      if(cb) cb();
    });
  }
  
  function activateEntity(entity, cb) {
    // ToDo: tell the server that we are sneaking while doing this
    bot.lookAt(entity.position.offset(0, 1, 0),false,function(){
      bot._client.write('arm_animation', {hand:0});
      bot._client.write('use_entity', {
        target: entity.id,
        mouse: 0
      });
      if(cb) cb();
    });
  }


  function transfer(options, cb) {
    const window = options.window || bot.currentWindow || bot.inventory;
    const itemType = options.itemType;
    const metadata = options.metadata;
    const count = options.count == null ? 1 : options.count;
    cb = cb || noop;
    const firstSourceSlot = null;

    // ranges
    const sourceStart = options.sourceStart;
    const destStart = options.destStart;
    assert.notEqual(sourceStart, null);
    assert.notEqual(destStart, null);
    const sourceEnd = options.sourceEnd == null ? sourceStart + 1 : options.sourceEnd;
    const destEnd = options.destEnd == null ? destStart + 1 : options.destEnd;

    transferOne();

    function transferOne() {
      if(count === 0) {
        putSelectedItemRange(sourceStart, sourceEnd, window, firstSourceSlot, cb);
        return;
      }
      if(!window.selectedItem || window.selectedItem.type !== itemType ||
        (metadata != null && window.selectedItem.metadata !== metadata)) {
        // we are not holding the item we need. click it.
        const sourceItem = window.findItemRange(sourceStart, sourceEnd, itemType, metadata);
        if(!sourceItem) return cb(new Error("missing source item " + itemType + ":" + metadata + " in (" + sourceStart + "," + sourceEnd + ")"));
        if(firstSourceSlot == null) firstSourceSlot = sourceItem.slot;
        // number of item that can be moved from that slot
        const sourceItemCount = sourceItem.count;
        clickWindow(sourceItem.slot, 0, 0, function(err) {
          if(err) {
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
        const destItem, destSlot;
        // special case for tossing
        if(destStart === -999) {
          destSlot = -999;
        } else {
          // find a non full item that we can drop into
          destItem = window.findItemRange(destStart, destEnd,
            window.selectedItem.type, window.selectedItem.metadata, true);
          // if that didn't work find an empty slot to drop into
          destSlot = destItem ? destItem.slot :
            window.firstEmptySlotRange(destStart, destEnd);
          // if that didn't work, give up
          if(destSlot == null) {
            cb(new Error("destination full"));
            return;
          }
        }
        // move the maximum number of item that can be moved
        const destSlotCount = destSlot.count ? destSlot.count : 0;
        const movedItems = Math.min(64 - destSlotCount, sourceItemCount);
        // if the number of item the left click moves is less than the number of item we want to move
        // several at the same time (left click)
        if(movedItems <= count) {
          clickWindow(destSlot, 0, 0, function(err) {
            if(err) {
              cb(err);
            } else {
              // update the number of item that can be moved at the source slot (sourceItemCount)
              sourceItemCount -= movedItems;
              // and the number of item we want to move (count)
              count -= movedItems;
              transferOne();
            }
          });
        }
        // one by one (right click)
        else {
          clickWindow(destSlot, 1, 0, function(err) {
            if(err) {
              cb(err);
            } else {
              count -= 1;
              transferOne();
            }
          });
        }
      }
    }
  }

  function openBlock(block, Class) {
    const session = new Class();
    session.close = close;
    bot.once("windowOpen", onWindowOpen);
    bot.activateBlock(block);
    return session;
    function onWindowOpen(window) {
      if(window.type !== Class.windowType) return;
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
      if(!Item.equal(oldItem, newItem)) {
        session.emit("updateSlot", oldItem, newItem);
      }
    }
  }

  function openEntity(entity, Class) {
    const session = new Class();
    session.close = close;
    bot.once("windowOpen", onWindowOpen);
    bot.activateEntity(entity);
    return session;

    function onWindowOpen(window) {
      if (window.type !== Class.windowType) return;
      session.window = window;
      bot.once("windowClose", onClose);
      bot.on("setSlot:" + window.id, onSetSlot);
      session.emit("open");
    }

    function close() {
      closeWindow(session.window);
    }

    function onClose() {
      bot.removeListener("setSlot:" + session.window.id, onSetSlot);
      session.window = null;
      session.emit("close");
    }

    function onSetSlot(oldItem, newItem) {
      if (!Item.equal(oldItem, newItem)) {
        session.emit("updateSlot", oldItem, newItem);
      }
    }
  }

  function placeBlock(referenceBlock, faceVector, cb) {
    cb = cb || noop;
    if(!bot.heldItem) cb(new Error("must be holding an item to place a block"));
    bot.lookAt(referenceBlock.position.offset(0.5,0.5,0.5),false,function(){
      // ToDo: tell the server that we are sneaking while doing this
      bot._client.write('arm_animation', {hand:0});
      const pos = referenceBlock.position;
      if(bot.majorVersion=="1.8") {
        bot._client.write('block_place', {
          location: pos,
          direction: vectorToDirection(faceVector),
          heldItem: Item.toNotch(bot.heldItem),
          cursorX: 8,
          cursorY: 8,
          cursorZ: 8
        });
      }
      if(bot.majorVersion=="1.9" || bot.majorVersion=="1.10") {
        bot._client.write('block_place', {
          location: pos,
          direction: vectorToDirection(faceVector),
          hand:0,
          cursorX: 8,
          cursorY: 8,
          cursorZ: 8
        });
      }

      if(bot.majorVersion=="1.11") {
        bot._client.write('block_place', {
          location: pos,
          direction: vectorToDirection(faceVector),
          hand:0,
          cursorX: 0.5,
          cursorY: 0.5,
          cursorZ: 0.5
        });
      }

      const dest = pos.plus(faceVector);
      const eventName = "blockUpdate:" + dest;
      bot.on(eventName, onBlockUpdate);
      function onBlockUpdate(oldBlock,newBlock){
        bot.removeListener(eventName, onBlockUpdate);
        if(oldBlock.type === newBlock.type)
          cb(new Error("No block has been placed : the block is still "+oldBlock.name));
        else
          cb();

      }
    });
  }

  function createActionNumber() {
    return nextActionNumber++;
  }


  function updateHeldItem() {
    bot.heldItem = bot.inventory.slots[bot.QUICK_BAR_START + bot.quickBarSlot];
    bot.entity.heldItem = bot.heldItem;
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
    const click = windowClickQueue.shift();
    assert.ok(click.id <= actionId);
    while(actionId > click.id) {
      onAccepted();
      click = windowClickQueue.shift();
    }
    assert.ok(click);

    if(accepted) {
      onAccepted();
    } else {
      onRejected();
    }
    updateHeldItem();

    function onAccepted() {
      const window = windowId === 0 ? bot.inventory : bot.currentWindow;
      if(!window || window.id !== click.windowId) return;
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
    if(slot >= bot.QUICK_BAR_START && bot.lastDigTime != null) {
      const timeSinceLastDig = new Date() - bot.lastDigTime;
      if(timeSinceLastDig < DIG_CLICK_TIMEOUT) {
        setTimeout(function() {
          clickWindow(slot, mouseButton, mode, cb);
        }, DIG_CLICK_TIMEOUT - timeSinceLastDig);
        return;
      }
    }
    cb = cb || noop;
    const window = bot.currentWindow || bot.inventory;

    assert.ok(mouseButton === 0 || mouseButton === 1);
    assert.strictEqual(mode, 0);
    const actionId = createActionNumber();

    const click = {
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
      item: slot === -999 ? {blockId: -1} : Item.toNotch(window.slots[slot])
    });
    bot.once("confirmTransaction" + actionId, function(success) {
      if(success) {
        cb();
      } else {
        cb(new Error("Server rejected transaction."));
      }
    });
    // notchian servers are assholes and only confirm certain transactions.
    if(!window.transactionRequiresConfirmation(click)) {
      // jump the gun and accept the click
      confirmTransaction(window.id, actionId, true);
    }
  }

  function putAway(slot, cb) {
    clickWindow(slot, 0, 0, function(err) {
      if(err) return cb(err);
      const window = bot.currentWindow || bot.inventory;
      const start = window.inventorySlotStart;
      const end = start + windows.INVENTORY_SLOT_COUNT;
      putSelectedItemRange(start, end, window, null, cb);
    });
  }

  function moveSlotItem(sourceSlot, destSlot, cb) {
    clickWindow(sourceSlot, 0, 0, function(err) {
      if(err) return cb(err);
      clickWindow(destSlot, 0, 0, function(err) {
        // if we're holding an item, put it back where the source item was.
        // otherwise we're done.
        if(err) {
          cb(err);
        } else if(bot.inventory.selectedItem) {
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
    const window = bot.currentWindow;
    if (!windowItems || window.id !== windowItems.windowId){
      // don't emit windowOpen until we have the slot data
      bot.once("setWindowItems:" + window.id, function() {
        bot.emit("windowOpen", window);
      });
    } else {
      const i, item;
      for(i = 0; i < windowItems.items.length; ++i) {
        item = Item.fromNotch(windowItems.items[i]);
        window.updateSlot(i, item);
      }
      updateHeldItem();
      bot.emit("windowOpen", window);
    }
  });
  bot._client.on('close_window', function(packet) {
    // close window
    const oldWindow = bot.currentWindow;
    bot.currentWindow = null;
    bot.emit("windowClose", oldWindow);
  });
  bot._client.on('set_slot', function(packet) {
    // set slot
    const window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if(!window || window.id !== packet.windowId) return;
    const newItem = Item.fromNotch(packet.item);
    const oldItem = window.slots[packet.slot];
    window.updateSlot(packet.slot, newItem);
    updateHeldItem();
    bot.emit("setSlot:" + window.id, oldItem, newItem);
  });
  bot._client.on('window_items', function(packet) {
    const window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if(!window || window.id !== packet.windowId) {
      windowItems = packet;
      return;
    }
    // set window items
    const i, item;
    for(i = 0; i < packet.items.length; ++i) {
      item = Item.fromNotch(packet.items[i]);
      window.updateSlot(i, item);
    }
    updateHeldItem();
    bot.emit("setWindowItems:" + window.id);
  });

  bot.activateBlock = activateBlock;
  bot.activateEntity = activateEntity;
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
  bot.openEntity = openEntity;
  bot.moveSlotItem = moveSlotItem;
  bot.updateHeldItem = updateHeldItem;

}

function noop(err) {
  if(err) throw err;
}

function vectorToDirection(v) {
  if(v.y < 0) {
    return 0;
  } else if(v.y > 0) {
    return 1;
  } else if(v.z < 0) {
    return 2;
  } else if(v.z > 0) {
    return 3;
  } else if(v.x < 0) {
    return 4;
  } else if(v.x > 0) {
    return 5;
  }
  assert.ok(false, "invalid direction vector " + v);
}
