var inventory = function() {
    var _public = {};

    _public.slot_count = 36;
    _public.column_count = 9;
    _public.row_count = 4;

    /**
     * Counts how many of a certain type of item you have.
     * @param {Number} item_id The item ID of the item you want to count.
     * @returns {Number} The number of items of that type that you have in all of your inventory slots combined.
     */
    _public.itemCount = function(item_id) {
        var count = 0;
        for (var i = 0; i < _public.slot_count; i++) {
            var item = mf.inventoryItem(i);
            if (item.type == item_id) {
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
    _public.equipItem = function(item_id) {
        // TODO
    };

    /**
     * Gets the item you are holding.
     * @returns {Item} What you are now equipped with.
     */
    _public.equippedItem = function() {
        return mf.inventoryItem(mf.selectedEquipSlot());
    };

    /**
     * Looks for armor in your inventory and equips it. If you don't
     * have the armor, nothing happens.
     * @param {Number} item_id The item ID of the armor you want to equip.
     */
    _public.equipArmor = function(item_id) {
        // TODO
    };

    /**
     * Returns a snapshot of your inventory.
     * @returns {Object} object with properties:
     *                   types: array of item_ids
     *                   counts: array of counts for each type.
     *      
     */
    _public.snapshot = function() {
        // TODO
    };

    /**
     * Tells how much room you have left in your inventory. No need to
     * worry about merging stacks; this function takes that into account.
     * @param {Number} item The item ID that you want to see how many more
     *                      will fit in your inventory.
     * @returns {Number} How many more of those items will fit.
     /
    _public.spaceLeft = function(item_type) {
        // TODO
    };

    /**
     * Tells how many free slots you have open in your inventory. No need
     * to worry about merging stacks; this function takes that into account.
     * @returns {Number} The total number of empty inventory slots.
     */
    _public.slotsLeft = function() {
        itemCount = {};
        var current;
        for (var i = 0; i < _public.slot_count; i++) {
            current = mf.inventoryItem(i);
            if (itemCount.hasOwnProperty(current.type)) {
                itemCount[current.type] += current.count;
            } else if (current.type != -1) {
                itemCount[current.type] = current.count;
            }
        }
        var remainingSlots = _public.slot_count;
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
    _public.itemSlot = function(item_id) {
        for (var i = 0; i < _public.slot_count; i++) {
            var item = mf.inventoryItem(i);
            if (item.type == item_id) {
                return i;
            }
        }
        return undefined;
    };

    /**
     * Returns the first empty slot, or undefined
     */
    _public.firstEmptySlot = function() {
        return _public.itemSlot(mf.ItemType.NoItem);
    };

    return _public;
}();
