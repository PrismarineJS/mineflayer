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
        var item = items.findBlockTypeUnambiguously(itemName,responder_func);
        if (item === undefined) {
            return;
        }
        var type = item.id;
        responder_func("Trying to find " + items.nameForId(type) + " closest to " + username + "...");
        var player_position = player.position;
        var coordinates = block_finder.findNearest(player_position,type).shift();
        if (coordinates === undefined) {
            responder_func("I couldn't find any " + itemName + ".");
            return;
        }

        var relativeCoordinates = coordinates.minus(player_position);

        northSouth = relativeCoordinates.x > 0 ? "South" : "North";
        upDown = relativeCoordinates.y > 0 ? "Up" : "Down";
        eastWest = relativeCoordinates.z > 0 ? "West" : "East";

        responder_func("I found some " + items.nameForId(type) + "! Go " + northSouth + " " + Math.abs(relativeCoordinates.x) + " blocks, " + upDown + " " + Math.abs(relativeCoordinates.y) + " blocks, and " + eastWest + " " + Math.abs(relativeCoordinates.z) + " blocks."); 
        mf.lookAt(coordinates);
    }
    chat_commands.registerCommand("find", find, 1, Infinity);
})();

