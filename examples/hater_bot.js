mf.include("navigator.js");
mf.include("arrays.js");
mf.include("player_tracker.js");

var target_ids = [];
function debug(message) {
    mf.debug(message);
    mf.chat(message);
}
mf.onEntitySpawned(function(entity) {
    if (entity.type !== mf.EntityType.Player) {
       return;
    }
    debug("i hate " + entity.username + "!");
    target_ids.push(entity.entity_id);
});
mf.onEntityDespawned(function(entity) {
    if (entity.type !== mf.EntityType.Player) {
       return;
    }
    debug("you suck " + entity.username + "!");
    target_ids.remove(entity.entity_id);
});
mf.setInterval(function() {
    if (target_ids.length === 0) {
        return;
    }
    mf.hax.attackEntity(target_ids[0]);
    mf.lookAt(mf.entity(target_ids[0]).position);
    mf.setControlState(mf.Control.Forward, true);
}, 100);

mf.setInterval(function() {
    if (target_ids.length === 0) {
        return;
    }
    mf.setControlState(mf.Control.Forward, false);
    navigator.navigateTo(mf.entity(target_ids[0]).position, {
        timeout_milliseconds: 1000,
        end_radius: 3,
        cant_find_func: function() { mf.chat("damn you!!"); },
    });
}, 5000);
