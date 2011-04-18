mf.include("chat_commands.js");
mf.include("iterators.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("inventory.js");

chat_commands.registerCommand("flatten", function(speaker, args, responder_fun) {
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
    var flatten_types = [mf.ItemType.Sand, mf.ItemType.Grass, mf.ItemType.Dirt, mf.ItemType.Gravel, mf.ItemType.Stone, mf.ItemType.Sandstone];
    var has_pick = inventory.itemsSlot(items.tools.pickaxes) !== undefined;
    var has_shovel = inventory.itemsSlot(items.tools.shovels) !== undefined;
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

    var block_to_tools = {};
        block_to_tools[mf.ItemType.Sand] = "shovels";
        block_to_tools[mf.ItemType.Dirt] = "shovels";
        block_to_tools[mf.ItemType.Snow] = "shovels";
        block_to_tools[mf.ItemType.Grass] = "shovels";
        block_to_tools[mf.ItemType.Gravel] = "shovels";
        block_to_tools[mf.ItemType.Stone] = "pickaxes";
        block_to_tools[mf.ItemType.Cobblestone] = "pickaxes";
        block_to_tools[mf.ItemType.SnowBlock] = "shovels";
        block_to_tools[mf.ItemType.CoalOre] = "pickaxes";

    function toolsForBlock(block_type) {
        return items.tools[block_to_tools[block_type]];
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
        if (flatten_types.indexOf(block_type) === -1) {
            block_positions.removeAt(block_index);
            mine_blocks();
            return;
        }
        var tools = toolsForBlock(block_type);

        if (tools !== undefined) {
            var slot = inventory.itemsSlot(tools);
            if (slot !== undefined) {
                inventory.equipItem(inventory.inventoryItem(slot).type, start_punch);
                return;
            }
            if (has_pick && tools === items.tools.pickaxes) {
                respond("I don't have any pickaxes!  I'm going to skip over any blocks that require a pickaxe for material.");
                has_pick = false;
                block_index++;
                mine_blocks();
                return;
            } else if (has_shovel && tools === items.tools.shovels) {
                respond("I don't have any shovels!");
                has_shovel = false;
            }
        }
        //equip non-tool
        for (var i = 0; i < inventory.InventoryFull.slotCount; i++) {
            var flag = false;
            for (var key in items.tools) {
                if (items.tools[key].indexOf(inventory.inventoryItem(i, inventory.InventoryFull).type) !== -1) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                continue;
            }
            inventory.equipItem(inventory.inventoryItem(i, inventory.InventoryFull).type, start_punch);
            return;
        }
        // no non-tools
        start_punch();
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
            running = true;
            navigator.navigateTo(player.position, {
                end_radius: 16,
                timeout_milliseconds: 1000 * 10,
                arrived_func: start_mining,
                path_found_func: function() {
                    responder_fun("Going to try and flatten");
                },
                cant_find_func: function() {
                    responder_fun("Sorry, I can't get to you!");
                    done();
                },
            });
        }, function stop() {
            running = false;
        }, function toString() {
            return "flatten (" + player_position.x + ", " + player_position.y + ") r=" + radius + " z=[" + min_height_level + " : " + block_positions[0].z + "]";
        })
    );
}, 0, 2);
