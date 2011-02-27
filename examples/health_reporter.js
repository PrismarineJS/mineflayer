
chat_commands.registerCommand("health", function(username, args, responder_func) {
    responder_func("health is " + mf.health() + "/20");
});
