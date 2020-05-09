// const assert = require('assert')

module.exports = () => (bot, done) => {
  done()
  // TODO fix unreliable trading/trading test
  /*
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const villagerType = mcData.entitiesByName.villager ? 'villager' : 'Villager'

  function onEntitySpawn (entity) {
    if (entity.name !== villagerType) return
    bot.removeListener('entitySpawn', onEntitySpawn)
    bot.openVillager(entity, (err, villager) => {
      const sell = villager.trades[0].inputItem1
      const buy = villager.trades[0].outputItem
      assert.notStrictEqual(sell, null)
      assert.notStrictEqual(buy, null)
      bot.test.sayEverywhere(`I can trade ${sell.count}x ${sell.displayName} for ${buy.count}x ${buy.displayName}`)
      bot.trade(villager, 0, 1, (err) => {
        assert.ifError(err)
        assert.strictEqual(bot.currentWindow.count(mcData.itemsByName.emerald.id, 0), 0)
        assert.strictEqual(bot.currentWindow.count(mcData.itemsByName.bread.id, 0), 1)
        villager.close(() => {
          bot.test.sayEverywhere(`/kill @e[type=${villagerType}]`)
          done()
        })
      })
    })
  }

  bot.test.setInventorySlot(36, new Item(mcData.itemsByName.emerald.id, 1, 0), (err) => {
    assert.ifError(err)
    bot.on('entitySpawn', onEntitySpawn)
    // The command is callibrated to be under the 100 character limit of 1.8 - 1.10:
    bot.test.sayEverywhere(`/summon ${villagerType} 1 5 1 {Offers:{Recipes:[{buy:{id:emerald,Count:1},sell:{id:bread,Count:1}}]}}`)
  }) */
}
