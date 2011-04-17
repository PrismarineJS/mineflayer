mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("block_finder.js");
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
    var has_pick = inventory.itemSlot(mf.ItemType.WoodenPickaxe) !== undefined || inventory.itemSlot(mf.ItemType.StonePickaxe) !== undefined || inventory.itemSlot(mf.ItemType.IronPickaxe) !== undefined || inventory.itemSlot(mf.ItemType.DiamondPickaxe) !== undefined;
    var running;
    var dirt_position;

    function find_dirt() {
        var dirt_position = block_finder.findHighest(player_position,{
            radius: radius,
            block_type: function(block_type) {
                return (block_type === mf.ItemType.Sand || block_type === mf.ItemType.Grass || block_type === mf.ItemType.Dirt || block_type === mf.ItemType.Gravel);
            },
            bottom_threshold: min_height_level,
            top_threshold: max_height_level
        });
        if (dirt_position.length === 0) {
            return undefined;
        } else {
            return dirt_position.shift();
        }
    }

    var find_stone = function() {
        var dirt_position = block_finder.findHighest(player_position,{
            radius: radius,
            block_type: function(block_type) {
                return (block_type === mf.ItemType.Sand || block_type === mf.ItemType.Grass || block_type === mf.ItemType.Dirt || block_type === mf.ItemType.Gravel || block_type === mf.ItemType.Stone);
                },
            bottom_threshold: min_height_level,
            top_threshold: max_height_level
        });
        if (dirt_position.length === 0) {
            return undefined;
        } else {
            return dirt_position.shift();
        }
    };

    function done() {
        running = false;
        task_manager.done();
    }

    function start_punch() {
        navigator.navigateTo(dirt_position, {
            end_radius: 3,
            timeout_milliseconds: 1000 * 5,
            arrived_func: function() {
                if (!running) {
                    // stopped
                    return;
                }
                mf.onStoppedDigging(function asdf() {
                    mf.removeHandler(mf.onStoppedDigging, asdf);
                    mine_dirt();
                });
                mf.startDigging(dirt_position);
            },
            cant_find_func: function() {
                respond("Sorry, I can't find a path to the highest piece of dirt.");
                done();
            },
        });
    }

    var mine_dirt = function() {
        dirt_position = find_stone();
        if (dirt_position === undefined) {
            respond("I can't find anything else to flatten!");
            done();
            return;
        }
        var dirt_type = mf.blockAt(dirt_position).type;
        if (dirt_type === mf.ItemType.Stone) {
            if (inventory.itemSlot(mf.ItemType.WoodenPickaxe) !== undefined) {
                inventory.equipItem(mf.ItemType.WoodenPickaxe, start_punch);
                return;
            } else if (inventory.itemSlot(mf.ItemType.StonePickaxe) !== undefined) {
                inventory.equipItem(mf.ItemType.StonePickaxe, start_punch);
                return;
            } else if (inventory.itemSlot(mf.ItemType.IronPickaxe) !== undefined) {
                inventory.equipItem(mf.ItemType.IronPickaxe, start_punch);
                return;
            } else if (inventory.itemSlot(mf.ItemType.DiamondPickaxe) !== undefined) {
                inventory.equipItem(mf.ItemType.DiamondPickaxe, start_punch);
                return;
            } else {
                if (has_pick) {
                    respond("My pickaxe is gone.  I'm going to just remove dirt/sand/gravel/grass now.");
                    has_pick = false;
                }
                dirt_position = find_dirt();
                if (dirt_position === undefined) {
                    respond("I don't see anything left to flatten.");
                    done();
                    return;
                }
            }
        }
        if (dirt_type === mf.ItemType.Dirt || dirt_type === mf.ItemType.Sand || dirt_type === mf.ItemType.Gravel || dirt_type === mf.ItemType.Grass) {
            if (inventory.itemSlot(mf.ItemType.WoodenShovel) !== undefined) {
                inventory.equipItem(mf.ItemType.WoodenShovel, start_punch);
            } else if (inventory.itemSlot(mf.ItemType.StoneShovel) !== undefined) {
                inventory.equipItem(mf.ItemType.StoneShovel, start_punch);
            } else if (inventory.itemSlot(mf.ItemType.IronShovel) !== undefined) {
                inventory.equipItem(mf.ItemType.IronShovel, start_punch);
            } else if (inventory.itemSlot(mf.ItemType.DiamondShovel) !== undefined) {
                inventory.equipItem(mf.ItemType.DiamondShovel, start_punch);
            } else {
                start_punch();
            }
            return;
        } 
    };

    var start_mining = function() {
        dirt_position = find_stone();
        if (dirt_position === undefined) {
            respond("I don't see anything to flatten!");
            done();
            return;
        } else {
            max_height_level = dirt_position.z;
        }
        mine_dirt();
    };
    task_manager.doLater(new task_manager.Task(function start() {
        running = true;
        navigator.navigateTo(player.position, {
            end_radius: 16,
            timeout_milliseconds: 1000 * 10,
            arrived_func: start_mining,
            path_found_func: function() {
                responder_fun("Going to go flatten");
            },
            cant_find_func: function() {
                responder_fun("Sorry, I can't get to you!");
            },
        });
    }, function stop() {
        running = false;
    }, "flatten " + player_position + " r=" + radius + " z=" + max_height_level));
}, 0, 2);
