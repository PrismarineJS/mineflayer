mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("chat_commands.js");

(function() {
    var followee = undefined;
    var following = false;
    var last_responder_func;
    
    function follow(username, args, responder_func) {
        var playerName = args[0];
        if (playerName === undefined || playerName === "me") {
            playerName = username;
        }
        var player = player_tracker.entityForPlayer(player_tracker.findUsername(playerName));
        if (player === undefined) {
            responder_func("I don't know who " + playerName + " is, or where they are.");
            return;
        }
        followee = player;
        last_responder_func = responder_func;
        responder_func("I'm now following " + followee.username + ".");
    };
    chat_commands.registerCommand("follow", follow, 0, 1);
    mf.onEntityMoved(function(entity) {
        if (followee !== undefined && !following) {
            if (entity.entity_id === followee.entity_id) {
                following = true;
                navigator.navigateTo(entity.position, {
                    timeout_milliseconds: 3000,
                    end_radius: 12,
                    cant_find_func: function() {
                        last_responder_func("Can't get to " + entity.username + "!  I'm gonna stop following!");
                        followee = undefined;
                        following = false;
                    },
                    arrived_func: function() {
                        following = false;
                    },
                });
            }
        }
    });
})();
