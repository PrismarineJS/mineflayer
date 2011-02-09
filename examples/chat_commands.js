
mf.include("assert.js");

var chat_commands = function() {
    var _public = {};
    _public.enabled = true;
    _public.debug = true;
    _public.register = function(name, callback, min_arg_count, max_arg_count) {
        if (min_arg_count === undefined) {
            min_arg_count = 0;
        }
        if (max_arg_count === undefined) {
            max_arg_count = Infinity;
        }
        assert.isString(name);
        assert.isFunction(callback);
        assert.isNumber(min_arg_count);
        assert.isNumber(max_arg_count);
        var entry = {};
        entry.name = name;
        entry.callback = callback;
        entry.min_arg_count = min_arg_count;
        entry.max_arg_count = max_arg_count;
        commands_by_name[name] = entry;
    };

    var commands_by_name = {};
    mf.onChat(function(username, message) {
        mf.debug("handle chat");
        if (!_public.enabled) {
            return;
        }
        handle_chat(username, message);
    });
    function handle_chat(username, message) {
        var parts = message.toLowerCase().trim().split(" ");
        if (parts.length === 0) {
            return;
        }
        var name = parts.removeAt(0);
        var entry = commands_by_name[name];
        if (entry === undefined) {
            return;
        }
        if (!(entry.min_arg_count <= parts.length && parts.length <= entry.max_arg_count)) {
            // ignore wrong usage
            return;
        }
        entry.callback(username, parts);
    };

    return _public;
}();
