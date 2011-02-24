mf.include("strings.js");
mf.include("player_tracker.js");
mf.include("chat_commands.js");
mf.include("items.js");
mf.include("block_finder.js");

function finder() {
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
        if (itemType.length == 1 || itemType[0].name.toLowerCase() == itemName.toLowerCase()) {
            type = itemType[0].id
            if (type === -1) {
                respond("I don't understand '" + itemName + "'");
                return false;
            }
            respond("Trying to find " + items.nameForId(type) + " closest to " + username + "...");
            var position = player.position;
            var coordinates = block_finder.findNearest(position,type).shift();
            if (coordinates === null) {
                respond("I couldn't find any " + itemName + ".");
                return;
            }
            var x = coordinates.x - position.x;
            var y = coordinates.y - position.y;
            var z = coordinates.z - position.z;
            eastWest = "East";
            northSouth = "North";
            upDown = "Up";
            if (x < 0) {
                eastWest = "West";
            }
            if (y < 0) {
                northSouth = "South";
            }
            if (z < 0) {
                upDown = "Down";
            }
            
            respond("I found some " + items.nameForId(type) + "! Go " + eastWest + " " + Math.abs(x) + " blocks, " + northSouth + " " + Math.abs(y) + " blocks, and " + upDown + " " + Math.abs(z) + " blocks."); 
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
}
finder();
