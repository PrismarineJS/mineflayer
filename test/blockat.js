mf.setTimeout(function() {
    mf.print("Test timed out.\n");
    mf.exit();
}, 5000);

mf.onChunkUpdated(function(start, size) {
    if (start.x === 0 && start.y === 0 && start.z === -80) {
        var pt = new mf.Point(0,0,0);
        for (pt.y = 58; pt.y <= 62; pt.y++) {
            for (pt.z = start.z; pt.z < start.z+5; pt.z++) {
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
