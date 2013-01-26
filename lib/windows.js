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
  this.inventorySlotCount = 35;
}

Window.prototype.findItem = function(itemType, metadata) {
  assert.ok(this.inventorySlotStart != null);
  assert.ok(this.inventorySlotCount != null);

  var end = this.inventorySlotStart + this.inventorySlotCount;
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

Window.prototype.acceptClick = function(click) {
  assert.ok(click.mouseButton === 0 || click.mouseButton === 1);
  if (click.slot 

      if ((bot.currentWindow == null || bot.currentWindow.type === 1) && click.slot === 0) {
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
}


function InventoryWindow(id, title, slotCount) {
  Window.call(this, id, null, title, slotCount);
}
util.inherits(InventoryWindow, Window);

InventoryWindow.prototype.inventorySlotStart = 5;
InventoryWindow.prototype.inventorySlotCount = 39;


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
  Window.call(this, id, 4, title, slotCount);
}
util.inherits(EnchantmentTableWindow, Window);

EnchantmentTableWindow.prototype.inventorySlotStart = 1;


function BrewingStandWindow(id, title, slotCount) {
  Window.call(this, id, 5, title, slotCount);
}
util.inherits(BrewingStandWindow, Window);

BrewingStandWindow.prototype.inventorySlotStart = 5;
