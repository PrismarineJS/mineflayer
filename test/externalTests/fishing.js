module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)

  bot.test.sayEverywhere('/fill ~-5 ~-1 ~-5 ~5 ~-1 ~5 water')
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.fishing_rod.id, 1, 0))
  await bot.lookAt(bot.entity.position) // dont force the position
  bot.fish()

  return new Promise((resolve, reject) => {
    function onPlayerCollect (collector, collected) {
      if (collected.type === 'object') {
        bot.test.sayEverywhere('I caught: ' + collected.displayName)
        bot.removeListener('playerCollect', onPlayerCollect)
        resolve()
      }
    }
    bot.on('playerCollect', onPlayerCollect)
  })
}
