mf.include("items.js");
var inventory = {};
(function() {
    inventory.slot_count = 36;
    inventory.column_count = 9;
    inventory.row_count = 4;


    //Inventory inventory types
    inventory.InventoryFull = {};
    inventory.ActionBar = {};
    inventory.Inventory = {};
    inventory.UniqueInventoryFull = {};
    inventory.SmallCraftingAreaFull = {};
    inventory.SmallCraftingArea = {};
    inventory.SmallCraftingAreaCrafted = {};
    inventory.Armor = {};

    //Chest inventory types
    inventory.ChestFull = {};
    inventory.ChestTop = {};
    inventory.ChestBottom = {};

    //Crafting Table inventory types
    inventory.CraftingTableFull = {};
    inventory.CraftingTableCrafted = {};
    inventory.CraftingTable = {};

    //Furnace inventory types
    inventory.FurnaceFull = {};
    inventory.FurnaceSmelted = {};
    inventory.FurnaceSmelting = {};
    inventory.FurnaceFuel = {};

    //Dispenser inventory types
    inventory.Dispenser = {};

    //Contains a lits of all inventory types   
    inventory.inventoryTypes = [inventory.InventoryFull, inventory.ActionBar, inventory.Inventory, inventory.UniqueInventoryFull, inventory.SmallCraftingAreaFull, inventory.SmallCraftingArea, inventory.SmallCraftingAreaCrafted, inventory.Armor, inventory.ChestFull, inventory.ChestTop, inventory.ChestBottom, inventory.CraftingTableFull, inventory.CraftingTableCrafted, inventory.CraftingTable, inventory.FurnaceFull, inventory.FurnaceSmelted, inventory.FurnaceSmelting, inventory.FurnaceFuel, inventory.Dispenser]; 

    //First slot for the inventory.
    inventory.InventoryFull.firstSlot = 0;
    inventory.ActionBar.firstSlot = 0;
    inventory.Inventory.firstSlot = 9;
    inventory.UniqueInventoryFull.firstSlot = 0;
    inventory.SmallCraftingAreaFull.firstSlot = 0;
    inventory.SmallCraftingAreaCrafted.firstSlot = 0;
    inventory.SmallCraftingArea.firstSlot = 1;
    inventory.Armor.firstSlot = 5;

    inventory.ChestFull.firstSlot = 0;
    inventory.ChestTop.firstSlot = 0;
    inventory.ChestBottom.firstSlot = 27;

    inventory.CraftingTableFull.firstSlot = 0;
    inventory.CraftingTableCrafted.firstSlot = 0;
    inventory.CraftingTable.firstSlot = 1;
    
    inventory.FurnaceFull.firstSlot = 0;
    inventory.FurnaceSmelted.firstSlot = 0;
    inventory.FurnaceSmelting.firstSlot = 1;
    inventory.FurnaceFuel.firstSlot = 2;

    inventory.Dispenser.firstSlot = 0;

    //Last slot for the inventory.
    inventory.InventoryFull.lastSlot = 35;
    inventory.ActionBar.lastSlot = 8;
    inventory.Inventory.lastSlot = 35;
    inventory.UniqueInventoryFull.lastSlot = 8;
    inventory.SmallCraftingAreaFull.lastSlot = 4;
    inventory.SmallCraftingAreaCrafted.lastSlot = 0;
    inventory.SmallCraftingArea.lastSlot = 4;
    inventory.Armor.lastSlot = 8;

    inventory.ChestFull.lastSlot = 53;
    inventory.ChestTop.lastSlot = 26;
    inventory.ChestBottom.lastSlot = 53;

    inventory.CraftingTableFull.lastSlot = 9;
    inventory.CraftingTableCrafted.lastSlot = 0;
    inventory.CraftingTable.lastSlot = 9;

    inventory.FurnaceFull.lastSlot = 2;
    inventory.FurnaceSmelted.lastSlot = 0;
    inventory.FurnaceSmelting.lastSlot = 1;
    inventory.FurnaceFuel.lastSlot = 2;

    inventory.Dispenser.lastSlot = 8;

    //Generic extra slots for inventories with slots for specific purposes.
    inventory.SmallCraftingAreaCrafted.slot = 0;
    inventory.Armor.helmetSlot = 5;
    inventory.Armor.chestSlot = 6;
    inventory.Armor.legSlot = 7;
    inventory.Armor.bootSlot = 8;

    inventory.CraftingTableCrafted.slot = 0;

    inventory.FurnaceFull.FuelSlot = 2;
    inventory.FurnaceFull.SmeltingSlot = 1;
    inventory.FurnaceFull.SmeltedSlot = 0;
    inventory.FurnaceSmelted.slot = 0;
    inventory.FurnaceSmelting.slot = 1;
    inventory.FurnaceFuel.slot = 2;

    //Contains the function that checks what item is in the specified slot, not intended for general use.
    inventory.InventoryFull.itemInSlot = mf.inventoryItem;
    inventory.ActionBar.itemInSlot = mf.inventoryItem;
    inventory.Inventory.itemInSlot = mf.inventoryItem;
    inventory.UniqueInventoryFull.itemInSlot = mf.uniqueWindowItem;
    inventory.SmallCraftingAreaFull.itemInSlot = mf.uniqueWindowItem;
    inventory.SmallCraftingAreaCrafted.itemInSlot = mf.uniqueWindowItem;
    inventory.SmallCraftingArea.itemInSlot = mf.uniqueWindowItem;
    inventory.Armor.itemInSlot = mf.uniqueWindowItem;

    inventory.ChestFull.itemInSlot = mf.uniqueWindowItem;
    inventory.ChestTop.itemInSlot = mf.uniqueWindowItem;
    inventory.ChestBottom.itemInSlot = mf.uniqueWindowItem;
    
    inventory.CraftingTableFull.itemInSlot = mf.uniqueWindowItem;
    inventory.CraftingTableCrafted.itemInSlot = mf.uniqueWindowItem;
    inventory.CraftingTable.itemInSlot = mf.uniqueWindowItem;

    inventory.FurnaceFull.itemInSlot = mf.uniqueWindowItem;
    inventory.FurnaceSmelted.itemInSlot = mf.uniqueWindowItem;
    inventory.FurnaceSmelting.itemInSlot = mf.uniqueWindowItem;
    inventory.FurnaceFuel.itemInSlot = mf.uniqueWindowItem;

    inventory.Dispenser.itemInSlot = mf.uniqueWindowItem;

    //Use the slotCount property in a for loop to iterate through the slots of an inventory
    for (var i = 0; i < inventory.inventoryTypes.length; i++) {
        inventory.inventoryTypes[i].slotCount = 1 + (inventory.inventoryTypes[i].lastSlot - inventory.inventoryTypes[i].firstSlot);
    }    

    // windowType property guarantees that if the given window type is open, that the inventory type is available
    for (var i = 0; i < inventory.inventoryTypes.length; i++) {
        if (i < 8) {
            inventory.inventoryTypes[i].windowType = mf.WindowType.Inventory;
        } else if (i < 11) {
            inventory.inventoryTypes[i].windowType = mf.WindowType.Chest;
        } else if (i < 14) {
            inventory.inventoryTypes[i].windowType = mf.WindowType.Workbench;
        } else if (i < 18) {
            inventory.inventoryTypes[i].windowType = mf.WindowType.Furnace;
        } else {
            inventory.inventoryTypes[i].windowType = mf.WindowType.Dispenser;
        }
    }

    /*
     * Click the specified inventory slot.  Slots go from 0 to inventory_type.slotCount (not inventory_type.firstSlot to inventory_type.lastSlot)
    */
    inventory.clickInventorySlot = function(slot, mouse_button, inventory_type) {
        //Doesn't check to see if correct window is open, or slot valid
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        if (inventory_type.itemInSlot === mf.inventoryItem) {
            mf.clickInventorySlot(slot+inventory_type.firstSlot,mouse_button);
        } else if (inventory_type.itemInSlot === mf.uniqueWindowItem) {
            mf.clickUniqueSlot(slot+inventory_type.firstSlot,mouse_button);
        }
    }

    /*
     * Get the item in the specified slot (slots go from 0 to inventory_type.slotCount)
     * @ param {Number} slot The slot to look in.
     * @ param {Object} inventory_type The type of inventory to look in, defaults to inventory.InventoryFull
     * @ returns {Object} mf.Item The item in the specified slot in the specified inventory.
    */
    inventory.inventoryItem = function(slot,inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        if (inventory_type.windowType !== inventory.currentlyOpenWindow) {
            if (inventory_type.windowType !== mf.WindowType.Inventory && inventory.currentlyOpenWindow === undefined) {
                return undefined;
            }
        }
        if (slot < 0 || slot >= inventory_type.slotCount) {
            return undefined;
        }
        return inventory_type.itemInSlot(slot+inventory_type.firstSlot);
    };
    
    /**
     * Counts how many of a certain type of item you have.
     * @param {Number} item_id The item ID of the item you want to count.
     * @param {InventoryType} inventory_type Defaults to InventoryFull
     * @returns {Number} The number of items of that type that you have in all of your inventory slots combined.
     */
    inventory.itemCount = function(item_id, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var count = 0;
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i, inventory_type);
            if (item.type === item_id) {
                count += item.count;
            }
        }
        return count;
    };

    function equipSomeTool(block_type, callback, best) {
        var tools = items.toolsForBlock(block_type);
        if (tools === undefined) {
            return false;
        }
        if (tools === items.tools.swords) {
            // don't use swords
            return inventory.equipNonTool(callback);
        } else {
            // use a tool
            if (best) {
                tools = tools.reversed();
            }
            for (var i = 0; i < tools.length; i++) {
                if (inventory.equipItem(tools[i], callback)) {
                    return true;
                }
            }
            return false;
        }
    };
    inventory.equipWorstTool = function(block_type, callback) {
        return equipSomeTool(block_type, callback, false);
    };
    inventory.equipBestTool = function(block_type, callback) {
        return equipSomeTool(block_type, callback, true);
    };
    inventory.equipNonTool = function(callback) {
        for (var i = 0; i < inventory.InventoryFull.slotCount; i++) {
            var item_id = inventory.inventoryItem(i, inventory.InventoryFull).type;
            if (!items.isTool(item_id)) {
                return inventory.equipItem(item_id, callback);
            }
        }
        // really? our whole inventory is full of tools?
        return false;
    };

    /**
     * Looks for an item in your inventory and equips it. If you don't
     * have the item, nothing happens.
     * If you are already equipping something in that slot, the items are
     * swapped.
     * @param {Number} item_id The item ID of the item you want to equip.
     * @param {Function} callback Called when it's finally equipped (possibly before this function returns)
     * @return true iff you have the item
     */
    inventory.equipItem = function(item_id, callback) {
        var itemSlot = undefined;
        for (var i = 0; i < inventory.slot_count; i++) {
            if (mf.inventoryItem(i).type === item_id) {
                itemSlot = i;
                break;
            }
        }
        if (itemSlot === undefined) {
            return false;
        }
        if (itemSlot < inventory.column_count) {
            //On hot-switch bar
            mf.selectEquipSlot(itemSlot);
            if (callback !== undefined) {
                callback();
            }
        } else {
            //In inventory
            switchSlot = itemSlot;
            switchCallback = callback;
            mf.openInventoryWindow();
        }
        return true;
    };

    var switchSlot = undefined;
    var switchCallback;
   
    mf.onWindowOpened(function(window_type) {
        if (window_type !== mf.WindowType.Inventory) {
            return;
        }
        if (switchSlot === undefined) {
            return;
        }
        mf.clickInventorySlot(switchSlot, mf.MouseButton.Left);
        mf.clickInventorySlot(mf.selectedEquipSlot(), mf.MouseButton.Left);
        mf.clickInventorySlot(switchSlot, mf.MouseButton.Left);
        switchSlot = undefined;
        if (switchCallback !== undefined) {
            switchCallback();
        }
    });
 
    /**
     * Gets the item you are holding.
     * @returns {Item} What you are now equipped with.
     */
    inventory.equippedItem = function() {
        return mf.inventoryItem(mf.selectedEquipSlot());
    };

    /**
     * Looks for armor in your inventory and equips it. If you don't
     * have the armor, nothing happens.
     * @param {Number} item_id The item ID of the armor you want to equip.
     */
    var slot_for_armor = {};
    slot_for_armor[mf.ItemType.LeatherHelmet] = 5;
    slot_for_armor[mf.ItemType.GoldHelmet] = 5;
    slot_for_armor[mf.ItemType.IronHelmet] = 5;
    slot_for_armor[mf.ItemType.DiamondHelmet] = 5;
    slot_for_armor[mf.ItemType.LeatherChestplate] = 6;
    slot_for_armor[mf.ItemType.GoldChestplate] = 6;
    slot_for_armor[mf.ItemType.IronChestplate] = 6;
    slot_for_armor[mf.ItemType.DiamondChestplate] = 6;
    slot_for_armor[mf.ItemType.LeatherLeggings] = 7;
    slot_for_armor[mf.ItemType.GoldLeggings] = 7;
    slot_for_armor[mf.ItemType.IronLeggings] = 7;
    slot_for_armor[mf.ItemType.DiamondLeggings] = 7;
    slot_for_armor[mf.ItemType.LeatherBoots] = 8;
    slot_for_armor[mf.ItemType.GoldBoots] = 8;
    slot_for_armor[mf.ItemType.IronBoots] = 8;
    slot_for_armor[mf.ItemType.DiamondBoots] = 8;

    var equipArmor_item_slot = undefined;

    inventory.equipArmor = function(item_id) {
        item_id = parseInt(item_id);
        if (slot_for_armor[item_id] === undefined) {
            return;
        }
        equipArmor_item_slot = inventory.itemSlot(item_id);
        if (equipArmor_item_slot !== undefined) {
            mf.openInventoryWindow();
        }
    };

    mf.onWindowOpened(function(window_type) {
        if (window_type !== mf.WindowType.Inventory) {
            return;
        }
        if (equipArmor_item_slot === undefined) {
            return;
        }
        var unique_slot = slot_for_armor[mf.inventoryItem(equipArmor_item_slot).type];
        mf.clickInventorySlot(equipArmor_item_slot,mf.MouseButton.Left);
        if (mf.uniqueWindowItem(unique_slot).type !== mf.ItemType.NoItem) {
            mf.clickUniqueSlot(unique_slot,mf.MouseButton.Left);
            mf.clickInventorySlot(equipArmor_item_slot,mf.MouseButton.Left);
        } else {
            mf.clickUniqueSlot(unique_slot,mf.MouseButton.Left);
        }
        equipArmor_item_slot = undefined;
    });

    inventory.isItemArmor = function(item_id) {
        return !(slot_for_armor[item_id] === undefined);
    };
    
   /**
     * Gives a snapshot containing the amounts of types of objects
     * @returns {Object} object that maps item type to 
     *          total number in inventory
     */

    inventory.condensedSnapshot = function(inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var obj = {};
        for (var i = 0; i < inventory_type.slotCount; i++) {
            if (obj[inventory.inventoryItem(i,inventory_type).type] === undefined) {
                obj[inventory.inventoryItem(i,inventory_type).type] = inventory.inventoryItem(i,inventory_type).count;
            } else {
                obj[inventory.inventoryItem(i,inventory_type).type] += inventory.inventoryItem(i,inventory_type).count;
            }
        }
        delete obj[-1];
        return obj;
    };

    /**
     * Returns a snapshot of your inventory.
     * @returns [Array] items with properties:
     */

    inventory.snapshot = function(inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var obj = [];
        for (var i = 0; i < inventory_type.slotCount; i++) {
            if (inventory.inventoryItem(i,inventory_type).type !== undefined) {
                obj.push(inventory.inventoryItem(i,inventory_type));
            }
        }
        return obj;
    };
  
    inventory.getDatabase = function(inventory_type) { 
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var inventory_database = {};
        var current_inventory = inventory.snapshot(inventory_type);
        for (var i = 0; i < current_inventory.length; i++) {
            inventory_database[current_inventory[i].type] = items.nameForId(current_inventory[i].type);
        }
        return inventory_database;
    };
 
    /**
     * Tells how much room you have left in your inventory. No need to
     * worry about merging stacks; this function takes that into account.
     * @param {Number} item The item ID that you want to see how many more
     *                      will fit in your inventory.
     * @returns {Number} How many more of those items will fit.
     */
    inventory.spaceLeft = function(item_type, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        itemCount = 0;
        var current;
        for (var i = 0; i < inventory_type.slotCount; i++) {
            current = inventory.inventoryItem(i,inventory_type);
            if (current.type === item_type) {
                itemCount += Math.max(0,mf.itemStackHeight(item_type) - current.count);
            } else if (current.type === -1) {
                itemCount += mf.itemStackHeight(item_type);
            }
        }
        return itemCount;
    };

    /**
     * Tells how many free slots you have open in your inventory. No need
     * to worry about merging stacks; this function takes that into account.
     * @param {Object} inventory_type The optional type of inventory to look through
     * @returns {Number} The total number of empty inventory slots.
     */
    inventory.slotsLeft = function(inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        itemCount = {};
        var current;
        for (var i = 0; i < inventory_type.slotCount; i++) {
            current = inventory.inventoryItem(i,inventory_type);
            if (itemCount.hasOwnProperty(current.type)) {
                itemCount[current.type] += Math.min(mf.itemStackHeight(current.type),current.count);
            } else if (current.type !== mf.ItemType.NoItem) {
                itemCount[current.type] = Math.min(mf.itemStackHeight(current.type),current.count);
            }
        }
        var remainingSlots = inventory_type.slotCount;
        for (var key in itemCount) {
            if (itemCount.hasOwnProperty(key)) {
                remainingSlots -= Math.ceil(itemCount[key] / mf.itemStackHeight(parseInt(key)));
            }
        }
        return remainingSlots;
    };

    inventory.itemsSlot = function(item_ids, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            for (var j = 0; j < item_ids.length; j++) {
                var item_id = item_ids[j];
                if (item.type === item_id) {
                    return i;
                }
            }
        }
        return undefined;
    };

    /**
     * Returns the first slot that contains any number of item.
     */
    inventory.itemSlot = function(item_id, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            if (item.type === item_id) {
                return i;
            }
        }
        return undefined;
    };
    
    /*
     * Returns the first slot that contains room for any of the specified types of items.
    */
    inventory.slotForItems = function(item_ids, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            for (var j = 0; j < item_ids.length; j++) {
                var item_id = item_ids[j];
                if (item.type !== item_id && item.type !== mf.ItemType.NoItem) {
                    continue;
                }
                if (item.type === item_id && item.count >= mf.itemStackHeight(item.type)) {
                    continue;
                }
                return i;
            }
        }
        return undefined;
    };

    /*
     * Returns all of the slots with room for the specified types of items.  Unfilled stacks are always listed before empty slots.
    */
    inventory.slotsForItems = function(item_ids, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var direct_matches = [];
        var empty_matches = [];
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            for (var j = 0; j < item_ids.length; j++) {
                var item_id = item_ids[j];
                if (item.type !== item_id && item.type !== mf.ItemType.NoItem) {
                    continue;
                }
                if (item.type === item_id && item.count >= mf.itemStackHeight(item.type)) {
                    continue;
                }
                if (item.type === item_id) {
                    direct_matches.push(i);
                } else {
                    empty_matches.push(i)
                }
            }
        }
        return direct_matches.concat(empty_matches);
    };

    /*
     * Returns the first slot that contains room for the specified type of item.
    */
    inventory.slotForItem = function(item_id, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            if (item.type !== item_id && item.type !== mf.ItemType.NoItem) {
                continue;
            }
            if (item.type === item_id && item.count >= mf.itemStackHeight(item.type)) {
                continue;
            }
            return i;
        }
        return undefined;
    };

    /*
     * Returns all of the slots with room for the specified type of item.  Unfilled stacks are always listed before empty slots.
    */
    inventory.slotsForItem = function(item_id, inventory_type) {
        if (inventory_type === undefined) {
            inventory_type = inventory.InventoryFull;
        }
        var direct_matches = [];
        var empty_matches = [];
        for (var i = 0; i < inventory_type.slotCount; i++) {
            var item = inventory.inventoryItem(i,inventory_type);
            if (item.type !== item_id && item.type !== mf.ItemType.NoItem) {
                continue;
            }
            if (item.type === item_id && item.count >= mf.itemStackHeight(item.type)) {
                continue;
            }
            if (item.type === item_id) {
                direct_matches.push(i);
            } else {
                empty_matches.push(i)
            }
        }
        return direct_matches.concat(empty_matches);
    };

    /**
     * Returns the first empty slot, or undefined
     */
    inventory.firstEmptySlot = function(inventory_type) {
        return inventory.itemSlot(mf.ItemType.NoItem, inventory_type);
    };


    //Overriding the mf.closeWindow function.
    inventory.currentlyOpenWindow = undefined;
    var old_close_window = mf.closeWindow;
    mf.closeWindow = function() {
        old_close_window();
        inventory.selectedItem = undefined;
        inventory.currentlyOpenWindow = undefined;
    };

    mf.onWindowOpened(function(window_type) {
        inventory.currentlyOpenWindow = window_type;
    });

})();
    
