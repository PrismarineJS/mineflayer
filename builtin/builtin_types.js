(function() {
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
    mf.Entity.prototype.equals = function(other) {
        return this.entity_id === other.entity_id;
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

    mf.MetadataUse = {
        "ItemUnknown": 0
        "ItemHealth": 1,
        "ItemType": 2,
        "ItemMap": 3
    };

    mf.Item.prototype.useForMetadata = function() {
        switch(this.type) {
            case 256: // Iron Shovel
            case 257: // Iron Pickaxe
            case 258: // Iron Axe
            case 259: // Flint and Steel
            case 267: // Iron Sword
            case 268: // Wooden Sword
            case 269: // Wooden Shovel
            case 270: // Wooden Pickaxe
            case 271: // Wooden Axe
            case 272: // Stone Sword
            case 273: // Stone Shovel
            case 274: // Stone Pickaxe
            case 275: // Stone Axe
            case 276: // Diamond Sword
            case 277: // Diamond Shovel
            case 278: // Diamond Pickaxe
            case 279: // Diamond Axe
            case 283: // Gold Sword
            case 284: // Gold Shovel
            case 285: // Gold Pickaxe
            case 286: // Gold Axe
            case 290: // Wooden Hoe
            case 291: // Stone Hoe
            case 292: // Iron Hoe
            case 293: // Diamond Hoe
            case 294: // Gold Hoe
            case 298: // Leather Helmet
            case 299: // Leather Chestplate
            case 300: // Leather Leggings (Spartan Leggings?)
            case 301: // Leather Boots
            case 302: // Chain Helmet
            case 303: // Chain Chestplate
            case 304: // Chain Leggings
            case 305: // Chain Boots
            case 306: // Iron Helmet
            case 307: // Iron Chestplate
            case 308: // Iron Leggings
            case 309: // Iron Boots
            case 310: // Diamond Helmet
            case 311: // Diamond Chestplate
            case 312: // Diamond Leggings
            case 313: // Dimaond Boots
            case 314: // Gold Helmet
            case 315: // Gold Chestplate
            case 316: // Gold Leggings
            case 317: // Gold Boots
            case 346: // Fishing Rod
            case 359: // Shears
                return mf.MetadataUse.ItemHealth;
            case 31: // Tall Grass (Dead Shrub/Tall Grass/Fern)
            case 35: // Wool (Color)
            case 43: // Double Slabs
            case 44: // Slabs
            case 98: // Stone Bricks (Normal/Cracked/Mossy)
            case 263: // Coal / Charcoal
            case 351: // Dye (Color)
            case 373: // Potion (type)
                return mf.MetadataUse.ItemType;
            case 358: // Map
                return mf.MetadataUse.ItemMap;
            default:
                return mf.MetadataUse.ItemUnknown;
        }
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

    mf.Block.prototype.isOccupied = function() {
        if (this.type === 26) { // Bed only
            return (this.metadata & 4) === 4;
        }
        return undefined;
    };

    mf.Block.prototype.isUnoccupied = function() {
        if (this.type === 26) { // Bed only
            return (this.metadata & 4) === 0;
        }
        return undefined;
    };

    mf.Block.prototype.isHead = function() {
        if (this.type === 26) { // Bed only
            return (this.metadata & 8) === 8;
        }
        return undefined;
    };

    mf.Block.prototype.isFoot = function() {
        if (this.type === 26) { // Bed only
            return (this.metadata & 8) === 0;
        }
        return undefined;
    };

    /** Whether a block is activated or not */
    mf.Block.prototype.isActivated = function() {
        switch(this.type) {
            case 27: // PoweredRail
            case 29: // StickyPiston
            case 33: // Piston
            case 69: // Lever
            case 77: // StoneButton
                return (this.metadata & 8) === 8;
            case 55: // RedstoneWire
                return this.metadata != 0;
            case 64: // WoodenDoor
            case 71: // IronDoor
            case 96: // Trapdoor
                return (this.metadata & 4) === 4;
            case 70: // StonePressurePlate
            case 72: // WoodenPressurePlate
                return this.metadata === 1;
            default:
                return undefined;
        }
    };

    var directions = {};
    var dxString = ["North", "", "South"];
    var dyString = ["Down", "", "Up"];
    var dzString = ["East", "", "West"];
    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
            for (var z = -1; z <= 1; z++) {
                if (x == 0 && y == 0 && z == 0) {
                    continue;
                }
                directions[dxString[x+1] + dyString[y+1] + dzString[z+1]] = new mf.Point(x, y, z);
            }
        }
    }

    var torch_facing = {
        1: directions["East"],
        2: directions["West"],
        3: directions["South"],
        4: directions["North"],
        5: directions["Up"]
    };

    var rail_facing = {
        0: directions["South"],
        1: directions["West"],
        2: directions["UpEast"],
        3: directions["UpWest"],
        4: directions["NorthUp"],
        5: directions["SouthUp"],
        6: directions["SouthEast"], // Corner that connects Rails coming from South and East
        7: directions["SouthWest"], // Corner that connects Rails coming from South and West
        8: directions["NorthWest"], // Corner that connects Rails coming from North and West
        9: directions["NorthEast"]  // Corner that connects Rails coming from the North and East
    };

    var ladder_facing = {
        2: directions["North"],
        3: directions["South"],
        4: directions["West"],
        5: directions["East"]
    };

    var stair_facing = {
        0: directions["West"],
        1: directions["East"],
        2: directions["North"],
        3: directions["South"]
    };

    var lever_facing = {
        1: directions["East"],
        2: directions["West"],
        3: directions["South"],
        4: directions["North"],
        5: directions["Up"],
        6: directions["Up"]
    };

    var door_facing = {
        0: directions["West"],
        1: directions["North"],
        2: directions["East"],
        3: directions["South"],

        4: directions["North"],
        5: directions["East"],
        6: directions["South"],
        7: directions["West"],
    };

    var button_facing = {
        1: directions["East"],
        2: directions["West"],
        3: directions["South"],
        4: directions["North"]
    };

    var sign_facing = {
        0: directions["South"],
        1: directions["South"] + directions["SouthWest"],
        2: directions["SouthWest"],
        3: directions["West"] + directions["SouthWest"],
        4: directions["West"],
        5: directions["West"] + directions["NorthWest"],
        6: directions["NorthWest"],
        7: directions["North"] + directions["NorthWest"],
        8: directions["North"],
        9: directions["North"] + directions["NorthEast"],
        10: directions["NorthEast"],
        11: directions["East"] + directions["NorthEast"],
        12: directions["East"],
        13: directions["East"] + directions["SouthEast"],
        14: directions["SouthEast"],
        15: directions["South"] + directions["SouthEast"]
    };

    var generic_facing = {
        // Wall Signs, Furnaces, Dispensers, Chests
        2: directions["North"],
        3: directions["South"],
        4: directions["West"],
        5: directions["East"]
    };

    var generic2_facing = {
        // Pumpkins, Beds
        0: directions["South"],
        1: directions["West"],
        2: directions["North"],
        3: directions["East"]
    };

    var repeater_facing = {
        0: directions["North"],
        1: directions["East"],
        2: directions["South"],
        3: directions["West"]
    };

    var trapdoor_facing = {
        0: directions["South"],
        1: directions["North"],
        2: directions["East"],
        3: directions["West"]
    };

    var piston_facing = {
        0: directions["Down"],
        1: directions["Up"],
        2: directions["North"],
        3: directions["South"],
        4: directions["West"],
        5: directions["East"]
    };

    var fence_facing = {
        0: directions["South"],
        1: directions["West"],
        2: directions["North"],
        3: directions["East"]
    };

    /** The direction a particular block is facing */
    mf.Block.prototype.facingDirection = function() {
        switch(this.type) {
            case 50: // Torch
            case 75: // Redstone Torch (off)
            case 76: // Redstone Torch (on)
                return torch_facing[this.metadata];
            case 28: // Detector Rail
            case 66: // Rails
                return rail_facing[this.metadata];
            case 27: // Powered Rail
                return rail_facing[this.metadata % 8]; // highest bit is bool powered
            case 65: // Ladder
                return ladder_facing[this.metadata];
            case 53: // Wooden Stairs
            case 67: // Cobblestone Stairs
            case 108: // Brick Stairs
            case 109: // Stone Brick Stairs
            case 114: // Nether Brick Stairs
                return stair_facing[this.metadata];
            case 69: // Lever
                return lever_facing[this.metadata % 8]; // highest bit is bool powered
            case 64: // Wooden Door
            case 71: // Iron Door
                return door_facing[this.metadata % 8] // highest bit is top/bottom;
            case 77: // Button
                return button_facing[this.metadata % 8]; // highest bit is bool powered
            case 63: // Free-standing Sign
                return sign_facing[this.metadata];
            case 68: // Wall Sign
            case 61: // Inactive Furnace
            case 62: // Active Furnace
            case 23: // Dispenser
            case 54: // Chest
                return generic_facing[this.metadata];
            case 86: // Pumpkin
            case 91: // Jack-O-Lantern
                return generic2_facing[this.metadata];
            case 26: // Bed
                return generic2_facing[this.metadata % 4]; // 2nd highest bit is bool occupied, highest is head/foot
            case 93: // Redstone Repeater (Off)
            case 94: // Redstone Repeater (On)
                return repeater_facing[this.metadata % 4]; // Highest 2 bits are delay amount
            case 96: // Trapdoor
                return trapdoor_facing[this.metadata % 4]; // 2nd highest bit is open/closed
            case 33: // Piston
            case 34: // Piston Extension
            case 29: // Sticky Piston
                return piston_facing[this.metadata % 8];
            case 106: // Vines
                return undefined; // Vines can have multiple sides.  Facing doesn't make sense.
            case 107: // Fence Gate
                return fence_facing[this.metadata % 4];
            default:
                return undefined;
        }
    };

    var wool_colors = ["White", "Orange", "Magenta", "Light Blue", "Yellow", "Lime", "Pink", "Gray", "Light Gray", "Cyan", "Purple", "Blue", "Brown", "Green", "Red", "Black"];

    /** The string color of a block of wool */
    mf.Block.prototype.color = function() {
        if (this.type != 35) {
            return undefined;
        }
        return wool_colors[this.metadata];
    };

    mf._serializableTypeNames.push("HealthStatus");
    mf.HealthStatus = function(health, food, food_saturation) {
        this._type = "HealthStatus";
        this.health = health;
        this.food = food;
        this.food_saturation = food_saturation;
    };
    mf.HealthStatus.prototype.equals = function(other) {
        return this.health === other.health && this.food === other.food && this.food_saturation === other.food_saturation;
    };

    mf._serializableTypeNames.push("StatusEffect");
    mf.StatusEffect = function(effect_id, amplifier, start_timestamp, duration_milliseconds) {
        this._type = "StatusEffect";
        this.effect_id = effect_id;
        this.amplifier = amplifier;
        this.start_timestamp = start_timestamp;
        this.duration_milliseconds = duration_milliseconds;
    };
    mf.StatusEffect.prototype.equals = function(other) {
        return this.effect_id === other.effect_id && this.amplifier === other.amplifier && this.start_timestamp === other.start_timestamp && this.duration_milliseconds === other.duration_milliseconds;
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
        "Enderman": 58,
        "CaveSpider": 59,
        "Silverfish": 60,
        "Blaze": 61,
        "MagmaCube": 62,
        "EnderDragon": 63,
        "Pig": 90,
        "Sheep": 91,
        "Cow": 92,
        "Chicken": 93,
        "Squid": 94,
        "Wolf": 95,
        "Snowman": 97,
        "Villager": 120
    };

    mf.StatusEffectType = {
        "Regeneration": 10,
        "Hunger": 17,
        "Poison": 19,
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
    };
})();
