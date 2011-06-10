mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("chat_commands.js");

(function() {
    var current_following_interval_id;
    var current_task = undefined;
    function follow(speaker, args, responder_func) {
        stop();
        var playerName = args[0];
        if (playerName !== undefined) {
            if (playerName === "me") {
                playerName = speaker;
            }
            args.shift();
        } else {
            playerName = speaker;
        }
        var distance = parseInt(args.shift());
        if (isNaN(distance)) {
            distance = 3;
        }
        var player = player_tracker.findUserEntityUnambiguously(playerName, speaker, responder_func);
        if (player === undefined) {
            return;
        }
        if (current_task !== undefined) {
            task_manager.remove(current_task);
        }
        current_task = new task_manager.Task(function start() {
            responder_func("I'm now following " + player.username + ".");
            go();
        }, function pause() {
            stop();
        }, function toString() {
            return "follow " + player.username + " r=" + distance;
        }, function resume() {
            stop();
            go();
        });

        function go() {
            stop();
            var entity = mf.entity(player.entity_id);
            if (entity === undefined) {
                responder_func("can't see you anymore");
                task_manager.done();
                current_task = undefined;
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
                    task_manager.postpone(100);
                },
                cant_navto_func: function() {
                    task_manager.postpone(2000);
                },                    
            });
            // recalculate path every 5 seconds even if don't make it in that long
            current_following_interval_id = mf.setInterval(go, 5 * 1000);
        }
        task_manager.doLater(current_task);

    };
    chat_commands.registerCommand("follow", follow, 0, 2);

    function stalk(speaker, args, responder_func) {
        // same as follow, but with a long distance
        args.push("12");
        follow(speaker, args, responder_func);
    }
    chat_commands.registerCommand("stalk", stalk, 1);

    function stop() {
        if (current_following_interval_id !== undefined) {
            mf.clearInterval(current_following_interval_id);
        }
    }
    chat_commands.registerCommand("stop", stop);
})();
