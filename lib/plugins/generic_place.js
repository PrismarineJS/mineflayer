const assert = require('assert')
const { Vec3 } = require('vec3')
module.exports = inject

// Points on `faceVector`'s face of a unit cube: the centre first, then a grid working outwards,
// so a face that is only partly visible still has somewhere to aim. When a slab half is asked for,
// the candidates on the face's vertical axis start in that half, since that is what picks it.
function faceAimPoints (faceVector, half) {
  const axis = faceVector.x !== 0 ? 'x' : faceVector.y !== 0 ? 'y' : 'z'
  const inFace = ['x', 'y', 'z'].filter(a => a !== axis)
  const spread = [0.5, 0.3, 0.7, 0.15, 0.85]
  const vertical = half === 'top'
    ? [0.75, 0.9, 0.6, 0.55]
    : half === 'bottom' ? [0.25, 0.1, 0.4, 0.45] : spread
  const stepsFor = (a) => (a === 'y' ? vertical : spread)
  const out = []
  for (const u of stepsFor(inFace[0])) {
    for (const v of stepsFor(inFace[1])) {
      const p = { x: 0, y: 0, z: 0 }
      p[axis] = faceVector[axis] > 0 ? 1 : 0
      p[inFace[0]] = u
      p[inFace[1]] = v
      out.push(new Vec3(p.x, p.y, p.z))
    }
  }
  return out
}

function inject (bot) {
  const Item = require('prismarine-item')(bot.registry)
  // When a face turns out not to be in view, refuse rather than send a packet no client could
  // produce. Off by default: the packets were accepted by vanilla servers before.
  bot.placeFaceStrict = false
  /**
   *
   * @param {import('prismarine-block').Block} referenceBlock
   * @param {import('vec3').Vec3} faceVector
   * @param {{half?: 'top'|'bottom', delta?: import('vec3').Vec3, forceLook?: boolean | 'ignore', offhand?: boolean, swingArm?: 'right' | 'left', showHand?: boolean}} options
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

    // The vanilla client never chooses a face: Minecraft.pick raycasts from the camera and hands
    // whatever it hit - block, face and exact hit point - straight to ServerboundUseItemOnPacket.
    // So the face has to be one our own crosshair reaches, and the cursor has to be the point the
    // ray meets it. Aiming at the centre of a side face gets this wrong every time: from anywhere
    // above the block the ray reaches the top face first, and the packet claims a face the player
    // could not have been pointing at.
    let face = faceVector
    let dx, dy, dz
    if (options.delta) {
      // The caller supplied the cursor itself, so it has said it knows where it is aiming.
      dx = options.delta.x
      dy = options.delta.y
      dz = options.delta.z
      if (options.forceLook !== 'ignore') {
        await bot.lookAt(referenceBlock.position.offset(dx, dy, dz), options.forceLook)
      }
    } else {
      // A block with no collision box - air, water, tall grass - is not pickable at all, so there
      // is nothing to raycast against and those callers keep the old behaviour.
      const pickable = referenceBlock.shapes && referenceBlock.shapes.length > 0
      const hit = pickable && options.forceLook !== 'ignore'
        ? aimAtFace(referenceBlock, faceVector, options.half)
        : null
      if (hit) {
        await bot.lookAt(hit.aim, options.forceLook)
        face = directionToVector(hit.face)
        dx = hit.cursor.x
        dy = hit.cursor.y
        dz = hit.cursor.z
      } else {
        // Nothing on that face is in view. The packet the old code sends here is one the client
        // could not have produced, so a server that checks the hit refuses it silently; bots that
        // would rather hear about it up front can turn that into an error.
        if (pickable && options.forceLook !== 'ignore' && (options.strictFace ?? bot.placeFaceStrict)) {
          throw new Error(`Cannot place against the ${faceName(faceVector)} face of ${referenceBlock.name} at ${referenceBlock.position}: it is not visible from ${bot.entity.position}`)
        }
        dx = 0.5 + faceVector.x * 0.5
        dy = 0.5 + faceVector.y * 0.5
        dz = 0.5 + faceVector.z * 0.5
        if (dy === 0.5) {
          if (options.half === 'top') dy += 0.25
          else if (options.half === 'bottom') dy -= 0.25
        }
        if (options.forceLook !== 'ignore') {
          await bot.lookAt(referenceBlock.position.offset(dx, dy, dz), options.forceLook)
        }
      }
    }
    // TODO: tell the server that we are sneaking while doing this
    const pos = referenceBlock.position

    if (options.swingArm) {
      bot.swingArm(options.swingArm, options.showHand)
    }

    if (bot.supportFeature('blockPlaceHasHeldItem')) {
      const packet = {
        location: pos,
        direction: vectorToDirection(face),
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      }
      bot._client.write('block_place', packet)
    } else if (bot.supportFeature('blockPlaceHasHandAndIntCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(face),
        hand: handToPlaceWith,
        cursorX: Math.floor(dx * 16),
        cursorY: Math.floor(dy * 16),
        cursorZ: Math.floor(dz * 16)
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndFloatCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(face),
        hand: handToPlaceWith,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz
      })
    } else if (bot.supportFeature('blockPlaceHasInsideBlock')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(face),
        hand: handToPlaceWith,
        cursorX: dx,
        cursorY: dy,
        cursorZ: dz,
        insideBlock: false,
        sequence: 0, // 1.19.0
        worldBorderHit: false // 1.21.3
      })
    }

    return pos
  }

  // Raycast from the eye through candidate points on the requested face and keep the first one
  // whose own hit is that block on that face, exactly as the client's pick does.
  function aimAtFace (referenceBlock, faceVector, half) {
    const eye = bot.entity.position.offset(0, bot.entity.eyeHeight, 0)
    const want = vectorToDirection(faceVector)
    for (const point of faceAimPoints(faceVector, half)) {
      const aim = referenceBlock.position.plus(point)
      const delta = aim.minus(eye)
      const range = delta.norm()
      if (range < 1e-6) continue
      const hit = bot.world.raycast(eye, delta.scaled(1 / range), range + 0.5)
      if (!hit || !hit.position.equals(referenceBlock.position) || hit.face !== want) continue
      return { aim, face: hit.face, cursor: hit.intersect.minus(referenceBlock.position) }
    }
    return null
  }

  bot._genericPlace = _genericPlace
}

function directionToVector (direction) {
  switch (direction) {
    case 0: return new Vec3(0, -1, 0)
    case 1: return new Vec3(0, 1, 0)
    case 2: return new Vec3(0, 0, -1)
    case 3: return new Vec3(0, 0, 1)
    case 4: return new Vec3(-1, 0, 0)
    case 5: return new Vec3(1, 0, 0)
  }
  assert.ok(false, `invalid direction ${direction}`)
}

function faceName (v) {
  return ['bottom', 'top', 'north', 'south', 'west', 'east'][vectorToDirection(v)]
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
