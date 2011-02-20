mf.include("auto_respawn.js");
mf.include("player_tracker.js");
mf.include("giver.js");

function dig() {
    mf.chat("digging down");
    var block_to_dig = mf.self().position.offset(0, 0, -0.5).floored();
    //mf.lookAt(block_to_dig.offset(0.5, 0.5, 0.5));
    mf.startDigging(block_to_dig);
}

mf.onChat(function(username, message) {
    if (message == "dig") {
        dig();
    } else if (message == "look") {
        mf.lookAt(player_tracker.entityForPlayer(username).position);
    } else if (message == "c'mere") {
        mf.chat("/tp " + mf.self().username + " " + username);
    }
});

mf.onStoppedDigging(function(reason) {
    if (reason == mf.StoppedDiggingReason.BlockBroken) {
        mf.chat("success!");
    } else if (reason == mf.StoppedDiggingReason.Aborted) {
        mf.chat("interrupted");
    } else {
        mf.chat("?? wtf?? - got "+ reason);
    }
});
