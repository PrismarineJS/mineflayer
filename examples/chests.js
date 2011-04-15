mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");
mf.include("items.js");
mf.include("inventory.js");
mf.include("navigator.js");
mf.include("task_manager.js");

(function() {
    var findChestNearestPoint = function(point) {
        var chests = block_finder.findNearest(point, mf.ItemType.Chest, 128, 1);
        if (chests.length === 0) {
            return undefined;
        } else {
            return chests.shift();
        }
    };

    var useChest = function(speaker, args, responder_fun, command) {
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
        var location_string;
        if (args.length > 0) {
            if (! isNaN(args[0])) {
                item_count = Math.ceil(args.shift());
                if (item_count <= 0) {
                    responder_fun("I can't " + command + " " + item_count + " of ANY item!");
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
                if (command === "loot") {
                    item_type = items.findItemTypeUnambiguously(args.join(" "),responder_fun);
                    if (item_type === undefined) {
                        return;
                    }
                } else {
                    item_type = items.findUnambiguouslyInDatabase(args.join(" "),responder_fun,inventory.getDatabase());
                    if (item_type === undefined) {
                        return;
                    }
                }
                item_type = item_type.id;
            }
            if (flag) {
                chest_position = location_manager.findUnambiguousLocation(location_string,responder_fun);
                if (chest_position === undefined) {
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
                return;
            }
            chest_position = chest_position.shift();
            location_string = "me";
        }
        if (item_count !== undefined) {
            if (item_type === undefined) {
                responder_fun("I can't " + command + " " + item_count + " of all block types!");
                return;
            }
        }
        chest_position = chest_position.floored();
        var task = new task_manager.Task(function useChestData() {
            function cant_navto_func() {
                responder_fun("I can't find a path to the chest at " + chest_position.floored() + ".");
                task_manager.remove(task);
            }
            if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
                if (mf.self().position.floored().distanceTo(chest_position) <= 120) {
                    var new_chest_position = findChestNearestPoint(chest_position);
                    if (new_chest_position === undefined) {
                        responder_fun("Unable to find any chest near " + chest_position.floored() + ".");
                        task_manager.remove(task);
                        return;
                    }
                    chest_position = new_chest_position;
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
                    mf.onWindowOpened(function on_chest_opened(window_type) {
                        if (window_type !== mf.WindowType.Chest) {
                            return;
                        }
                        mf.removeHandler(mf.onWindowOpened, on_chest_opened);
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
                        task_manager.remove(task);
                    });
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
                    navigator.navigateTo(chest_position,{
                        end_radius : 3,
                        timeout_milliseconds: 6 * 1000,
                        cant_find_func : cant_navto_func,
                        arrived_func : useChestData
                    });
                }
            }
        }, function stop() {
            if (inventory.currentlyOpenWindow !== undefined) {
                mf.closeWindow();
            }
            task_manager.remove(task);
        });
        task.pause = navigator.stop;
        task.toString = function() {
            if (item_type === undefined) {
                if (command === "loot") {
                    if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
                        return "loot everything near " + location_string;
                    } else {
                        return "loot everything from chest at " + chest_position;
                    }
                } else {
                    if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
                        return "dump everything near " + location_string;
                    } else {
                        return "dump everything into chest at " + chest_position;
                    }
                }
            } else if (item_count === undefined) {
                if (command === "loot") {
                    if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
                        return "loot all " + items.nameForId(item_type) + " from chest near " + location_string;
                    } else {
                        return "loot all " + items.nameForId(item_type) + " from chest at " + chest_position;
                    }
                } else {
                    if (mf.blockAt(chest_position).type !== mf.ItemType.Chest) {
                        return "dump all " + items.nameForId(item_type) + " into chest near " + location_string;
                    } else {
                        return "dump all " + items.nameForId(item_type) + " into chest at " + chest_position;
                    }
                }
            }
        };
        task_manager.doLater(task);
    };

    chat_commands.registerCommand("loot", function(speaker, args, responder_fun) {
       useChest(speaker, args, responder_fun, "loot"); 
    }, 0, Infinity);

    chat_commands.registerCommand("dump", function(speaker, args, responder_fun) {
        useChest(speaker,args,responder_fun,"dump");
    }, 0, Infinity);
})();
