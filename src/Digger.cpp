#include "Digger.h"
#include "Game.h"

Digger::Digger(Game * game, QObject *parent) :
    QObject(parent),
    m_sum(0),
    m_tool(Item::NoItem),
    m_block(Item::NoItem),
    m_timer(),
    m_game(game)
{
    m_timer.setInterval(1000 / 20);
    bool success;
    success = connect(&m_timer, SIGNAL(timeout()), this, SLOT(tick()));
    Q_ASSERT(success);

    m_harvest_level.insert(Item::WoodMaterial, 0);
    m_harvest_level.insert(Item::StoneMaterial, 1);
    m_harvest_level.insert(Item::IronMaterial, 2);
    m_harvest_level.insert(Item::DiamondMaterial, 3);
    m_harvest_level.insert(Item::GoldMaterial, 0);

    m_tool_effectiveness.insert(Item::WoodMaterial, 2.0f);
    m_tool_effectiveness.insert(Item::StoneMaterial, 4.0f);
    m_tool_effectiveness.insert(Item::IronMaterial, 6.0f);
    m_tool_effectiveness.insert(Item::DiamondMaterial, 8.0f);
    m_tool_effectiveness.insert(Item::GoldMaterial, 12.0f);

    QSet<Item::ItemType> pick_blocks;
    pick_blocks.insert(Item::Cobblestone);
    pick_blocks.insert(Item::DoubleSlab);
    pick_blocks.insert(Item::Slab);
    pick_blocks.insert(Item::Stone);
    pick_blocks.insert(Item::Sandstone);
    pick_blocks.insert(Item::MossStone);
    pick_blocks.insert(Item::IronOre);
    pick_blocks.insert(Item::IronBlock);
    pick_blocks.insert(Item::CoalOre);
    pick_blocks.insert(Item::GoldBlock);
    pick_blocks.insert(Item::GoldOre);
    pick_blocks.insert(Item::DiamondOre);
    pick_blocks.insert(Item::DiamondBlock);
    pick_blocks.insert(Item::Ice);
    pick_blocks.insert(Item::Netherrack);
    pick_blocks.insert(Item::LapisLazuliOre);
    pick_blocks.insert(Item::LapisLazuliBlock);
    m_tool_effective_against.insert(Pickaxe, pick_blocks);

    QSet<Item::ItemType> axe_blocks;
    axe_blocks.insert(Item::WoodenPlank);
    axe_blocks.insert(Item::Bookshelf);
    axe_blocks.insert(Item::Wood);
    axe_blocks.insert(Item::Chest);
    m_tool_effective_against.insert(Axe, axe_blocks);

    QSet<Item::ItemType> shovel_blocks;
    shovel_blocks.insert(Item::Grass);
    shovel_blocks.insert(Item::Dirt);
    shovel_blocks.insert(Item::Sand);
    shovel_blocks.insert(Item::Gravel);
    shovel_blocks.insert(Item::Snow);
    shovel_blocks.insert(Item::SnowBlock);
    shovel_blocks.insert(Item::Clay);
    m_tool_effective_against.insert(Shovel, shovel_blocks);

}

bool Digger::itemCanHarvest(Item::ItemType tool, Item::ItemType block_type) const
{
    const Item::ItemData * item_data = Item::itemData(block_type);
    if (item_data->material != Item::StoneMaterial &&
        item_data->material != Item::IronMaterial &&
        item_data->material != Item::SnowMaterial &&
        item_data->material != Item::SnowBlockMaterial)
    {
        return true;
    }

    ToolType tool_type = toolType(tool);
    switch (tool_type) {
    case Pickaxe:
        if (item_data->material == Item::StoneMaterial)
            return true;
        if (item_data->material == Item::IronMaterial)
            return true;

        switch(m_harvest_level.value(Item::itemData(tool)->material, 0)) {
        case 3:
            if (block_type == Item::Obsidian)
                return true;
            // fall through
        case 2:
            if (block_type == Item::DiamondBlock)
                return true;
            if (block_type == Item::DiamondOre)
                return true;
            if (block_type == Item::GoldBlock)
                return true;
            if (block_type == Item::GoldOre)
                return true;
            if (block_type == Item::RedstoneOre)
                return true;
            if (block_type == Item::GlowingRedstoneOre)
                return true;
            // fall through
        case 1:
            if (block_type == Item::IronBlock)
                return true;
            if (block_type == Item::IronOre)
                return true;
            if (block_type == Item::LapisLazuliBlock)
                return true;
            if (block_type == Item::LapisLazuliOre)
                return true;
            // fall through
        }

        return false;

    case Shovel:
        if (block_type == Item::Snow)
            return true;
        if (block_type == Item::SnowBlock)
            return true;

        return false;

    case Axe:
    case NoTool:
        return false;
    }
    Q_ASSERT(false);
    return false;
}

Digger::ToolType Digger::toolType(Item::ItemType tool) const
{
    switch (tool) {
    case Item::WoodenPickaxe:
    case Item::StonePickaxe:
    case Item::IronPickaxe:
    case Item::DiamondPickaxe:
    case Item::GoldPickaxe:
        return Pickaxe;

    case Item::WoodenShovel:
    case Item::StoneShovel:
    case Item::IronShovel:
    case Item::DiamondShovel:
    case Item::GoldShovel:
        return Shovel;

    case Item::WoodenAxe:
    case Item::StoneAxe:
    case Item::IronAxe:
    case Item::DiamondAxe:
    case Item::GoldAxe:
        return Axe;

    default:
        return NoTool;
    }
}


float Digger::strengthVsBlock(Item::ItemType tool, Item::ItemType block, bool underwater, bool on_ground)
{
    const Item::ItemData * tool_data = Item::itemData(tool);
    const Item::ItemData * block_data = Item::itemData(block);


    if (block_data->hardness < 0)
        return 0;
    if (! itemCanHarvest(tool, block))
        return 1.0f / block_data->hardness / 100.0f;

    float multiplier = 1.0f;

    if (m_tool_effective_against.value(toolType(tool)).contains(block))
        multiplier *= m_tool_effectiveness.value(tool_data->material, 1.0f);
    if (underwater)
        multiplier /= 5.0f;
    if (! on_ground)
        multiplier /= 5.0f;

    return multiplier / block_data->hardness / 30.0f;
}

void Digger::start(Item::ItemType tool, Item::ItemType block)
{
    stop();
    m_sum = 0;
    m_tool = tool;
    m_block = block;
    m_timer.start();
}

void Digger::tick()
{
    Server::EntityPosition pos = m_game->playerPosition();
    Item::ItemType block_at_type = m_game->blockAt(Int3D(pos.pos.x, pos.pos.y, pos.pos.z + 1)).type();
    m_sum += strengthVsBlock(m_tool, m_block, block_at_type == Item::Water, pos.on_ground);
    if (m_sum >= 1.0f) {
        stop();
        emit finished();
    }
}

void Digger::stop()
{
    m_timer.stop();
}
