mf.include("items.js");

(function() {
    function nameForEntity(entity) {
        switch(entity.type) {
            case mf.EntityType.Player:
                return entity.username;
                break;
            case mf.EntityType.Mob:
                return "Mob: "+entity.mob_type;
                break;
            case mf.EntityType.Item:
                var name = "Item: "+items.nameForId(entity.item.type);
                if (entity.item.count > 1) {
                    name += " x"+entity.item.count;
                }
                return name;
        }
    }
    mf.onAnimation(function(entity, animation_type) {
        mf.debug(nameForEntity(entity) + " animated: " + animation_type)
    });
    mf.onEntityDamaged(function(entity) {
        mf.debug(nameForEntity(entity) + " took damage");
    });
    mf.onEntityDead(function(entity) {
        mf.debug(nameForEntity(entity) + " died");
    });
})();
