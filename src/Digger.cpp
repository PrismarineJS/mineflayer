#include "Digger.h"
#include "Game.h"

#include "mineflayer-core.h"

Digger::Digger(Game * game, QObject *parent) :
    QObject(parent),
    m_sum(0),
    m_tool(mineflayer_NoItem),
    m_block(mineflayer_NoItem),
    m_timer(),
    m_game(game)
{
    m_timer.setInterval(1000 / 20);
    bool success;
    success = connect(&m_timer, SIGNAL(timeout()), this, SLOT(tick()));
    Q_ASSERT(success);

    m_harvest_level.insert(mineflayer_WoodMaterial, 0);
    m_harvest_level.insert(mineflayer_StoneMaterial, 1);
    m_harvest_level.insert(mineflayer_IronMaterial, 2);
    m_harvest_level.insert(mineflayer_DiamondMaterial, 3);
    m_harvest_level.insert(mineflayer_GoldMaterial, 0);

    m_tool_effectiveness.insert(mineflayer_WoodMaterial, 2.0f);
    m_tool_effectiveness.insert(mineflayer_StoneMaterial, 4.0f);
    m_tool_effectiveness.insert(mineflayer_IronMaterial, 6.0f);
    m_tool_effectiveness.insert(mineflayer_DiamondMaterial, 8.0f);
    m_tool_effectiveness.insert(mineflayer_GoldMaterial, 12.0f);

    QSet<ItemType> pick_blocks;
    pick_blocks.insert(mineflayer_CobblestoneItem);
    pick_blocks.insert(mineflayer_DoubleSlabItem);
    pick_blocks.insert(mineflayer_SlabItem);
    pick_blocks.insert(mineflayer_StoneItem);
    pick_blocks.insert(mineflayer_SandstoneItem);
    pick_blocks.insert(mineflayer_MossStoneItem);
    pick_blocks.insert(mineflayer_IronOreItem);
    pick_blocks.insert(mineflayer_IronBlockItem);
    pick_blocks.insert(mineflayer_CoalOreItem);
    pick_blocks.insert(mineflayer_GoldBlockItem);
    pick_blocks.insert(mineflayer_GoldOreItem);
    pick_blocks.insert(mineflayer_DiamondOreItem);
    pick_blocks.insert(mineflayer_DiamondBlockItem);
    pick_blocks.insert(mineflayer_IceItem);
    pick_blocks.insert(mineflayer_NetherrackItem);
    pick_blocks.insert(mineflayer_LapisLazuliOreItem);
    pick_blocks.insert(mineflayer_LapisLazuliBlockItem);
    m_tool_effective_against.insert(Pickaxe, pick_blocks);

    QSet<ItemType> axe_blocks;
    axe_blocks.insert(mineflayer_WoodenPlankItem);
    axe_blocks.insert(mineflayer_BookshelfItem);
    axe_blocks.insert(mineflayer_WoodItem);
    axe_blocks.insert(mineflayer_ChestItem);
    m_tool_effective_against.insert(Axe, axe_blocks);

    QSet<ItemType> shovel_blocks;
    shovel_blocks.insert(mineflayer_GrassItem);
    shovel_blocks.insert(mineflayer_DirtItem);
    shovel_blocks.insert(mineflayer_SandItem);
    shovel_blocks.insert(mineflayer_GravelItem);
    shovel_blocks.insert(mineflayer_SnowItem);
    shovel_blocks.insert(mineflayer_SnowBlockItem);
    shovel_blocks.insert(mineflayer_ClayItem);
    m_tool_effective_against.insert(Shovel, shovel_blocks);

}

bool Digger::itemCanHarvest(ItemType tool, ItemType block_type) const
{
    const ItemData * item_data = Item::itemData(block_type);
    if (item_data->material != mineflayer_StoneMaterial &&
        item_data->material != mineflayer_IronMaterial &&
        item_data->material != mineflayer_SnowMaterial &&
        item_data->material != mineflayer_SnowBlockMaterial)
    {
        return true;
    }

    ToolType tool_type = toolType(tool);
    switch (tool_type) {
    case Pickaxe:
        if (item_data->material == mineflayer_StoneMaterial)
            return true;
        if (item_data->material == mineflayer_IronMaterial)
            return true;

        switch(m_harvest_level.value(Item::itemData(tool)->material, 0)) {
        case 3:
            if (block_type == mineflayer_ObsidianItem)
                return true;
            // fall through
        case 2:
            if (block_type == mineflayer_DiamondBlockItem)
                return true;
            if (block_type == mineflayer_DiamondOreItem)
                return true;
            if (block_type == mineflayer_GoldBlockItem)
                return true;
            if (block_type == mineflayer_GoldOreItem)
                return true;
            if (block_type == mineflayer_RedstoneOreItem)
                return true;
            if (block_type == mineflayer_GlowingRedstoneOreItem)
                return true;
            // fall through
        case 1:
            if (block_type == mineflayer_IronBlockItem)
                return true;
            if (block_type == mineflayer_IronOreItem)
                return true;
            if (block_type == mineflayer_LapisLazuliBlockItem)
                return true;
            if (block_type == mineflayer_LapisLazuliOreItem)
                return true;
            // fall through
        }

        return false;

    case Shovel:
        if (block_type == mineflayer_SnowItem)
            return true;
        if (block_type == mineflayer_SnowBlockItem)
            return true;

        return false;

    case Axe:
    case NoTool:
        return false;
    }
    Q_ASSERT(false);
    return false;
}

Digger::ToolType Digger::toolType(ItemType tool) const
{
    switch (tool) {
    case mineflayer_WoodenPickaxeItem:
    case mineflayer_StonePickaxeItem:
    case mineflayer_IronPickaxeItem:
    case mineflayer_DiamondPickaxeItem:
    case mineflayer_GoldPickaxeItem:
        return Pickaxe;

    case mineflayer_WoodenShovelItem:
    case mineflayer_StoneShovelItem:
    case mineflayer_IronShovelItem:
    case mineflayer_DiamondShovelItem:
    case mineflayer_GoldShovelItem:
        return Shovel;

    case mineflayer_WoodenAxeItem:
    case mineflayer_StoneAxeItem:
    case mineflayer_IronAxeItem:
    case mineflayer_DiamondAxeItem:
    case mineflayer_GoldAxeItem:
        return Axe;

    default:
        return NoTool;
    }
}


float Digger::strengthVsBlock(ItemType tool, ItemType block, bool underwater, bool on_ground)
{
    const ItemData * tool_data = Item::itemData(tool);
    const ItemData * block_data = Item::itemData(block);


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

void Digger::start(ItemType tool, ItemType block)
{
    stop();
    m_sum = 0;
    m_tool = tool;
    m_block = block;
    m_timer.start();
}

void Digger::tick()
{
    EntityPosition pos = m_game->playerPosition();
    ItemType block_at_type = m_game->blockAt(Int3D(pos.pos.x, pos.pos.y, pos.pos.z + 1)).type();
    m_sum += strengthVsBlock(m_tool, m_block, block_at_type == mineflayer_WaterItem, pos.on_ground);
    if (m_sum >= 1.0f) {
        stop();
        emit finished();
    }
}

void Digger::stop()
{
    m_timer.stop();
}
