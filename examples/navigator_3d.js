mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

var navigator_3d = function() {
    var _public = {};
    _public.enabled = true;
    chat_commands.registerModule("navigator_3d", _public);
    function navhere(username, args) {
        if (!_public.enabled) {
            return;
        }
        var entity = player_tracker.entityForPlayer(username);
        if (entity === undefined) {
            respond("sorry, can't see you");
            return;
        }
        function make_responder(message) {
            return function() {
                respond(message);
            };
        }
        var end = entity.position.floored();
        var end_radius = undefined;
        if (!mf.isPhysical(mf.blockAt(end.offset(0, 0, -1)).type)) {
            // player is jumping or hanging over an edge. settle for a destination near by
            end_radius = 1.5;
        }
        respond("looking for a path from " + mf.self().position.floored() + " to " + end + "...");
        navigator.navigateTo(entity.position, {
            "end_radius": end_radius,
            "timeout_milliseconds": 10000,
            "cant_find_func": make_responder("can't find a path"),
            "path_found_func": function(path) {
                respond("i can get there in " + path.length + " moves");
            },
            "arrived_func": make_responder("i have arrived"),
        });
    }
    chat_commands.registerCommand("navhere", navhere);
    function stop() {
        navigator.stop();
    }
    chat_commands.registerCommand("stop", stop);
    function respond(message) {
        mf.debug(message);
        mf.chat(message);
    }

    return _public;
}();

