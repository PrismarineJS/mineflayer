mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");
mf.include("items.js");
mf.include("inventory.js");
mf.include("navigator.js");

var findChestNearestPoint = function(point) {
    chests = block_finder.findNearest(point,mf.ItemType.Chest, 128, 1);
    if (chests.length === 0) {
        return undefined;
    } else {
        return chests.shift();
    }
};

var chest_data = [];

var cant_navto_func = function() {
    var this_data = chest_data.shift();
    this_data.respond("I can't find a path to the chest at (" + this_data.chest_position.x + ", " + this_data.chest_position.y + ", " + this_data_chest_position.z + ").");
    if (chest_data.length !== 0) {
        dump_to_chest();
    } else {
        mf.chat("Chest navigation complete.  Awaiting new commands.");
    }
};

var on_chest_opened = function(window_type) {
    if (window_type !== mf.WindowType.Chest) {
        return;
    }
    if (chest_data.length === 0) {
        return;
    }
    var this_data = chest_data.shift();
    var current_inventory = inventory.condensedSnapshot();
    if (this_data.item_type === undefined) {
        for (var type in current_inventory) {
            type = parseInt(type);
            if (current_inventory.hasOwnProperty(type)) {
                var item_slot = inventory.itemSlot(type);
                if (item_slot === undefined) {
                    continue;
                }
                for (var chest_slot = 0; chest_slot < 54; chest_slot++) {
                    var chest_item = mf.uniqueWindowItem(chest_slot);
                    if (chest_item.type === type || chest_item.type === mf.ItemType.NoItem) {
                        if (chest_item.count < mf.itemStackHeight(chest_item.type) || chest_item.type === mf.ItemType.NoItem) {
                            mf.clickInventorySlot(item_slot,mf.MouseButton.Left);
                            mf.clickUniqueSlot(chest_slot,mf.MouseButton.Left);
                            mf.clickInventorySlot(item_slot,mf.MouseButton.Left);
                        }
                    }
                    if (mf.inventoryItem(item_slot).id !== type) {
                        //No more items here
                        break;
                    }
        
                }
            }
        }
    } else {
        mf.chat("No.");
    }
    mf.closeWindow();
    if (chest_data.length !== 0) {
        dump_to_chest();
    } else {
        mf.chat("Chest navigation complete.  Awaiting new commands.");
    }
};

mf.onWindowOpened(on_chest_opened);

var dump_func = function() {
    mf.hax.activateBlock(chest_data[0].chest_position);
};

var dump_to_chest = function() {
    if (chest_data.length !== 0) {
        var this_data = chest_data[0];
        if (this_data.item_type !== undefined) {
            if (this_data.item_count !== undefined) {
                this_data.respond("Going to go dump " + this_data.item_count + " " + items.nameForId(this_data.item_type) + " into chest at (" + this_data.chest_position.x + ", " + this_data.chest_position.y + ", " + this_data.chest_position.z + ").");
            } else {
                this_data.respond("Goin to go dump all of my " + items.nameForId(this_data.item_type) + " into chest at (" + this_data.chest_position.x + ", " + this_data.chest_position.y + ", " + this_data.chest_position.z + ").");
            }
        } else {
            this_data.respond("Going to go dump everything into chest at (" + this_data.chest_position.x +", " + this_data.chest_position.y + ", " + this_data.chest_position.z + ").");
        }
        navigator.navigateTo(this_data.chest_position,{
            end_radius : 3,
            cant_find_func : cant_navto_func,
            arrived_func : dump_func
        });

    }
};

var dump = function(chest_position, respond, item_type, item_count) {
    data = {
        chest_position : chest_position,
        item_type : item_type,
        item_count : item_count,
        respond : respond
    };
    chest_data.push(data);
    if (chest_data.length === 1) {
        dump_to_chest();
    }
};

var dump_command = function(speaker,args,respond) {
/*
    Parsing:
    case 1: Dump everything into nearest chest
        "dump" 
        "dump all/inventory/ * /everything"
    
    case 2: Dump everything into chest nearest entity(speaker)
        "dump here" 
        "dump all/inventory/ * /everything here"

    case 3: Dump everything into chest nearest location
        "dump into location"
        "dump all/inventory/ * /everything into location"

    case 4: Dump all items of type X into nearest chest
        "dump X"

    case 5: Dump all items of type X into chest nearest entity(speaker)
        "dump X here"

    case 6: Dump all items of type X into chest nearest location
        "dump X into location"

    case 7: Dump # items of type X into nearest chest
        "dump # X"

    case 8: Dump # items of type X into chest nearest entity(speaker)
        "dump # X here"

    case 9: Dump # items of type X into chest nearest location
        "dump # X into location"
*/

    var chest_position = findChestNearestPoint(mf.self().position);
    var location_type = 0;
    if (args.length !== 0 && args[args.length-1] === "here") {
        //set chest_position to position of speaker
        args.pop();
        var player = player_tracker.entityForPlayer(speaker);
        if (player === undefined) {
            respond("I don't know where you are, " + speaker + ".");
            return;
        }        
        chest_position = findChestNearestPoint(player.position);
        location_type = 1;
    }
    var location_string = undefined;
    for (var i = 0; i < args.length; i++) {
        if (args[i] === "into") {
            location_string = (args.slice(i+1,args.length)).join(" ");
            args = args.slice(0,i);
            break;
        }
    }
    if (location_string !== undefined) {
        matching_location = location_manager.findUnambiguousLocation(location_string,respond);
        if (matching_location === undefined) {
            return;
        }
        matching_location = matching_location.point;
        chest_position = findChestNearestPoint(matching_location);
        location_type = 2;
    }
    if (chest_position === undefined) {
        switch(location_type) {
            case 0:
                respond("I couldn't find any chests near me.");
                return;
            case 1:
                respond("I couldn't find any chests near you.");
                return;
            case 2:
                respond("I couldn't find any chests near " + location_string + ".");
                return;
            default:
                // This should never happen...
                respond("I couldn't find any chests anywhere.");
                return;
        }
    } else {
        chest_position = chest_position.floored();
    }
    
    if (args.length === 0) {
        //dump everything into chest_position
        dump(chest_position, respond);
        return;
    }
    if (args.length === 1) {
        var arg = args[0];
        if (arg === "all" || arg === "inventory" || arg === "*" || arg === "everything") {
            //dump everything into chest nearest mf.self()
            dump(chest_position,respond);
            return;
        }
    }
    var count = undefined;
    if (!isNaN(args[0])) {
        count = parseInt(args.shift());
    }
    item_name = args.join(" ");
    var item = items.findUnambiguouslyInDatabase(item_name,respond,inventory.getDatabase());
    if (item === undefined) {
        return;
    }
    var item_type = item.id;
    if (count !== undefined) {
        have_count = inventory.itemCount(item_type);
        if (inventory.itemCount(item_type) >= count) {
            respond("I don't have " + count + " " + items.nameForId(item_type) + ".  I'm only going to dump " + have_count + ".");
        }
        dump(chest_position, respond, item_type, count);
    } else {
        dump(chest_position,respond,item_type);
    }
};
chat_commands.registerCommand("dump",dump_command,0,Infinity);
