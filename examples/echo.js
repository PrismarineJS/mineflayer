mf.include("chat_commands.js");

var echo = function(username,message,respond) {
    mf.chat(message.join(" "));
};
chat_commands.registerCommand("echo",echo,0,Infinity);
