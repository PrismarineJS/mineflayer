mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");

(function() {
    var whereAreYou = function(username,args,respond) {
        var position = mf.self().position.floored();
        if (args.length === 0) { 
            respond("I am at (" + position.x + ", " + position.y + ", " + position.z +").");
            return;
        }
    };

    var whereIs = function(username,args,respond) {
        var player = player_tracker.entityForPlayer(username);
        if (player === undefined) {
            respond("I can't see you, " + username);
            return;
        }
        var position = player.position.floored();
        if (position === undefined) {
            respond("I can't see you, " + username);
            return;
        }
        var matches = location_manager.searchLocations(args.join(" "));
        if (matches.length === 0) {
            respond("I couldn't find anything by the name of " + args.join(" "));
            return;
        } else if (matches.length > 1) {
            var names = [];
            for (var property in matches) {
                if (matches.hasOwnProperty(property)) {
                        names.push(matches[property].name);
                }
            }
            
            respond(args.join(" ") + " is ambiguous: " + names.join(", "));
            return;
        }
        var from = matches.shift();
        var from_pos = from.point === undefined ? from.position.floored() : from.point.floored();
        position = from_pos.minus(position).floored();
        var eastWest = position.x < 0 ? "West" : "East";
        var northSouth = position.y < 0 ? "South" : "North";
        var upDown = position.z < 0 ? "Down" : "Up";
        var name = from.username === undefined ? from.name : from.username;
        respond(name + " is " + Math.abs(position.x) + " blocks " + eastWest + ", " + Math.abs(position.y) + " blocks " + northSouth + ", and " + Math.abs(position.z) + " blocks " + upDown); 
    };

    chat_commands.registerCommand("whereareyou",whereAreYou,0,Infinity);
    chat_commands.registerCommand("whereis",whereIs,1,Infinity);
})();
