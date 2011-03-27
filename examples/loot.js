mf.include("inventory.js");
mf.include("player_tracker.js");
mf.include("navigator.js");
mf.include("chat_commands.js");
mf.include("location_manager.js");
mf.include("items.js");

var item_type = undefined;
var item_count = undefined;
var chest_position = undefined;
var respond = undefined;
var location_string = undefined;

var reset = function() {
    item_type = undefined;
    item_count = undefined;
    chest_position = undefined;
    respond = undefined;
    location_string = undefined;
};

chat_commands.registerCommand("stop",reset);

mf.onWindowOpened(function(window_type) {
    if (window_type !== mf.WindowType.Chest) {
        return;
    }
    if (respond === undefined || location_string === undefined || chest_position === undefined) {
        return;
    }

    if (item_type !== undefined) {
        if (item_count === undefined) {
            item_count = inventory.condensedSnapshot(inventory.ChestFull)[item_type];
            if (item_count === undefined) {
                respond("I couldn't find any " + items.nameForId(item_type) + ".  Done!");
                reset();
                mf.closeWindow();
                return;
            }
        } else {
            var actual_count = inventory.condensedSnapshot(inventory.ChestFull)[item_type];
            if (actual_count === undefined) {
                respond("I couldn't find any " + items.nameForId(item_type) + ".  Done!");
                reset();
                mf.closeWindow();
                return;
            } else if (actual_count < item_count) {
                respond("I only see " + actual_count + " " + items.nameForId(item_type) + ".  I'm only going to be able to loot that many.");
            }
        }
        
    } else {
        item_count = 0;//1;
        var counts = inventory.condensedSnapshot(inventory.ChestFull);
        for (var type in counts) {
            if (counts.hasOwnProperty(type)) {
                item_count += counts[type];
            }
        }
        if (item_count === 0) {
            respond("Done!");
            reset();
            mf.closeWindow();
            return;
        }
    }
    // Deposit items
    for (var chest_slot = inventory.ChestFull.firstSlot; chest_slot <= inventory.ChestFull.lastSlot; chest_slot++) {
        var chest_item = inventory.inventoryItem(chest_slot,inventory.ChestFull);
        if (chest_item.type === mf.ItemType.NoItem) {
            continue;
        }
        if (item_type !== undefined) {
            if (item_type !== chest_item.type) {
                continue;
            }
        }

        var slots = inventory.slotsForItem(inventory.inventoryItem(chest_slot,inventory.ChestFull).type, inventory.InventoryFull);

        for (var k = 0; k < slots.length; k++) {
            var inv_slot = slots[k];
            var inv_item = inventory.inventoryItem(inv_slot,inventory.InventoryFull);
            var open_slots = mf.itemStackHeight(chest_item.type) - inv_item.count;
            if (open_slots === 0) {
                continue;
            }
            if (open_slots <= item_count) {
                //Fill all slots
                mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                mf.clickInventorySlot(inv_slot,mf.MouseButton.Left);
                mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                chest_item = inventory.inventoryItem(chest_slot, inventory.ChestFull);
                item_count -= Math.min(open_slots, chest_item.count);
                if (chest_item.type === mf.ItemType.NoItem) {
                    break;
                }
            } else {
                //Fill up to item_count slots
                if (chest_item.count > item_count) {
                    //Fill item_count slots

                    if (Math.ceil(chest_item.count/2) >= item_count) {
                        if (Math.ceil(chest_item.count/2) === item_count) {
                            mf.clickUniqueSlot(chest_slot,mf.MouseButton.Right);
                            mf.clickInventorySlot(inv_slot,mf.MouseButton.Left);
                            chest_item = inventory.inventoryItem(chest_slot, inventory.ChestFull);
                        } else {
                            mf.clickUniqueSlot(chest_slot,mf.MouseButton.Right);
                            for (var i = 0; i < item_count; i++) {
                                mf.clickInventorySlot(inv_slot,mf.MouseButton.Right);
                            }
                            mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                            chest_item = inventory.inventoryItem(chest_slot, inventory.ChestFull);
                        }
                    } else {
                        mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                        for (var i = 0; i < item_count; i++) {
                            mf.clickInventorySlot(inv_slot,mf.MouseButton.Right);
                        }
                        mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                        chest_item = inventory.inventoryItem(chest_slot, inventory.ChestFull);
                    }                    
                    item_count = 0;
                    break;
                } else {
                    //Fill chest_item.count slots
                    mf.clickUniqueSlot(chest_slot, mf.MouseButton.Left);
                    mf.clickInventorySlot(inv_slot,mf.MouseButton.Left);
                    mf.clickUniqueSlot(chest_slot, mf.MouseButton.Left);
                    chest_item = inventory.inventoryItem(chest_slot, inventory.ChestFull);
                    item_count -= chest_item.count;
                }
            }
        }
        if (item_count === 0) {
            break;
        }
    }
    if (item_count !== 0 && (item_type === undefined || inventory.itemSlot(item_type,inventory.ChestFull) !== undefined)) {
       respond("My inventory is full!");
    } else {
        respond("Done!");
    }
    reset();
    mf.closeWindow();
});

