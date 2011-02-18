
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("navigator.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

var path_finder_3d;
if (path_finder_3d === undefined) {
    path_finder_3d = function() {
        var _public = {};
        _public.enabled = true;
        chat_commands.registerModule("path_finder_3d", _public);
        function navhere(username, args) {
            if (!_public.enabled) {
                return;
            }
            var entity = player_tracker.entityForPlayer(username);
            if (entity === undefined) {
                respond("sorry, can't see you");
                return;
            }
            navigator.navigateTo(entity.position, function() {
                respond("i have arrived");
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

