mf.include("chat_commands.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("block_finder.js");

(function() {
    var min_height_level = undefined;
    var max_height_level = undefined;
    var player_position = undefined;
    var respond = undefined;
    var dirt_position = undefined;
    var radius = undefined;
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

    var mine_dirt = function() {
        dirt_position = find_dirt();
        if (dirt_position === undefined) {
            respond("I can't find anything else to flatten!");
            stop();
            return;
        }
        navigator.navigateTo(dirt_position,{
            end_radius: 3,
            timeout_milliseconds: 1000 * 5,
            arrived_func: punch_dirt,
            cant_find_func: no_path_found,
        });
        
    };

    mf.onStoppedDigging(mine_dirt);
    var start_mining = function() {
        dirt_position = find_dirt();
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
