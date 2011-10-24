
mf.include("chat_commands.js");

mf.onStdinLine(function(line) {
    if (line.startsWith("!")) {
        line = line.substr(1);
        chat_commands.talkToSelf(line, function(message) {
            mf.debug(message);
        });
        return;
    }
    mf.chat(line);
});

