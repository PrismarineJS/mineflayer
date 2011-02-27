mf.include("assert.js");
mf.include("strings.js");
mf.include("Set.js");
mf.include("player_tracker.js");

var chat_commands = {};
(function() {
    /**
     * Use this to register a command that runs in response to a chat message.
     * Commands are identified by the first spoken word, and the rest of the message
     * is split on " " and becomes the args array (like shell commands).
     *
     *
     * Example 1:
     *
     * chat_commands.registerCommand("hello", function(speaker, args, responder_func) {
     *     responder_func("hi!");
     * });
     *
     * Conversation will look like this:
     * <Player1> hello
     * <mineflayer> hi!
     *
     *
     * Example 2:
     *
     * function echo(speaker, args, responder_func) {
     *     responder_func(args.join(" "));
     * }
     * chat_commands.registerCommand("echo", echo, 1, Infinity);
     *
     * Conversation will look like this:
     * <Player1> echo hello
     * <mineflayer> hello
     * <Player1> echo a b c d
     * <mineflayer> a b c d
     * <Player1> mineflayer, echo hello
     * <mineflayer> Player1, hello
     * Player1 whispers echo this is whispering
     * minflayer whispers this is whispering
     *
     *
     * @param command_name {String} The first word of the command. Must be a single word.
     * @param callback {Function} Callback for the command: function(speaker, args, responder_func) {...}
     *     speaker - the name of the user who gave the chat command
     *     args - array of arguments (even if you're only expecting 1)
     *     responder_func(message) - call this function to respond in the same fassion
     *                               the user used to invoke the command. Will whisper
     *                               if whispered to, etc.
     * @param min_arg_count {Number} Defaults to 0.
     * @param max_arg_count {Number} Defaults to min_arg_count.
     */
    chat_commands.registerCommand = function(command_name, callback, min_arg_count, max_arg_count) {
        assert.isString(command_name);
        assert.isFunction(callback);
        if (min_arg_count === undefined) {
            min_arg_count = 0;
        }
        assert.isNumber(min_arg_count);
        if (max_arg_count === undefined) {
            max_arg_count = min_arg_count;
        }
        assert.isNumber(max_arg_count);

        var entry = {};
        entry.command_name = command_name;
        entry.callback = callback;
        entry.min_arg_count = min_arg_count;
        entry.max_arg_count = max_arg_count;
        var entries = commands_by_name[command_name];
        if (entries === undefined) {
            entries = [];
            commands_by_name[command_name] = entries;
        }
        entries.push(entry);
    };

    var masters;
    (function() {
        var args = mf.args();
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var master_arg_prefix = "--master=";
            if (arg.startsWith(master_arg_prefix)) {
                var new_masters = arg.substr(master_arg_prefix.length).split(",");
                if (masters === undefined) {
                    masters = new Set();
                }
                for (var j = 0; j < new_masters.length; j++) {
                    var new_master = new_masters[j];
                    if (new_master !== "") {
                        masters.add(new_master);
                    }
                }
            }
        }
    })();
    var commands_by_name = {};

    mf.onChat(function(speaker, message) {
        handle_chat(speaker, message, false);
    });
    mf.onNonSpokenChat(function(message) {
        var matches = /(\S+) whispers (.*)/.exec(message);
        if (matches === null) {
            return;
        }
        handle_chat(matches[1], matches[2], true);
    });
    function handle_chat(speaker, message, whispered) {
        if (masters !== undefined) {
            if (!masters.contains(speaker)) {
                return;
            }
        }
        var parts = message.toLowerCase().trim().split(" ");
        if (parts.length === 0) {
            return;
        }
        var responder_prefix = "";
        if (parts[0].endsWith(",")) {
            var maybe_my_name = parts[0].substr(0, parts[0].length - 1);
            var search_results = player_tracker.findUsername(maybe_my_name);
            if (search_results.length !== 1 || search_results[0] !== mf.self().username) {
                // not talking to me
                return;
            }
            // talking to me specifically
            responder_prefix = speaker + ", ";
            parts.shift();
        }
        var command_name = parts.shift();
        var entries = commands_by_name[command_name];
        if (entries === undefined) {
            return;
        }
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (!(entry.min_arg_count <= parts.length && parts.length <= entry.max_arg_count)) {
                // ignore wrong usage
                return;
            }
            var responder_func;
            if (whispered) {
                responder_func = function(message) {
                    mf.chat("/tell " + speaker + " " + message);
                };
            } else {
                responder_func = function(message) {
                    mf.chat(responder_prefix + message);
                };
            }
            entry.callback(speaker, parts, responder_func);
        }
    }
    // notify any masters when they join
    mf.onEntitySpawned(function(entity) {
        if (masters !== undefined && masters.contains(entity.username)) {
            mf.chat("/tell " + entity.username + " you are my master");
        }
    });
})();

