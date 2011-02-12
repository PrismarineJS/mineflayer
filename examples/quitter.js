
mf.include("chat_commands.js");

var quitter;
if (quitter === undefined) {
    quitter = function() {
        var _public = {};
        _public.enabled = true;
        _public.debug = true;
        function quit() {
            if (_public.enabled) {
                if (_public.debug) {
                    mf.debug("quitting");
                }
                mf.exit();
            }
        }
        chat_commands.register("quit", quit, 0);
        return _public;
    }();
}

