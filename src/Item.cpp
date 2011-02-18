#include "Item.h"

#include <QDebug>

bool Item::s_initialized = false;
QHash<Item::ItemType, int> Item::s_item_stack_height;
QHash<Item::ItemType, bool> Item::s_block_is_physical;
QHash<Item::ItemType, bool> Item::s_block_is_safe;
QHash<Item::ItemType, bool> Item::s_block_is_diggable;


void Item::initializeStaticData()
{
    if (s_initialized)
        return;
    s_initialized = true;

    s_item_stack_height.insert(Item::NoItem, 0);
    s_item_stack_height.insert(Item::Air, 0);
    s_item_stack_height.insert(Item::Stone, 64);
    s_item_stack_height.insert(Item::Grass, 64);
    s_item_stack_height.insert(Item::Dirt, 64);
    s_item_stack_height.insert(Item::Cobblestone, 64);
    s_item_stack_height.insert(Item::WoodenPlank, 64);
    s_item_stack_height.insert(Item::Sapling, 64);
    s_item_stack_height.insert(Item::Bedrock, 64);
    s_item_stack_height.insert(Item::Water, 64);
    s_item_stack_height.insert(Item::StationaryWater, 64);
    s_item_stack_height.insert(Item::Lava, 64);
    s_item_stack_height.insert(Item::StationaryLava, 64);
    s_item_stack_height.insert(Item::Sand, 64);
    s_item_stack_height.insert(Item::Gravel, 64);
    s_item_stack_height.insert(Item::GoldOre, 64);
    s_item_stack_height.insert(Item::IronOre, 64);
    s_item_stack_height.insert(Item::CoalOre, 64);
    s_item_stack_height.insert(Item::Wood, 64);
    s_item_stack_height.insert(Item::Leaves, 64);
    s_item_stack_height.insert(Item::Sponge, 64);
    s_item_stack_height.insert(Item::Glass, 64);
    s_item_stack_height.insert(Item::LapisLazuliOre, 64);
    s_item_stack_height.insert(Item::LapisLazuliBlock, 64);
    s_item_stack_height.insert(Item::Dispenser, 64);
    s_item_stack_height.insert(Item::Sandstone, 64);
    s_item_stack_height.insert(Item::NoteBlock, 64);
    s_item_stack_height.insert(Item::Wool, 64);
    s_item_stack_height.insert(Item::YellowFlower, 64);
    s_item_stack_height.insert(Item::RedRose, 64);
    s_item_stack_height.insert(Item::BrownMushroom, 64);
    s_item_stack_height.insert(Item::RedMushroom, 64);
    s_item_stack_height.insert(Item::GoldBlock, 64);
    s_item_stack_height.insert(Item::IronBlock, 64);
    s_item_stack_height.insert(Item::DoubleStoneSlab, 64);
    s_item_stack_height.insert(Item::StoneSlab, 64);
    s_item_stack_height.insert(Item::Brick, 64);
    s_item_stack_height.insert(Item::Tnt, 64);
    s_item_stack_height.insert(Item::Bookshelf, 64);
    s_item_stack_height.insert(Item::MossStone, 64);
    s_item_stack_height.insert(Item::Obsidian, 64);
    s_item_stack_height.insert(Item::Torch, 64);
    s_item_stack_height.insert(Item::Fire, 64);
    s_item_stack_height.insert(Item::MonsterSpawner, 64);
    s_item_stack_height.insert(Item::WoodenStairs, 64);
    s_item_stack_height.insert(Item::Chest, 64);
    s_item_stack_height.insert(Item::RedstoneWire_placed, 64);
    s_item_stack_height.insert(Item::DiamondOre, 64);
    s_item_stack_height.insert(Item::DiamondBlock, 64);
    s_item_stack_height.insert(Item::Workbench, 64);
    s_item_stack_height.insert(Item::Crops, 64);
    s_item_stack_height.insert(Item::Farmland, 64);
    s_item_stack_height.insert(Item::Furnace, 64);
    s_item_stack_height.insert(Item::BurningFurnace, 64);
    s_item_stack_height.insert(Item::SignPost_placed, 1);
    s_item_stack_height.insert(Item::WoodenDoor_placed, 1);
    s_item_stack_height.insert(Item::Ladder, 64);
    s_item_stack_height.insert(Item::MinecartTracks, 64);
    s_item_stack_height.insert(Item::CobblestoneStairs, 64);
    s_item_stack_height.insert(Item::WallSign_placed, 1);
    s_item_stack_height.insert(Item::Lever, 64);
    s_item_stack_height.insert(Item::StonePressurePlate, 64);
    s_item_stack_height.insert(Item::IronDoor_placed, 1);
    s_item_stack_height.insert(Item::WoodenPressurePlate, 64);
    s_item_stack_height.insert(Item::RedstoneOre, 64);
    s_item_stack_height.insert(Item::GlowingRedstoneOre, 64);
    s_item_stack_height.insert(Item::RedstoneTorchOff_placed, 64);
    s_item_stack_height.insert(Item::RedstoneTorchOn, 64);
    s_item_stack_height.insert(Item::StoneButton, 64);
    s_item_stack_height.insert(Item::Snow, 64);
    s_item_stack_height.insert(Item::Ice, 64);
    s_item_stack_height.insert(Item::SnowBlock, 64);
    s_item_stack_height.insert(Item::Cactus, 64);
    s_item_stack_height.insert(Item::Clay, 64);
    s_item_stack_height.insert(Item::SugarCane_placed, 64);
    s_item_stack_height.insert(Item::Jukebox, 64);
    s_item_stack_height.insert(Item::Fence, 64);
    s_item_stack_height.insert(Item::Pumpkin, 64);
    s_item_stack_height.insert(Item::Netherrack, 64);
    s_item_stack_height.insert(Item::SoulSand, 64);
    s_item_stack_height.insert(Item::Glowstone, 64);
    s_item_stack_height.insert(Item::Portal, 0);
    s_item_stack_height.insert(Item::JackOLantern, 64);
    s_item_stack_height.insert(Item::Cake_placed, 1);

    s_item_stack_height.insert(Item::IronShovel, 1);
    s_item_stack_height.insert(Item::IronPickaxe, 1);
    s_item_stack_height.insert(Item::IronAxe, 1);
    s_item_stack_height.insert(Item::FlintAndSteel, 1);
    s_item_stack_height.insert(Item::Apple, 1);
    s_item_stack_height.insert(Item::Bow, 1);
    s_item_stack_height.insert(Item::Arrow, 64);
    s_item_stack_height.insert(Item::Coal, 64);
    s_item_stack_height.insert(Item::Diamond, 64);
    s_item_stack_height.insert(Item::IronIngot, 64);
    s_item_stack_height.insert(Item::GoldIngot, 64);
    s_item_stack_height.insert(Item::IronSword, 1);
    s_item_stack_height.insert(Item::WoodenSword, 1);
    s_item_stack_height.insert(Item::WoodenShovel, 1);
    s_item_stack_height.insert(Item::WoodenPickaxe, 1);
    s_item_stack_height.insert(Item::WoodenAxe, 1);
    s_item_stack_height.insert(Item::StoneSword, 1);
    s_item_stack_height.insert(Item::StoneShovel, 1);
    s_item_stack_height.insert(Item::StonePickaxe, 1);
    s_item_stack_height.insert(Item::StoneAxe, 1);
    s_item_stack_height.insert(Item::DiamondSword, 1);
    s_item_stack_height.insert(Item::DiamondShovel, 1);
    s_item_stack_height.insert(Item::DiamondPickaxe, 1);
    s_item_stack_height.insert(Item::DiamondAxe, 1);
    s_item_stack_height.insert(Item::Stick, 64);
    s_item_stack_height.insert(Item::Bowl, 64);
    s_item_stack_height.insert(Item::MushroomSoup, 1);
    s_item_stack_height.insert(Item::GoldSword, 1);
    s_item_stack_height.insert(Item::GoldShovel, 1);
    s_item_stack_height.insert(Item::GoldPickaxe, 1);
    s_item_stack_height.insert(Item::GoldAxe, 1);
    s_item_stack_height.insert(Item::String, 64);
    s_item_stack_height.insert(Item::Feather, 64);
    s_item_stack_height.insert(Item::Sulphur, 64);
    s_item_stack_height.insert(Item::WoodenHoe, 1);
    s_item_stack_height.insert(Item::StoneHoe, 1);
    s_item_stack_height.insert(Item::IronHoe, 1);
    s_item_stack_height.insert(Item::DiamondHoe, 1);
    s_item_stack_height.insert(Item::GoldHoe, 1);
    s_item_stack_height.insert(Item::Seeds, 64);
    s_item_stack_height.insert(Item::Wheat, 64);
    s_item_stack_height.insert(Item::Bread, 1);
    s_item_stack_height.insert(Item::LeatherHelmet, 1);
    s_item_stack_height.insert(Item::LeatherChestplate, 1);
    s_item_stack_height.insert(Item::LeatherLeggings, 1);
    s_item_stack_height.insert(Item::LeatherBoots, 1);
    s_item_stack_height.insert(Item::ChainmailHelmet, 1);
    s_item_stack_height.insert(Item::ChainmailChestplate, 1);
    s_item_stack_height.insert(Item::ChainmailLeggings, 1);
    s_item_stack_height.insert(Item::ChainmailBoots, 1);
    s_item_stack_height.insert(Item::IronHelmet, 1);
    s_item_stack_height.insert(Item::IronChestplate, 1);
    s_item_stack_height.insert(Item::IronLeggings, 1);
    s_item_stack_height.insert(Item::IronBoots, 1);
    s_item_stack_height.insert(Item::DiamondHelmet, 1);
    s_item_stack_height.insert(Item::DiamondChestplate, 1);
    s_item_stack_height.insert(Item::DiamondLeggings, 1);
    s_item_stack_height.insert(Item::DiamondBoots, 1);
    s_item_stack_height.insert(Item::GoldHelmet, 1);
    s_item_stack_height.insert(Item::GoldChestplate, 1);
    s_item_stack_height.insert(Item::GoldLeggings, 1);
    s_item_stack_height.insert(Item::GoldBoots, 1);
    s_item_stack_height.insert(Item::Flint, 1);
    s_item_stack_height.insert(Item::RawPorkchop, 1);
    s_item_stack_height.insert(Item::CookedPorkchop, 1);
    s_item_stack_height.insert(Item::Paintings, 64);
    s_item_stack_height.insert(Item::GoldenApple, 1);
    s_item_stack_height.insert(Item::Sign, 1);
    s_item_stack_height.insert(Item::WoodenDoor, 1);
    s_item_stack_height.insert(Item::Bucket, 1);
    s_item_stack_height.insert(Item::WaterBucket, 1);
    s_item_stack_height.insert(Item::LavaBucket, 1);
    s_item_stack_height.insert(Item::Minecart, 1);
    s_item_stack_height.insert(Item::Saddle, 1);
    s_item_stack_height.insert(Item::IronDoor, 1);
    s_item_stack_height.insert(Item::Redstone, 64);
    s_item_stack_height.insert(Item::Snowball, 16);
    s_item_stack_height.insert(Item::Boat, 1);
    s_item_stack_height.insert(Item::Leather, 64);
    s_item_stack_height.insert(Item::Milk, 1);
    s_item_stack_height.insert(Item::ClayBrick, 64);
    s_item_stack_height.insert(Item::ClayBalls, 64);
    s_item_stack_height.insert(Item::SugarCane, 64);
    s_item_stack_height.insert(Item::Paper, 64);
    s_item_stack_height.insert(Item::Book, 64);
    s_item_stack_height.insert(Item::Slimeball, 64);
    s_item_stack_height.insert(Item::StorageMinecart, 1);
    s_item_stack_height.insert(Item::PoweredMinecart, 1);
    s_item_stack_height.insert(Item::Egg, 16);
    s_item_stack_height.insert(Item::Compass, 64);
    s_item_stack_height.insert(Item::FishingRod, 64);
    s_item_stack_height.insert(Item::Clock, 64);
    s_item_stack_height.insert(Item::GlowstoneDust, 64);
    s_item_stack_height.insert(Item::RawFish, 1);
    s_item_stack_height.insert(Item::CookedFish, 1);
    s_item_stack_height.insert(Item::InkSac, 64);
    s_item_stack_height.insert(Item::Bone, 64);
    s_item_stack_height.insert(Item::Sugar, 64);
    s_item_stack_height.insert(Item::Cake, 1);
    s_item_stack_height.insert(Item::GoldMusicDisc, 1);
    s_item_stack_height.insert(Item::GreenMusicDisc, 1);



    s_block_is_physical.insert(Item::Stone, true);
    s_block_is_physical.insert(Item::Grass, true);
    s_block_is_physical.insert(Item::Dirt, true);
    s_block_is_physical.insert(Item::Cobblestone, true);
    s_block_is_physical.insert(Item::WoodenPlank, true);
    s_block_is_physical.insert(Item::Sapling, true);
    s_block_is_physical.insert(Item::Bedrock, true);
    s_block_is_physical.insert(Item::Sand, true);
    s_block_is_physical.insert(Item::Gravel, true);
    s_block_is_physical.insert(Item::GoldOre, true);
    s_block_is_physical.insert(Item::IronOre, true);
    s_block_is_physical.insert(Item::CoalOre, true);
    s_block_is_physical.insert(Item::Wood, true);
    s_block_is_physical.insert(Item::Leaves, true);
    s_block_is_physical.insert(Item::Sponge, true);
    s_block_is_physical.insert(Item::Glass, true);
    s_block_is_physical.insert(Item::LapisLazuliOre, true);
    s_block_is_physical.insert(Item::LapisLazuliBlock, true);
    s_block_is_physical.insert(Item::Dispenser, true);
    s_block_is_physical.insert(Item::Sandstone, true);
    s_block_is_physical.insert(Item::NoteBlock, true);
    s_block_is_physical.insert(Item::Wool, true);
    s_block_is_physical.insert(Item::GoldBlock, true);
    s_block_is_physical.insert(Item::IronBlock, true);
    s_block_is_physical.insert(Item::DoubleStoneSlab, true);
    s_block_is_physical.insert(Item::StoneSlab, true);
    s_block_is_physical.insert(Item::Brick, true);
    s_block_is_physical.insert(Item::Tnt, true);
    s_block_is_physical.insert(Item::Bookshelf, true);
    s_block_is_physical.insert(Item::MossStone, true);
    s_block_is_physical.insert(Item::Obsidian, true);
    s_block_is_physical.insert(Item::MonsterSpawner, true);
    s_block_is_physical.insert(Item::WoodenStairs, true);
    s_block_is_physical.insert(Item::Chest, true);
    s_block_is_physical.insert(Item::DiamondOre, true);
    s_block_is_physical.insert(Item::DiamondBlock, true);
    s_block_is_physical.insert(Item::Workbench, true);
    s_block_is_physical.insert(Item::Farmland, true);
    s_block_is_physical.insert(Item::Furnace, true);
    s_block_is_physical.insert(Item::BurningFurnace, true);
    s_block_is_physical.insert(Item::WoodenDoor_placed, true);
    s_block_is_physical.insert(Item::Ladder, true);
    s_block_is_physical.insert(Item::CobblestoneStairs, true);
    s_block_is_physical.insert(Item::IronDoor_placed, true);
    s_block_is_physical.insert(Item::RedstoneOre, true);
    s_block_is_physical.insert(Item::GlowingRedstoneOre, true);
    s_block_is_physical.insert(Item::Ice, true);
    s_block_is_physical.insert(Item::SnowBlock, true);
    s_block_is_physical.insert(Item::Cactus, true);
    s_block_is_physical.insert(Item::Clay, true);
    s_block_is_physical.insert(Item::Jukebox, true);
    s_block_is_physical.insert(Item::Fence, true);
    s_block_is_physical.insert(Item::Pumpkin, true);
    s_block_is_physical.insert(Item::Netherrack, true);
    s_block_is_physical.insert(Item::SoulSand, true);
    s_block_is_physical.insert(Item::Glowstone, true);
    s_block_is_physical.insert(Item::Portal, 0);
    s_block_is_physical.insert(Item::JackOLantern, true);
    s_block_is_physical.insert(Item::Cake_placed, true);

    foreach (Item::ItemType item_type, s_block_is_physical.keys())
        s_block_is_safe.insert(item_type, !s_block_is_physical.value(item_type, false));
    s_block_is_safe.insert(Item::Lava, false);
    s_block_is_safe.insert(Item::StationaryLava, false);
    s_block_is_safe.insert(Item::Fire, false);

    s_block_is_diggable.insert(Item::Air, false);
    s_block_is_diggable.insert(Item::Bedrock, false);
    s_block_is_diggable.insert(Item::Water, false);
    s_block_is_diggable.insert(Item::StationaryWater, false);
    s_block_is_diggable.insert(Item::Lava, false);
    s_block_is_diggable.insert(Item::StationaryLava, false);
    s_block_is_diggable.insert(Item::Fire, false);
    s_block_is_diggable.insert(Item::Portal, false);
}

int Item::itemStackHeight(Item::ItemType item)
{
    initializeStaticData();
    return s_item_stack_height.value(item, -1);
}
bool Item::blockIsPhysical(Item::ItemType item)
{
    initializeStaticData();
    return s_block_is_physical.value(item, false);
}
bool Item::blockIsSafe(Item::ItemType item)
{
    initializeStaticData();
    return s_block_is_safe.value(item, true);
}
bool Item::blockIsDiggable(Item::ItemType item)
{
    initializeStaticData();
    return s_block_is_diggable.value(item, true);
}
