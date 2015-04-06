var util = require('util');
var assert = require('assert');
var Item = require('./item');
var EventEmitter = require("events").EventEmitter;


var INVENTORY_SLOT_COUNT = 36;

module.exports = {
  createWindow: createWindow,
  Window: Window,
  InventoryWindow: InventoryWindow,
  ChestWindow: ChestWindow,
  CraftingTableWindow: CraftingTableWindow,
  FurnaceWindow: FurnaceWindow,
  DispenserWindow: DispenserWindow,
  EnchantmentTableWindow: EnchantmentTableWindow,
  BrewingStandWindow: BrewingStandWindow,
  INVENTORY_SLOT_COUNT: INVENTORY_SLOT_COUNT,
};

var windows = {
  "minecraft:chest":ChestWindow,
  "minecraft:crafting_table":CraftingTableWindow,
  "minecraft:furnace":FurnaceWindow,
  "minecraft:dispenser":DispenserWindow,
  "minecraft:enchanting_table":EnchantmentTableWindow,
  "minecraft:brewing_stand":BrewingStandWindow,
};

function createWindow(id, type, title, slotCount) {
  return new windows[type](id, title, slotCount);
}

util.inherits(Window, EventEmitter);
function Window(id, type, title, slotCount) {
  this.id = id;
  this.type = type;
  this.title = title;
  this.slots = new Array(slotCount);
  // in vanilla client, this is the item you are holding with the
  // mouse cursor
  this.selectedItem = null;
}

Window.prototype.findItemRange = function(start, end, itemType, metadata, notFull) {
  assert.notEqual(itemType, null);
  for (var i = start; i < end; ++i) {
    var item = this.slots[i];
    if (item && itemType === item.type &&
       (metadata == null || metadata === item.metadata) &&
       (!notFull || item.count < item.stackSize))
    {
      return item;
    }
  }
  return null;
};

Window.prototype.findInventoryItem = function(itemType, metadata, notFull) {
  assert.ok(this.inventorySlotStart != null);

  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  return this.findItemRange(this.inventorySlotStart, end, itemType, metadata, notFull);
};

Window.prototype.firstEmptySlotRange = function(start, end) {
  for (var i = start; i < end; ++i) {
    if (!this.slots[i]) return i;
  }
  return null;
};

Window.prototype.firstEmptyInventorySlot = function() {
  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  return this.firstEmptySlotRange(this.inventorySlotStart, end);
};

Window.prototype.acceptClick = function(click) {
  assert.ok(click.mouseButton === 0 || click.mouseButton === 1);
  var invSlotEnd = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  if (click.slot === -999) {
    this.acceptOutsideWindowClick(click);
  } else if (click.slot >= this.inventorySlotStart && click.slot < invSlotEnd) {
    this.acceptInventoryClick(click);
  } else {
    this.acceptUniqueClick(click);
  }
};

Window.prototype.acceptOutsideWindowClick = function(click) {
  assert.strictEqual(click.mode, 0, "unimplemented");
  if (click.mouseButton === 0) {
    this.selectedItem = null;
  } else if (click.mouseButton === 1) {
    this.selectedItem.count -= 1;
    if (! this.selectedItem.count) this.selectedItem = null;
  } else {
    assert.ok(false, "unimplemented");
  }
};

Window.prototype.acceptInventoryClick = function(click) {
  if (click.mouseButton === 0) {
    if (click.mode > 0) {
      assert.ok(false, "unimplemented");
    } else {
      this.acceptSwapAreaLeftClick(click);
    }
  } else if (click.mouseButton === 1) {
    this.acceptSwapAreaRightClick(click);
  } else {
    assert.ok(false, "unimplemented");
  }
};

Window.prototype.acceptNonInventorySwapAreaClick = function(click) {
  assert.strictEqual(click.mode, 0, "unimplemented");
  if (click.mouseButton === 0) {
    this.acceptSwapAreaLeftClick(click);
  } else if (click.mouseButton === 1) {
    this.acceptSwapAreaRightClick(click);
  } else {
    assert.ok(false, "unimplemented");
  }
};


