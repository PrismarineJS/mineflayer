mf.include("assert.js");
mf.include("strings.js");
mf.include("Set.js");
mf.include("player_tracker.js");

/**
 * Use this module to register commands that run in response to chat messages.
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
 * These command line parameters are recognized by this module:
 *
 * --master=USERNAME
 *  This identifies the user specified as a master.
 *  If there are any masters, only chat commands from masters will be honored.
 *  Multiple masters can be specified by --master="user1,user2" --master=user3.
 *
 * --oblivious
 *  This causes generally spoken commands to be ignored, but commands addressed
 *  specifically to us to be honored. Example:
 *  <Player1> echo hello
 *  not honored
 *  <Player1> mineflayer, echo hello
 *  <mineflayer> Player1, hello
 *  Player1 whispers echo hello
 *  mineflayer whispers hello
 *
 * --setup="command ..."
 *  This causes the command specified to be "run" once we log in. The
 *  responder_func for the commands whispers to each of the masters specified by
 *  --master (see above). If there are no masters, then the responder_func
 *  speaks openly. Example:
 *  --setup='echo Hello, World!'
 *
 */
var chat_commands = {};
(function() {
    /**
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

    /**
     * Runs text-based commands as if they were whispered from myself
     */
    chat_commands.talkToSelf = function(text, responder_func) {
        if (responder_func === undefined) {
            responder_func = function() {};
        }
        handle_chat(mf.self().username, text, true, responder_func);
    };

    var masters;
    var oblivious = false;
    var silent_mode = false;
    (function() {
        var setup_commands = [];
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
                continue;
            }
            if (arg === "--oblivious") {
                oblivious = true;
                continue;
            }
            var setup_arg_prefix = "--setup=";
            if (arg.startsWith(setup_arg_prefix)) {
                setup_commands.push(arg.substr(setup_arg_prefix.length));
                continue;
            }
        }
        if (masters !== undefined) {
            masters.add(mf.self().username);
        }
        mf.onSpawn(function handleSpawn() {
            mf.removeHandler(mf.onSpawn, handleSpawn);
            for (var i = 0; i < setup_commands.length; i++) {
                var command = setup_commands[i];
                if (masters === undefined) {
                    // tell everyone
                    handle_chat("", command, false);
                } else {
                    // tell masters
                    var responder_func = function(message) {
                        for (var master in masters.values) {
                            mf.chat("/tell " + master + " " + message);
                        }
                    };
                    chat_commands.talkToSelf(command, responder_func);
                }
            }
        });
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
    function handle_chat(speaker, message, whispered, responder_func) {
        if (masters !== undefined) {
            if (!masters.contains(speaker)) {
                return;
            }
        }
        var parts = message.trim().split(/\s+/);
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
        if (parts.length === 0) {
            return;
        }
        if (oblivious && (responder_prefix === "" && !whispered)) {
            // ignore global messages while in oblivious mode
            return;
        }
        // determine suffix
        var responder_suffix = "";
        var last_part = parts[parts.length - 1];
        while (last_part.endsWith("!")) {
            last_part = last_part.substr(0, last_part.length - 1);
            responder_suffix += "!";
        }
        parts[parts.length - 1] = last_part;
        // determine responder func
        if (responder_func === undefined) {
            if (whispered || silent_mode) {
                responder_func = function(message) {
                    mf.chat("/tell " + speaker + " " + message);
                };
            } else {
                responder_func = function(message) {
                    mf.chat(responder_prefix + message);
                };
            }
        }
        if (responder_suffix !== "") {
            var old_responder_func = responder_func;
            responder_func = function(message) {
                old_responder_func(message + responder_suffix);
            };
        }
        // invoke callbacks
        var parts_list = parts.join(" ").split(" && ").mapped(function(command) { return command.split(" "); });
        for (var i = 0; i < parts_list.length; i++) {
            parts = parts_list[i];
            var command_name = parts.shift();
            var entries = commands_by_name[command_name];
            if (entries === undefined) {
                continue;
            }
            for (var j = 0; j < entries.length; j++) {
                var entry = entries[j];
                if (!(entry.min_arg_count <= parts.length && parts.length <= entry.max_arg_count)) {
                    // ignore wrong usage
                    continue;
                }
                entry.callback(speaker, parts, responder_func);
            }
        }
    }
    // notify any masters when they join
    mf.onEntitySpawned(function(entity) {
        if (masters !== undefined && masters.contains(entity.username)) {
            mf.chat("/tell " + entity.username + " you are my master. say \"help\" for more info.");
        }
    });
    chat_commands.registerCommand("help", function(speaker_name, args, responder_func) {
        var command_names = [];
        for (var name in commands_by_name) {
            command_names.push(name);
        }
        command_names.sort();

        mf.chat("/tell " + speaker_name + " available commands: " + command_names.join(", "));
    }, 0, Infinity);
    chat_commands.registerCommand("silentmode", function(speaker, args, responder_fun) {
        if (args[0] === "on") {
            silent_mode = true;
            mf.chat("/tell " + speaker + " silent mode is now activated.");
        } else if (args[0] === "off") {
            silent_mode = false;
            responder_fun("silent mode is now deactivated.");
        }
    }, 1);
})();

