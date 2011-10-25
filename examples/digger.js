mf.include("auto_respawn.js");
mf.include("player_tracker.js");
mf.include("giver.js");
mf.include("inventory_test.js");
mf.include("navigator.js");
mf.include("ray_tracer.js");

function dig(block_to_dig) {
    mf.chat("digging down");
    mf.startDigging(block_to_dig);
    mf.onStoppedDigging(function stopped(reason) {
        mf.removeHandler(mf.onStoppedDigging, stopped);
        if (reason == mf.StoppedDiggingReason.BlockBroken) {
            mf.chat("success!");
        } else if (reason == mf.StoppedDiggingReason.Aborted) {
            mf.chat("interrupted");
        } else {
            mf.chat("?? wtf?? - got "+ reason);
        }
    });
}

mf.onChat(function(username, message) {
    if (message == "dig") {
        dig(mf.self().position.offset(0, -0.5, 0).floored());
    } else if (message == "dig there") {
        dig(ray_tracer.find_physical_from_player(player_tracker.entityForPlayer(username)));
    } else if (message == "look") {
        mf.lookAt(player_tracker.entityForPlayer(username).position);
    } else if (message == "c'mere") {
        mf.chat("/tp " + mf.self().username + " " + username);
    }
});


