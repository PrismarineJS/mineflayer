const assert = require('assert')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)

  async function placeEntityWithOptions (referenceBlock, faceVector, options) {
    const type = bot.heldItem.name
      .replace(/.+_boat/, 'boat')
      .replace(/.+_spawn_egg/, 'spawn_egg')

    const name = bot.heldItem.name
      .replace(/.+_boat/, 'boat')
      .replace(/(.+)_spawn_egg/, '$1')

    assert(['end_crystal', 'boat', 'spawn_egg'].some(o => type === o),
      'Unimplemented')

    if (!bot.heldItem) throw new Error('must be holding an item to place an entity')
    // Look at the center of the face
    let dx = 0.5 + faceVector.x * 0.5
    let dy = 0.5 + faceVector.y * 0.5
    let dz = 0.5 + faceVector.z * 0.5
    if (dy === 0.5) {
      if (options.half === 'top') dy += 0.25
      else if (options.half === 'bottom') dy -= 0.25
    }
    if (options.delta) {
      dx = options.delta.x
      dy = options.delta.y
      dz = options.delta.z
    }
    if (options.forceLook !== 'ignore') {
      await bot.lookAt(referenceBlock.position.offset(dx, dy, dz), options.forceLook)
    }
    // TODO: tell the server that we are sneaking while doing this
    const pos = referenceBlock.position

    if (bot.supportFeature('blockPlaceHasHeldItem')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndIntCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndFloatCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz
      })
    } else if (bot.supportFeature('blockPlaceHasInsideBlock')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz,
        insideBlock: false
      })

      if (name === 'boat') {
        bot._client.write('use_item', {
          hand: 36 - bot.heldItem.slot
        })
      }

      bot.swingArm()
    }

    const dest = pos.plus(faceVector)

    return await waitForEntitySpawn(name, dest)
  }

  async function placeEntity (referenceBlock, faceVector) {
    return await placeEntityWithOptions(referenceBlock, faceVector, {})
  }

  function waitForEntitySpawn (name, placePosition) {
    return new Promise((resolve, reject) => {
      function listener (entity) {
        if (entity.name === name && entity.position.distanceTo(placePosition) < 2) {
          resolve(entity)
        }
        bot.off('entitySpawn', listener)
      }

      setTimeout(() => reject(new Error('placeEntity timed out')), 5000) // reject after 5s
      bot.on('entitySpawn', listener)
    })
  }

  bot.placeEntity = callbackify(placeEntity)
  bot._placeEntityWIthOptions = placeEntityWithOptions
}

function vectorToDirection (v) {
  if (v.y < 0) {
    return 0
  } else if (v.y > 0) {
    return 1
  } else if (v.z < 0) {
    return 2
  } else if (v.z > 0) {
    return 3
  } else if (v.x < 0) {
    return 4
  } else if (v.x > 0) {
    return 5
  }
  assert.ok(false, `invalid direction vector ${v}`)
}
