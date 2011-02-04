function MineflayerBot() {
    this.frameCount = 0;
}

MineflayerBot.prototype.process = function() {
    mf.print("frame " + this.frameCount);
    this.frameCount++;
}
