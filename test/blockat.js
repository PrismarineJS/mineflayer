mf.setTimeout(function() {
    mf.print("Test timed out.\n");
    mf.exit();
}, 5000);

mf.onChunkUpdated(function(start, size) {
    if (start.x === 48 && start.y === 16 && start.z === 0) {
        var pt = new mf.Point(0,0,0);
        for (pt.z = 58; pt.z <= 62; pt.z++) {
            for (pt.y = start.y; pt.y < start.y+5; pt.y++) {
                for (pt.x = start.x; pt.x < start.x+5; pt.x++) {
                    mf.print(mf.blockAt(pt).type + ",");
                }
                mf.print("\n");
            }
            mf.print("\n");
        }
        mf.exit();
    }
});
