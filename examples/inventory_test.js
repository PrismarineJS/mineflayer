mf.include("navigator_3d.js");
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
        mf.clickInventorySlot(slot, false);
        mf.clickOutsideWindow(false);
        mf.closeWindow();
    };
    mf.openInventoryWindow();
}, 1);

var build_under_myself = false;
chat_commands.registerCommand("build", function() {
    mf.setControlState(mf.Control.Jump, true);
    build_under_myself = true;
});

chat_commands.registerCommand("build1", function(user, arg) {
    var glass_pos_arr = block_finder.findNearest(mf.self().position, mf.ItemType.Glass, 10, 1);
    if (glass_pos_arr.length === 0) {
        mf.chat("I see no glass.");
        return;
    }
    mf.hax.placeBlock(glass_pos_arr[0], parseInt(arg));
}, 1);

chat_commands.registerCommand("stopbuild", function() {
    mf.setControlState(mf.Control.Jump, false);
    build_under_myself = false;
});

chat_commands.registerCommand("where", function() {
    var pos = mf.self().position;
    mf.chat("I'm at " + pos.x + " " + pos.y + " " + pos.z);
});

mf.onSelfMoved(function() {
    if (build_under_myself) {
        var below = mf.self().position.offset(0, 0, -1.5).floored();
        if (mf.blockAt(below.offset(0, 0, 1)).type == mf.ItemType.Air) {
            mf.debug("js: place block at "+ below.x + " " + below.y + " " + below.z);
            mf.hax.placeBlock(below, mf.Face.PositiveZ);
        }
    }
});

chat_commands.registerCommand("woodplank", function() {
    var wood_count = inventory.itemCount(mf.ItemType.Wood);

    if (wood_count < 1) {
        mf.chat("not enough wood to create plank");
        return
    }

    var wood_slot = inventory.itemSlot(mf.ItemType.Wood);
    var wood_item = mf.inventoryItem(wood_slot);

    window_open_func = function(window_type) {
        window_open_func = undefined;

        mf.debug("now crafting");

        mf.clickInventorySlot(wood_slot, false);
        mf.clickUniqueSlot(1, false);
        mf.clickUniqueSlot(0, false);

        mf.closeWindow();
    };
    mf.openInventoryWindow();

});

chat_commands.registerCommand("torch", function() {
    var stick_count = inventory.itemCount(mf.ItemType.Stick);

    if (stick_count < 1) {
        mf.chat("not enough sticks to create torch");
        return
    }

    var coal_count = inventory.itemCount(mf.ItemType.Coal);

    if (coal_count < 1) {
        mf.chat("not enough coal to create torch");
        return
    }

    var stick_slot = inventory.itemSlot(mf.ItemType.Stick);
    var stick_item = mf.inventoryItem(stick_slot);

    var coal_slot = inventory.itemSlot(mf.ItemType.Coal);
    var coal_item = mf.inventoryItem(coal_slot);

    window_open_func = function(window_type) {
        window_open_func = undefined;

        mf.debug("now crafting");

        mf.clickInventorySlot(stick_slot, false);
        mf.clickUniqueSlot(3, true);

        mf.clickInventorySlot(coal_slot, false);
        mf.clickUniqueSlot(1, true);

        mf.clickUniqueSlot(0, false);

        mf.closeWindow();
    };
    mf.openInventoryWindow();

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

    var table_pt_arr = block_finder.findNearest(mf.self().position, mf.ItemType.Workbench, 20, 1);
    
    if (table_pt_arr.length === 0) {
        mf.chat("I see no crafting table.");
        return;
    }
    var table_pt = table_pt_arr[0];

    navigator.navigateTo(table_pt, {
        "end_radius": 3,
        "arrived_func": function() {
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
            mf.hax.activateBlock(table_pt);
        },
    });
});

chat_commands.registerCommand("loot", function() {
    var chest_pts = block_finder.findNearest(mf.self().position, mf.ItemType.Chest, 20, 1);
    
    if (chest_pts.length === 0) {
        mf.chat("I see no chest.");
        return;
    }
    var chest_pt = chest_pts[0];

    navigator.navigateTo(chest_pt, {
        "end_radius": 3,
        "arrived_func": function() {
            mf.debug("done navigating");
            window_open_func = function(window_type) {
                window_open_func = undefined;

                mf.debug("now looting");

                for (var i = 0; i < 27; i++) {
                    var item = mf.uniqueWindowItem(i);
                    if (item.type != mf.ItemType.NoItem) {
                        mf.debug("looting " + item.count + " " + items.nameForId(item.type));
                        mf.clickUniqueSlot(i, false);
                        mf.debug("dropping outside window");
                        mf.clickOutsideWindow(false);
                    }
                }

                mf.closeWindow();
            };
            mf.hax.activateBlock(chest_pt);
        },
    });
    
});
