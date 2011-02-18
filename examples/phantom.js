
mf.include("giver.js");
mf.include("teleporter.js");
mf.include("quitter.js");

mf.onSpawn(function() {
    // no living allowed
    mf.setTimeout(function() {
        mf.debug("goodbye life");
        mf.chat("/kill");
    }, 5000);
    // the timeout is to wait until after invulnerability has worn off

    mf.hax.setGravityEnabled(false);
});

