
mf.onChat(function(username, message) {
    mf.debug("Got chat message: " + message);
    mf.chat(message);
});

mf.onConnected(function() {
    mf.debug("Connected successfully.");
});
