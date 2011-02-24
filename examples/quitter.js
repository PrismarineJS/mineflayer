mf.include("chat_commands.js");

var quitter = function() {
    var _public = {};
    _public.enabled = true;
    chat_commands.registerModule("quitter", _public);
    function quit(username, args) {
        if (_public.enabled) {
            mf.exit();
        }
    }
    chat_commands.registerCommand("quit", quit);
    return _public;
}();
