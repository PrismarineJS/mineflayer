var util = require('util')
  , assert = require('assert')

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
};

var INVENTORY_SLOT_COUNT = 35;

var windows = [
  ChestWindow,
  CraftingTableWindow,
  FurnaceWindow,
  DispenserWindow,
  EnchantmentTableWindow,
  BrewingStandWindow,
];

function createWindow(id, type, title, slotCount) {
  return new windows[type](id, title, slotCount);
}

function Window(id, type, title, slotCount) {
  this.id = id;
  this.type = type;
  this.title = title;
  this.slots = new Array(slotCount);
  // item id -> total count
  this.count = {};
  // in vanilla client, this is the item you are holding with the
  // mouse cursor
  this.selectedItem = null;
}

Window.prototype.findInventoryItem = function(itemType, metadata) {
  assert.ok(this.inventorySlotStart != null);

  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  for (var i = this.inventorySlotStart; i < end; ++i) {
    var item = this.slots[i];
    if (item && itemType === item.type &&
       (metadata == null || item.metadata === metadata))
    {
      return item;
    }
  }
  return null;
};

Window.prototype.firstEmptyInventorySlot = function() {
  var end = this.inventorySlotStart + INVENTORY_SLOT_COUNT;
  for (var i = this.inventorySlotStart; i < end; ++i) {
    if (!this.slots[i]) return i;
  }
  return null;
};

Window.prototype.acceptClick = function(click) {
  var self = this;
  assert.ok(click.mouseButton === 0 || click.mouseButton === 1);
  var invSlotEnd = self.inventorySlotStart + INVENTORY_SLOT_COUNT;
  if (click.slot === -999) {
    assert.strictEqual(click.shift, false, "unimplemented");
    if (click.mouseButton === 0) {
      self.selectedItem = null;
    } else if (click.mouseButton === 1) {
      self.selectedItem.count -= 1;
      if (! self.selectedItem.count) self.selectedItem = null;
    }
  } else if (click.slot >= self.inventorySlotStart && click.slot < invSlotEnd) {
    if (click.mouseButton === 0) {
      if (click.shift) {
        invShiftLeftClick();
      } else {
        invLeftClick();
      }
    } else {
      assert.ok(false, "unimplemented");
    }
  } else {
    self.acceptUniqueClick(click);
  }

  function invShiftLeftClick() {
    var clickedItem = self.slots[click.slot];
    if (!clickedItem) return;
    var invEnd = self.inventorySlotStart + INVENTORY_SLOT_COUNT;
    var i, slotItem;
    for (i = self.inventorySlotStart; i < invEnd; ++i) {
      slotItem = self.slots[i];
      if (!slotItem) continue;
      if (slotItem.type !== clickedItem.type) continue;
      if (slotItem.metadata !== clickedItem.metadata) continue;

      var newCount = slotItem.count + clickedItem.count;
      var leftover = newCount - slotItem.stackSize;
      if (leftover <= 0) {
        slotItem.count = newCount;
        self.slots[click.slot] = null;
        return;
      } else {
        slotItem.count = slotItem.stackSize;
        clickedItem.count = leftover;
      }
    }
    // we've put everything we could into existing items. now utilize empty
    // spaces if they exist
    for (i = self.inventorySlotStart; i < invEnd; ++i) {
      slotItem = self.slots[i];
      if (!slotItem) {
        self.slots[i] = clickedItem;
        self.slots[click.slot] = null;
        return;
      }
    }
  }

  function invLeftClick() {
    var item = self.slots[click.slot];
    if (item && self.selectedItem &&
        item.type === self.selectedItem.type &&
        item.meta === self.selectedItem.meta)
    {
      // drop as many held item counts into the slot as we can
      var newCount = item.count + self.selectedItem.count;
      var leftover = newCount - item.stackSize;
      if (leftover <= 0) {
        item.count = newCount;
        self.selectedItem = null;
      } else {
        item.count = item.stackSize;
        self.selectedItem.count = leftover;
      }
    } else {
      // swap selected item and window item
      var tmp = self.selectedItem;
      self.selectedItem = item;
      self.updateSlot(click.slot, tmp);
    }
  }
};

Window.prototype.updateSlot = function (slot, newItem) {
  var invCount = this.count;
  var oldItem = this.slots[slot];
  if (oldItem) invCount[oldItem.type] -= oldItem.count;
  if (newItem) {
    newItem.slot = slot;
    invCount[newItem.type] = invCount[newItem.type] ?
      invCount[newItem.type] + newItem.count : newItem.count;
  }
  this.slots[slot] = newItem;
};

Window.prototype.acceptUniqueClick = function(click) {
  console.log("click", click);
  assert.ok(false, "override this method");
};


function InventoryWindow(id, title, slotCount) {
  Window.call(this, id, null, title, slotCount);
}
util.inherits(InventoryWindow, Window);

InventoryWindow.prototype.inventorySlotStart = 9;


function ChestWindow(id, title, slotCount) {
  Window.call(this, id, 0, title, slotCount);

  this.inventorySlotStart = slotCount > 62 ? 54 : 27;
}
util.inherits(ChestWindow, Window);


function CraftingTableWindow(id, title, slotCount) {
  Window.call(this, id, 1, title, slotCount);
}
util.inherits(CraftingTableWindow, Window);

CraftingTableWindow.prototype.inventorySlotStart = 10;


function FurnaceWindow(id, title, slotCount) {
  Window.call(this, id, 2, title, slotCount);
}
util.inherits(FurnaceWindow, Window);

FurnaceWindow.prototype.inventorySlotStart = 3;


function DispenserWindow(id, title, slotCount) {
  Window.call(this, id, 3, title, slotCount);
}
util.inherits(DispenserWindow, Window);

DispenserWindow.prototype.inventorySlotStart = 9;


function EnchantmentTableWindow(id, title, slotCount) {
  // this window incorrectly reports the number of slots as 9. it should be 1.
  Window.call(this, id, 4, title, 1);
}
util.inherits(EnchantmentTableWindow, Window);

EnchantmentTableWindow.prototype.inventorySlotStart = 1;


function BrewingStandWindow(id, title, slotCount) {
  Window.call(this, id, 5, title, slotCount);
}
util.inherits(BrewingStandWindow, Window);

BrewingStandWindow.prototype.inventorySlotStart = 5;
