
// find a human player
mf.onEntitySpawned(function handleEntitySpawned(entity_id) {
    var entity = mf.entity(entity_id);
    if (entity === undefined || entity.type !== mf.EntityType.Player) {
        // not a human player
        return;
    }
    // found a human player
    var message = "i'm following " + entity.username + " " + entity_id;
    mf.chat(message);
    mf.debug(message);

    // detach this handler so we don't try to follow anyone else
    mf.removeHandler(mf.onEntitySpawned, handleEntitySpawned);
    var get_him = entity_id;
    // add a handler to watch this guy moving around
    mf.onEntityMoved(function(entity_id) {
        if (entity_id !== get_him) {
            // this isn't our target
            return;
        }
        var entity = mf.entity(entity_id);
        if (entity === undefined) {
            // entity is gone now
            return;
        }
        // face the target
        mf.lookAt(entity.position);
        // move forward constantly
        mf.setControlState(mf.Control.Forward, true);
    });
    mf.onEntityDespawned(function(entity_id) {
        if (entity_id === get_him) {
            mf.chat("well, i'm outta here");
            mf.exit();
        }
    });
});

