mf.onChunkUpdated(function(start, size) {
    for (var x = 0; x < size.x; x++) {
        for (var y = 0; y < size.y; y++) {
            for (var z = 0; z < size.z; z++) {
                if (mf.blockAt(mf.Point(start.x+x, start.y+y, start.z+z)).type === mf.ItemType.DiamondOre) {
                    var message = "diamonds located: " + x + ", " + y + ", " + z;
                    mf.debug(message);
                    mf.chat(message);
                    mf.exit();
                }
            }
        }
    }
});
