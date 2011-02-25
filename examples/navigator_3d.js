mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

var navigator_3d = {};
(function() {
    chat_commands.registerCommand("navhere", function navhere(username, args, responder_func) {
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
        responder_func("looking for a path from " + mf.self().position.floored() + " to " + end + "...");
        navigator.navigateTo(entity.position, {
            "end_radius": end_radius,
            "timeout_milliseconds": 10 * 1000,
            "cant_find_func": function() {
                responder_func("can't find a path");
            },
            "path_found_func": function(path) {
                responder_func("i can get there in " + path.length + " moves");
            },
            "arrived_func": function() {
                responder_func("i have arrived");
            },
        });
    });

    chat_commands.registerCommand("stop", navigator.stop);
})();

