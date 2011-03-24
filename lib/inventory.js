mf.include("items.js");
var inventory = {};
(function() {
    inventory.slot_count = 36;
    inventory.column_count = 9;
    inventory.row_count = 4;

    /**
     * Counts how many of a certain type of item you have.
     * @param {Number} item_id The item ID of the item you want to count.
     * @returns {Number} The number of items of that type that you have in all of your inventory slots combined.
     */
    inventory.itemCount = function(item_id) {
        var count = 0;
        for (var i = 0; i < inventory.slot_count; i++) {
            var item = mf.inventoryItem(i);
            if (item.type === item_id) {
                count += item.count;
            }
        }
        return count;
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

    inventory.condensedSnapshot = function() {
        var obj = {};
        for (var i = 0; i < inventory.slot_count; i++) {
            if (obj[mf.inventoryItem(i).type] === undefined) {
                obj[mf.inventoryItem(i).type] = mf.inventoryItem(i).count;
            } else {
                obj[mf.inventoryItem(i).type] += mf.inventoryItem(i).count;
            }
        }
        delete obj[-1];
        return obj
    };

    /**
     * Returns a snapshot of your inventory.
     * @returns [Array] items with properties:
     */

    inventory.snapshot = function() {
        var obj = [];
        for (var i = 0; i < inventory.slot_count; i++) {
            if (mf.inventoryItem(i).type !== undefined) {
                obj.push(mf.inventoryItem(i));
            }
        }
        return obj;
    };
  
    inventory.getDatabase = function() { 
        var inventory_database = {};
        var current_inventory = inventory.snapshot();
        for (var i = 0; i < current_inventory.length; i++) {
            inventory_database[current_inventory[i].type] = items.nameForId(current_inventory[i].type);
        }
        return inventory_database;
    }
 
    /**
     * Tells how much room you have left in your inventory. No need to
     * worry about merging stacks; this function takes that into account.
     * @param {Number} item The item ID that you want to see how many more
     *                      will fit in your inventory.
     * @returns {Number} How many more of those items will fit.
     */
    inventory.spaceLeft = function(item_type) {
        itemCount = 0;
        var current;
        for (var i = 0; i < inventory.slot_count; i++) {
            current = mf.inventoryItem(i);
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
     * @returns {Number} The total number of empty inventory slots.
     */
    inventory.slotsLeft = function() {
        itemCount = {};
        var current;
        for (var i = 0; i < inventory.slot_count; i++) {
            current = mf.inventoryItem(i);
            if (itemCount.hasOwnProperty(current.type)) {
                itemCount[current.type] += Math.min(mf.itemStackHeight(current.type),current.count);
            } else if (current.type !== -1) {
                itemCount[current.type] = Math.min(mf.itemStackHeight(current.type),current.count);
            }
        }
        var remainingSlots = inventory.slot_count;
        for (var key in itemCount) {
            if (itemCount.hasOwnProperty(key)) {
                remainingSlots -= Math.ceil(itemCount[key] / mf.itemStackHeight(parseInt(key)));
            }
        }
        return remainingSlots;
    }
    /**
     * Returns the first slot that contains any number of item.
     */
    inventory.itemSlot = function(item_id) {
        for (var i = 0; i < inventory.slot_count; i++) {
            var item = mf.inventoryItem(i);
            if (item.type === item_id) {
                return i;
            }
        }
        return undefined;
    };

    /**
     * Returns the first empty slot, or undefined
     */
    inventory.firstEmptySlot = function() {
        return inventory.itemSlot(mf.ItemType.NoItem);
    };

})();
