function MineflayerBot() {
    this.frameCount = 0;
}

MineflayerBot.prototype.onNextFrame = function() {
    if (this.frameCount % 10000 == 0) {
        mf.print("frame " + this.frameCount);
    }
    this.frameCount++;
}

MineflayerBot.prototype.onChat = function(username, message) {
    mf.print("Got chat message: " + message);
    mf.chat(message);
}

MineflayerBot.prototype.onConnected = function() {
    mf.print("Connected successfully.");
}
