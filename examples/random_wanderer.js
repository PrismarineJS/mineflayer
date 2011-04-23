mf.include("auto_respawn.js");
mf.include("navigator.js");

function goToRandomLocation() {
    // how far away the target position can be
    var dist = new mf.Point(50, 50, 0);

    var target_pos = new mf.Point(
        mf.self().position.x + Math.random() * dist.x * 2 - dist.x,
        mf.self().position.y + Math.random() * dist.y * 2 - dist.y,
        127);

    // move the z up to the surface of the earth
    while (! mf.isPhysical(mf.blockAt(target_pos).type) && target_pos.z > 0) {
        target_pos.z -= 1;
    }
    mf.chat("going to " + target_pos.floored());
    
    navigator.navigateTo(target_pos, {
        // get within 10 blocks
        'end_radius': 20, 
        // give up if it takes longer than 5 seconds to compute
        'timeout_milliseconds': 5000,  
        'cant_find_func': function() {
            mf.chat("can't figure out how to get there. recomputing");
            goToRandomLocation();
        },
        'arrived_func': function() {
            mf.chat("got there! going somewhere else.");
            goToRandomLocation();
        },
    });
}

function chatRandomly() {
    mf.chat("hey everybody!");
}

mf.onConnected(function() {
    // walk on water
    mf.hax.setJesusModeEnabled(true);

    // wait 5 sec for chunks to load
    mf.setTimeout(goToRandomLocation, 5000);

    // chatter randomly every 8 seconds
    mf.setInterval(chatRandomly, 8000);
});


