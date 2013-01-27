var Item = require('../item')
  , assert = require('assert')
  , Recipe = require('../recipe')
  , windows = require('../windows')

module.exports = inject;

var armorSlots = {
  head: 5,
  torso: 6,
  legs: 7,
  feet: 8,
};

function inject(bot) {
  var nextActionNumber = 0;
  var windowClickQueue = [];

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null;
  bot.inventory = new windows.InventoryWindow(0, "Inventory", 44);
  bot.currentWindow = null;

  function putSelectedItemBack(window, slot, cb) {
    // put the selected item back into window.

    // nothing to do if no selected item
    if (! window.selectedItem) {
      cb();
      return;
    }

    // try to put it in an item that already exists and just increase
    // the count.
    tryToJoin();

    function tryToFindEmpty() {
      var emptySlot = window.firstEmptyInventorySlot();
      if (emptySlot == null) {
        // if there is still some leftover and slot is not null, click slot
        if (slot == null) {
          tossLeftover();
        } else {
          clickWindowConfirm(slot, 0, false, tossLeftover);
        }
      } else {
        clickWindowConfirm(emptySlot, 0, false, cb);
      }
    }
    function tossLeftover() {
      if (window.selectedItem) {
        clickWindowConfirm(-999, 0, false, cb);
      } else {
        cb();
      }
    }
    function tryToJoin() {
      for (var i = 0; i < window.slots.length; ++i) {
        var item = window.slots[i];
        if (item && item.type === window.selectedItem.type &&
            item.metadata === window.selectedItem.metadata &&
            item.count < item.stackSize)
        {
          clickWindowConfirm(item.slot, 0, false, onClick);
          return;
        }
      }
      // If there is still some left over, try to find an empty slot
      // to put it in.
      if (window.selectedItem) {
        tryToFindEmpty();
      } else {
        cb();
      }

      function onClick(err) {
        if (err) {
          cb(err);
        } else {
          tryToJoin();
        }
      }
    }
  }

  function activateBlock(block) {
    // TODO: tell the server that we are not sneaking while doing this
    var heldItem = bot.inventory.slots[bot.quickBarSlot];
    bot.client.write(0x0f, {
      x: block.position.x,
      y: block.position.y,
      z: block.position.z,
      direction: 1,
      heldItem: itemToNotch(heldItem),
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8,
    });
  }

  function craft(recipe, count, craftingTable, cb) {
    // TODO: take count into account
    count = count == null ? 1 : count;
    cb = cb || noop;

    if (recipe.requiresTable && !craftingTable) {
      cb(new Error("recipe requires craftingTable"));
      return;
    }

    if (craftingTable) {
      activateBlock(craftingTable);
      bot.once('windowOpen', function(window) {
        if (window.type !== 1) {
          cb(new Error("crafting: non craftingTable used as craftingTable"));
          return;
        }
        startClicking(window, 3, 3);
      });
    } else {
      startClicking(bot.inventory, 2, 2);
    }

    function startClicking(window, w, h) {
      var extraSlots = unusedRecipeSlots();
      var it = {
        x: 0,
        y: 0,
        row: recipe.inShape[0],
      };
      var ingredientIndex = 0;
      var originalSourceSlot = null;
      clickShape();

      function incrementShapeIterator() {
        it.x += 1;
        if (it.x >= it.row.length) {
          it.y += 1;
          if (it.y >= recipe.inShape.length) return null;
          it.x = 0;
          it.row = recipe.inShape[it.y];
        }
        return it;
      }
      function nextShapeClick() {
        if (incrementShapeIterator()) {
          clickShape();
        } else if (! recipe.ingredients) {
          grabResult();
        } else {
          nextIngredientsClick();
        }
      }
      function clickShape() {
        var destSlot = slot(it.x, it.y);
        var ingredient = it.row[it.x];
        if (!ingredient) return nextShapeClick();
        if (!window.selectedItem || window.selectedItem.type !== ingredient.id ||
            (ingredient.metadata != null &&
             window.selectedItem.metadata !== ingredient.metadata))
        {
          // we are not holding the item we need. click it.
          var sourceItem = window.findInventoryItem(ingredient.id, ingredient.metadata);
          if (!sourceItem) return cb(new Error("missing ingredient"));
          if (originalSourceSlot == null) originalSourceSlot = sourceItem.slot;
          clickWindow(sourceItem.slot, 0, false);
        }
        clickWindowConfirm(destSlot, 1, false, function(err) {
          if (err) {
            cb(err);
          } else {
            nextShapeClick();
          }
        });
      }
      function nextIngredientsClick() {
        var ingredient = recipe.ingredients[ingredientIndex];
        var destSlot = extraSlots.pop();
        if (!window.selectedItem || window.selectedItem.type !== ingredient.id ||
          (ingredient.metadata != null &&
           window.selectedItem.metadata !== ingredient.metadata))
        {
          // we are not holding the item we need. click it.
          var sourceItem = window.findInventoryItem(ingredient.id, ingredient.metadata);
          if (!sourceItem) return cb(new Error("missing ingredient"));
          clickWindow(sourceItem.slot, 0, false);
        }
        clickWindowConfirm(destSlot, 1, false, function(err) {
          if (err) {
            cb(err);
          } else if (++ingredientIndex < recipe.ingredients.length) {
            nextIngredientsClick();
          } else {
            grabResult();
          }
        });
      }
      function grabResult() {
        putSelectedItemBack(window, originalSourceSlot, function(err) {
          if (err) {
            cb(err);
          } else {
            // shift click result
            clickWindowConfirm(0, 0, true, cb);
          }
        });
      }
      function slot(x, y) {
        return 1 + x + w * y;
      }
      function unusedRecipeSlots() {
        var result = [];
        var x, y, row;
        for (y = 0; y < recipe.inShape.length; ++y) {
          row = recipe.inShape[y];
          for (x = 0; x < row.length; ++x) {
            if (! row[x]) result.push(slot(x, y));
          }
          for (; x < w; ++x) {
            result.push(slot(x, y));
          }
        }
        for (; y < h; ++y) {
          for (x = 0; x < w; ++x) {
            result.push(slot(x, y));
          }
        }
        return result;
      }
    }
  }

  function recipesFor(itemType, metadata, minResultCount, craftingTable) {
    minResultCount = minResultCount == null ? 1 : minResultCount;
    var results = [];
    Recipe.find(itemType, metadata).forEach(function(recipe) {
      if (requirementsMetForRecipe(recipe, minResultCount, craftingTable)) {
        results.push(recipe);
      }
    });
    return results;
  }

  function requirementsMetForRecipe(recipe, minResultCount, craftingTable) {
    if (recipe.requiresTable && !craftingTable) return false;

    // how many times we have to perform the craft to achieve minResultCount
    var craftCount = Math.ceil(minResultCount / recipe.count);

    // false if not enough inventory to make all the ones that we want
    var delta = recipe.delta;
    var i, id;
    for (i = 0; i < craftCount; ++i) {
      for (id in delta) {
        if (bot.inventory.count(id) + delta[id] * craftCount < 0) return false;
      }
    }

    // otherwise true
    return true;
  }

  function placeBlock(referenceBlock, faceVector) {
    // TODO: tell the server that we are sneaking while doing this
    var pos = referenceBlock.position;
    var heldItem = bot.inventory.slots[bot.quickBarSlot];
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

  function createActionNumber() {
    return nextActionNumber++;
  }

  function setQuickBarSlot(slot) {
    assert.ok(slot >= 0);
    assert.ok(slot < 9);
    bot.quickBarSlot = slot;
    bot.client.write(0x10, {
      slotId: slot,
    });
  }

  function clickWindow(slot, mouseButton, shift) {
    var window = bot.currentWindow || bot.inventory;

    assert.ok(mouseButton === 0 || mouseButton === 1);
    var actionId = createActionNumber();

    windowClickQueue.push({
      slot: slot,
      mouseButton: mouseButton,
      shift: shift,
      id: actionId,
      windowId: window.id,
    });
    bot.client.write(0x66, {
      windowId: window.id,
      slot: slot,
      mouseButton: mouseButton,
      action: actionId,
      shift: shift,
      item: slot === -999 ? { id: -1 } : itemToNotch(window.slots[slot]),
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

    if (packet.accepted) {
      accepted();
    } else {
      rejected();
    }

    function accepted() {
      var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
      if (! window || window.id !== click.windowId) return;
      window.acceptClick(click);
      bot.emit("confirmTransaction" + click.id, true);
    }

    function rejected() {
      bot.client.write(0x6a, {
        windowId: 0,
        action: click.id,
        accepted: false,
      });
      bot.emit("confirmTransaction" + click.id, false);
    }
  });

  function clickWindowConfirm(slot, button, shift, cb) {
    cb = cb || noop;
    var id = clickWindow(slot, button, shift);
    bot.once("confirmTransaction" + id, function(success) {
      if (success) {
        cb();
      } else {
        cb(new Error("Server rejected transaction."));
      }
    });
  }

  function tossStack(item, cb) {
    cb = cb || noop;
    assert.ok(item);
    clickWindow(item.slot, 0, false);
    clickWindowConfirm(-999, 0, false, cb);
  }

  function tossOne(window, itemType, metadata, cb) {
    var item = null;
    if (!window.selectedItem || window.selectedItem.type !== itemType ||
       (metadata != null && window.selectedItem.metadata !== metadata))
    {
      item = window.findInventoryItem(itemType, metadata);
      if (! item) {
        cb(new Error("item not found"));
        return;
      }
      clickWindow(item.slot, 0, false);
    }
    clickWindowConfirm(-999, 1, false, function(err) {
      cb(err, item);
    });
  }

  function toss(itemType, metadata, count, cb) {
    count = count == null ? 1 : count;
    cb = cb || noop;
    var window = bot.currentWindow || bot.inventory;
    var firstItem = null;
    tossNext();
    function tossNext() {
      if (count === 0) {
        putSelectedItemBack(window, firstItem && firstItem.slot, cb);
      } else {
        tossOne(window, itemType, metadata, onTossOne);
      }
      function onTossOne(err, item) {
        if (err) {
          cb(err);
        } else {
          firstItem = firstItem || item;
          count -= 1;
          tossNext();
        }
      }
    }
  }

  function getDestSlot(destination) {
    if (! destination || destination === 'hand') {
      return 36 + bot.quickBarSlot;
    } else {
      var destSlot = armorSlots[destination];
      assert.ok(destSlot != null, "invalid destination: " + destination);
      return destSlot;
    }
  }

  function unequip(destination, cb) {
    cb = cb || noop;
    var destSlot = getDestSlot(destination);
    clickWindowConfirm(destSlot, 0, true, cb);
  }

  function equip(itemType, destination, cb) {
    cb = cb || noop;

    var sourceItem = bot.inventory.findInventoryItem(itemType);
    var sourceSlot = sourceItem.slot;

    // unable to equip requested item type
    if (!sourceItem) {
      cb(new Error("item " + itemType + " not present in inventory"));
    }

    var destSlot = getDestSlot(destination);

    if (sourceSlot === destSlot) {
      // don't need to do anything
      cb();
      return;
    }

    if (sourceSlot >= 36) {
      // all we have to do is change the quick bar selection
      bot.setQuickBarSlot(sourceSlot - 36);
      cb();
      return;
    }

    clickWindow(sourceSlot, 0, false);
    clickWindowConfirm(destSlot, 0, false, function(err) {
      // if we're holding an item, put it back where the source item was.
      // otherwise we're done.
      if (err) {
        cb(err);
      } else if (bot.inventory.selectedItem) {
        clickWindowConfirm(sourceSlot, 0, false, cb);
      } else {
        cb();
      }
    });
  }

  bot.client.on(0x10, function(packet) {
    // held item change
    bot.quickBarSlot = packet.slotId;
  });
  bot.client.on(0x64, function(packet) {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      packet.inventoryType, packet.windowTitle, packet.slotCount);
    bot.emit("windowOpen", bot.currentWindow);
  });
  bot.client.on(0x65, function(packet) {
    // close window
    var oldWindow = bot.currentWindow;
    bot.currentWindow = null;
    bot.emit("windowClose", oldWindow);
  });
  bot.client.on(0x67, function(packet) {
    // set slot
    var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if (! window || window.id !== packet.windowId) return;
    var newItem = itemFromNotch(packet.item);
    window.updateSlot(packet.slot, newItem);
  });
  bot.client.on(0x68, function(packet) {
    // set window items
    var window = packet.windowId === 0 ? bot.inventory : bot.currentWindow;
    if (! window || window.id !== packet.windowId) return;
    var i, item;
    for (i = 0; i < packet.items.length; ++i) {
      item = itemFromNotch(packet.items[i]);
      window.updateSlot(i, item);
    }
  });
  bot.client.on(0x69, function(packet) {
    // update window property
    // (furnace fuel/progress, enchantment level, etc)
  });
  bot.client.on(0x6b, function(packet) {
    // creative inventory action
    console.info("got 0x6b creative inventory action", packet);
  });

  bot.equip = equip;
  bot.unequip = unequip;
  bot.toss = toss;
  bot.tossStack = tossStack;
  bot.activateBlock = activateBlock;
  bot.placeBlock = placeBlock;
  bot.setQuickBarSlot = setQuickBarSlot;
  bot.craft = craft;
  bot.recipesFor = recipesFor;
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
