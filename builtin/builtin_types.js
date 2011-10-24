
mf._serializableTypeNames = [];

mf._serializableTypeNames.push("Point");
mf.Point = function(x, y, z) {
    this._type = "Point";
    this.x = x;
    this.y = y;
    this.z = z;
};
mf.Point.prototype.floored = function() {
    return new mf.Point(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
};
/** returns a new point offset by the amount specified */
mf.Point.prototype.offset = function(dx, dy, dz) {
    return new mf.Point(this.x + dx, this.y + dy, this.z + dz);
};
/** returns a new point */
mf.Point.prototype.plus = function(other) {
    return this.offset(other.x, other.y, other.z);
};
mf.Point.prototype.minus = function(other) {
    return this.offset(-other.x, -other.y, -other.z);
};
mf.Point.prototype.scaled = function(scalar) {
    return new mf.Point(this.x * scalar, this.y * scalar, this.z * scalar);
};
mf.Point.prototype.abs = function() {
    return new mf.Point(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
};
/** euclidean distance */
mf.Point.prototype.distanceTo = function(other) {
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    var dz = other.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
mf.Point.prototype.equals = function(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
};
mf.Point.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ")";
};
mf.Point.prototype.clone = function() {
    return this.offset(0, 0, 0);
};

mf.Entity = function() {
};
mf.EntityType = {
    "Player": 1,
    "Mob": 3,
    "Pickup": 4,
};

mf._serializableTypeNames.push("Item");
mf.Item = function(type, count, metadata) {
    this._type = "Item";
    this.type = type;
    this.count = count !== undefined ? count : 1;
    this.metadata = metadata !== undefined ? metadata : 0;
};

mf._serializableTypeNames.push("Block");
mf.Block = function(type, metadata, light, sky_light) {
    this._type = "Block";
    this.type = type;
    this.metadata = metadata !== undefined ? metadata : 0;
    this.light = light !== undefined ? light : 0;
    this.sky_light = sky_light !== undefined ? sky_light : 0;
};
mf.Block.prototype.equals = function(other) {
    // ignore light levels
    return this.type === other.type && this.metadata === other.metadata;
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
    "Squid": 94,
    "Wolf": 95
};

mf.StoppedDiggingReason = {
    "BlockBroken": 0,
    "Aborted": 1,
};

mf.Control = {
    "Forward":      0,
    "Back":         1,
    "Left":         2,
    "Right":        3,
    "Jump":         4,
    "Crouch":       5,
    "DiscardItem":  6,
};

mf.AnimationType = {
    "NoAnimation":  0,
    "SwingArm":     1,
    "Damage":       2,
    "Crouch":       104,
    "Uncrouch":     105,
    "Dead":         55061,
};

mf.WindowType = {
    "None":         -2,
    "Inventory":    -1,
    "Chest":        0,
    "Workbench":    1,
    "Furnace":      2,
    "Dispenser":    3,
};

mf.MouseButton = {
    "Left":         false,
    "Right":        true,
};
mf.Dimension = {
    "Normal":   0,
    "Nether":   -1,
}
