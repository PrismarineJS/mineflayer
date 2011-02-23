#ifndef ITEM_H
#define ITEM_H

#include <QSize>
#include <QVector>

class Item;

namespace _Item {
    struct Ingredient;
    struct Recipe;
}

uint qHash(const _Item::Recipe & recipe);
uint qHash(const Item & item);

#include <QHash>

class Item {
public:
    enum ItemType
    {
        NoItem=-1,
        Air=0x00,
        Stone=0x01,
        Grass=0x02,
        Dirt=0x03,
        Cobblestone=0x04,
        WoodenPlank=0x05,
        Sapling=0x06,
        Bedrock=0x07,
        Water=0x08,
        StationaryWater=0x09,
        Lava=0x0A,
        StationaryLava=0x0B,
        Sand=0x0C,
        Gravel=0x0D,
        GoldOre=0x0E,
        IronOre=0x0F,
        CoalOre=0x10,
        Wood=0x11,
        Leaves=0x12,
        Sponge=0x13,
        Glass=0x14,
        LapisLazuliOre=0x15,
        LapisLazuliBlock=0x16,
        Dispenser=0x17,
        Sandstone=0x18,
        NoteBlock=0x19,
        Bed_placed=0x1A,
        Wool=0x23,
        YellowFlower=0x25,
        RedRose=0x26,
        BrownMushroom=0x27,
        RedMushroom=0x28,
        GoldBlock=0x29,
        IronBlock=0x2A,
        DoubleSlab=0x2B,
        Slab=0x2C,
        Brick=0x2D,
        Tnt=0x2E,
        Bookshelf=0x2F,
        MossStone=0x30,
        Obsidian=0x31,
        Torch=0x32,
        Fire=0x33,
        MonsterSpawner=0x34,
        WoodenStairs=0x35,
        Chest=0x36,
        RedstoneWire_placed=0x37,
        DiamondOre=0x38,
        DiamondBlock=0x39,
        CraftingTable=0x3A,
        Crops=0x3B,
        Farmland=0x3C,
        Furnace=0x3D,
        BurningFurnace=0x3E,
        SignPost_placed=0x3F,
        WoodenDoor_placed=0x40,
        Ladder=0x41,
        MinecartTracks=0x42,
        CobblestoneStairs=0x43,
        WallSign_placed=0x44,
        Lever=0x45,
        StonePressurePlate=0x46,
        IronDoor_placed=0x47,
        WoodenPressurePlate=0x48,
        RedstoneOre=0x49,
        GlowingRedstoneOre=0x4A,
        RedstoneTorchOff_placed=0x4B,
        RedstoneTorchOn=0x4C,
        StoneButton=0x4D,
        Snow=0x4E,
        Ice=0x4F,
        SnowBlock=0x50,
        Cactus=0x51,
        Clay=0x52,
        SugarCane_placed=0x53,
        Jukebox=0x54,
        Fence=0x55,
        Pumpkin=0x56,
        Netherrack=0x57,
        SoulSand=0x58,
        Glowstone=0x59,
        Portal=0x5A,
        JackOLantern=0x5B,
        Cake_placed=0x5C,
        RedstoneRepeaterOff_placed=0x5D,
        RedstoneRepeaterOn_placed=0x5E,
        IronShovel=0x100,
        IronPickaxe=0x101,
        IronAxe=0x102,
        FlintAndSteel=0x103,
        Apple=0x104,
        Bow=0x105,
        Arrow=0x106,
        Coal=0x107,
        Diamond=0x108,
        IronIngot=0x109,
        GoldIngot=0x10A,
        IronSword=0x10B,
        WoodenSword=0x10C,
        WoodenShovel=0x10D,
        WoodenPickaxe=0x10E,
        WoodenAxe=0x10F,
        StoneSword=0x110,
        StoneShovel=0x111,
        StonePickaxe=0x112,
        StoneAxe=0x113,
        DiamondSword=0x114,
        DiamondShovel=0x115,
        DiamondPickaxe=0x116,
        DiamondAxe=0x117,
        Stick=0x118,
        Bowl=0x119,
        MushroomStew=0x11A,
        GoldSword=0x11B,
        GoldShovel=0x11C,
        GoldPickaxe=0x11D,
        GoldAxe=0x11E,
        String=0x11F,
        Feather=0x120,
        Gunpowder=0x121,
        WoodenHoe=0x122,
        StoneHoe=0x123,
        IronHoe=0x124,
        DiamondHoe=0x125,
        GoldHoe=0x126,
        Seeds=0x127,
        Wheat=0x128,
        Bread=0x129,
        LeatherHelmet=0x12A,
        LeatherChestplate=0x12B,
        LeatherLeggings=0x12C,
        LeatherBoots=0x12D,
        ChainmailHelmet=0x12E,
        ChainmailChestplate=0x12F,
        ChainmailLeggings=0x130,
        ChainmailBoots=0x131,
        IronHelmet=0x132,
        IronChestplate=0x133,
        IronLeggings=0x134,
        IronBoots=0x135,
        DiamondHelmet=0x136,
        DiamondChestplate=0x137,
        DiamondLeggings=0x138,
        DiamondBoots=0x139,
        GoldHelmet=0x13A,
        GoldChestplate=0x13B,
        GoldLeggings=0x13C,
        GoldBoots=0x13D,
        Flint=0x13E,
        RawPorkchop=0x13F,
        CookedPorkchop=0x140,
        Painting=0x141,
        GoldenApple=0x142,
        Sign=0x143,
        WoodenDoor=0x144,
        Bucket=0x145,
        WaterBucket=0x146,
        LavaBucket=0x147,
        Minecart=0x148,
        Saddle=0x149,
        IronDoor=0x14A,
        Redstone=0x14B,
        Snowball=0x14C,
        Boat=0x14D,
        Leather=0x14E,
        MilkBucket=0x14F,
        ClayBrick=0x150,
        ClayBall=0x151,
        SugarCane=0x152,
        Paper=0x153,
        Book=0x154,
        Slimeball=0x155,
        StorageMinecart=0x156,
        PoweredMinecart=0x157,
        Egg=0x158,
        Compass=0x159,
        FishingRod=0x15A,
        Clock=0x15B,
        GlowstoneDust=0x15C,
        RawFish=0x15D,
        CookedFish=0x15E,
        InkSac=0x15F,
        Bone=0x160,
        Sugar=0x161,
        Cake=0x162,
        Bed=0x163,
        RedstoneRepeater=0x164,
        GoldMusicDisc=0x8D0,
        GreenMusicDisc=0x8D1,
    };

