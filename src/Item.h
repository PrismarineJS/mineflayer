#ifndef ITEM_H
#define ITEM_H

#include <QHash>

class Item {
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
    ItemType type;
    qint8 count;
    qint16 metadata;


private:
    static bool s_initialized;

    static QHash<Item::ItemType, int> s_item_stack_height;
    static QHash<Item::ItemType, bool> s_block_is_physical;
    static QHash<Item::ItemType, bool> s_block_is_safe;

public:
    static void initializeStaticData();
    static int itemStackHeight(Item::ItemType item);
    static bool blockIsPhysical(Item::ItemType item);
    static bool blockIsSafe(Item::ItemType item);

};







#endif // ITEM_H
