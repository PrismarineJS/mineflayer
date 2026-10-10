const assert = require('assert')
const { Vec3 } = require('vec3')
module.exports = inject

// Fractions across a face to try aiming at, centre first, so a partly hidden face still has a target
const AIM_SPREAD = [0.5, 0.3, 0.7, 0.15, 0.85]
const AIM_ATTEMPTS = 3

function inject (bot) {
  const Item = require('prismarine-item')(bot.registry)
  // Throw instead of sending a face the crosshair does not reach
  bot._placeFaceStrict = false
  /**
   *
   * @param {import('prismarine-block').Block} referenceBlock
   * @param {import('vec3').Vec3} faceVector
   * @param {{half?: 'top'|'bottom', delta?: import('vec3').Vec3, forceLook?: boolean | 'ignore', offhand?: boolean, swingArm?: 'right' | 'left', showHand?: boolean, strictFace?: boolean}} options
   */
  async function _genericPlace (referenceBlock, faceVector, options) {
    let handToPlaceWith = 0
    if (options.offhand) {
      if (!bot.inventory.slots[45]) {
        throw new Error('must be holding an item in the off-hand to place')
      }
      handToPlaceWith = 1
    } else if (!bot.heldItem) {
      throw new Error('must be holding an item to place')
    }

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
    // The client sends the face and cursor its crosshair hits, so take the cursor from a raycast
    const canAim = !options.delta && options.forceLook !== 'ignore' && referenceBlock.shapes?.length > 0
    const cursor = canAim ? await lookAtFace(referenceBlock, faceVector, options) : null
    if (cursor) {
      dx = cursor.x
      dy = cursor.y
      dz = cursor.z
    } else {
      if (canAim && (options.strictFace ?? bot._placeFaceStrict)) {
        throw new Error(`Cannot place against face ${faceVector} of ${referenceBlock.name} at ${referenceBlock.position}: it is not visible from ${bot.entity.position}`)
      }
      if (options.forceLook !== 'ignore') {
        await bot.lookAt(referenceBlock.position.offset(dx, dy, dz), options.forceLook)
      }
    }
    // TODO: tell the server that we are sneaking while doing this
    const pos = referenceBlock.position

    if (bot.supportFeature('blockPlaceHasHeldItem')) {
      const packet = {
        location: pos,
        direction: vectorToDirection(faceVector),
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      }
      bot._client.write('block_place', packet)
    } else if (bot.supportFeature('blockPlaceHasHandAndIntCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: handToPlaceWith,
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndFloatCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: handToPlaceWith,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz
      })
    } else if (bot.supportFeature('blockPlaceHasInsideBlock')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: handToPlaceWith,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz,
        insideBlock: false,
        sequence: bot._nextSequence(), // 1.19.0
        worldBorderHit: false // 1.21.3
      })
    }

    // The swing must follow use_item_on
    if (options.swingArm) {
      bot.swingArm(options.swingArm, options.showHand)
    }

    return pos
  }

  // The bot can move while it turns, so the cursor is read from where it ends up looking
  async function lookAtFace (referenceBlock, faceVector, options) {
    const direction = vectorToDirection(faceVector)
    for (let i = 0; i < AIM_ATTEMPTS; i++) {
      const aim = aimAtFace(referenceBlock, faceVector, direction, options.half)
      if (!aim) return null
      await bot.lookAt(aim, options.forceLook)
      const hit = bot.blockAtCursor(eyePosition().distanceTo(aim) + 1)
      if (hit && hit.position.equals(referenceBlock.position) && hit.face === direction) {
        return hit.intersect.minus(referenceBlock.position)
      }
    }
    return null
  }

  // The first point on the face that a ray from the eye reaches before anything else
  function aimAtFace (referenceBlock, faceVector, direction, half) {
    const eye = eyePosition()
    for (const point of faceAimPoints(referenceBlock.shapes, faceVector, half)) {
      const aim = referenceBlock.position.plus(point)
      const range = eye.distanceTo(aim)
      if (range === 0) continue
      const hit = bot.world.raycast(eye, aim.minus(eye).normalize(), range + 1)
      if (hit && hit.position.equals(referenceBlock.position) && hit.face === direction) return aim
    }
    return null
  }

  function eyePosition () {
    return bot.entity.position.offset(0, bot.entity.eyeHeight, 0)
  }

  bot._genericPlace = _genericPlace
}

// Candidate points on the face of each collision box. A requested slab half keeps the points on a
// side face in that half, since that is what decides it.
function faceAimPoints (shapes, faceVector, half) {
  const points = []
  for (const [x0, y0, z0, x1, y1, z1] of shapes) {
    const min = new Vec3(x0, y0, z0)
    const max = new Vec3(x1, y1, z1)
    if (half && faceVector.y === 0) {
      const lo = Math.max(min.y, half === 'top' ? 0.5 : 0)
      const hi = Math.min(max.y, half === 'top' ? 1 : 0.5)
      if (hi > lo) {
        min.y = lo
        max.y = hi
      }
    }
    // On the face's own axis the point sits on that side of the box, u and v run across the other two
    const side = 0.5 + 0.5 * (faceVector.x + faceVector.y + faceVector.z)
    for (const u of AIM_SPREAD) {
      for (const v of AIM_SPREAD) {
        let t
        if (faceVector.x !== 0) t = new Vec3(side, u, v)
        else if (faceVector.y !== 0) t = new Vec3(u, side, v)
        else t = new Vec3(u, v, side)
        points.push(min.plus(t.multiply(max.minus(min))))
      }
    }
  }
  return points
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
