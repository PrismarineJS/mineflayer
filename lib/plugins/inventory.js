var Item = require('../item')
  , assert = require('assert')
  , recipes = require('../enums/recipes')
  , Window = require('../window')

module.exports = inject;

var armorSlots = {
  head: 5,
  torso: 6,
  legs: 7,
  feet: 8,
};

function inject(bot) {
  var nextActionNumber = 0;

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null;
  bot.inventory = new Window(-1, -1, "inventory", 36);
  bot.currentWindow = null;

  function putSelectedItemBack(slot) {
    var window = bot.currentWindow || bot.inventory;
    // put the selected item back into window.
    // first try to put it in an item that already exists and just increase
    // the count. If there is still some left over, try to find an empty slot
    // to put it in. If that fails and slot is not null, click slot. Finally,
    // toss whatever is left.

  }

  function craft(recipe, options, cb) {
    if (! cb && options) {
      cb = options;
      options = {};
    }
    cb = cb || noop;
    options = options || {};

    var craftingTable = options.craftingTable;
    // TODO: take count into account
    var count = options.count || 1;
    var metadata = options.metadata || 0;

    if (recipeRequiresTable(recipe) && !craftingTable) {
      cb(new Error("recipe requires craftingTable"));
      return;
    }
    // TODO: check if the extraSlots will be enough, and if not
    // callback with an error right away

    if (craftingTable) {
      var heldItem = bot.inventory.slots[bot.quickBarSlot];
      bot.client.write(0x0f, {
        x: craftingTable.pos.x,
        y: craftingTable.pos.y,
        z: craftingTable.pos.z,
        direction: 1,
        heldItem: itemToNotch(heldItem),
        cursorX: 8,
        cursorY: 8,
        cursorZ: 8,
      });
      bot.once('windowOpen', function(window) {
        if (window.type !== 1) {
          cb(new Error("crafting: non workbench used as workbench"));
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
        var itemType = it.row[it.x];
        if (!itemType) return nextShapeClick();
        if (!window.selectedItem || window.selectedItem.type !== itemType) {
          // we are not holding the item we need. click it.
          var sourceItem = window.findItem(itemType);
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
          (ingredient.metadata != null && window.selectedItem.metadata !== ingredient.metadata))
        {
          // we are not holding the item we need. click it.
          var sourceItem = window.findItem(ingredient.id, ingredient.metadata);
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
        putSelectedItemBack(originalSourceSlot, function(err) {
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
    // TODO: take metadata into account for source items. for example, say
    // the user is requesting recipes for bed. you can use any color wool.
    // the result list should include a recipe for every kind of wool that
    // the player has in their inventory.
    var possibleRecipes = recipes[itemType];
    var i, recipe;
    var results = [];
    for (i = 0; i < possibleRecipes.length; ++i) {
      recipe = possibleRecipes[i];
      if (recipe.metadata === metadata &&
          requirementsMetForRecipe(recipe, minResultCount, craftingTable))
      {
        results.push(recipe);
      }
    }
    return results;
  }

  function recipeDelta(recipe) {
    // returns a map of item type to a delta how many more or less you will
    // have in your inventory after crafting
    var delta = {};
    if (recipe.inShape) applyShape(recipe.inShape, 1);
    if (recipe.outShape) applyShape(recipe.outShape, -1);
    if (recipe.ingredients) applyIngredients(recipe.ingredients);
    return delta;

    function applyShape(shape, direction) {
      var x, y, row, id;
      for (y = 0; y < shape.length; ++y) {
        row = recipe.inShape[y];
        for (x = 0; x < row.length; ++x) {
          id = row[x];
          delta[id] = delta[id] ? delta[id] + direction : direction;
        }
      }
    }

    function applyIngredients(ingredients) {
      var i, id;
      for (i = 0; i < ingredients; ++i) {
        id = ingredients[i].id;
        delta[id] = delta[id] ? delta[id] + 1 : 1;
      }
    }
  }

  function recipeRequiresTable(recipe) {
    var spaceLeft = 4;

    var x, y, row;
    if (recipe.inShape) {
      if (recipe.inShape.length > 2) return true;
      for (y = 0; y < recipe.inShape.length; ++y) {
        row = recipe.inShape[y];
        if (row.length > 2) return true;
        for (x = 0; x < row.length; ++x) {
          if (row[x]) spaceLeft -= 1;
        }
      }
    }
    if (recipe.ingredients) spaceLeft -= recipe.ingredients.length;
    return spaceLeft < 0;
  }

  function requirementsMetForRecipe(recipe, minResultCount, craftingTable) {
    if (recipeRequiresTable(recipe) && !craftingTable) return false;

    // how many times we have to perform the craft to achieve minResultCount
    var craftCount = Math.ceil(minResultCount / recipe.count);

    // false if not enough inventory to make all the ones that we want
    var delta = recipeDelta(recipe);
    var i, id;
    for (i = 0; i < craftCount; ++i) {
      for (id in delta) {
        if ((bot.inventory.count[id] || 0) + delta[id] * craftCount < 0) return false;
      }
    }

    // otherwise true
    return true;
  }

  function placeBlock(referenceBlock, faceVector) {
    var pos = referenceBlock.pos;
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

  function updateSlot(slot, newItem) {
    var window = bot.currentWindow || bot.inventory;
    var invCount = window.count;
    var oldItem = window.slots[slot];
    if (oldItem) {
      invCount[oldItem.type] -= oldItem.count;
    }
    if (newItem) {
      newItem.slot = slot;
      invCount[newItem.type] = invCount[newItem.type] ?
        invCount[newItem.type] + newItem.count : newItem.count;
    }
    window.slots[slot] = newItem;
  }

  var windowClickQueue = [];
  function clickWindow(slot, mouseButton, shift) {
    var window = bot.currentWindow || bot.inventory;

    assert.strictEqual(mouseButton, 0);
    assert.strictEqual(shift, false);
    var actionId = createActionNumber();

    windowClickQueue.push({
      slot: slot,
      mouseButton: shift,
      shift: shift,
      id: actionId,
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
    var window = bot.currentWindow || bot.inventory;
    
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
      var item = window.slots[click.slot];
      if (item && window.selectedItem &&
          item.type === window.selectedItem.type &&
          item.meta === window.selectedItem.meta)
      {
        // drop as many held item counts into the slot as we can
        var newCount = item.count + window.selectedItem.count;
        var leftover = newCount - item.stackSize;
        if (leftover <= 0) {
          item.count = newCount;
          window.selectedItem = null;
        } else {
          item.count = item.stackSize;
          window.selectedItem.count = leftover;
        }
      } else {
        // swap selected item and window item
        var tmp = window.selectedItem;
        window.selectedItem = item;
        updateSlot(click.slot, tmp);
      }
    }

    function clickOutsideWindow() {
      window.selectedItem = null;
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

  function toss(itemType, count, cb) {
    count = count || 1;
    // TODO
  }

  function getItem(itemType) {
    itemType = parseInt(itemType, 10);
    var slot, slotItem;
    for(slot = 0; slot < bot.inventory.slots.length; ++slot) {
      slotItem = bot.inventory.slots[slot];
      if (slotItem && slotItem.type === itemType) {
        assert.strictEqual(slotItem.slot, slot);
        return slotItem;
      }
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
      destSlot = 36 + bot.quickBarSlot;
    } else {
      destSlot = armorSlots[destination];
      assert.ok(armorSlots[destination] != null,
          "invalid destination: " + destination);
    }

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
    bot.currentWindow = new Window(packet.windowId, packet.inventoryType,
      packet.windowTitle, packet.slotCount);
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
    // (furnace fuel/progress, enchantment level, etc)
  });
  bot.client.on(0x6b, function(packet) {
    // creative inventory action
    console.info("got 0x6b creative inventory action", packet);
  });

  bot.equip = equip;
  bot.toss = toss;
  bot.tossStack = tossStack;
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
