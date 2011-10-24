#ifndef BLOCK_H
#define BLOCK_H

#include <QDebug>
#include "Item.h"

class Block {
public:
    inline void setType(mineflayer_ItemType type) {
        Q_ASSERT((uint)type <= 0xff);
        data.type = type;
    }
    inline mineflayer_ItemType type() const { return (mineflayer_ItemType)data.type; }

    // [0, 15] - how much light from non-skylight
    inline void setLight(int light) {
        Q_ASSERT((uint)light <= 0xf);
        data.light = light;
    }
    inline int light() const { return data.light; }

    // [0, 15] - how much light would be on the block from the sun if it was day
    inline void setSkyLight(int sky_light) {
        Q_ASSERT((uint)sky_light <= 0xf);
        data.sky_light = sky_light;
    }
    inline int skyLight() const { return data.sky_light; }

    inline void setMetadata(int metadata) {
        Q_ASSERT((uint)metadata <= 0xf);
        data.metadata = metadata;
    }

    // specific metadata getters
    inline Item::WoodMetadata woodMetadata() const {
        Q_ASSERT(type() == mineflayer_WoodItem);
        return (Item::WoodMetadata) data.metadata;
    }
    inline Item::LeavesMetadata leavesMetadata() const {
        Q_ASSERT(type() == mineflayer_LeavesItem);
        return (Item::LeavesMetadata) data.metadata;
    }
    inline Item::CoalMetadata coalMetadata() const {
        Q_ASSERT(type() == mineflayer_CoalItem);
        return (Item::CoalMetadata) data.metadata;
    }

    // 0x0 is a freshly planted sapling. The data value is
    // incremented at random intervals. When it becomes 15, a new tree is created in its place.
    inline int saplingMetadata() const {
        Q_ASSERT(type() == mineflayer_SaplingItem);
        return data.metadata;
    }

    // 0x0 is a freshly planted cactus. The data value is
    // incremented at random intervals. When it becomes 15, a new cactus block
    // is created on top as long as the total height does not exceed 3.
    inline int cactusMetadata() const {
        Q_ASSERT(type() == mineflayer_CactusItem);
        return data.metadata;
    }

    // 0x0 is a full block. Goes up to 0x7, If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int waterMetadata() const {
        Q_ASSERT(type() == mineflayer_WaterItem);
        return data.metadata;
    }

    // 0x0 is a full block. Can only go up to 0x3. If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int lavaMetadata() const {
        Q_ASSERT(type() == mineflayer_LavaItem);
        return data.metadata;
    }

    // 0x0 is dry land, 0x1-0x8 are increasing levels of
    // wetness. The wetness value depends on how far the block is away
    // from water.
    inline int farmlandMetadata() const {
        Q_ASSERT(type() == mineflayer_FarmlandItem);
        return data.metadata;
    }

    // Crops Metadata: Crops grow from 0x0 to 0x7.
    inline int cropsMetadata() const {
        Q_ASSERT(type() == mineflayer_CropsItem);
        return data.metadata;
    }
    inline Item::WoolMetadata woolMetadata() const {
        Q_ASSERT(type() == mineflayer_WoolItem);
        return (Item::WoolMetadata) data.metadata;
    }

    inline Item::DyeMetadata dyeMetadata() const {
        Q_ASSERT(type() == mineflayer_InkSacItem);
        return (Item::DyeMetadata) data.metadata;
    }

    inline Item::TorchMetadata torchMetadata() const {
        Q_ASSERT(type() == mineflayer_TorchItem);
        return (Item::TorchMetadata) data.metadata;
    }

    inline int redstoneMetadata() const {
        Q_ASSERT(type() == mineflayer_RedstoneWire_placedItem);
        return data.metadata;
    }

    inline Item::MinecartTrackMetadata minecartTrackMetadata() const {
        Q_ASSERT(type() == mineflayer_MinecartTracksItem);
        return (Item::MinecartTrackMetadata) data.metadata;
    }

    inline Item::LadderMetadata ladderMetadata() const {
        Q_ASSERT(type() == mineflayer_LadderItem);
        return (Item::LadderMetadata) data.metadata;
    }

    inline Item::StairsMetadata stairsMetadata() const {
        Q_ASSERT(type() == mineflayer_WoodenStairsItem || type() == mineflayer_CobblestoneStairsItem);
        return (Item::StairsMetadata) data.metadata;
    }

    inline bool leverState() const {
        Q_ASSERT(type() == mineflayer_LeverItem);
        return (data.metadata & 0x8) != 0;
    }
    inline Item::LeverPosition leverPosition() const {
        Q_ASSERT(type() == mineflayer_LeverItem);
        return (Item::LeverPosition)(data.metadata & 0x7);
    }
    inline bool isTopDoorHalf() const {
        Q_ASSERT(type() == mineflayer_WoodenDoor_placedItem || type() == mineflayer_IronDoor_placedItem);
        return (data.metadata & 0x8) != 0;
    }
    inline bool isDoorOpen() const {
        Q_ASSERT(type() == mineflayer_WoodenDoor_placedItem || type() == mineflayer_IronDoor_placedItem);
        return (data.metadata & 0x4) != 0;
    }
    inline Item::DoorHingeLocation doorHingeLocation() const {
        Q_ASSERT(type() == mineflayer_WoodenDoor_placedItem || type() == mineflayer_IronDoor_placedItem);
        return (Item::DoorHingeLocation)(data.metadata & 0x3);
    }
    inline bool isButtonPressed() const {
        Q_ASSERT(type() == mineflayer_StoneButtonItem);
        return (data.metadata & 0x8) != 0;
    }
    inline Item::ButtonDirection buttonDirection() const {
        Q_ASSERT(type() == mineflayer_StoneButtonItem);
        return (Item::ButtonDirection)(data.metadata & 0x7);
    }
    inline float signPostYaw() const {
        Q_ASSERT(type() == mineflayer_SignPost_placedItem);
        return (8 - data.metadata) * 3.1415926536f / 8.0f;
    }
    inline bool isPressurePlatePressed() const {
        Q_ASSERT(type() == mineflayer_StonePressurePlateItem || type() == mineflayer_WoodenPressurePlateItem);
        return (data.metadata & 0x1) != 0;
    }

    inline Item::WallSignMetadata wallSignMetadata() const {
        Q_ASSERT(type() == mineflayer_WallSign_placedItem);
        return (Item::WallSignMetadata) data.metadata;
    }
    inline Item::FurnaceMetadata furnaceMetadata() const {
        Q_ASSERT(type() == mineflayer_FurnaceItem || type() == mineflayer_BurningFurnaceItem || type() == mineflayer_DispenserItem);
        return (Item::FurnaceMetadata) data.metadata;
    }
    inline Item::PumpkinMetadata pumpkinMetadata() const {
        Q_ASSERT(type() == mineflayer_PumpkinItem || type() == mineflayer_JackOLanternItem);
        return (Item::PumpkinMetadata) data.metadata;
    }

    Block() {}
    Block(mineflayer_ItemType type, int metadata, int light, int sky_light) {
        data.type = type;
        data.metadata = metadata;
        data.light = light;
        data.sky_light = sky_light;
    }

    // There are usually > 13 million Blocks in memory, so keep it compact.
    mineflayer_Block data;
};

#endif // BLOCK_H
