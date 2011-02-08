mf.onChunkUpdated(function(start_x, start_y, start_z, x_count, y_count, z_count) {
    for (var x = start_x; x < x_count; x++) {
        for (var y = start_y; y < y_count; y++) {
            for (var z = start_z; z < z_count; z++) {
                if (mf.blockAt(x, y, z).type === mf.ItemType.DiamondOre) {
                    var message = "diamonds located: " + x + ", " + y + ", " + z;
                    mf.debug(message);
                    mf.chat(message);
                    mf.exit();
                }
            }
        }
    }
});
