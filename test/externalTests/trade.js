const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)

  const villagerType = bot.registry.entitiesByName.villager ? 'villager' : 'Villager'
  const testFluctuations = bot.supportFeature('selectingTradeMovesItems')
  const summonCommand = bot.supportFeature('indexesVillagerRecipes')
    ? `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[0:{maxUses:7,buy:{id:"minecraft:emerald",Count:2},sell:{id:"minecraft:pumpkin_pie",Count:2},uses: 1},1:{maxUses:7,buy:{id:"minecraft:emerald",Count:2},buyB:{id:"minecraft:pumpkin_pie",Count:2},sell:{id:"minecraft:wheat",Count:2}, uses:1}]}}`
    : `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[{maxUses:7,buy:{id:"minecraft:emerald",Count:2},sell:{id:"minecraft:pumpkin_pie",Count:2},${testFluctuations ? 'demand:60,priceMultiplier:0.05f,specialPrice:-4,' : ''}uses: 1},{maxUses:7,buy:{id:"minecraft:emerald",Count:2},buyB:{id:"minecraft:pumpkin_pie",Count:2},sell:{id:"minecraft:wheat",Count:2}, uses:1}]}}`

  const commandBlockPos = bot.entity.position.offset(0.5, 0, 0.5)
  const redstoneBlockPos = commandBlockPos.offset(1, 0, 0)

  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.emerald.id, 64, 0))

  // A command block is needed to spawn the villager due to the chat's character limit in some versions
  bot.test.sayEverywhere(`/setblock ${commandBlockPos.toArray().join(' ')} command_block`)
  await bot.test.wait(500)
  bot.setCommandBlock(commandBlockPos, summonCommand)
  bot.test.sayEverywhere(`/setblock ${redstoneBlockPos.toArray().join(' ')} redstone_block`) // Activate the command block

  const [entity] = await once(bot, 'entitySpawn')
  assert(entity.name === villagerType)

  const villager = await bot.openVillager(entity)
  for (const [index, trade] of villager.trades.entries()) {
    const sell1 = trade.inputItem1
    const sell2 = trade.inputItem2
    const buy = trade.outputItem

    assert.notStrictEqual(sell1, null)
    assert.notStrictEqual(buy, null)
    assert.strictEqual(trade.nbTradeUses, 1)
    assert.strictEqual(trade.maximumNbTradeUses, 7)
    assert.strictEqual(trade.tradeDisabled, false)

    if (index === 0) {
      assert(trade.inputItem2 === null || (trade.inputItem2.type === undefined && trade.inputItem2.count === undefined)) // In some versions it returns null in others it returns an empty Item instance
    } else {
      assert.strictEqual(sell2.count, 2)
      assert.strictEqual(sell2.name, 'pumpkin_pie')
    }
    assert.strictEqual(sell1.name, 'emerald')
    assert.strictEqual(sell1.count, 2)
    assert.strictEqual(buy.name, index ? 'wheat' : 'pumpkin_pie')
    assert.strictEqual(buy.count, 2)

    const printCountInv = function (item) {
      return `${bot.currentWindow.count(bot.registry.itemsByName[item.name].id)}x ${item.displayName}`
    }
    const printCountTrade = function (item) {
      return `${item.count}x ${item.displayName}`
    }
    bot.test.sayEverywhere(`I have ${printCountInv(sell1)} ${trade.hasItem2 ? 'and ' + printCountInv(sell2) : ''}`)
    bot.test.sayEverywhere(`I can trade ${printCountTrade(sell1)} ${trade.hasItem2 ? 'and ' + printCountTrade(sell2) : ''} for ${printCountTrade(buy)}`)

    await bot.trade(villager, index, 6)
    if (index === 0) {
      assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), testFluctuations ? 64 - 24 : 64 - 12)
      assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 12)
    } else {
      assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), testFluctuations ? 64 - 36 : 64 - 24)
      assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 0)
      assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.wheat.id), 12)
    }
  }

  assert.rejects(bot.trade(villager, 1, 1)) // Shouldn't be able, the trade is blocked!
  villager.close()
  bot.test.sayEverywhere(`/kill @e[type=${villagerType}]`)
}
