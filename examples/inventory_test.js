mf.include("giver.js");
mf.include("auto_respawn.js");
mf.include("block_finder.js");
mf.include("items.js");
mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("navigator.js");

var window_open_func;

mf.onWindowOpened(function(window_type) {
    mf.debug("window opened of type: " + window_type);
    if (window_open_func != undefined) {
        window_open_func(window_type);
    }
});

mf.onEquippedItemChanged(function() {
    var item = inventory.equippedItem();
    mf.debug("equipped item changed. now holding " + item.count + " " + items.nameForId(item.type));
});

mf.onInventoryUpdated(function() {
    mf.debug("inventory update");
});

chat_commands.registerCommand("list", function() {
    mf.debug("----- my inventory ------");
    for (var i = 0; i < inventory.slot_count; i++) {
        var item = mf.inventoryItem(i);
        if (item.type == mf.ItemType.NoItem) { continue; }
        mf.debug("slot " + i + ": " + items.nameForId(item.type) + " x " + item.count);
    }
    mf.debug("-------------------------");
});

chat_commands.registerCommand("next", function() {
    mf.selectEquipSlot((mf.selectedEquipSlot() + 1) % inventory.column_count);
});

chat_commands.registerCommand("prev", function() {
    mf.selectEquipSlot((mf.selectedEquipSlot() - 1) % inventory.column_count);
});

chat_commands.registerCommand("toss", function(username, slot_str) {
    var slot = parseInt(slot_str);
    window_open_func = function(window_type) {
        window_open_func = undefined;
        mf.debug("clicking the slot");
        mf.clickInventorySlot(slot, false);
        mf.debug("clicking outside window");
        mf.clickOutsideWindow(false);
        mf.debug("closing window");
        mf.closeWindow();
    };
    mf.openInventoryWindow();
}, 1);

var build_under_myself = false;
chat_commands.registerCommand("build", function() {
    mf.setControlState(mf.Control.Jump, true);
    build_under_myself = true;
});

chat_commands.registerCommand("build1", function() {
    mf.placeBlock(mf.self().position.offset(0, 2, 0), mf.Face.PositiveZ);
});

chat_commands.registerCommand("stop", function() {
    mf.setControlState(mf.Control.Jump, false);
    build_under_myself = false;
});

mf.onSelfMoved(function() {
    if (build_under_myself) {
        var below = mf.self().position.offset(0, 0, -1);
        if (mf.blockAt(below).type == mf.ItemType.Air) {
            mf.debug("js: place block at "+ below.x + " " + below.y + " " + below.z);
            mf.placeBlock(below, mf.Face.PositiveZ);
        }
    }
});

chat_commands.registerCommand("craft", function() {
    var stone_count = inventory.itemCount(mf.ItemType.Cobblestone);

    if (stone_count < 3) {
        mf.chat("not enough stone to create pick axe");
        return;
    }

    var stick_count = inventory.itemCount(mf.ItemType.Stick);

    if (stick_count < 2) {
        mf.chat("not enough sticks to create pick axe");
        return
    }

    var stone_slot = inventory.itemSlot(mf.ItemType.Cobblestone);
    var stone_item = mf.inventoryItem(stone_slot);
    if (stone_item.count < 3) {
        mf.chat("stone stack too small.");
    }

    var stick_slot = inventory.itemSlot(mf.ItemType.Stick);
    var stick_item = mf.inventoryItem(stick_slot);
    if (stick_item.count < 2) {
        mf.chat("stick stack too small.");
    }

    var table_pt = block_finder.findNearest(mf.self().position, mf.ItemType.Workbench, 20);
    
    if (table_pt === undefined) {
        mf.chat("I see no crafting table.");
        return;
    }

    navigator.navigateTo(table_pt, function() {
        mf.debug("done navigating");
        window_open_func = function(window_type) {
            window_open_func = undefined;

            mf.debug("now crafting");

            mf.clickInventorySlot(stick_slot, false);
            mf.clickUniqueSlot(8, true);
            mf.clickUniqueSlot(5, true);

            mf.clickInventorySlot(stone_slot, false);
            mf.clickUniqueSlot(1, true);
            mf.clickUniqueSlot(2, true);
            mf.clickUniqueSlot(3, true);

            if (stone_item.count > 3) {
                mf.clickInventorySlot(inventory.firstEmptySlot(), false);
            }

            mf.clickUniqueSlot(0, false);
            mf.clickInventorySlot(inventory.firstEmptySlot(), false);

            mf.closeWindow();
        };
        mf.placeBlock(table_pt, mf.Face.PositiveZ);
    }, 3);
});
