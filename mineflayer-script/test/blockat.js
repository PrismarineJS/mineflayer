mf.setTimeout(function() {
    mf.print("Test timed out.");
    mf.exit();
}, 5000);
mf.onSpawn(function() {
    // set timeout to wait for blocks to load...
    mf.setTimeout(function(){
        var pt = new mf.Point(0,0,0);
        for (pt.z = 58; pt.z <= 62; pt.z++) {
            for (pt.y = 15; pt.y <= 19; pt.y++) {
                for (pt.x = 103; pt.x <= 107; pt.x++) {
                    mf.print(mf.blockAt(pt).type + ",");
                }
                mf.print("\n");
            }
            mf.print("\n");
        }
        mf.exit();
    }, 3000);
});
