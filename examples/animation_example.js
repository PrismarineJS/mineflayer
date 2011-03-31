mf.include("items.js");

function backwards(object) {
    var result = {};
    for (var name in object) {
        result[object[name]] = name;
    }
    return result;
}

var mob_type_to_name = backwards(mf.MobType);
var animation_type_to_name = backwards(mf.AnimationType);

mf.onAnimation(function(entity, animation_type) {
    var name;
    switch(entity.type) {
        case mf.EntityType.Player:
            name = entity.username;
            break;
        case mf.EntityType.Mob:
            name = "Mob: " + mob_type_to_name[entity.mob_type];
            break;
        case mf.EntityType.Item:
            name = "Item: " + items.nameForId(entity.item.type);
            if (entity.item.count > 1) {
                name += " x" + entity.item.count;
            }
            break
    }
    mf.debug(name + " animated: " + animation_type_to_name[animation_type]);
});
