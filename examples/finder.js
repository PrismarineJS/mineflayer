mf.include("player_tracker.js");
mf.include("chat_commands.js");
mf.include("items.js");
mf.include("block_finder.js");

(function() {
    function find(username, args, responder_func) {
        var player = player_tracker.entityForPlayer(username);
        if (player === undefined) {
            responder_func("I couldn't even find YOU, " + username + "!");
            return;
        }
        var itemName = args.join(" ");
        var item = items.findBlockTypeUnambiguously(itemName);
        if (item === undefined) {
            return;
        }
        var itemType = item.id;
        typeIndex = -1;
        if (itemType.length === 1) {
            typeIndex = 0;
        } else {
            for (var i = 0; i < itemType.length; i++) {
                if (itemType[i].name.toLowerCase() === itemName.toLowerCase()) {
                    typeIndex = i;
                    break;
                }
            }
        }
        if (typeIndex !== -1) {
            type = itemType[typeIndex].id
            if (type === -1) {
                responder_func("I don't understand '" + itemName + "'");
                return false;
            }
            responder_func("Trying to find " + items.nameForId(type) + " closest to " + username + "...");
            var position = player.position;
            var coordinates = block_finder.findNearest(position,type).shift();
            if (coordinates === undefined) {
                responder_func("I couldn't find any " + itemName + ".");
                return;
            }
            
            var relativeCoordinates = coordinates.minus(position);
            
            eastWest = relativeCoordinates.x < 0 ? "West" : "East";
            northSouth = relativeCoordinates.y < 0 ? "South" : "North";
            upDown = relativeCoordinates.z < 0 ? "Down" : "Up";
            
            responder_func("I found some " + items.nameForId(type) + "! Go " + eastWest + " " + Math.abs(relativeCoordinates.x) + " blocks, " + northSouth + " " + Math.abs(relativeCoordinates.y) + " blocks, and " + upDown + " " + Math.abs(relativeCoordinates.z) + " blocks."); 
            return coordinates;
        } else {
            var matchingItemTypeList = itemType;
            responder_func("The block '" + itemName + "' is ambiguous.");
            var matchingTypes = [];
            for (var i = 0; i < matchingItemTypeList.length; i++) {
                matchingTypes.push(matchingItemTypeList[i].name);
            }
            responder_func("Did you mean any of these?: " + matchingTypes.join(", "));
            return false;
        }
    }
    chat_commands.registerCommand("find", find, 1, Infinity);
})();

