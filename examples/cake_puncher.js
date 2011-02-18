mf.include("block_finder.js");
mf.include("navigator.js");
mf.include("auto_respawn.js");

function go() {
    // FIND CAKE
    mf.chat("MUST FIND CAKE");
    var cake_pos = block_finder.findNearest(mf.self().position.floored(), mf.ItemType.Cake_placed);
    if (cake_pos === undefined) {
        mf.chat("can't find cake!! :-( :-(((");
    } else {
        // STAND ON THE CAKE
        navigator.navigateTo(cake_pos.offset(0, 0, 1), function() {
            // PUNCH THE CAKE   
            mf.startDigging(cake_pos);
        });
    }
}

mf.onChat(function(username, message) {
    if (message == "go") {
        go();
    }
});

mf.onStoppedDigging(function() {
    mf.chat("take THAT, cake!!");

    go();
});

mf.onHealthChanged(function() {
    mf.debug("new health: " + mf.health());
});
