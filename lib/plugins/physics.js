const Vec3 = require('vec3').Vec3
const assert = require('assert')
const math = require('../math')
const conv = require('../conversions')
const { performance } = require('perf_hooks')
const { callbackify, createDoneTask, createTask } = require('../promise_utils')

const { Physics, PlayerState } = require('prismarine-physics')

module.exports = inject

const PI = Math.PI
const PI_2 = Math.PI * 2
const PHYSICS_INTERVAL_MS = 50
const PHYSICS_TIMESTEP = PHYSICS_INTERVAL_MS / 1000

function inject (bot) {
  const mcData = require('minecraft-data')(bot.version)

  const world = { getBlock: (pos) => { return bot.blockAt(pos, false) } }
  const physics = Physics(mcData, world)

  bot.jumpQueued = false
  bot.jumpTicks = 0 // autojump cooldown

  const controlState = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    sneak: false
  }
  let lastSentYaw = null
  let doPhysicsTimer = null
  let lastPhysicsFrameTime = null
  let physicEnabled = false

  const lastSent = {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    onGround: false,
    time: 0
  }

  // This function should be executed each tick (every 0.05 seconds)
  // How it works: https://gafferongames.com/post/fix_your_timestep/
  let timeAccumulator = 0
  function doPhysics () {
    const now = performance.now()
    const deltaSeconds = (now - lastPhysicsFrameTime) / 1000
    lastPhysicsFrameTime = now

    timeAccumulator += deltaSeconds

    while (timeAccumulator >= PHYSICS_TIMESTEP) {
      if (physicEnabled) {
        physics.simulatePlayer(new PlayerState(bot, controlState), world).apply(bot)
        bot.emit('physicTick')
      }
      updatePosition(PHYSICS_TIMESTEP)
      timeAccumulator -= PHYSICS_TIMESTEP
    }
  }

  function cleanup () {
    clearInterval(doPhysicsTimer)
    doPhysicsTimer = null
  }

  function sendPacketPosition (position, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.x = position.x
    lastSent.y = position.y
    lastSent.z = position.z
    lastSent.onGround = onGround
    bot._client.write('position', lastSent)
    bot.emit('move', oldPos)
  }

  function sendPacketLook (yaw, pitch, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.yaw = yaw
    lastSent.pitch = pitch
    lastSent.onGround = onGround
    bot._client.write('look', lastSent)
    bot.emit('move', oldPos)
  }

  function sendPacketPositionAndLook (position, yaw, pitch, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.x = position.x
    lastSent.y = position.y
    lastSent.z = position.z
    lastSent.yaw = yaw
    lastSent.pitch = pitch
    lastSent.onGround = onGround
    bot._client.write('position_look', lastSent)
    bot.emit('move', oldPos)
  }

  function deltaYaw (yaw1, yaw2) {
    let dYaw = (yaw1 - yaw2) % PI_2
    if (dYaw < -PI) dYaw += PI_2
    else if (dYaw > PI) dYaw -= PI_2

    return dYaw
  }

  function updatePosition (dt) {
    // If you're dead, you're probably on the ground though ...
    if (!bot.isAlive) bot.entity.onGround = true

    // Increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    const dYaw = deltaYaw(bot.entity.yaw, lastSentYaw)

    // Vanilla doesn't clamp yaw, so we don't want to do it either
    const maxDeltaYaw = dt * physics.yawSpeed
    lastSentYaw += math.clamp(-maxDeltaYaw, dYaw, maxDeltaYaw)

    const yaw = conv.toNotchianYaw(lastSentYaw)
    const pitch = conv.toNotchianPitch(bot.entity.pitch)
    const position = bot.entity.position
    const onGround = bot.entity.onGround

    // Only send a position update if necessary, select the appropriate packet
    const positionUpdated = lastSent.x !== position.x || lastSent.y !== position.y || lastSent.z !== position.z
    const lookUpdated = lastSent.yaw !== yaw || lastSent.pitch !== pitch

    if (positionUpdated && lookUpdated && bot.isAlive) {
      sendPacketPositionAndLook(position, yaw, pitch, onGround)
    } else if (positionUpdated && bot.isAlive) {
      sendPacketPosition(position, onGround)
    } else if (lookUpdated && bot.isAlive) {
      sendPacketLook(yaw, pitch, onGround)
    } else if (performance.now() - lastSent.time >= 1000) {
      // Send a position packet every second, even if no update was made
      sendPacketPosition(position, onGround)
      lastSent.time = performance.now()
    } else if (bot.supportFeature('positionUpdateSentEveryTick') && bot.isAlive) {
      // For versions < 1.12, one player packet should be sent every tick
      // for the server to update health correctly
      bot._client.write('flying', { onGround: bot.entity.onGround })
    }
  }

  bot.physics = physics

  bot.setControlState = (control, state) => {
    assert.ok(control in controlState, `invalid control: ${control}`)
    assert.ok(typeof state === 'boolean', `invalid state: ${state}`)
    if (controlState[control] === state) return
    controlState[control] = state
    if (control === 'jump' && state) {
      bot.jumpQueued = true
    } else if (control === 'sprint') {
      bot._client.write('entity_action', {
        entityId: bot.entity.id,
        actionId: state ? 3 : 4,
        jumpBoost: 0
      })
    } else if (control === 'sneak') {
      bot._client.write('entity_action', {
        entityId: bot.entity.id,
        actionId: state ? 0 : 1,
        jumpBoost: 0
      })
    }
  }

  bot.clearControlStates = () => {
    for (const control in controlState) {
      bot.setControlState(control, false)
    }
  }

  bot.controlState = {}

  for (const control of Object.keys(controlState)) {
    Object.defineProperty(bot.controlState, control, {
      get () {
        return controlState[control]
      },
      set (state) {
        bot.setControlState(control, state)
        return state
      }
    })
  }

  let lookingTask = createDoneTask()

  bot.on('move', () => {
    if (!lookingTask.done && Math.abs(deltaYaw(bot.entity.yaw, lastSentYaw)) < 0.001) {
      lookingTask.finish()
    }
  })

  bot.look = callbackify(async (yaw, pitch, force) => {
    if (!lookingTask.done) {
      lookingTask.finish() // finish the previous one
    }
    lookingTask = createTask()

    bot.entity.yaw = yaw
    bot.entity.pitch = pitch
    if (force) {
      lastSentYaw = yaw
      return
    }

    await lookingTask.promise
  })

  bot.lookAt = callbackify(async (point, force) => {
    const delta = point.minus(bot.entity.position.offset(0, bot.entity.height, 0))
    const yaw = Math.atan2(-delta.x, -delta.z)
    const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z)
    const pitch = Math.atan2(delta.y, groundDistance)
    await bot.look(yaw, pitch, force)
  })

  // player position and look (clientbound)
  bot._client.on('position', (packet) => {
    bot.entity.height = 1.62
    bot.entity.velocity.set(0, 0, 0)

    // If flag is set, then the corresponding value is relative, else it is absolute
    const pos = bot.entity.position
    pos.set(
      packet.flags & 1 ? (pos.x + packet.x) : packet.x,
      packet.flags & 2 ? (pos.y + packet.y) : packet.y,
      packet.flags & 4 ? (pos.z + packet.z) : packet.z
    )

    const newYaw = (packet.flags & 8 ? conv.toNotchianYaw(bot.entity.yaw) : 0) + packet.yaw
    const newPitch = (packet.flags & 16 ? conv.toNotchianPitch(bot.entity.pitch) : 0) + packet.pitch
    bot.entity.yaw = conv.fromNotchianYaw(newYaw)
    bot.entity.pitch = conv.fromNotchianPitch(newPitch)
    bot.entity.onGround = false

    if (bot.supportFeature('teleportUsesOwnPacket')) {
      bot._client.write('teleport_confirm', { teleportId: packet.teleportId })
      // Force send an extra packet to be like vanilla client
      sendPacketPositionAndLook(pos, newYaw, newPitch, bot.entity.onGround)
    }
    sendPacketPositionAndLook(pos, newYaw, newPitch, bot.entity.onGround)

    physicEnabled = true
    bot.entity.timeSinceOnGround = 0
    lastSentYaw = bot.entity.yaw

    if (doPhysicsTimer === null) {
      lastPhysicsFrameTime = performance.now()
      doPhysicsTimer = setInterval(doPhysics, PHYSICS_INTERVAL_MS)
    }
    bot.emit('forcedMove')
  })

  bot.waitForTicks = async function (ticks) {
    if (ticks <= 0) return
    await new Promise(resolve => {
      const tickListener = () => {
        ticks--
        if (ticks === 0) {
          this.bot.removeListener('physicTick', tickListener)
          resolve()
        }
      }

      this.bot.on('physicTick', tickListener)
    })
  }

  bot.on('mount', () => { physicEnabled = false })
  bot.on('respawn', () => { physicEnabled = false })
  bot.on('end', cleanup)
}
