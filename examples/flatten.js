mf.include("chat_commands.js");
mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("block_finder.js");

(function() {
    var height_level = undefined;
    var player_position = undefined;
    var respond = undefined;
    var dirt_position = undefined;
    var find_dirt = function(position,radius, min_height) {
        if (radius === undefined) {
            radius = 32;
        }
        var dirt_position = block_finder.findHighest(position,{
            radius: radius,
            block_type: function(block_type) {
                return (block_type === mf.ItemType.Sand || block_type === mf.ItemType.Grass || block_type === mf.ItemType.Dirt || block_type === mf.ItemType.Gravel);},
            bottom_threshold: min_height
        });
        if (dirt_position.length === 0) {

            dirt_position = block_finder.findHighest(position,{
                radius: radius,
                block_type: mf.ItemType.Dirt,
                bottom_threshold: min_height
            });
            if (dirt_position.length === 0) {
                return undefined;
            } else {
                return dirt_position.shift();
            }
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
        height_level = undefined;
        player_position = undefined;
    };
    
    var no_path_found = function() {
        respond("Sorry, I can't find a path to the highest piece of dirt.");
        stop();
    };

    var mine_dirt = function() {
        dirt_position = find_dirt(player_position, 8, height_level);
        if (dirt_position === undefined) {
            respond("I can't find any dirt above your height!");
            height_level = undefined;
            player_position = undefined;
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
    
    chat_commands.registerCommand("flatten",function(speaker,args,responder_fun) {
        var player = player_tracker.entityForPlayer(speaker);
        if (player === undefined) {
            responder_fun("I can't see you, " + speaker + ".");
            return;
        }
        player_position = player.position;
        respond = responder_fun;
        height_level = player.position.z;
        navigator.navigateTo(player.position,{
            end_radius: 16,
            timeout_milliseconds: 1000 * 10,
            arrived_func: mine_dirt,
            cant_find_func: function() {
                responder_fun("Sorry, I can't get to you!");
            }
        });
    },0,0);

    chat_commands.registerCommand("stop",stop,0,0);
})();
