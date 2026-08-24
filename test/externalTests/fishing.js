module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  bot.test.sayEverywhere('/fill ~-10 ~-1 ~-10 ~10 ~-1 ~10 water')
  bot.test.sayEverywhere('/weather rain') // rain shortens the vanilla bite wait
  // The server rolls the bite wait as nextInt(100, 900) on 1.8.x and
  // nextInt(100, 600) on 1.9+, then subtracts Lure level x100 ticks; a
  // non-positive roll just rerolls next tick. These levels are the maximum
  // viable: they leave only 1-100 tick waits (expected ~2.5s, hard cap 5s).
  // One level higher and the roll can never go positive - the hook never
  // bites. /enchant caps at Lure III, so the level is set via item NBT.
  // From 1.20.5 the servers silently strip enchantments written by the
  // client into a creative slot, so the rod must come from a server /give.
  // The enchantments component lost its levels wrapper in 1.21.5.
  if (bot.registry.version['>=']('1.21.5')) {
    await bot.test.clearInventory()
    await bot.test.awaitItemReceived('/give @a minecraft:fishing_rod[minecraft:enchantments={"minecraft:lure":5}] 1')
  } else if (bot.registry.version['>=']('1.20.5')) {
    await bot.test.clearInventory()
    await bot.test.awaitItemReceived('/give @a minecraft:fishing_rod[minecraft:enchantments={levels:{"minecraft:lure":5}}] 1')
  } else {
    const rod = new Item(bot.registry.itemsByName.fishing_rod.id, 1, 0)
    rod.enchants = [{ name: 'lure', lvl: bot.registry.version['>=']('1.9') ? 5 : 8 }]
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
