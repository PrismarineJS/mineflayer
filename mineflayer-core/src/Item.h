#ifndef ITEM_H
#define ITEM_H

#include <QSize>
#include <QVector>

#include "mineflayer-core.h"

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
    mineflayer_Item data;

    // for hashing purposes. we only check type and metadata, not count.
    bool operator ==(const Item & other) const;

public:

    static void initializeStaticData();
    static void setJesusModeEnabled(bool value);
    inline static mineflayer_ItemData * itemData(mineflayer_ItemType item_id) { return s_item_data.value(item_id, NULL); }
    inline static const QHash<mineflayer_ItemType, mineflayer_ItemData *> * itemDataHash() { return &s_item_data; }

    static const _Item::Recipe * recipeFor(const _Item::Recipe & recipe);
    inline static QList<_Item::Recipe *> recipesToMake(const Item & item) { return s_item_recipe.values(item); }

    Item() { data.type = mineflayer_NoItem; data.count = 0; data.metadata = 0; }

private:
    static bool s_initialized;

    // material name -> material enum value
    static QHash<QString, mineflayer_Material> s_materials;

    static QHash<mineflayer_ItemType, mineflayer_ItemData *> s_item_data;
    static QHash<QString, mineflayer_ItemData *> s_item_by_name;

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
