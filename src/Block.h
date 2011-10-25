#ifndef BLOCK_H
#define BLOCK_H

#include <QDebug>
#include "Item.h"

class Block {
public:
    inline void setType(Item::ItemType type) {
        Q_ASSERT((uint)type <= 0xff);
        m_type = type;
    }
    inline Item::ItemType type() const { return (Item::ItemType)m_type; }

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
    inline Item::WoodMetadata woodMetadata() const {
        Q_ASSERT(type() == Item::Wood);
        return (Item::WoodMetadata) m_metadata;
    }
    inline Item::LeavesMetadata leavesMetadata() const {
        Q_ASSERT(type() == Item::Leaves);
        return (Item::LeavesMetadata) m_metadata;
    }
    inline Item::CoalMetadata coalMetadata() const {
        Q_ASSERT(type() == Item::Coal);
        return (Item::CoalMetadata) m_metadata;
    }

    // 0x0 is a freshly planted sapling. The data value is
    // incremented at random intervals. When it becomes 15, a new tree is created in its place.
    inline int saplingMetadata() const {
        Q_ASSERT(type() == Item::Sapling);
        return m_metadata;
    }

    // 0x0 is a freshly planted cactus. The data value is
    // incremented at random intervals. When it becomes 15, a new cactus block
    // is created on top as long as the total height does not exceed 3.
    inline int cactusMetadata() const {
        Q_ASSERT(type() == Item::Cactus);
        return m_metadata;
    }

    // 0x0 is a full block. Goes up to 0x7, If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int waterMetadata() const {
        Q_ASSERT(type() == Item::Water);
        return m_metadata;
    }

    // 0x0 is a full block. Can only go up to 0x3. If bit 0x8 is set,
    // this liquid is "falling" and only spreads downward.
    inline int lavaMetadata() const {
        Q_ASSERT(type() == Item::Lava);
        return m_metadata;
    }

    // 0x0 is dry land, 0x1-0x8 are increasing levels of
    // wetness. The wetness value depends on how far the block is away
    // from water.
    inline int farmlandMetadata() const {
        Q_ASSERT(type() == Item::Farmland);
        return m_metadata;
    }

    // Crops Metadata: Crops grow from 0x0 to 0x7.
    inline int cropsMetadata() const {
        Q_ASSERT(type() == Item::Crops);
        return m_metadata;
    }
    inline Item::WoolMetadata woolMetadata() const {
        Q_ASSERT(type() == Item::Wool);
        return (Item::WoolMetadata) m_metadata;
    }

    inline Item::DyeMetadata dyeMetadata() const {
        Q_ASSERT(type() == Item::InkSac);
        return (Item::DyeMetadata) m_metadata;
    }

    inline Item::TorchMetadata torchMetadata() const {
        Q_ASSERT(type() == Item::Torch);
        return (Item::TorchMetadata) m_metadata;
    }

    inline int redstoneMetadata() const {
        Q_ASSERT(type() == Item::RedstoneWire_placed);
        return m_metadata;
    }

    inline Item::MinecartTrackMetadata minecartTrackMetadata() const {
        Q_ASSERT(type() == Item::MinecartTracks);
        return (Item::MinecartTrackMetadata) m_metadata;
    }

    inline Item::LadderMetadata ladderMetadata() const {
        Q_ASSERT(type() == Item::Ladder);
        return (Item::LadderMetadata) m_metadata;
    }

    inline Item::StairsMetadata stairsMetadata() const {
        Q_ASSERT(type() == Item::WoodenStairs || type() == Item::CobblestoneStairs);
        return (Item::StairsMetadata) m_metadata;
    }

    inline bool leverState() const {
        Q_ASSERT(type() == Item::Lever);
        return (m_metadata & 0x8) != 0;
    }
    inline Item::LeverPosition leverPosition() const {
        Q_ASSERT(type() == Item::Lever);
        return (Item::LeverPosition)(m_metadata & 0x7);
    }
    inline bool isTopDoorHalf() const {
        Q_ASSERT(type() == Item::WoodenDoor_placed || type() == Item::IronDoor_placed);
        return (m_metadata & 0x8) != 0;
    }
    inline bool isDoorOpen() const {
        Q_ASSERT(type() == Item::WoodenDoor_placed || type() == Item::IronDoor_placed);
        return (m_metadata & 0x4) != 0;
    }
    inline Item::DoorHingeLocation doorHingeLocation() const {
        Q_ASSERT(type() == Item::WoodenDoor_placed || type() == Item::IronDoor_placed);
        return (Item::DoorHingeLocation)(m_metadata & 0x3);
    }
    inline bool isButtonPressed() const {
        Q_ASSERT(type() == Item::StoneButton);
        return (m_metadata & 0x8) != 0;
    }
    inline Item::ButtonDirection buttonDirection() const {
        Q_ASSERT(type() == Item::StoneButton);
        return (Item::ButtonDirection)(m_metadata & 0x7);
    }
    inline float signPostYaw() const {
        Q_ASSERT(type() == Item::SignPost_placed);
        return (8 - m_metadata) * 3.1415926536f / 8.0f;
    }
    inline bool isPressurePlatePressed() const {
        Q_ASSERT(type() == Item::StonePressurePlate || type() == Item::WoodenPressurePlate);
        return (m_metadata & 0x1) != 0;
    }

    inline Item::WallSignMetadata wallSignMetadata() const {
        Q_ASSERT(type() == Item::WallSign_placed);
        return (Item::WallSignMetadata) m_metadata;
    }
    inline Item::FurnaceMetadata furnaceMetadata() const {
        Q_ASSERT(type() == Item::Furnace || type() == Item::BurningFurnace || type() == Item::Dispenser);
        return (Item::FurnaceMetadata) m_metadata;
    }
    inline Item::PumpkinMetadata pumpkinMetadata() const {
        Q_ASSERT(type() == Item::Pumpkin || type() == Item::JackOLantern);
        return (Item::PumpkinMetadata) m_metadata;
    }

    Block() {}
    Block(Item::ItemType type, int metadata, int light, int sky_light) {
        m_type = type;
        m_metadata = metadata;
        m_light = light;
        m_sky_light = sky_light;
    }

    // There are usually > 13 million Blocks in memory, so keep it compact.
    unsigned m_type : 8;
    unsigned m_metadata : 4;
    unsigned m_light : 4;
    unsigned m_sky_light : 4;
};

#endif // BLOCK_H
