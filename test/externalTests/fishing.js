module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  bot.test.sayEverywhere('/fill ~-10 ~-1 ~-10 ~10 ~-1 ~10 water')
  bot.test.sayEverywhere('/weather rain') // rain shortens the vanilla bite wait
  // The server rolls the bite wait as nextInt(100, fishingBiteDelayMaxTicks)
  // then subtracts Lure level x100 ticks; a non-positive roll just rerolls
  // next tick. This Lure level is the maximum viable: it leaves only 1-100
  // tick waits (expected ~2.5s, hard cap 5s). One level higher and the roll
  // can never go positive - the hook never bites. /enchant caps at Lure III.
  // Component-era servers silently strip enchantments written by the client
  // into a creative slot, so there the rod must come from a server /give.
  const lure = (bot.supportFeature('fishingBiteDelayMaxTicks') - 100) / 100
  if (bot.supportFeature('enchantmentsComponentIsFlat')) {
    await bot.test.clearInventory()
    await bot.test.awaitItemReceived(`/give @a minecraft:fishing_rod[minecraft:enchantments={"minecraft:lure":${lure}}] 1`)
  } else if (bot.supportFeature('itemsWithComponents')) {
    await bot.test.clearInventory()
    await bot.test.awaitItemReceived(`/give @a minecraft:fishing_rod[minecraft:enchantments={levels:{"minecraft:lure":${lure}}}] 1`)
  } else {
    const rod = new Item(bot.registry.itemsByName.fishing_rod.id, 1, 0)
    rod.enchants = [{ name: 'lure', lvl: lure }]
    await bot.test.setInventorySlot(36, rod)
  }
  await bot.lookAt(bot.entity.position) // dont force the position
  bot.fish()

  await new Promise((resolve, reject) => {
    function onPlayerCollect (collector, collected) {
      if (collected.name.toLowerCase() === 'item' || collected.type === 'object') {
        bot.test.sayEverywhere('I caught: ' + collected.displayName)
        bot.removeListener('playerCollect', onPlayerCollect)
        resolve()
      }
    }
    bot.on('playerCollect', onPlayerCollect)
  })

  bot.test.sayEverywhere('/weather clear')
}