//Overriding the mf.clickInventorySlot and mf.clickUniqueSlot functions

inventory.selectedItem = undefined;

var oldClickInventory = mf.clickInventorySlot;
var oldClickUnique = mf.clickUniqueSlot;

mf.clickInventorySlot = function(slot,mouseButton) {
    if (inventory.selectedItem === undefined) {
        if (mf.inventoryItem(slot).type === mf.ItemType.NoItem) {
            return;
        }
        inventory.selectedItem = mf.inventoryItem(slot);
        if (mouseButton === mf.MouseButton.Right) {
            inventory.selectedItem.count = Math.ceil(inventory.selectedItem.count/2);
        }
        oldClickInventory(slot,mouseButton);
    } else if (inventory.selectedItem.type !== mf.inventoryItem(slot).type) {
        if (mf.inventoryItem(slot).type === mf.ItemType.NoItem) {
            if (mouseButton === mf.MouseButton.Left) {
                inventory.selectedItem = undefined;
            } else {
                inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-1);
                if (inventory.selectedItem.count === 0) {
                    inventory.selectedItem = undefined;
                }
            }
        } else {
            inventory.selectedItem = mf.inventoryItem(slot);
        }
        oldClickInventory(slot,mouseButton);
    } else if (mouseButton === mf.MouseButton.Right) {
        if (mf.itemStackHeight(mf.inventoryItem(slot).type) - mf.inventoryItem(slot).count > 0) {
            inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-1);
            if (inventory.selectedItem.count === 0) {
                inventory.selectedItem = undefined;
            }
        }
        oldClickInventory(slot,mouseButton);
    } else if (mouseButton === mf.MouseButton.Left) {
        var slot_count = mf.itemStackHeight(mf.inventoryItem(slot).type) - mf.inventoryItem(slot).count;
        if (inventory.selectedItem.count <= slot_count) {
            inventory.selectedItem = undefined;
        } else {
            inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-slot_count);
        }
        oldClickInventory(slot,mouseButton);
    }
};

