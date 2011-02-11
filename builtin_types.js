
mf.serializableTypeNames = [];

mf.serializableTypeNames.push("Point");
mf.Point = function(x, y, z) {
    this._type = "Point";
    this.x = x;
    this.y = y;
    this.z = z;
};

mf.Entity = function() {
};
mf.EntityType = {
    "Player": 1,
    "Mob": 3,
    "Pickup": 4,
};

mf.serializableTypeNames.push("Item");
mf.Item = function(type, count) {
    this._type = "Item";
    this.type = type;
    if (count !== undefined) {
        this.count = count;
    } else {
        this.count = 1;
    }
};

mf.Face = {
    "NoDirection": -1,
    "NegativeY": 0,
    "PositiveY": 1,
    "NegativeZ": 2,
    "PositiveZ": 3,
    "NegativeX": 4,
    "PositiveX": 5,
};

mf.MobType = {
    "Creeper": 50,
    "Skeleton": 51,
    "Spider": 52,
    "GiantZombie": 53,
    "Zombie": 54,
    "Slime": 55,
    "Ghast": 56,
    "ZombiePigman": 57,
    "Pig": 90,
    "Sheep": 91,
    "Cow": 92,
    "Chicken": 93,
};

mf.StoppedDiggingReason = {
    "BlockBroken": 1,
    "Interrupted": 2,
};

