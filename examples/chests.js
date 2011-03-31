mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");
mf.include("items.js");
mf.include("inventory.js");
mf.include("navigator.js");
(function() {
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
        this_data.responder_fun("I can't find a path to the chest at " + chest_position.floored() + ".");
        if (chest_data.length !== 0) {
            useChestData();
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
        var chest_position = this_data.chest_position;
        var item_type = this_data.item_type;
        var item_count = this_data.item_count;
        var responder_fun = this_data.responder_fun;
        var location_string = this_data.location_string
        var command = this_data.command;

        if (item_type === undefined) {
            if (command === "loot") {
                var success = inventory.moveAll(inventory.ChestFull,inventory.InventoryFull);
            } else {
                var success = inventory.moveAll(inventory.InventoryFull,inventory.ChestFull);
            }
            
            if (success) {
                responder_fun("Done!");
            } else {
                if (command === "loot") {
                    responder_fun("My inventory is full!");
                } else {
                    responder_fun("The chest is too full to hold anything else!");
                }
            }
        } else {
            if (item_count === undefined) {
                if (command === "loot") {
                    var success = inventory.moveAllType(item_type, inventory.ChestFull, inventory.InventoryFull);
                } else {
                    var success = inventory.moveAllType(item_type,inventory.InventoryFull,inventory.ChestFull);
                }
                if (success) {
                    responder_fun("Done!");
                } else {
                    if (command === "loot") {
                        respond_fun("My inventory is too full to hold any more " + items.nameForId(item_type) + ".");
                    } else {
                        responder_fun("The chest is too full to hold any more " + items.nameForId(item_type) + ".");
                    }
                }
            } else {
                if (command === "loot") {
                    var success = inventory.moveCountType(item_count, item_type, inventory.ChestFull, inventory.InventoryFull);
                } else {
                    var success = inventory.moveCountType(item_count, item_type, inventory.InventoryFull, inventory.ChestFull);
                }
                if (success) {
                    responder_fun("Done!");
                } else {
                    if (command === "loot") {
                        responder_fun("My inventory is too full to hold any more " + items.nameForId(item_type) + ".");
                    } else {
                        responder_fun("The chest is too full to hold any more " + items.nameForId(item_type) + ".");
                    }
                }
            }
        }
        mf.closeWindow();
        if (chest_data.length !== 0) {
            useChestData();
        }
    };

    mf.onWindowOpened(on_chest_opened);

    var useChestData = function() {
        if (chest_data.length === 0) {
            return;
        }
        var this_data = chest_data[0];
        var chest_position = chest_data[0].chest_position;
        var item_type = chest_data[0].item_type;
        var item_count = chest_data[0].item_count;
        var responder_fun = chest_data[0].responder_fun;
        var location_string = chest_data[0].location_string
        var command = chest_data[0].command;
        if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
            if (mf.self().position.floored().distanceTo(chest_position) <= 64) {
                chest_position = findChestNearestPoint(chest_position);
                if (chest_position === undefined) {
                    responder_fun("Unable to find any chest near " + chest_position.floored() + ".");
                    chest_data.shift();
                    if (chest_data.length !== 0) {
                        useChestData();
                    }
                }
                if (item_type !== undefined) {
                    if (item_count !== undefined) {
                        if (command === "loot") {
                            responder_fun("Going to go " + command + " " + item_count + " " + items.nameForId(item_type) + " from chest at " + chest_position.floored() + ".");
                        } else {
                            responder_fun("Going to go " + command + " " + item_count + " " + items.nameForId(item_type) + " into chest at " + chest_position.floored() + ".");
                        }
                    } else {
                        if (command === "loot") {
                            responder_fun("Going to go " + command + " all of the " + items.nameForId(item_type) + " from the chest at " + chest_position.floored() + ".");
                        } else {
                            responder_fun("Going to go " + command + " all of my " + items.nameForId(item_type) + " into the chest at " + chest_position.floored() + ".");
                        }
                    }
                } else {
                    if (command === "loot") {
                        responder_fun("Going to go " + command + " everything from the chest at " + chest_position.floored() + ".");
                    } else {
                        responder_fun("Going to go " + command + " everything into the chest at " + chest_position.floored() + ".");
                    } 
                }
                navigator.navigateTo(chest_position.floored(),{
                    end_radius : 3,
                    timeout_milliseconds: 6 * 1000,
                    cant_find_func : cant_navto_func,
                    arrived_func : useChestData
                });
            } else {
                responder_fun("Going to go near that location and see the nearest chests.");
                navigator.navigateTo(chest_position.floored(),{
                    end_radius: 32,
                    timeout_milliseconds: 6 * 1000,
                    cant_find_func: cant_navto_func,
                    arrived_func: useChestData
                });
            }
        } else {
            if (mf.self().position.floored().distanceTo(chest_position.floored()) <= 3) {
                mf.hax.activateBlock(chest_position);
            } else {
                if (item_type !== undefined) {
                    if (item_count !== undefined) {
                        if (command === "loot") {
                            responder_fun("Going to go " + command + " " + item_count + " " + items.nameForId(item_type) + " from the chest at " + chest_position.floored() + ".");
                        } else {
                            responder_fun("Going to go " + command + " " + item_count + " " + items.nameForId(item_type) + " into the chest at " + chest_position.floored() + ".");
                        }
                    } else {
                        if (command === "loot") {
                            responder_fun("Going to go " + command + " all of my " + items.nameForId(item_type) + " from the chest at " + chest_position.floored() + ".");
                        } else {
                            responder_fun("Going to go " + command + " all of my " + items.nameForId(item_type) + " into the chest at " + chest_position.floored() + ".");
                        }
                    }
                } else {
                    if (command === "loot") {
                        responder_fun("Going to go " + command + " everything from the chest at " + chest_position.floored() + ".");
                    } else {
                        responder_fun("Going to go " + command + " everything into the chest at " + chest_position.floored() + ".");
                    }
                }
                navigator.navigateTo(chest_position,{
                    end_radius : 3,
                    timeout_milliseconds: 6 * 1000,
                    cant_find_func : cant_navto_func,
                    arrived_func : useChestData
                });
            }
        }
    };

    var start_using_chest = function(chest_position, responder_fun, item_type, item_count, command, location_string) {
        data = {
            chest_position: chest_position,
            item_type: item_type,
            item_count: item_count,
            responder_fun: responder_fun,
            command: command,
            location_string: location_string
        };
        chest_data.push(data);
        if (chest_data.length === 1) {
            useChestData();
        }
    };

    var useChest = function(speaker,args,responder_fun,command) {
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
    var chest_position;
    var item_type;
    var item_count;
    var location_string
        if (args.length > 0) {
            if (! isNaN(args[0])) {
                item_count = Math.ceil(args.shift());
                if (item_count <= 0) {
                    responder_fun("I can't " + command + " " + item_count + " of ANY item!");
                    stop();
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
                    stop();
                    return;
                }
                var target_block_position;
                var cursor = player.position.offset(0, 0, player.height);
                var yaw = player.yaw, pitch = player.pitch;
                var vector_length = 0.03125;
                var x = Math.cos(yaw) * Math.cos(pitch);
                var y = Math.sin(yaw) * Math.cos(pitch);
                var z = Math.sin(pitch);
                var step_delta = new mf.Point(x * vector_length, y * vector_length, z * vector_length);
                for (var i = 0; i < 192; i++) {
                    cursor = cursor.plus(step_delta);
                    if (mf.isPhysical(mf.blockAt(cursor).type)) {
                        target_block_position = cursor.floored();
                        break;
                    }
                }
                if (target_block_position === undefined) {
                    chest_position = player.position;
                } else {
                    chest_position = target_block_position;
                }
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
                    stop();
                    return;
                }
                item_type = item_type.id;
            }
            if (flag) {
                chest_position = location_manager.findUnambiguousLocation(location_string,responder_fun);
                if (chest_position === undefined) {
                    stop();
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
                stop();
                return;
            }
            chest_position = chest_position.shift();
            location_string = "me";
        }
        if (item_count !== undefined) {
            if (item_type === undefined) {
                responder_fun("I can't " + command + " " + item_count + " of all block types!");
                stop();
                return;
            }
        }
        start_using_chest(chest_position, responder_fun, item_type, item_count, command, location_string);
    };


    var stop = function(speaker,args,respond) {
        if (inventory.currentlyOpenWindow !== undefined) {
            mf.closeWindow();
        }
        chest_data = [];
        
    };

    function loot_command(speaker,args,responder_fun) {
       useChest(speaker,args,responder_fun,"loot"); 
    }

    function dump_command(speaker,args,responder_fun) {
        useChest(speaker,args,responder_fun,"dump");
    }

    chat_commands.registerCommand("loot",loot_command,0,Infinity);
    chat_commands.registerCommand("stop",stop,0,0);
    chat_commands.registerCommand("dump",dump_command,0,Infinity);
})();
