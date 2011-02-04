function MineflayerBot() {
    
}

MineflayerBot.prototype.onChat = function(username, message) {
    mf.print("Got chat message: " + message);
    mf.chat(message);
}

MineflayerBot.prototype.onConnected = function() {
    mf.print("Connected successfully.");
}