mf.clickUniqueSlot = function(slot,mouseButton) {
    if (inventory.selectedItem === undefined) {
        if (mf.uniqueWindowItem(slot).type === mf.ItemType.NoItem) {
            return;
        }
        inventory.selectedItem = mf.uniqueWindowItem(slot);
        if (mouseButton === mf.MouseButton.Right) {
            inventory.selectedItem = new mf.Item(inventory.selectedItem.type, Math.ceil(inventory.selectedItem.count/2));
        }
        oldClickUnique(slot,mouseButton);
    } else if (inventory.selectedItem.type !== mf.uniqueWindowItem(slot).type) {
        if (mf.uniqueWindowItem(slot).type === mf.ItemType.NoItem) {
            if (mouseButton === mf.MouseButton.Left) {
                inventory.selectedItem = undefined;
            } else {
                inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-1);
                if (inventory.selectedItem.count === 0) {
                    inventory.selectedItem = undefined;
                }
            }
        } else {
            inventory.selectedItem = mf.uniqueWindowItem(slot);
        }
        oldClickUnique(slot,mouseButton);
    } else if (mouseButton === mf.MouseButton.Right) {
        if (mf.itemStackHeight(mf.uniqueWindowItem(slot).type) - mf.uniqueWindowItem(slot).count > 0) {
            inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-1);
            if (inventory.selectedItem.count === 0) {
                inventory.selectedItem = undefined;
            }
        }
        oldClickUnique(slot,mouseButton);
    } else if (mouseButton === mf.MouseButton.Left) {
        var slot_count = mf.itemStackHeight(mf.uniqueWindowItem(slot).type) - mf.uniqueWindowItem(slot).count;
        if (inventory.selectedItem.count <= slot_count) {
            inventory.selectedItem = undefined;
        } else {
            inventory.selectedItem = new mf.Item(inventory.selectedItem.type, inventory.selectedItem.count-slot_count);
        }
        oldClickUnique(slot,mouseButton);
    }
};