    enum WoodMetadata {
        NormalTrunkTexture = 0,
        RedwoodTrunkTexture = 1,
        BirchTrunkTexture = 2,
    };

    enum LeavesMetadata {
        NormalLeavesTexture = 0,
        RedwoodLeavesTexture = 1,
        BirchLeavesTexture = 2,
    };

    enum CoalMetadata {
        NormalCoal = 0,
        CharCoal = 1,
    };

    enum WoolMetadata {
        WhiteWool = 0,
        OrangeWool = 1,
        MagentaWool = 2,
        LightBlueWool = 3,
        YellowWool = 4,
        LightGreenWool = 5,
        PinkWool = 6,
        GrayWool = 7,
        LightGrayWool = 8,
        CyanWool = 9,
        PurpleWool = 10,
        BlueWool = 11,
        BrownWool = 12,
        DarkGreenWool = 13,
        RedWool = 14,
        BlackWool = 15,
    };

    enum DyeMetadata {
        InkSacDye = 0,
        RoseRedDye = 1,
        CactusGreenDye = 2,
        CocoBeansDye = 3,
        LapisLazuliDye = 4,
        PurpleDye = 5,
        CyanDye = 6,
        LightGrayDye = 7,
        GrayDye = 8,
        PinkDye = 9,
        LimeDye = 10,
        DandelionYellowDye = 11,
        LightBlueDye = 12,
        MagentaDye = 13,
        OrangeDye = 14,
        BoneMealDye = 15,
    };

    enum TorchMetadata {
        SouthTorch = 0,
        NorthTorch = 1,
        WestTorch = 2,
        EastTorch = 3,
        FloorTorch = 4,
    };

    enum MinecartTrackMetadata {
        FlatEastWestTrack = 0,
        FlatNorthSouthTrack = 1,
        AscendingSouthTrack = 2,
        AscendingNorthTrack = 3,
        AscendingEastTrack = 4,
        AscendingWestTrack = 5,
        CornerNorthEastTrack = 6,
        CornerSouthEastTrack = 7,
        CornerSouthWestTrack = 8,
        CornerNorthWestTrack = 9,
    };

