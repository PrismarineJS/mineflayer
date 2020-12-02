const assert = require('assert')
const Vec3 = require('vec3').Vec3
const { callbackify, sleep } = require('../promise_utils')
const { once } = require('events')

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)

  // these features only work when you are in creative mode.
  bot.creative = {
    setInventorySlot: callbackify(setInventorySlot),
    flyTo: callbackify(flyTo),
    startFlying,
    stopFlying
  }

  const creativeSlotsUpdates = []
  bot._client.on('set_slot', ({ windowId, slot, item }) => {
    if (windowId === 0 && creativeSlotsUpdates[slot]) {
      bot.emit(`set_creative_slot_${slot}`)
    }
  })

  // WARN: This method should not be called twice on the same slot before first callback exceeds
  async function setInventorySlot (slot, item) {
    assert(slot >= 0 && slot <= 44)

    if (creativeSlotsUpdates[slot]) {
      throw new Error(`Setting slot ${slot} cancelled due to calling bot.creative.setInventorySlot(${slot}, ...) again`)
    }
    creativeSlotsUpdates[slot] = true

    bot._client.write('set_creative_slot', {
      slot,
      item: Item.toNotch(item)
    })

    await once(bot, `set_creative_slot_${slot}`)
    creativeSlotsUpdates[slot] = false
  }

  let normalGravity = null
  const flyingSpeedPerUpdate = 0.5

  // straight line, so make sure there's a clear path.
  async function flyTo (destination) {
    // TODO: consider sending 0x13
    startFlying()

    let vector = destination.minus(bot.entity.position)
    let magnitude = vecMagnitude(vector)

    while (magnitude > flyingSpeedPerUpdate) {
      bot.physics.gravity = 0
      bot.entity.velocity = new Vec3(0, 0, 0)

      // small steps
      const normalizedVector = vector.scaled(1 / magnitude)
      bot.entity.position.add(normalizedVector.scaled(flyingSpeedPerUpdate))

      await sleep(50)

      vector = destination.minus(bot.entity.position)
      magnitude = vecMagnitude(vector)
    }

    // last step
    bot.entity.position = destination
    await once(bot, 'move')
  }

  function startFlying () {
    if (normalGravity == null) normalGravity = bot.physics.gravity
    bot.physics.gravity = 0
  }

  function stopFlying () {
    bot.physics.gravity = normalGravity
  }
}

// this should be in the vector library
function vecMagnitude (vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
}
