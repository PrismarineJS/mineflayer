mf.include("chat_commands.js");

var die = function(username, message, respond) {
    respond("okay. :(");
    mf.chat("/kill");
};

chat_commands.registerCommand("die",die,0,0);
