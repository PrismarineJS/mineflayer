
mf.include("chat_commands.js");

var quitter;
if (quitter === undefined) {
    quitter = function() {
        var _public = {};
        _public.enabled = true;
        _public.debug = true;
        chat_commands.registerModule("quitter", _public);
        function quit(username, args) {
            if (_public.enabled) {
                if (_public.debug) {
                    mf.debug("quitting");
                }
                mf.exit();
            }
        }
        chat_commands.registerCommand("quit", quit);
        return _public;
    }();
}

