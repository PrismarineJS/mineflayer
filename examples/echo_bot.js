function MineflayerBot() {
    
}

MineflayerBot.prototype.onChat = function(username, message) {
    mf.debug("Got chat message: " + message);
    mf.chat(message);
}

MineflayerBot.prototype.onConnected = function() {
    mf.debug("Connected successfully.");
}
