mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("location_manager.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

(function() {
    chat_commands.registerCommand("stop", navigator.stop);
    // navhere
    chat_commands.registerCommand("navhere", function(username, args, responder_func) {
        var entity = player_tracker.entityForPlayer(username);
        if (entity === undefined) {
            responder_func("sorry, can't see you. use F3 and say \"goto (x, y, z)\"");
            return;
        }
        var end = entity.position.floored();
        var end_radius = undefined;
        if (!(mf.isPhysical(mf.blockAt(end.offset(0, -1, 0)).type) &&
              mf.isSafe(mf.blockAt(end).type) &&
              mf.isSafe(mf.blockAt(end.offset(0, 1, 0)).type))) {
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

    function goToPoint(end, end_radius, responder_func, wait_for_username) {
        stopChecking();
        var current_checker_interval_id;
        function startMonitor() {
            if (current_checker_interval_id !== undefined) {
                // already started
                return;
            }
            if (wait_for_username === undefined) {
                // noboday to wait for
                return;
            }
            var waiting = false;
            current_checker_interval_id = mf.setInterval(function() {
                // wait for someone maybe
                if (current_checker_interval_id === undefined) {
                    // race conditions
                    return;
                }
                var current_position = mf.self().position;
                var entity = player_tracker.entityForPlayer(wait_for_username);
                var resume = false;
                if (entity === undefined) {
                    responder_func("can't see " + wait_for_username + " so i'm going on with them");
                    stopChecking();
                    if (waiting) {
                        resume = true;
                    }
                } else if (waiting) {
                    if (entity.position.distanceTo(mf.self().position) < 10) {
                        // resume
                        resume = true;
                    }
                } else {
                    if (entity.position.distanceTo(current_position) > 20) {
                        responder_func("waiting for " + wait_for_username + " to catch up");
                        navigator.stop();
                        waiting = true;
                    }
                }
                if (resume) {
                    goToPoint(end, end_radius, responder_func, wait_for_username);
                    waiting = false;
                }
            }, 1000);
        }
        function stopChecking() {
            if (current_checker_interval_id === undefined) {
                // race conditions
                return;
            }
            mf.clearInterval(current_checker_interval_id);
            current_checker_interval_id = undefined;
        }
        var description;
        if (wait_for_username !== undefined) {
            description = "lead " + wait_for_username + " to ";
        } else {
            description = "goto ";
        }
        description += end;
        task_manager.doLater(new task_manager.Task(function start() {
            responder_func("looking for a path from " + mf.self().position.floored() + " to " + end.floored() + "...");
            navigator.navigateTo(end, {
                "end_radius": end_radius,
                "timeout_milliseconds": 10 * 1000,
                "cant_find_func": function() {
                    responder_func("can't find a path");
                    task_manager.done();
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
                    task_manager.done();
                },
            });
        }, function stop() {
            navigator.stop();
            stopChecking();
        }, description));
    }

})();