inventory.isInventoryOpen = function(inv) {
    if (inventory.currentlyOpenWindow === undefined) {
        return false;
    }
    if (inv === undefined) {
        inv = inventory.InventoryFull;
    }
    if (inv.windowType !== mf.WindowType.Inventory && inventory.currentlyOpenWindow !== inv.windowType) {
        return false;
    }
    if (inv.windowType === mf.WindowType.Inventory && inv.itemInSlot === mf.uniqueWindowItem && inventory.currentlyOpenWindow !== inv.windowType) {
        return false;
    }
    return true;
};

inventory.moveSelected = function(inv_to) {
    if (inventory.selectedItem === undefined) {
        return true;
    }
    if (inv_to === undefined) {
        inv_to = inventory.InventoryFull;
    }
    if (! inventory.isInventoryOpen(inv_to)) {
        return false;
    }
    var slots = inventory.slotsForItem(inventory.selectedItem.type);
    for (var i = 0; i < slots.length; i++) {
        inventory.clickInventorySlot(slots[i],mf.MouseButton.Left,inv_to);
        if (inventory.selectedItem === undefined) {
            return true;
        }
    }
    return false;
};

inventory.moveCountType = function(item_count, item_type, inv_from, inv_to) {
    if (item_count === undefined) {
        return moveAllType(item_type, inv_from, inv_to);
    }
    if (item_type === undefined) {
        return moveAll(inv_from, inv_to);
    }    
    if (inv_from === undefined) {
        inv_from = inventory.InventoryFull;
    }
    if (inv_to === undefined) {
        inv_to = inventory.InventoryFull;
    }
    if (inv_from === inv_to) {
        return true;
    }
    if (! inventory.isInventoryOpen(inv_from) || ! inventory.isInventoryOpen(inv_to)) {
        return false;
    }
    if (inventory.selectedItem !== undefined) {
        var success = moveSelected(inv_to);
        if (! success) {
            // Couldn't move selected item to inv_to, not going to try to move items from inv_from to inv_to.
            return success;
        }
    }
    for (var i = 0; i < inv_from.slotCount; i++) {
        if (item_count <= 0) {
            return true;
        }
        var item = inventory.inventoryItem(i,inv_from);
        if (item.type !== item_type) {
            continue;
        }
        if (item_count >= item.count) {
            inventory.clickInventorySlot(i,mf.MouseButton.Left,inv_from);
            var slots = inventory.slotsForItem(item_type, inv_to);
            for (var j = 0; j < slots.length; j++) {
                var slot = slots[j];
                if (inventory.selectedItem === undefined) {
                    break;
                }
                inventory.clickInventorySlot(slot,mf.MouseButton.Left, inv_to);
            }
            if (inventory.selectedItem !== undefined) {
                inventory.clickInventorySlot(i,mf.MouseButton.Left, inv_from);
                return false;
            }
            item_count -= item.count;
        } else {
            while (item_count >= Math.ceil(item.count/2)) {
                inventory.clickInventorySlot(i,mf.MouseButton.Right, inv_from);
                var slots = inventory.slotsForItem(item_type, inv_to);
                for (var j = 0; j < slots.length; j++) {
                    var slot = slots[j];
                    if (inventory.selectedItem === undefined) {
                        break;
                    }
                    inventory.clickInventorySlot(slot,mf.MouseButton.Left, inv_to);
                }
                if (inventory.selectedItem !== undefined) {
                    inventory.clickInventorySlot(i,mf.MouseButton.Left, inv_from);
                    return false;
                }
                item_count -= Math.ceil(item.count/2);
                item = inventory.inventoryItem(i,inv_from);
            }
            if (item_count > 0) {
                inventory.clickInventorySlot(i,mf.MouseButton.Right, inv_from);
                var slots = inventory.slotsForItem(item_type, inv_to);
                for (var j = 0; j < slots.length; j++) {
                    var slot = slots[j];
                    if (inventory.selectedItem === undefined) {
                        break;
                    }
                    var room = mf.itemStackHeight(item_type) - inventory.inventoryItem(slot,inv_to).count;
                    if (room <= item_count) {
                        inventory.clickInventorySlot(slot,mf.MouseButton.Left, inv_to);
                        item_count -= room;
                    } else {
                        for (var k = 0; k < item_count; k++) {
                            inventory.clickInventorySlot(slot, mf.MouseButton.Right, inv_to);
                        }
                        inventory.clickInventorySlot(i, mf.MouseButton.Left, inv_from);
                        return true;
                    }
                }
                if (inventory.selectedItem !== undefined) {
                    inventory.clickInventorySlot(i,mf.MouseButton.Left, inv_from);
                    return false;
                }
            } else {
                return true;
            }
            
        }
    }
    return true;
};

