#ifndef BLOCK_H
#define BLOCK_H

#include <QDebug>

class Block {
public:
    #include "ItemTypeEnum.h"

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

    // 0x0 is a freshly planted sapling. The data value is
    // incremented at random intervals. When it becomes 15, a new tree is created in its place.
    inline int saplingMetadata() const {
        Q_ASSERT(type() == Sapling);
        return m_metadata;
    }

    // 0x0 is a freshly planted cactus. The data value is
    // incremented at random intervals. When it becomes 15, a new cactus block
    // is created on top as long as the total height does not exceed 3.
    inline int cactusMetadata() const {
        Q_ASSERT(type() == Cactus);
        return m_metadata;
    }

    // 0x0 is a full block. Goes up to 0x7, If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int waterMetadata() const {
        Q_ASSERT(type() == Water);
        return m_metadata;
    }

    // 0x0 is a full block. Can only go up to 0x3. If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int lavaMetadata() const {
        Q_ASSERT(type() == Lava);
        return m_metadata;
    }

    // 0x0 is dry land, 0x1-0x8 are increasing levels of
    // wetness. The wetness value depends on how far the block is away
    // from water.
    inline int farmlandMetadata() const {
        Q_ASSERT(type() == Farmland);
        return m_metadata;
    }

    // Crops Metadata: Crops grow from 0x0 to 0x7.
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