Window.prototype.acceptSwapAreaRightClick = function(click) {
  assert.strictEqual(click.mouseButton, 1);
  assert.strictEqual(click.mode, 0);

  var item = this.slots[click.slot];
  if (this.selectedItem) {
    if (item) {
      if (item.type === this.selectedItem.type &&
          item.metadata === this.selectedItem.metadata)
      {
        item.count += 1;
        this.selectedItem.count -= 1;
        if (this.selectedItem.count === 0) this.selectedItem = null;
      } else {
        // swap selected item and window item
        this.updateSlot(click.slot, this.selectedItem);
        this.selectedItem = item;
      }
    } else {
      if (this.selectedItem.count === 1) {
        this.updateSlot(click.slot, this.selectedItem);
        this.selectedItem = null;
      } else {
        this.updateSlot(click.slot, new Item(this.selectedItem.type, 1,
              this.selectedItem.metadata, this.selectedItem.nbt));
        this.selectedItem.count -= 1;
      }
    }
  } else if (item) {
    // grab 1/2 of item
    this.selectedItem = new Item(item.type, Math.ceil(item.count / 2),
        item.metadata, item.nbt);
    item.count -= this.selectedItem.count;
    if (item.count === 0) this.updateSlot(item.slot, null);
  }
};

Window.prototype.acceptSwapAreaLeftClick = function(click) {
  assert.strictEqual(click.mouseButton, 0);
  assert.strictEqual(click.mode, 0);
  var item = this.slots[click.slot];
  if (item && this.selectedItem &&
      item.type === this.selectedItem.type &&
      item.metadata === this.selectedItem.metadata)
  {
    // drop as many held item counts into the slot as we can
    var newCount = item.count + this.selectedItem.count;
    var leftover = newCount - item.stackSize;
    if (leftover <= 0) {
      item.count = newCount;
      this.selectedItem = null;
    } else {
      item.count = item.stackSize;
      this.selectedItem.count = leftover;
    }
  } else {
    // swap selected item and window item
    var tmp = this.selectedItem;
    this.selectedItem = item;
    this.updateSlot(click.slot, tmp);
  }
};

Window.prototype.updateSlot = function (slot, newItem) {
  if (newItem) newItem.slot = slot;
  var oldItem = this.slots[slot];
  this.slots[slot] = newItem;
  this.emit("windowUpdate", slot, oldItem, newItem);
};

Window.prototype.acceptUniqueClick = function(click) {
  assert.ok(false, "override this method");
};

Window.prototype.countRange = function(start, end, itemType, metadata) {
  var sum = 0;
  for (var i = start; i < end; ++i) {
    var item = this.slots[i];
    if (item && itemType === item.type &&
       (metadata == null || item.metadata === metadata))
    {
      sum += item.count;
    }
  }
  return sum;
};

Window.prototype.itemsRange = function(start, end) {
  var results = [];
  for (var i = start; i < end; ++i) {
    var item = this.slots[i];
    if (item) results.push(item);
  }
  return results;
};

Window.prototype.count = function(itemType, metadata) {
  itemType = parseInt(itemType, 10); // allow input to be string
  assert.ok(this.inventorySlotStart != null);

  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  return this.countRange(this.inventorySlotStart, end, itemType, metadata);
};

Window.prototype.items = function() {
  assert.ok(this.inventorySlotStart != null);
  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  return this.itemsRange(this.inventorySlotStart, end);
};

Window.prototype.emptySlotCount = function() {
  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  var count = 0;
  for (var i = this.inventorySlotStart; i < end; ++i) {
    if (!this.slots[i]) count += 1;
  }
  return count;
};

Window.prototype.transactionRequiresConfirmation = function(click) {
  return true;
};

Window.prototype.acceptCraftingClick = function(click) {
  assert.strictEqual(click.mouseButton, 0);
  assert.strictEqual(click.mode, 0);
  assert.equal(this.selectedItem, null);
  this.acceptNonInventorySwapAreaClick(click);
};

function InventoryWindow(id, title, slotCount) {
  Window.call(this, id, null, title, slotCount);
}
util.inherits(InventoryWindow, Window);

