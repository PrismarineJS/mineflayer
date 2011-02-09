
mf.include("chat_commands.js");
mf.include("assert.js");

var teleporter = function() {
    var _public = {};
    _public.enabled = true;
    _public.debug = true;
    function zapto(username, args) {
        mf.debug("zapto handler");
        assert.isTrue(args.length === 1);
        mf.chat(username + ": " + args.join(" "));
    }
    chat_commands.register("zapto", zapto, 1, 1);
}();
