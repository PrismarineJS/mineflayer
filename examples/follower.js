mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("chat_commands.js");

(function() {
    var current_following_interval_id;
    function follow(username, args, responder_func) {
        stop();
        var playerName = args[0];
        if (playerName !== undefined) {
            if (playerName === "me") {
                playerName = username;
            }
            args.shift();
        } else {
            playerName = username;
        }
        var distance = parseInt(args.shift());
        if (isNaN(distance)) {
            distance = 12;
        }
        var player = player_tracker.entityForPlayer(player_tracker.findUsername(playerName));
        if (player === undefined) {
            responder_func("I don't know who " + playerName + " is, or where they are.");
            return;
        }
        responder_func("I'm now following " + player.username + ".");
        function go() {
            stop();
            var entity = mf.entity(player.entity_id);
            if (entity === undefined) {
                responder_func("can't see you anymore");
                return;
            }
            navigator.navigateTo(entity.position, {
                timeout_milliseconds: 3 * 1000,
                end_radius: distance,
                arrived_func: function() {
                    if (current_following_interval_id === undefined) {
                        // stopped
                        return;
                    }
                    stop();
                    go();
                },
            });
            // recalculate path every 5 seconds even if don't make it in that long
            current_following_interval_id = mf.setInterval(go, 5 * 1000);
        }
        go();
    };
    chat_commands.registerCommand("follow", follow, 0, 2);

    function stop() {
        if (current_following_interval_id !== undefined) {
            mf.clearInterval(current_following_interval_id);
        }
    }
    chat_commands.registerCommand("stop", stop);
})();
