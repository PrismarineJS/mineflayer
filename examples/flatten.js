mf.include("chat_commands.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("block_finder.js");
mf.include("inventory.js");

(function() {
    var min_height_level = undefined;
    var max_height_level = undefined;
    var player_position = undefined;
    var respond = undefined;
    var dirt_position = undefined;
    var radius = undefined;
    var has_pick = undefined;
    var find_dirt = function() {
        if (radius === undefined) {
            radius = 8;
        }
        var dirt_position = block_finder.findHighest(player_position,{
            radius: radius,
            block_type: function(block_type) {
                return (block_type === mf.ItemType.Sand || block_type === mf.ItemType.Grass || block_type === mf.ItemType.Dirt || block_type === mf.ItemType.Gravel);},
            bottom_threshold: min_height_level,
            top_threshold: max_height_level
        });
        if (dirt_position.length === 0) {
                return undefined;
        } else {
            return dirt_position.shift();
        }
    };

    var find_stone = function() {
        if (radius === undefined) {
            radius = 8;
        }
        var dirt_position = block_finder.findHighest(player_position,{
            radius: radius,
            block_type: function(block_type) {
                return (block_type === mf.ItemType.Sand || block_type === mf.ItemType.Grass || block_type === mf.ItemType.Dirt || block_type === mf.ItemType.Gravel || block_type === mf.ItemType.Stone);},
            bottom_threshold: min_height_level,
            top_threshold: max_height_level
        });
        if (dirt_position.length === 0) {
                return undefined;
        } else {
            return dirt_position.shift();
        }
    };

    var punch_dirt = function() {
        if (dirt_position === undefined) {
            stop();
            return;
        }
        mf.startDigging(dirt_position);
    };
    
    var stop = function() {
        dirt_position = undefined;
        min_height_level = undefined;
        max_height_level = undefined;
        player_position = undefined;
        radius = undefined;
    };
    
    var no_path_found = function() {
        respond("Sorry, I can't find a path to the highest piece of dirt.");
        stop();
    };

    var start_punch = function() {
        navigator.navigateTo(dirt_position,{
            end_radius: 3,
            timeout_milliseconds: 1000 * 5,
            arrived_func: punch_dirt,
            cant_find_func: no_path_found,
        });
    };

    var mine_dirt = function() {
        dirt_position = find_stone();
        if (dirt_position === undefined) {
            respond("I can't find anything else to flatten!");
            stop();
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
                    stop();
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

    mf.onStoppedDigging(mine_dirt);
    var start_mining = function() {
        dirt_position = find_stone();
        if (dirt_position === undefined) {
            respond("I don't see anything to flatten!");
            stop();
            return;
        } else {
            max_height_level = dirt_position.z;
            respond("Going to go flatten.");
        }
        mine_dirt();
        
    };
    
    chat_commands.registerCommand("flatten",function(speaker,args,responder_fun) {
        var player = player_tracker.entityForPlayer(speaker);
        if (player === undefined) {
            responder_fun("I can't see you, " + speaker + ".");
            return;
        }
        if (args.length === 1) {
            var arg = args.shift();
            if (isNaN(arg)) {
                responder_fun("I don't understand " + arg + ".");
                return;
            } else {
                radius = arg;
            }
        } else {
            radius = undefined;
        }
        player_position = player.position;
        respond = responder_fun;
        min_height_level = player.position.z;
        if (inventory.itemSlot(mf.ItemType.WoodenPickaxe) !== undefined || inventory.itemSlot(mf.ItemType.StonePickaxe) !== undefined || inventory.itemSlot(mf.ItemType.IronPickaxe) !== undefined || inventory.itemSlot(mf.ItemType.DiamondPickaxe) !== undefined) {
            has_pick = true;
        } else {
            has_pick = false;
        }
        
        navigator.navigateTo(player.position,{
            end_radius: 16,
            timeout_milliseconds: 1000 * 10,
            arrived_func: start_mining,
            cant_find_func: function() {
                responder_fun("Sorry, I can't get to you!");
            }
        });
    },0,1);

    chat_commands.registerCommand("stop",stop,0,0);
})();
