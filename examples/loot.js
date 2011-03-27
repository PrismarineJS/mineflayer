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
        respond("I WOULD be stealing from this chest if chest-looting was implemented!");
        reset();
    }
};

chat_commands.registerCommand("loot",function(speaker,args,responder_fun) {
    if (args.length > 0) {
        if (! isNaN(args[0])) {
            item_count = args.shift();
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
            mf.debug(typeof item_count);
            mf.debug(item_count);
            mf.debug(items.nameForId(item_type));
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