inventory.moveAllType = function(item_type, inv_from, inv_to) {
    if (item_type === undefined) {
        return moveAll(inv_from, inv_to);
    }    
    if (inv_from === undefined) {
        inv_from = inventory.InventoryFull;
    }
    if (inv_to === undefined) {
        inv_to = inventory.InventoryFull;
    }
    if (inv_from === inv_to) {
        return true;
    }
    if (! inventory.isInventoryOpen(inv_from) || ! inventory.isInventoryOpen(inv_to)) {
        return false;
    }
    if (inventory.selectedItem !== undefined) {
        var success = moveSelected(inv_to);
        if (! success) {
            // Couldn't move selected item to inv_to, not going to try to move items from inv_from to inv_to.
            return success;
        }
    }
    for (var i = 0; i < inv_from.slotCount; i++) {
        var item = inventory.inventoryItem(i,inv_from);
        if (item.type !== item_type) {
            continue;
        }
        var slots = inventory.slotsForItem(item_type,inv_to);
        inventory.clickInventorySlot(i,mf.MouseButton.Left,inv_from);
        for (var j = 0; j < slots.length; j++) {
            var slot = slots[j];
            if (inventory.selectedItem === undefined) {
                break;
            }
            inventory.clickInventorySlot(slot,mf.MouseButton.Left, inv_to);
        }
        if (inventory.selectedItem !== undefined) {
            inventory.clickInventorySlot(i,mf.MouseButton.Left, inv_from);
            return false;
        }
    }
    return true;
};

