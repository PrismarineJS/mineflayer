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
     */
   
    inventory.equipItem = function(item_id) {
        item_id = parseInt(item_id);
        var itemSlot = undefined;
        for (var i = 0; i < inventory.slot_count; i++) {
            if (mf.inventoryItem(i).type === item_id) {
                itemSlot = i;
                break;
            }
        }
        if (itemSlot === undefined) {
            return;
        }
        if (itemSlot < inventory.column_count) {
            //On hot-switch bar
            mf.selectEquipSlot(itemSlot);
        } else {
            //In inventory
            switchSlot = itemSlot;
            mf.openInventoryWindow();
        }
    };

    var switchSlot = undefined;
   
    mf.onWindowOpened(function(window_type) {
        if (window_type !== mf.WindowType.Inventory) {
            return;
        }
        if (switchSlot === undefined) {
            return;
        }
        mf.clickInventorySlot(switchSlot,mf.MouseButton.Left);
        mf.clickInventorySlot(mf.selectedEquipSlot(),mf.MouseButton.Left);
        switchSlot = undefined;
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
    inventory.equipArmor = function(item_id) {
        // TODO
    };

    /**
     * Returns a snapshot of your inventory.
     * @returns {Object} object with properties:
     *                   types: array of item_ids
     *                   counts: array of counts for each type.
     */
    inventory.snapshot = function() {
        var obj = {types: [], counts: []};
        for (var i = 0; i < inventory.slot_count; i++) {
            obj.types.push(mf.inventoryItem(i).type);
            obj.counts.push(mf.inventoryItem(i).count);
        }
        return obj;
    };
    
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
