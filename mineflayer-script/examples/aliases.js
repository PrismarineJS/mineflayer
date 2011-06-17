
mf.include("chat_commands.js");

chat_commands.registerCommand("alias", function(speaker_name, args, responder_func) {
    var short_name = args.shift();
    var meaning = args;
    chat_commands.registerCommand(short_name, function(speaker_name, args, responder_func) {
        var full_command = meaning.concat(args).join(" ");
        chat_commands.talkToSelf(full_command, responder_func, speaker_name);
    }, 0, Infinity);
}, 2, Infinity);

