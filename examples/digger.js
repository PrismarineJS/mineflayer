mf.include("auto_respawn.js");
mf.include("player_tracker.js");
mf.include("giver.js");
mf.include("inventory_test.js");

function dig(block_to_dig) {
    mf.chat("digging down");
    //mf.lookAt(block_to_dig.offset(0.5, 0.5, 0.5));
    mf.startDigging(block_to_dig);
}

mf.onChat(function(username, message) {
    if (message == "dig") {
        dig(mf.self().position.offset(0, 0, -0.5).floored());
    } else if (message == "dig there") {
        dig(entityLooksAt(player_tracker.entityForPlayer(username)));
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

function entityLooksAt(entity) {
    var pos = entity.position.offset(0, 0, 1.6);
    var yaw = entity.yaw, pitch = entity.pitch;
    var vector_length = 0.25;
    var x = Math.cos(yaw) * Math.cos(pitch);
    var y = Math.sin(yaw) * Math.cos(pitch);
    var z = Math.sin(pitch);
    var vector = new mf.Point(x*vector_length,y*vector_length,z*vector_length);

    var block = 0;
    while (!mf.isPhysical(block)) {
        pos = pos.plus(vector);
        block = mf.blockAt(pos).type;
    }
    return pos;
}