var loot = function() {
    if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
        if (mf.self().position.floored().distanceTo(chest_position.floored()) > 64) {
            responder_fun("I'm going to go near " + location_string + " to look for chests.");
            navigator.navigateTo(chest_position, {
                end_radius: 32,
                timeout_milliseconds: 1000 * 6,
                arrived_func: loot,
                cant_find_func: function() {
                    respond("I can't get close enough to " + location_string + " to look for chests.");
                    reset();
                }
            });
        } else {
            chest_position = block_finder.findNearest(chest_position,mf.ItemType.Chest,128,1);
            if (chest_position.length !== 1) {
                respond("I can't see any chests near " + location_string + ".");
                reset();
            }
            chest_position = chest_position.shift();
            navigator.navigateTo(chest_position, {
                end_radius: 3,
                timeout_milliseconds: 1000 * 5,
                arrived_func: loot,
                cant_find_func: function() {
                    respond("I can't get close enough to the chest at " + chest_position + ".");
                    reset();
                }
            });
        }
    } else {
        if (mf.self().position.floored().distanceTo(chest_position.floored()) < 4) {         
            mf.hax.activateBlock(chest_position);
        } else {
            navigator.navigateTo(chest_position, {
                end_radius: 3,
                timeout_milliseconds: 1000 * 5,
                arrived_func: loot,
                cant_find_func: function() {
                    respond("I can't get close enough to the chest at " + chest_position + ".");
                    reset();
                }
            });
        }
    }
};

chat_commands.registerCommand("loot",function(speaker,args,responder_fun) {
    if (args.length > 0) {
        if (! isNaN(args[0])) {
            item_count = Math.ceil(args.shift());
            if (item_count <= 0) {
                responder_fun("I can't loot " + item_count + " of ANY item!");
                reset();
                return;
            }
        }
    }
    if (args.length > 0) {
        var arg = args[0];
        if (arg === "everything" || arg === "all" || arg === "*") {
            args.shift();
            item_type = undefined;
        }
    }
    if (args.length > 0) {
        if (args[args.length-1] === "here") {
            args.pop();
            var player = player_tracker.entityForPlayer(speaker);
            if (player === undefined) {
                responder_fun("I can't see you, " + speaker + ".");
                reset();
                return;
            }
            chest_position = player.position;
            location_string = "you";
        }
    }
    if (args.length > 0) {
        var flag = false;
        for (var i = 0; i < args.length; i++) {
            if (args[i] === "near") {
                location_string = (args.slice(i+1,args.length)).join(" ");
                args = args.slice(0,i);
                flag = true;
                break;
            }
        }
        if (args.length === 0) {
            item_type = undefined;
        } else {
            item_type = items.findItemTypeUnambiguously(args.join(" "),responder_fun);
            if (item_type === undefined) {
                reset();
                return;
            }
            item_type = item_type.id;
        }
        if (flag) {
            chest_position = location_manager.findUnambiguousLocation(location_string,responder_fun);
            if (chest_position === undefined) {
                reset();
                return;
            }
            location_string = chest_position.name;
            chest_position = chest_position.point;
        }
    }
    if (chest_position === undefined) {
        chest_position = block_finder.findNearest(mf.self().position,mf.ItemType.Chest,128,1);
        if (chest_position.length !== 1) {
            responder_fun("I couldn't find any nearby chests.");
            reset();
            return;
        }
        chest_position = chest_position.shift();
        location_string = "me";
    }
    if (item_count !== undefined) {
        if (item_type === undefined) {
            responder_fun("I can't loot " + item_count + " of all block types!");
            reset();
            return;
        } else {
            responder_fun("I'm going to go loot " + item_count + " " + items.nameForId(item_type) + " from the chest nearest " + location_string);
        }
    } else {
        if (item_type === undefined) {
            responder_fun("I'm going to go loot everything out of the chest nearest " + location_string);
        } else {
            responder_fun("I'm going to go loot all " + items.nameForId(item_type) + " from the chest nearest " + location_string);
        }
    }
    respond = responder_fun;
    loot();
},0,Infinity);
