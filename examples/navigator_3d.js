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
            responder_func("sorry, can't see you");
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
        var name = args[0];
        var location = location_manager.findUnambiguousLocation(name, responder_func);
        if (location === undefined) {
            return;
        }
        goToPoint(location.point, undefined, responder_func);
    }, 1);

    function goToPoint(end, end_radius, responder_func) {
        responder_func("looking for a path from " + mf.self().position.floored() + " to " + end + "...");
        var checker_interval_id;
        navigator.navigateTo(end, {
            "end_radius": end_radius,
            "timeout_milliseconds": 10 * 1000,
            "cant_find_func": function() {
                responder_func("can't find a path");
            },
            "path_found_func": function(path) {
                responder_func("i can get there in " + path.length + " moves");
                var previous_position;
                checker_interval_id = mf.setInterval(function() {
                    var current_position = mf.self().position;
                    if (previous_position !== undefined && current_position.distanceTo(previous_position) < 1) {
                        // i'm stuck
                        mf.clearInterval(checker_interval_id);
                        goToPoint(end, end_radius, responder_func);
                        return;
                    }
                    previous_position = current_position;
                }, 3 * 1000);
            },
            "arrived_func": function() {
                responder_func("i have arrived");
                mf.clearInterval(checker_interval_id);
            },
        });
    }

    // stop
    chat_commands.registerCommand("stop", navigator.stop);
})();

