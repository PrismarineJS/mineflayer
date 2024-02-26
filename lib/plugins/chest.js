const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:generic', 'minecraft:chest', 'minecraft:dispenser', 'minecraft:ender_chest', 'minecraft:shulker_box', 'minecraft:hopper', 'minecraft:container', 'minecraft:dropper', 'minecraft:trapped_chest', 'minecraft:barrel', 'minecraft:white_shulker_box', 'minecraft:orange_shulker_box', 'minecraft:magenta_shulker_box', 'minecraft:light_blue_shulker_box', 'minecraft:yellow_shulker_box', 'minecraft:lime_shulker_box', 'minecraft:pink_shulker_box', 'minecraft:gray_shulker_box', 'minecraft:light_gray_shulker_box', 'minecraft:cyan_shulker_box', 'minecraft:purple_shulker_box', 'minecraft:blue_shulker_box', 'minecraft:brown_shulker_box', 'minecraft:green_shulker_box', 'minecraft:red_shulker_box', 'minecraft:black_shulker_box']
  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openContainer (containerToOpen, direction, cursorPos) {
    direction = direction ?? new Vec3(0, 1, 0)
    cursorPos = cursorPos ?? new Vec3(0.5, 0.5, 0.5)
    let chest
    if (containerToOpen.constructor.name === 'Block' && allowedWindowTypes.map(name => name.replace('minecraft:', '')).includes(containerToOpen.name)) {
      chest = await bot.openBlock(containerToOpen, direction, cursorPos)
    } else if (containerToOpen.constructor.name === 'Entity') {
      chest = await bot.openEntity(containerToOpen)
    } else {
      throw new Error('containerToOpen is neither a block nor an entity')
    }

    if (!matchWindowType(chest)) { throw new Error('Non-container window used as a container: ' + JSON.stringify(chest)) }
    return chest
  }

  bot.openContainer = openContainer
  bot.openChest = openContainer
  bot.openDispenser = openContainer
}
