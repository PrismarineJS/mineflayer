var Item = require('../item')
  , assert = require('assert')

module.exports = inject;

var armorSlots = {
  head: 5,
  torso: 6,
  legs: 7,
  feet: 8,
};

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

function inject(bot) {
  bot.currentWindow = null;

  bot.inventory = {
    slots: new Array(36),
    // item id -> total count
    count: {},
    // 0-8, null = uninitialized
    // which quick bar slot is selected
    quickBarSlot: null,
    // in vanilla client, this is the item you are holding with the
    // mouse cursor
    selectedItem: null,
  };

  function placeBlock(referenceBlock, faceVector) {
    var pos = referenceBlock.pos;
    var heldItem = bot.inventory.slots[bot.inventory.quickBarSlot];
    bot.client.write(0x0f, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      direction: vectorToDirection(faceVector),
      heldItem: itemToNotch(heldItem),
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8,
    });
  }

  var nextActionNumber = 0;
  function createActionNumber() {
    return nextActionNumber++;
  }

  function updateSlot(slot, newItem) {
    var invCount = bot.inventory.count;
    var oldItem = bot.inventory.slots[slot];
    if (oldItem) {
      invCount[oldItem.type] -= oldItem.count;
    }
    if (newItem) {
      newItem.slot = slot;
      invCount[newItem.type] = invCount[newItem.type] ?
        invCount[newItem.type] + newItem.count : newItem.count;
    }
    bot.inventory.slots[slot] = newItem;
  }

  var windowClickQueue = [];
  function clickWindow(slot, mouseButton, shift) {
    assert.strictEqual(mouseButton, 0);
    assert.strictEqual(shift, false);
    // TODO: make clickWindow work for non-inventory windows
    var actionId = createActionNumber();

    windowClickQueue.push({
      slot: slot,
      mouseButton: shift,
      shift: shift,
      id: actionId,
    });
    bot.client.write(0x66, {
      windowId: 0, // TODO: use bot.currentWindow
      slot: slot,
      mouseButton: mouseButton,
      action: actionId,
      shift: shift,
      item: slot === -999 ? { id: -1 } : itemToNotch(bot.inventory.slots[slot]),
    });
    return actionId;
  }

  bot.client.on(0x6a, function(packet) {
    // confirm transaction
    
    // drop the queue entries for all the clicks that the server did not send
    // transaction packets for.
    var click = windowClickQueue.shift();
    assert.ok(click.id <= packet.action);
    while (packet.action > click.id) {
      bot.emit("confirmTransaction" + click.id, true);
      click = windowClickQueue.shift();
    }
    assert.ok(click);

    // TODO: handle shift
    if (packet.accepted) {
      if (false) {
        // TODO: this is where crafting will go
        assert.ok(false);
      } else if (click.mouseButton === 1) {
        // TODO: this is where right click will go
        assert.ok(false);
      } else {
        if (click.slot === -999) {
          clickOutsideWindow();
        } else {
          normalClick();
        }
      }
      bot.emit("confirmTransaction" + click.id, true);
    } else {
      rejected();
    }

    function rejected() {
      bot.client.write(0x6a, {
        windowId: 0,
        action: click.id,
        accepted: false,
      });
      bot.emit("confirmTransaction" + click.id, false);
    }

    function normalClick() {
      var item = bot.inventory.slots[click.slot];
      if (item && bot.inventory.selectedItem &&
          item.type === bot.inventory.selectedItem.type &&
          item.meta === bot.inventory.selectedItem.meta)
      {
        // drop as many held item counts into the slot as we can
        var newCount = item.count + bot.inventory.selectedItem.count;
        var leftover = newCount - item.stackSize;
        if (leftover <= 0) {
          item.count = newCount;
          bot.inventory.selectedItem = null;
        } else {
          item.count = item.stackSize;
          bot.inventory.selectedItem.count = leftover;
        }
      } else {
        // swap selected item and window item
        var tmp = bot.inventory.selectedItem;
        bot.inventory.selectedItem = item;
        updateSlot(click.slot, tmp);
      }
    }

    function clickOutsideWindow() {
      bot.inventory.selectedItem = null;
    }
  });

  function tossStack(item, cb) {
    assert.ok(item);
    clickWindow(item.slot, 0, false);
    var id = clickWindow(-999, 0, false);
    bot.once("confirmTransaction" + id, function(success) {
      if (success) {
        cb();
      } else {
        cb(new Error("server rejected transaction"));
      }
    });
  }

  function toss(itemType, count, cb) {
    count = count || 1;
    // TODO
  }

  function getItem(itemType) {
    itemType = parseInt(itemType, 10);
    var slot, slotItem;
    for(slot = 0; slot < bot.inventory.slots.length; ++slot) {
      slotItem = bot.inventory.slots[slot];
      if (slotItem && slotItem.type === itemType) return slotItem;
    }
    return null;
  }

  function equip(itemType, destination, cb) {
    cb = cb || noop;

    var sourceItem = getItem(itemType);
    var sourceSlot = sourceItem.slot;

    // unable to equip requested item type
    if (!sourceItem) {
      cb(new Error("item " + itemType + " not present in inventory"));
    }

    var destSlot;
    if (destination === 'hand') {
      destSlot = 36 + bot.inventory.quickBarSlot;
    } else {
      destSlot = armorSlots[destination];
      assert.ok(armorSlots[destination] != null,
          "invalid destination: " + destination);
    }

    clickWindow(sourceSlot, 0, false);
    var id = clickWindow(destSlot, 0, false);
    bot.once("confirmTransaction" + id, function(success) {
      if (!success) {
        cb(new Error("server rejected transaction"));
        return;
      }
      // if we're holding an item, put it back where the source item was.
      // otherwise we're done.
      if (! bot.inventory.selectedItem) {
        cb();
        return;
      }
      var id = clickWindow(sourceSlot, 0, false);
      bot.once("confirmTransaction" + id, function(success) {
        if (success) {
          cb();
        } else {
          cb(new Error("server rejected transaction"));
        }
      });
    });
  }

  bot.client.on(0x10, function(packet) {
    // held item change
    bot.inventory.quickBarSlot = packet.slotId;
  });
  bot.client.on(0x64, function(packet) {
    // open window
  });
  bot.client.on(0x65, function(packet) {
    // close window
  });
  bot.client.on(0x67, function(packet) {
    // set slot
    if (packet.windowId !== 0) return;
    var newItem = itemFromNotch(packet.item);
    updateSlot(packet.slot, newItem);
  });
  bot.client.on(0x68, function(packet) {
    // set window items
    if (packet.windowId !== 0) return;
    var i, item;
    for (i = 0; i < packet.items.length; ++i) {
      item = itemFromNotch(packet.items[i]);
      updateSlot(i, item);
    }
  });
  bot.client.on(0x69, function(packet) {
    // update window property
  });
  bot.client.on(0x6b, function(packet) {
    // creative inventory action
  });

  bot.equip = equip;
  bot.toss = toss;
  bot.tossStack = tossStack;
  bot.placeBlock = placeBlock;
}

function itemToNotch(item) {
  assert.ok(typeof item === 'object');
  return item ? {
    id: item.type,
    itemCount: item.count,
    itemDamage: item.meta,
    nbtData: item.nbt,
  } : { id: -1 };
}

function itemFromNotch(item) {
  return item.id === -1 ? null :
    new Item(item.id, item.itemCount, item.itemDamage, item.nbtData);
}

function noop() {}
