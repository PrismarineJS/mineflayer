const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

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

  // Handle trade #1 -- takes 2x emerald and returns 2x pumpkin_pie
  {
    const trade = villager.trades[0]
    assert.strictEqual(trade.inputs.length, 1, 'Expected single input from villager on first trade')
    verifyTrade(trade)

    const [input] = trade.inputs
    assert.strictEqual(input.name, 'emerald')
    assert.strictEqual(input.count, 2)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'pumpkin_pie')
    assert.strictEqual(output.count, 2)

    await bot.trade(villager, 0, 6)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), testFluctuations ? 64 - 24 : 64 - 12)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 12)
  }

  // Handle trade #2 -- takes [2x emerald, 2x pumpkin_pie] and returns 2x wheat
  {
    const trade = villager.trades[1]
    assert.strictEqual(trade.inputs.length, 2, 'Expected two inputs from villager on second trade')
    verifyTrade(trade)

    const [input1, input2] = trade.inputs
    assert.strictEqual(input1.name, 'emerald')
    assert.strictEqual(input1.count, 2)
    assert.strictEqual(input2.name, 'pumpkin_pie')
    assert.strictEqual(input2.count, 2)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'wheat')
    assert.strictEqual(output.count, 2)

    await bot.trade(villager, 1, 6)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), testFluctuations ? 64 - 36 : 64 - 24)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 0)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.wheat.id), 12)
  }

  function verifyTrade (trade) {
    assert.strictEqual(trade.nbTradeUses, 1)
    assert.strictEqual(trade.maximumNbTradeUses, 7)
    assert.strictEqual(trade.tradeDisabled, false)

    const printCountInv = function (item) {
      return `${bot.currentWindow.count(bot.registry.itemsByName[item.name].id)}x ${item.displayName}`
    }
    const printCountTrade = function (item) {
      return `${item.count}x ${item.displayName}`
    }

    bot.test.sayEverywhere(`I have ${printCountInv(trade.inputItem1)} ${trade.hasItem2 ? 'and ' + printCountInv(trade.inputItem2) : ''}`)
    bot.test.sayEverywhere(`I can trade ${printCountTrade(trade.inputItem1)} ${trade.hasItem2 ? 'and ' + printCountTrade(trade.inputItem2) : ''} for ${printCountTrade(trade.outputItem)}`)
  }

  assert.rejects(bot.trade(villager, 1, 1)) // Shouldn't be able, the trade is blocked!
  villager.close()
  bot.test.sayEverywhere(`/kill @e[type=${villagerType}]`)
}
