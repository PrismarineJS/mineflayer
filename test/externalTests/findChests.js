const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const chest1Pos = bot.entity.position.offset(2, 0, 0).floored()
  const chest2Pos = chest1Pos.offset(1, 0, 0)

  const p1 = once(bot.world, `blockUpdate:(${chest1Pos.toArray().join(', ')})`)
  const p2 = once(bot.world, `blockUpdate:(${chest2Pos.toArray().join(', ')})`)
  bot.test.sayEverywhere(`/setblock ${chest1Pos.toArray().join(' ')} minecraft:chest`)
  bot.test.sayEverywhere(`/setblock ${chest2Pos.toArray().join(' ')} minecraft:chest`)
  await Promise.all([p1, p2])

  const chests = bot.findChests({})
  assert(chests.length === 1)
}
