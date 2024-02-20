const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  let nbt = null

  if (bot.registry.isNewerOrEqualTo('1.9')) {
    nbt = {
      type: 'compound',
      name: '',
      value: { Potion: { type: 'string', value: 'minecraft:water' } }
    }
  }
  const wbottle = new Item(bot.registry.itemsByName.potion.id, 1, null, nbt)

  // prepare inventory
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.brewing_stand.id, 1))
  await bot.test.setInventorySlot(37, wbottle)
  await bot.test.setInventorySlot(38, wbottle)
  await bot.test.setInventorySlot(39, wbottle)
  await bot.test.setInventorySlot(40, new Item(bot.registry.itemsByName.nether_wart.id, 1))
  await bot.test.setInventorySlot(41, new Item(bot.registry.itemsByName.ghast_tear.id, 1))
  await bot.test.setInventorySlot(44, new Item(bot.registry.itemsByName.blaze_powder.id, 1))

  await bot.test.becomeSurvival()

  // place brewing stand
  await bot.test.placeBlock(36, bot.entity.position.offset(1, 0, 0))

  const b = bot.findBlock({ matching: bot.registry.blocksByName.brewing_stand.id })
  const brewingStand = await bot.openBrewingStand(b)

  console.log('Opened brewing stand!')

  // put in water bottles
  for (const i of [0, 1, 2]) {
    const potion = brewingStand.findInventoryItem(bot.registry.itemsByName.potion.id)
    await brewingStand.putPotion(i, potion.type, null, 1)
  }

  // put in fuel
  const blaze = brewingStand.findInventoryItem(bot.registry.itemsByName.blaze_powder.id)
  await brewingStand.putFuel(blaze.type, null, 1)

  // brew ingredients, waiting in between
  const wart = brewingStand.findInventoryItem(bot.registry.itemsByName.nether_wart.id)
  await brewingStand.putIngredient(wart.type, null, 1)

  await once(brewingStand, 'brewingStopped')

  const tear = brewingStand.findInventoryItem(bot.registry.itemsByName.ghast_tear.id)
  await brewingStand.putIngredient(tear.type, null, 1)

  await once(brewingStand, 'brewingStopped')

  const pot = await brewingStand.takePotion(0)

  if (bot.registry.isNewerOrEqualTo('1.9')) {
    assert.strictEqual(pot.nbt.value.Potion.value, 'minecraft:regeneration')
  } else {
    assert.strictEqual(pot.metadata, 8193)
  }

  brewingStand.close()
}
