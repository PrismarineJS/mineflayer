mf.include("chat_commands.js");
mf.include("iterators.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("inventory.js");

(function() {

    var flatten_types = new Set([mf.ItemType.Sand, mf.ItemType.Grass, mf.ItemType.Dirt, mf.ItemType.Gravel, mf.ItemType.Stone, mf.ItemType.Sandstone]);

    function get_flatten_database() {
        var db = {};
        for (var val in flatten_types.values) {
            db[parseInt(val)] = items.nameForId(val);
        }
        return db;
    }

    function flatten_add_type(speaker, args, responder_fun) {
        var arg = args.join(" ");
        var str_item_types = arg.split(",");
        var invalid_types = [];
        var valid_types = [];
        for (var i = 0; i < str_item_types.length; i++) {
            var item_type = str_item_types[i].trim();
            var matching_types = items.lookupBlockType(item_type);
            if (matching_types.length !== 1) {
                invalid_types.push(item_type);
                continue;
            }
            item_type = matching_types[0].id;
            valid_types.push(items.nameForId(item_type));
            flatten_types.add(item_type);
        }
        if (invalid_types.length > 0) {
            responder_fun("Ambiguous or unknown types: " + invalid_types.join(", "));
        }
        if (valid_types.length > 0) {
            responder_fun("Now flattening " + valid_types.join(", "));
        }
    }

    function flatten_remove_type(speaker, args, responder_fun) {
        var arg = args.join(" ");
        if (arg === "*" || arg === "everything" || arg === "all") {
            flatten_types.clear();
            responder_fun("No longer flattening anything");
            return;
        }
        var str_item_types = arg.split(",");
        var invalid_types = [];
        var valid_types = [];
        for (var i = 0; i < str_item_types.length; i++) {
            var item_type = str_item_types[i].trim();
            var matching_types = items.lookupInDatabase(item_type, get_flatten_database());
            if (matching_types.length !== 1) {
                invalid_types.push(item_type);
                continue;
            }
            item_type = matching_types[0].id;
            valid_types.push(items.nameForId(item_type));
            flatten_types.remove(item_type);
        }
        if (invalid_types.length > 0) {
            responder_fun("Ambiguous, unknown, or already not flattening " + invalid_types.join(", "));
        }
        if (valid_types.length > 0) {
            responder_fun("No longer flattening " + valid_types.join(", "));
        }
    }

    function flatten_list(speaker, responder_fun) {
        responder_fun("Flattening " + flatten_types.list().mapped(function(type) {return items.nameForId(type);}).join(", "));
    }

    chat_commands.registerCommand("flatten", function(speaker, args, responder_fun) {
        if (!isNaN(args[0])) {
            return;
        }
        var command = args.shift();
        if (command === "add") {
            if (args.length > 0) {
                flatten_add_type(speaker, args, responder_fun);
            } else {
                responder_fun("Must specify a type to add");
            }
            return;
        }
        if (command === "remove") {
            if (args.length > 0) {
                flatten_remove_type(speaker, args, responder_fun);
            } else {
                responder_fun("Must specify a type to remove");
            }
            return;
        }
        if (command === "list") {
            flatten_list(speaker, responder_fun);
            return;
        }
        responder_fun("Unrecognized command: " + command);
    }, 1, Infinity);

    chat_commands.registerCommand("flatten", function(speaker, args, responder_fun) {
        if (isNaN(args[0])) {
            return;
        }
        var player = player_tracker.entityForPlayer(speaker);
        if (player === undefined) {
            responder_fun("I can't see you, " + speaker + ".");
            return;
        }
        var radius = 8;
        if (args.length > 0) {
            var arg = args.shift();
            if (isNaN(arg)) {
                responder_fun("Not a number: " + arg);
                return;
            } else {
                radius = parseInt(arg);
            }
        }
        var player_position = player.position.floored();
        var max_height_level = 128;
        if (args.length > 0) {
            var arg = args.shift();
            if (isNaN(arg)) {
                responder_fun("Not a number: " + arg);
                return;
            }
            max_height_level = player_position.z + parseInt(arg);
        }
        var respond = responder_fun;
        var min_height_level = player.position.z;
        var has_pick = true;
        var has_axe = true;
        var has_shovel = true;
        var block_positions;
        var block_index;
        var running;
        var flattened;

        function done() {
            running = false;
            task_manager.done();
        }

        function start_punch() {
            navigator.navigateTo(block_positions[block_index], {
                end_radius: 4,
                timeout_milliseconds: 1000 * 1,
                arrived_func: function() {
                    if (!running) {
                        // stopped
                        return;
                    }
                    if (! mf.isDiggable(mf.blockAt(block_positions[block_index]).type)) {
                        block_positions.removeAt(block_index);
                        mine_blocks();
                        return;
                    }
                    mf.onStoppedDigging(function asdf() {
                        mf.removeHandler(mf.onStoppedDigging, asdf);
                        block_positions.removeAt(block_index);
                        mine_blocks();
                    });
                    flattened = true;
                    mf.startDigging(block_positions[block_index]);
                },
                cant_find_func: function() {
                    block_index++;
                    mine_blocks();
                },
            });
        }

        var mine_blocks = function() {
            if (block_positions.length === 0) {
                respond("I can't find anything else to flatten!");
                done();
                return;
            }
            if (block_index >= block_positions.length) {
                if (!flattened) {
                    respond("I can't reach any of the " + block_positions.length + " remaining blocks.  Done!");
                    done();
                    return;
                } else {
                    block_index = 0;
                    flattened = false;
                }
            }
            var block_position = block_positions[block_index];
            var block_type = mf.blockAt(block_position).type;
            if (! flatten_types.contains(block_type)) {
                block_positions.removeAt(block_index);
                mine_blocks();
                return;
            }
            if (!inventory.equipBestTool(block_type, start_punch)) {
                // couldn't equip proper tool
                var missing_tools = items.toolsForBlock(block_type);
                if (missing_tools === items.tools.shovels) {
                    if (has_shovel) {
                        respond("I don't have any shovels!");
                        has_shovel = false;
                        if (!inventory.equipNonTool(start_punch)) {
                            start_punch();
                        }
                    }
                } else if (missing_tools === items.tools.pickaxes) {
                    if (has_pick) {
                        respond("I don't have any pickaxes!  I'm going to skip over any blocks that require a pickaxe for material.");
                        has_pick = false;
                    }
                    block_index++;
                    mine_blocks();
                } else  if (missing_tools === items.tools.axes) {
                    if (has_axe) {
                        respond("I don't have any axes!");
                        has_axe = false;
                        if (! inventory.equipNonTool(start_punch)) {
                            start_punch();
                        }
                    }
                } else {
                    throw "I didn't know I was going to need a " + items.nameForId(missing_tools[0]);
                }
            }
        };
        var start_mining = function() {
            block_positions = new iterators.StripeIterable({
                corner1: new mf.Point(player_position.x - radius, player_position.y - radius, min_height_level),
                corner2: new mf.Point(player_position.x + radius, player_position.y + radius, max_height_level),
                stripe_width: 6,
                z_direction: -1,
            }).toArray();
            block_index = 0;
            flattened = false;
            if (block_positions.length <= 0) {
                respond("I don't see anything to flatten!");
                done();
                return;
            }
            max_height_level = block_positions[0].z;
            mine_blocks();
        };
        task_manager.doLater(new task_manager.Task(function start() {
                navigator.navigateTo(player.position, {
                    end_radius: 16,
                    timeout_milliseconds: 1000 * 10,
                    arrived_func: start_mining,
                    path_found_func: function() {
                        if (! running) {
                            responder_fun("Going to try and flatten");
                        }
                        running = true;
                    },
                    cant_find_func: function() {
                        responder_fun("Sorry, I can't get to you!");
                        done();
                    },
                });
            }, function stop() {
                running = false;
            }, function toString() {
                if (block_positions !== undefined && block_positions.length > 0) {
                    return "flatten (" + player_position.x + ", " + player_position.y + ") r=" + radius + " z=[" + min_height_level + " : " + block_positions[0].z + "]";
                } else {
                    return "flatten (" + player_position.x + ", " + player_position.y + ") r=" + radius + " z=[" + min_height_level + " : " + max_height_level + "]";
                }

            })
        );
    }, 0, 2);

})();
