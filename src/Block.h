#ifndef BLOCK_H
#define BLOCK_H

#include <QDebug>

class Block {
public:
    enum ItemType {
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
        Wool=0x23,
        YellowFlower=0x25,
        RedRose=0x26,
        BrownMushroom=0x27,
        RedMushroom=0x28,
        GoldBlock=0x29,
        IronBlock=0x2A,
        DoubleStoneSlab=0x2B,
        StoneSlab=0x2C,
        Brick=0x2D,
        TNT=0x2E,
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
        Workbench=0x3A,
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
        SugarCane_place=0x53,
        Jukebox=0x54,
        Fence=0x55,
        Pumpkin=0x56,
        Netherrack=0x57,
        SoulSand=0x58,
        Glowstone=0x59,
        Portal=0x5A,
        JackOLantern=0x5B,
        CakeBlock=0x5C,

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
        MushroomSoup=0x11A,
        GoldSword=0x11B,
        GoldShovel=0x11C,
        GoldPickaxe=0x11D,
        GoldAxe=0x11E,
        String=0x11F,
        Feather=0x120,
        Sulphur=0x121,
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
        Paintings=0x141,
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
        Milk=0x14F,
        ClayBrick=0x150,
        ClayBalls=0x151,
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

    // Sapling Metadata: 0x0 is a freshly planted sapling. The data value is
    // incremented at random intervals. When it becomes 15, a new tree is created in its place.

    // Cactus Metadata: 0x0 is a freshly planted cactus. The data value is
    // incremented at random intervals. When it becomes 15, a new cactus block
    // is created on top as long as the total height does not exceed 3.

    // Water and Lava Metadata: 0x0 is a full block. Water goes up to 0x7, Lava
    // can only go up to 0x3. If bit 0x8 is set, this liquid is "falling" and
    // only spreads downward.

    // Farmland Metadata: 0x0 is dry land, 0x1-0x8 are increasing levels of
    // wetness. The wetness value depends on how far the block is away
    // from water.

    // Crops Metadata: Crops grow from 0x0 to 0x7.

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

public:
    inline void setType(ItemType type) {
        Q_ASSERT((uint)type <= 0xff);
        m_type = type;
    }
    inline ItemType type() const { return (ItemType)m_type; }

    // [0, 15] - how much light from non-skylight
    inline void setLight(int light) {
        Q_ASSERT((uint)light <= 0xf);
        m_light = light;
    }
    inline int light() const { return m_light; }

    // [0, 15] - how much light would be on the block from the sun if it was day
    inline void setSkyLight(int sky_light) {
        Q_ASSERT((uint)sky_light <= 0xf);
        m_sky_light = sky_light;
    }
    inline int skyLight() const { return m_sky_light; }

    inline void setMetadata(int metadata) {
        Q_ASSERT((uint)metadata <= 0xf);
        m_metadata = metadata;
    }

    // specific metadata getters
    inline WoodMetadata woodMetadata() const {
        Q_ASSERT(type() == Wood);
        return (WoodMetadata) m_metadata;
    }
    inline LeavesMetadata leavesMetadata() const {
        Q_ASSERT(type() == Leaves);
        return (LeavesMetadata) m_metadata;
    }
    inline CoalMetadata coalMetadata() const {
        Q_ASSERT(type() == Coal);
        return (CoalMetadata) m_metadata;
    }
    inline int saplingMetadata() const {
        Q_ASSERT(type() == Sapling);
        return m_metadata;
    }
    inline int cactusMetadata() const {
        Q_ASSERT(type() == Cactus);
        return m_metadata;
    }
    inline int waterMetadata() const {
        Q_ASSERT(type() == Water);
        return m_metadata;
    }
    inline int lavaMetadata() const {
        Q_ASSERT(type() == Lava);
        return m_metadata;
    }
    inline int farmlandMetadata() const {
        Q_ASSERT(type() == Farmland);
        return m_metadata;
    }
    inline int cropsMetadata() const {
        Q_ASSERT(type() == Crops);
        return m_metadata;
    }
    inline WoolMetadata woolMetadata() const {
        Q_ASSERT(type() == Wool);
        return (WoolMetadata) m_metadata;
    }

    inline DyeMetadata dyeMetadata() const {
        Q_ASSERT(type() == InkSac);
        return (DyeMetadata) m_metadata;
    }

    inline TorchMetadata torchMetadata() const {
        Q_ASSERT(type() == Torch);
        return (TorchMetadata) m_metadata;
    }

    inline MinecartTrackMetadata minecartTrackMetadata() const {
        Q_ASSERT(type() == MinecartTracks);
        return (MinecartTrackMetadata) m_metadata;
    }

    inline LadderMetadata ladderMetadata() const {
        Q_ASSERT(type() == Ladder);
        return (LadderMetadata) m_metadata;
    }

    inline StairsMetadata stairsMetadata() const {
        Q_ASSERT(type() == WoodenStairs || type() == CobblestoneStairs);
        return (StairsMetadata) m_metadata;
    }

    inline bool leverState() const {
        Q_ASSERT(type() == Lever);
        return (m_metadata & 0x8) != 0;
    }
    inline LeverPosition leverPosition() const {
        Q_ASSERT(type() == Lever);
        return (LeverPosition)(m_metadata & 0x7);
    }
    inline bool isTopDoorHalf() const {
        Q_ASSERT(type() == WoodenDoor_placed || type() == IronDoor_placed);
        return (m_metadata & 0x8) != 0;
    }
    inline bool isDoorOpen() const {
        Q_ASSERT(type() == WoodenDoor_placed || type() == IronDoor_placed);
        return (m_metadata & 0x4) != 0;
    }
    inline DoorHingeLocation doorHingeLocation() const {
        Q_ASSERT(type() == WoodenDoor_placed || type() == IronDoor_placed);
        return (DoorHingeLocation)(m_metadata & 0x3);
    }
    inline bool isButtonPressed() const {
        Q_ASSERT(type() == StoneButton);
        return (m_metadata & 0x8) != 0;
    }
    inline ButtonDirection buttonDirection() const {
        Q_ASSERT(type() == StoneButton);
        return (ButtonDirection)(m_metadata & 0x7);
    }
    inline float signPostYaw() const {
        Q_ASSERT(type() == SignPost_placed);
        return (8 - m_metadata) * 3.1415926536f / 8.0f;
    }
    inline bool isPressurePlatePressed() const {
        Q_ASSERT(type() == StonePressurePlate || type() == WoodenPressurePlate);
        return (m_metadata & 0x1) != 0;
    }

    inline WallSignMetadata wallSignMetadata() const {
        Q_ASSERT(type() == WallSign_placed);
        return (WallSignMetadata) m_metadata;
    }
    inline FurnaceMetadata furnaceMetadata() const {
        Q_ASSERT(type() == Furnace || type() == Dispenser);
        return (FurnaceMetadata) m_metadata;
    }
    inline PumpkinMetadata pumpkinMetadata() const {
        Q_ASSERT(type() == Pumpkin || type() == JackOLantern);
        return (PumpkinMetadata) m_metadata;
    }

    Block() {}
    Block(ItemType type, int metadata, int light, int sky_light) :
        m_type(type), m_metadata(metadata), m_light(light), m_sky_light(sky_light) {}

private:
    // There are usually > 13 million Blocks in memory, so keep it compact.
    unsigned m_type : 8;
    unsigned m_metadata : 4;
    unsigned m_light : 4;
    unsigned m_sky_light : 4;
};

#endif // BLOCK_H
