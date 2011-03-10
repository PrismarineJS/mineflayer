mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");
mf.include("items.js");
mf.include("inventory.js");

var findChestNearestPoint = function(point) {
    chests = block_finder.findNearest(point,mf.ItemType.Chest, 128, 1);
    if (chests.length === 0) {
        return undefined;
    } else {
        return chests.shift();
    }
};

var dump_slots;
var chest_position;

var dump_func = function() {
    mf.chat("I would be dumping now, if dumping was implemented!");
};

var dump = function(username,args,respond) {
/*
    Parsing:
    case 1: Dump everything into nearest chest
        "dump" 
        "dump all/inventory/ * /everything"
    
    case 2: Dump everything into chest nearest entity(username)
        "dump here" 
        "dump all/inventory/ * /everything here"

    case 3: Dump everything into chest nearest location
        "dump into location"
        "dump all/inventory/ * /everything into location"

    case 4: Dump all items of type X into nearest chest
        "dump X"

    case 5: Dump all items of type X into chest nearest entity(username)
        "dump X here"

    case 6: Dump all items of type X into chest nearest location
        "dump X into location"

    case 7: Dump # items of type X into nearest chest
        "dump # X"

    case 8: Dump # items of type X into chest nearest entity(username)
        "dump # X here"

    case 9: Dump # items of type X into chest nearest location
        "dump # X into location"
*/
    var chest_position = findChestNearestPoint(mf.self().position);
    var location_type = 0;
    if (args.length !== 0 && args[args.length-1] === "here") {
        //set chest_position to position of username
        args.pop();
        var player = player_tracker.entityForPlayer(username);
        if (player === undefined) {
            respond("I don't know where you are, " + username + ".");
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
        chest_position = matching_location.point;
        chest_position = findChestNearestPoint(chest_position);
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
                respond("I couldn't find any chests anywhere.");
                return;
        }
    } else {
        chest_position = chest_position.floored();
        cant_navto_func = function() {
            respond("I can't reach that chest.");
        };
    }
    
    if (args.length === 0) {
        //dump everything into chest_position
        respond("Dumping everything into chest at (" + chest_position.x +", " + chest_position.y + ", " + chest_position.z + ").");
        navigator.navigateTo(chest_position,{
            end_radius : 4,
            cant_find_func : cant_navto_func,
            arrived_func : dump_func});
        return;
    }
    if (args.length === 1) {
        var arg = args[0];
        if (arg === "all" || arg === "inventory" || arg === "*" || arg === "everything") {
            args.shift();
            //dump everything into chest nearest mf.self()
            respond("Dumping everything into chest at (" + chest_position.x +", " + chest_position.y + ", " + chest_position.z + ").");
            navigator.navigateTo(chest_position,{
            end_radius : 4,
            cant_find_func : cant_navto_func,
            arrived_func : dump_func});
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
        respond("Dumping " + count + " " + items.nameForId(item_type) + " into chest at (" + chest_position.x +", " + chest_position.y + ", " + chest_position.z + ").");
        navigator.navigateTo(chest_position,{
            end_radius : 4,
            cant_find_func : cant_navto_func,
            arrived_func : dump_func});
    } else {
        respond("Dumping all " + items.nameForId(item_type) + " into chest at (" + chest_position.x +", " + chest_position.y + ", " + chest_position.z + ").");
        navigator.navigateTo(chest_position,{
            end_radius : 4,
            cant_find_func : cant_navto_func,
            arrived_func : dump_func});
    }
};
chat_commands.registerCommand("dump",dump,0,Infinity);
