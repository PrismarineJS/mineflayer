mf.include("player_tracker.js");
mf.include("chat_commands.js");
mf.include("items.js");
mf.include("block_finder.js");

var finder = function() {
    var _public = {};
    _public.enabled = true;
    _public.debug = true;
    chat_commands.registerModule("finder",_public);

    function debug(message) {
        if (_public.debug) {
            mf.debug(message);
        }
    }
    function respond(message) {
        debug(message);
        mf.chat(message);
    }
    
    function find(username,args) {
        if (! _public.enabled) {
            return;
        }
        var player = player_tracker.entityForPlayer(username);
        if (player == undefined) {
            respond("I couldn't even find YOU, " + username + "!");
            return;
        }
        var itemName = args.join(" ");
        var itemType = items.lookupItemType(itemName);
        if (itemType.length == 0) {
            respond("The block '" + itemName + "' is ambiguous.");
            return;
        }
        typeIndex = -1;
        if (itemType.length == 1) {
            typeIndex = 0;
        } else {
            for (var i = 0; i < itemType.length; i++) {
                if (itemType[i].name.toLowerCase() == itemName.toLowerCase()) {
                    typeIndex = i;
                    break;
                }
            }
        }
        if (typeIndex != -1) {
            type = itemType[typeIndex].id
            if (type === -1) {
                respond("I don't understand '" + itemName + "'");
                return false;
            }
            respond("Trying to find " + items.nameForId(type) + " closest to " + username + "...");
            var position = player.position;
            var coordinates = block_finder.findNearest(position,type).shift();
            if (coordinates === undefined) {
                respond("I couldn't find any " + itemName + ".");
                return;
            }
            
            var relativeCoordinates = coordinates.minus(position);
            
            eastWest = relativeCoordinates.x < 0 ? "West" : "East";
            northSouth = relativeCoordinates.y < 0 ? "South" : "North";
            upDown = relativeCoordinates.z < 0 ? "Down" : "Up";
            
            respond("I found some " + items.nameForId(type) + "! Go " + eastWest + " " + Math.abs(relativeCoordinates.x) + " blocks, " + northSouth + " " + Math.abs(relativeCoordinates.y) + " blocks, and " + upDown + " " + Math.abs(relativeCoordinates.z) + " blocks."); 
            return coordinates;
        } else {
            var matchingItemTypeList = itemType;
            respond("The block '" + itemName + "' is ambiguous.");
            var matchingTypes = [];
            for (var i = 0; i < matchingItemTypeList.length; i++) {
                matchingTypes.push(matchingItemTypeList[i].name);
            }
            respond("Did you mean any of these?: " + matchingTypes.join(", "));
            return false;
        }
    }
    chat_commands.registerCommand("find",find, 1, Infinity);
    return _public;
}();
