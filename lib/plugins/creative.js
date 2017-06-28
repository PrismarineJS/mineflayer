const assert = require('assert')
const Vec3 = require('vec3').Vec3

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)

  // these features only work when you are in creative mode.
  bot.creative = {
    setInventorySlot,
    flyTo,
    startFlying,
    stopFlying
  }

  function setInventorySlot (slot, item) {
    assert(slot >= 0 && slot <= 44)
    bot._client.write('set_creative_slot', {
      slot,
      item: Item.toNotch(item)
    })
  }

  let normalGravity = null
  const flyingSpeedPerUpdate = 0.5

  // straight line, so make sure there's a clear path.
  function flyTo (destination, cb) {
    // TODO: consider sending 0x13
    startFlying()
    const intervalHandle = setInterval(flyStep, 50)

    function flyStep () {
      bot.physics.gravity = 0
      bot.entity.velocity = new Vec3(0, 0, 0)

      const vector = destination.minus(bot.entity.position)
      const magnitude = vecMagnitude(vector)
      if (magnitude <= flyingSpeedPerUpdate) {
        // last step
        bot.entity.position = destination
        if (cb != null) bot.once('move', cb)
        clearInterval(intervalHandle)
      } else {
        // small steps
        const normalizedVector = vector.scaled(1 / magnitude)
        bot.entity.position.add(normalizedVector.scaled(flyingSpeedPerUpdate))
      }
    }
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
