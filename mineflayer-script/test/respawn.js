var diedYet = false;

mf.setTimeout(function() {
    mf.print("Test timed out.\n");
    mf.exit();
}, 8000);

mf.onDeath(function() {
    diedYet = true;
    mf.print("Dead, respawning.\n");
    mf.respawn();
});
mf.onConnected(function() {
    mf.print("Connected.\n");
});
mf.onSpawn(function() {
    if (diedYet) {
        mf.print("I have respawned.\n");
        mf.exit();
    } else {
        mf.setTimeout(function() {
            mf.print("I have spawned, killing myself.\n");
            mf.chat("/kill");
        }, 4000);
    }
});
