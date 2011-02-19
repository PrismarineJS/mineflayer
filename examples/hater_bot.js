
mf.include("arrays.js");

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
}, 100);