    enum LadderMetadata {
        EastLadder = 2,
        WestLadder = 3,
        NorthLadder = 4,
        SouthLadder = 5,
    };

    enum StairsMetadata {
        AscendingSouthStairs = 0,
        AscendingNorthStairs = 1,
        AscendingWestStairs = 2,
        AscendingEastStairs = 3,
    };

    enum LeverPosition {
        WallFacingSouthLever = 0,
        WallFacingNorthLever = 1,
        WallFacingWestLever = 2,
        WallFacingEastLever = 3,
        GroundFacingWestLever = 4, // lever points west when off
        GroundFacingSouthLever = 5, // lever points south when off
    };

    enum DoorHingeLocation {
        NorthEastDoorHinge = 0,
        SouthEastDoorHinge = 1,
        SouthWestDoorHinge = 2,
        NirthWestDoorHinge = 3,
    };

    enum ButtonDirection {
        SouthFacingButton = 1,
        NorthFacingButton = 2,
        WestFacingButton = 3,
        EastFacingButton = 4,
    };

    enum WallSignMetadata {
        EastFacingWallSign = 2,
        WestFacingWallSign = 3,
        NorthFacingWallSign = 4,
        SouthFacingWallSign = 5,
    };

    enum FurnaceMetadata {
        EastFacingFurnace = 2,
        WestFacingFurnace = 3,
        NorthFacingFurnace = 4,
        SouthFacingFurnace = 5,
    };

    enum PumpkinMetadata {
        EastFacingPumpkin = 0,
        SouthFacingPumpkin = 1,
        WestFacingPumpkin = 2,
        NorthFacingPumpkin = 3,
    };

    struct ItemData {
        ItemType id;
        QString name;
        int stack_height;
        bool placeable; // true if right clicking with it equipped on a block face puts it in the world or uses the item on that face
        bool item_activatable; // true if right clicking anywhere with it equipped activates the item
        bool physical; // true if it physically obstructs you
        bool diggable; // false if placing a block against one of its faces would be cheating
        bool block_activatable; // true if right clicking on the block in the world activates the block
        bool safe; // false if your presence in this block causes you harm

        ItemData() : id(NoItem) {}
    };

public:
    ItemType type;
    qint8 count;
    qint16 metadata;

    // for hashing purposes. we only check type and metadata, not count.
    bool operator ==(const Item & other) const;

public:

    static void initializeStaticData();
    inline static const ItemData * itemData(ItemType item_id) { return s_item_data.value(item_id, NULL); }
    inline static const QHash<ItemType, ItemData *> * itemDataHash() { return &s_item_data; }

    static const _Item::Recipe * recipeFor(const _Item::Recipe & recipe);
    inline static QList<_Item::Recipe *> recipesToMake(const Item & item) { return s_item_recipe.values(item); }

    Item() : type(NoItem), count(0), metadata(0) {}

private:
    static bool s_initialized;

    static QHash<ItemType, ItemData *> s_item_data;
    static QHash<QString, ItemData *> s_item_by_name;

    // match generic recipe to our recipe structure which contains result
    static QHash<_Item::Recipe, _Item::Recipe *> s_recipes;
    // match result item type to list of recipes that can make it.
    static QMultiHash<Item, _Item::Recipe *> s_item_recipe;

    static const Item * c_no_item;

private:
    static Item parseItem(QString item_string, bool * metadata_matters = NULL);
};

namespace _Item {

    struct Ingredient {
        Item item;
        // are we looking for specific metadata for this ingredient?
        bool metadata_matters;
        // what this ingredient turns into when the crafting is done. Usually NoItem.
        // for MilkBucket this is Bucket and for MushroomStew this is Bowl.
        Item result;

        // for sorting
        bool operator <(const Ingredient & other) const;
        bool operator ==(const Ingredient & other) const;
    };

    struct Recipe {
        Item result;
        // palette for design
        QVector<Ingredient> ingredients;
        // design width and height. 0, 0 means design doesn't matter.
        QSize size;
        // list of length size.width * size.height indexes into ingredients vector.
        QVector<int> design;

        bool operator ==(const Recipe & other) const;
    };
}






#endif // ITEM_H
