
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

var navigator_3d;
if (navigator_3d === undefined) {
    navigator_3d = function() {
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
            respond("looking for a path from " + mf.self().position.floored() + " to " + entity.position.floored() + "...");
            navigator.navigateTo(entity.position, {
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
}

