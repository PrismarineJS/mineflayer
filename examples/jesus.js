
mf.include("chat_commands.js");
chat_commands.registerCommand("jesusmode", function(speaker, args, responder_func) {
    var value = args[0] === "on";
    mf.hax.setJesusModeEnabled(value);
    responder_func("jesus mode is now " + (value ? "ON" : "OFF"));
}, 1);

