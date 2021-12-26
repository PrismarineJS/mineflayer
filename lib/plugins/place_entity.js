const assert = require('assert')

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)

  /**
   *
   * @param {import('prismarine-block').Block} referenceBlock
   * @param {import('vec3').Vec3} faceVector
   * @param {{forceLook?: boolean | 'ignore', offhand?: boolean, swingArm?: 'right' | 'left', showHand?: boolean}} options
   */
  async function placeEntityWithOptions (referenceBlock, faceVector, options) {
    if (!bot.heldItem) throw new Error('must be holding an item to place an entity')

    const type = bot.heldItem.name // used for assert
      .replace(/.+_boat/, 'boat')
      .replace(/.+_spawn_egg/, 'spawn_egg')
    assert(['end_crystal', 'boat', 'spawn_egg', 'armor_stand'].includes(type), 'Unimplemented')

    let name = bot.heldItem.name // used for finding entity after spawn
      .replace(/.+_boat/, 'boat')

    if (name.endsWith('spawn_egg')) {
      name = bot.heldItem.spawnEggMobName
    }

    if (type === 'spawn_egg') {
      options.showHand = false
    }

    if (!options.swingArm) options.swingArm = options.offhand ? 'left' : 'right'

    const pos = await bot._genericPlace(referenceBlock, faceVector, options)

    if (type === 'boat') {
      if (bot.supportFeature('useItemWithOwnPacket')) {
        bot._client.write('use_item', {
          hand: options.offhand ? 1 : 0
        })
      } else {
        bot._client.write('block_place', {
          location: { x: -1, y: -1, z: -1 },
          direction: -1,
          heldItem: Item.toNotch(bot.heldItem),
          cursorX: 0,
          cursorY: 0,
          cursorZ: 0
        })
      }
    }

    const dest = pos.plus(faceVector)
    const entity = await waitForEntitySpawn(name, dest)
    bot.emit('entityPlaced', entity)
    return entity
  }

  async function placeEntity (referenceBlock, faceVector) {
    return await placeEntityWithOptions(referenceBlock, faceVector, {})
  }

  function waitForEntitySpawn (name, placePosition) {
    const maxDistance = name === 'bat' ? 4 : name === 'boat' ? 3 : 2
    let mobName = name
    if (name === 'end_crystal') {
      if (bot.supportFeature('enderCrystalNameEndsInErNoCaps')) {
        mobName = 'ender_crystal'
      } else if (bot.supportFeature('entityNameLowerCaseNoUnderscore')) {
        mobName = 'endercrystal'
      } else if (bot.supportFeature('enderCrystalNameNoCapsWithUnderscore')) {
        mobName = 'end_crystal'
      } else {
        mobName = 'EnderCrystal'
      }
    } else if (name === 'boat') {
      mobName = bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'Boat' : 'boat'
    } else if (name === 'armor_stand') {
      if (bot.supportFeature('entityNameUpperCaseNoUnderscore')) {
        mobName = 'ArmorStand'
      } else if (bot.supportFeature('entityNameLowerCaseNoUnderscore')) {
        mobName = 'armorstand'
      } else {
        mobName = 'armor_stand'
      }
    }

    return new Promise((resolve, reject) => {
      function listener (entity) {
        const dist = entity.position.distanceTo(placePosition)
        if (entity.name === mobName && dist < maxDistance) {
          resolve(entity)
        }
        bot.off('entitySpawn', listener)
      }

      setTimeout(() => {
        bot.off('entitySpawn', listener)
        reject(new Error('Failed to place entity'))
      }, 5000) // reject after 5s

      bot.on('entitySpawn', listener)
    })
  }

  bot.placeEntity = placeEntity
  bot._placeEntityWithOptions = placeEntityWithOptions
}
