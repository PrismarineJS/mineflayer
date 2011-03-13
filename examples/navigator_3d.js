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
        if (!(mf.isPhysical(mf.blockAt(end.offset(0, 0, -1)).type) &&
              mf.isSafe(mf.blockAt(end).type) &&
              mf.isSafe(mf.blockAt(end.offset(0, 0, 1)).type))) {
            // player is hanging over an edge or standing in a partial block. settle for a destination near by
            end_radius = 1.5;
        }
        goToPoint(end, end_radius, responder_func);
    });

    function _goto(username, args, responder_func, wait_for_username) {
        var end_radius;
        if (args.length >= 2) {
            var end_radius_string_maybe = args[args.length - 1];
            if (!end_radius_string_maybe.endsWith(")")) {
                var end_radius = parseInt(end_radius_string_maybe);
                if (!isNaN(end_radius)) {
                    args.pop();
                } else {
                    end_radius = undefined;
                }
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
        goToPoint(location.point, end_radius, responder_func, wait_for_username);
    }
    chat_commands.registerCommand("goto", _goto, 1, Infinity);

    chat_commands.registerCommand("lead", function(speaker, args, responder_func) {
        var wait_for_username = player_tracker.findUsernameUnambiguously(args.shift(), speaker, responder_func);
        if (wait_for_username === undefined) {
            return;
        }
        if (args[0] === "to") {
            args.shift();
            if (args.length === 0) {
                return;
            }
        }
        _goto(speaker, args, responder_func, wait_for_username);
    }, 2, Infinity);

    var current_checker_interval_id;
    function goToPoint(end, end_radius, responder_func, wait_for_username) {
        stopChecking();
        responder_func("looking for a path from " + mf.self().position.toNotch().floored() + " to " + end.toNotch().floored() + "...");
        function startMonitor() {
            if (current_checker_interval_id !== undefined) {
                // already started
                return;
            }
            var previous_position;
            current_checker_interval_id = mf.setInterval(function() {
                if (current_checker_interval_id === undefined) {
                    // race conditions
                    return;
                }
                var current_position = mf.self().position;
                if (previous_position !== undefined && current_position.distanceTo(previous_position) < 3) {
                    // i'm stuck
                    stopChecking();
                    goToPoint(end, end_radius, responder_func, wait_for_username);
                    return;
                }
                previous_position = current_position;

                // wait for someone maybe
                if (wait_for_username === undefined) {
                    return;
                }
                var entity = player_tracker.entityForPlayer(wait_for_username);
                if (entity === undefined) {
                    responder_func("can't see " + wait_for_username + " so i'm going on with them");
                    wait_for_username = undefined;
                    return;
                }
                if (entity.position.distanceTo(current_position) > 20) {
                    responder_func("waiting for " + wait_for_username + " to catch up");
                    navigator.stop();
                    stopChecking();
                    var resume_interval_id = mf.setInterval(function() {
                        var entity = player_tracker.entityForPlayer(wait_for_username);
                        var resume = false;
                        if (entity === undefined) {
                            responder_func("can't see " + wait_for_username + " so i'm going on with them");
                            wait_for_username = undefined;
                            resume = true;
                        } else if (entity.position.distanceTo(mf.self().position) < 10) {
                            // resume
                            resume = true;
                        }
                        if (resume) {
                            mf.clearInterval(resume_interval_id);
                            goToPoint(end, end_radius, responder_func, wait_for_username);
                        }
                    }, 1000);
                }

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
                startMonitor();
            },
            "path_found_func": function(path) {
                responder_func("i can get there in " + path.length + " moves");
                startMonitor();
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

