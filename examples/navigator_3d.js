mf.include("chat_commands.js");
mf.include("location_manager.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

(function() {
    // navhere
    chat_commands.registerCommand("navhere", function(username, args, responder_func) {
        var entity = player_tracker.entityForPlayer(username);
        if (entity === undefined) {
            responder_func("sorry, can't see you. use F3 and say \"goto (x, y, z)\"");
            return;
        }
        var end = entity.position.floored();
        var end_radius = undefined;
        if (!mf.isPhysical(mf.blockAt(end.offset(0, 0, -1)).type)) {
            // player is jumping or hanging over an edge. settle for a destination near by
            end_radius = 1.5;
        }
        goToPoint(end, end_radius, responder_func);
    });

    chat_commands.registerCommand("goto", function(username, args, responder_func) {
        var end_radius;
        if (args.length >= 2) {
            var end_radius = parseInt(args[args.length - 1]);
            if (!isNaN(end_radius)) {
                args.pop();
            } else {
                end_radius = undefined;
            }
        }
        var name = args.join(" ");
        var location = location_manager.findUnambiguousLocation(name, responder_func);
        if (location === undefined) {
            return;
        }
        if (location.name === "[literal]") {
            end_radius = 3;
        }
        goToPoint(location.point, end_radius, responder_func);
    }, 1, Infinity);

    var current_checker_interval_id;
    function goToPoint(end, end_radius, responder_func) {
        stopChecking();
        responder_func("looking for a path from " + mf.self().position.floored() + " to " + end + "...");
        function startMonitor() {
            var previous_position;
            current_checker_interval_id = mf.setInterval(function() {
                if (current_checker_interval_id === undefined) {
                    // race conditions
                    return;
                }
                var current_position = mf.self().position;
                if (previous_position !== undefined && current_position.distanceTo(previous_position) < 1) {
                    // i'm stuck
                    stopChecking();
                    goToPoint(end, end_radius, responder_func);
                    return;
                }
                previous_position = current_position;
            }, 3 * 1000);
        }
        navigator.navigateTo(end, {
            "end_radius": end_radius,
            "timeout_milliseconds": 10 * 1000,
            "cant_find_func": function() {
                responder_func("can't find a path");
            },
            "path_part_found_func": function(path) {
                responder_func("k, i'm going to go " + path.length + " moves for now");
            },
            "path_found_func": function(path) {
                responder_func("i can get there in " + path.length + " moves");
            },
            "arrived_func": function() {
                responder_func("i have arrived");
                stopChecking();
            },
        });
    }

    function stopChecking() {
        if (current_checker_interval_id === undefined) {
            // race conditions
            return;
        }
        mf.clearInterval(current_checker_interval_id);
        current_checker_interval_id = undefined;
    }

    // stop
    chat_commands.registerCommand("stop", function() {
        navigator.stop();
        stopChecking();
    });
})();

