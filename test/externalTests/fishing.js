module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  bot.test.sayEverywhere('/fill ~-10 ~-1 ~-10 ~10 ~-1 ~10 water')
  bot.test.sayEverywhere('/weather rain') // rain shortens the vanilla bite wait
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.fishing_rod.id, 1, 0))
  await bot.test.awaitItemReceived('/enchant @a minecraft:lure 3')
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
