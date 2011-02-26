mf.include("chat_commands.js");
mf.include("player_tracker.js");

(function() {
    var whereAreYou = function(username,message,respond) {
        var position = mf.self().position.floored();
        
        var eastWest = position.x < 0 ? "West" : "East";
        var northSouth = position.y < 0 ? "South" : "North";
        var upDown = position.z < 0 ? "Down" : "Up";
        
        respond("I am " + Math.abs(position.x) + " blocks " + eastWest + ", " + Math.abs(position.y) + " blocks " + northSouth + ", and " + Math.abs(position.z) + " blocks " + upDown + "."); 
    };

    var whereIs = function(username,message,respond) {
        var player;
        if (message.length === 0 || message[0] === "me") {
            player = player_tracker.entityForPlayer(username);
        } else {
            var playerName = message.shift();
            var player = player_tracker.entityForPlayer(player_tracker.findUsername(playerName));
            if (player !== undefined) {
                var position = player.position.floored();
                respond(player.username + " is at (" + position.x + ", " + position.y + ", " + position.z +").");
            } else {
                respond("I can't see " + playerName);
            }
        }
    };

    chat_commands.registerCommand("whereareyou",whereAreYou,0,0);
    chat_commands.registerCommand("whereis",whereIs,0,1);
})();