InventoryWindow.prototype.inventorySlotStart = 9;

InventoryWindow.prototype.acceptUniqueClick = function(click) {
  if (click.slot === 0) {
    this.acceptCraftingClick(click);
  } else if (click.slot >= 1 && click.slot < 9) {
    this.acceptNonInventorySwapAreaClick(click);
  }
};


function ChestWindow(id, title, slotCount) {
  Window.call(this, id, 0, title, slotCount);

  this.inventorySlotStart = slotCount > 62 ? 54 : 27;
}
util.inherits(ChestWindow, Window);

ChestWindow.prototype.chestItems = function() {
  return this.itemsRange(0, this.inventorySlotStart);
};

ChestWindow.prototype.chestCount = function(itemType, metadata) {
  itemType = parseInt(itemType, 10); // allow input to be a string
  return this.countRange(0, this.inventorySlotStart, itemType, metadata);
};

ChestWindow.prototype.findChestItem = function(itemType, metadata, notFull) {
  itemType = parseInt(itemType, 10); // allow input to be a string
  return this.findItemRange(0, this.inventorySlotStart, itemType, metadata, notFull);
};

ChestWindow.prototype.firstEmptyChestSlot = function() {
  return this.firstEmptySlotRange(0, this.inventorySlotStart);
};

ChestWindow.prototype.acceptUniqueClick = function(click) {
  assert.ok(click.slot >= 0);
  assert.ok(click.slot < this.inventorySlotStart);
  this.acceptNonInventorySwapAreaClick(click);
};

function CraftingTableWindow(id, title, slotCount) {
  Window.call(this, id, 1, title, slotCount);
}
util.inherits(CraftingTableWindow, Window);

CraftingTableWindow.prototype.inventorySlotStart = 10;

CraftingTableWindow.prototype.acceptUniqueClick = function(click) {
  if (click.slot === 0) {
    this.acceptCraftingClick(click);
  } else if (click.slot >= 1 && click.slot < 10) {
    this.acceptNonInventorySwapAreaClick(click);
  }
};

function FurnaceWindow(id, title, slotCount) {
  Window.call(this, id, 2, title, slotCount);
}
util.inherits(FurnaceWindow, Window);

FurnaceWindow.prototype.inventorySlotStart = 3;

FurnaceWindow.prototype.acceptUniqueClick = function(click) {
  this.acceptNonInventorySwapAreaClick(click);
};

function DispenserWindow(id, title, slotCount) {
  Window.call(this, id, 3, title, slotCount);
}
util.inherits(DispenserWindow, Window);

DispenserWindow.prototype.inventorySlotStart = 9;

DispenserWindow.prototype.dispenserItems = function() {
  return this.itemsRange(0, this.inventorySlotStart);
};

DispenserWindow.prototype.dispenserCount = function(itemType, metadata) {
  itemType = parseInt(itemType, 10); // allow input to be a string
  return this.countRange(0, this.inventorySlotStart, itemType, metadata);
};

DispenserWindow.prototype.acceptUniqueClick = function(click) {
  assert.ok(click.slot >= 0);
  assert.ok(click.slot < this.inventorySlotStart);
  this.acceptNonInventorySwapAreaClick(click);
};

function EnchantmentTableWindow(id, title, slotCount) {
  // this window incorrectly reports the number of slots as 9. it should be 1.
  Window.call(this, id, 4, title, 2);
}
util.inherits(EnchantmentTableWindow, Window);

EnchantmentTableWindow.prototype.inventorySlotStart = 2;

EnchantmentTableWindow.prototype.acceptUniqueClick = function(click) {
  if (click.slot === 0 || click.slot === 1) {
    // this is technically incorrect. there are some exceptions to enchantment
    // table slot clicks but we're going to bank on them not being used.
    this.acceptNonInventorySwapAreaClick(click);
  }
};


function BrewingStandWindow(id, title, slotCount) {
  Window.call(this, id, 5, title, slotCount);
}
util.inherits(BrewingStandWindow, Window);

BrewingStandWindow.prototype.inventorySlotStart = 5;
