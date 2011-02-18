mf.include("block_finder.js");
mf.include("navigator.js");
mf.include("auto_respawn.js");

mf.onChat(function(username, message) {
    if (message == "go") {
        // FIND CAKE
        mf.chat("MUST FIND CAKE");
        var cake_pos = block_finder.findNearest(mf.self().position, mf.ItemType.Cake_placed);
        if (cake_pos === undefined) {
            mf.chat("can't find cake!! :-( :-(((");
        } else {
            // STAND ON THE CAKE
            navigator.navigateTo(cake_pos.offset(0, 0, 1));
        }
    }
});