inventory.moveAll = function(inv_from, inv_to) {
    if (inv_from === undefined) {
        inv_from = inventory.InventoryFull;
    }
    if (inv_to === undefined) {
        inv_to = inventory.InventoryFull;
    }
    if (inv_from === inv_to) {
        return true;
    }
    if (! inventory.isInventoryOpen(inv_from) || ! inventory.isInventoryOpen(inv_to)) {
        return false;
    }
    if (inventory.selectedItem !== undefined) {
        var success = moveSelected(inv_to);
        if (! success) {
            // Couldn't move selected item to inv_to, not going to try to move items from inv_from to inv_to.
            return success;
        }
    }
    var flag = true;
    for (var i = 0; i < inv_from.slotCount; i++) {
        var item = inventory.inventoryItem(i,inv_from);
        if (item.type === mf.ItemType.NoItem) {
            continue;
        }
        var slots = inventory.slotsForItem(item.type,inv_to);
        inventory.clickInventorySlot(i, mf.MouseButton.Left, inv_from);
        for (var j = 0; j < slots.length; j++) {
            var slot = slots[j];
            if (inventory.selectedItem === undefined) {
                break;
            }
            inventory.clickInventorySlot(slot,mf.MouseButton.Left, inv_to);
        }
        if (inventory.selectedItem !== undefined) {
            flag = false;
            inventory.clickInventorySlot(i,mf.MouseButton.Left, inv_from);
        }
    }
    return flag;
};
