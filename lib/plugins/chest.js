const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:generic', 'minecraft:chest', 'minecraft:dispenser', 'minecraft:shulker_box', 'minecraft:hopper']

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openContainer (containerToOpen) {
    let chest
    if (containerToOpen.constructor.name === 'Block') {
      chest = await bot.openBlock(containerToOpen)
    } else if (containerToOpen.constructor.name === 'Entity') {
      chest = await bot.openEntity(containerToOpen)
    } else {
      throw new Error('containerToOpen is neither a block nor an entity')
    }

    if (!matchWindowType(chest)) { throw new Error('Non-container window used as a container') }
    return chest
  }

  bot.openContainer = callbackify(openContainer)
  bot.openChest = callbackify(openContainer)
  bot.openDispenser = callbackify(openContainer)
}
