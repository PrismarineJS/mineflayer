mf.include("items.js");

mf.onAnimation(function(entity, animation_type) {
    var name;
    switch(entity.type) {
        case mf.EntityType.Player:
            name = entity.username;
            break;
        case mf.EntityType.Mob:
            name = "Mob: "+entity.mob_type;
            break;
        case mf.EntityType.Item:
            name = "Item: "+items.nameForId(entity.item.type);
            if (entity.item.count > 1) {
                name += " x"+entity.item.count;
            }
            break
    }
    mf.debug(name+" animated: "+animation_type)
});
