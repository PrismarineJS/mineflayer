const { Vec3 } = require('vec3')
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

function inject (bot, { physicsEnabled }) {
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
  let shouldUsePhysics = false
  bot.physicsEnabled = physicsEnabled ?? true

  const lastSent = {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    onGround: false,
    time: 0
  }

  let ticksDead = 0
  let isAlive = false // this is used instead of bot.isAlive because only send the position packet

  // This function should be executed each tick (every 0.05 seconds)
  // How it works: https://gafferongames.com/post/fix_your_timestep/
  // WARNING: THIS IS NOT ACCURATE ON WINDOWS
  // use WSL or switch to the superior OS
  // see: https://discord.com/channels/413438066984747026/519952494768685086/901948718255833158
  let timeAccumulator = 0
  function doPhysics () {
    const now = performance.now()
    const deltaSeconds = (now - lastPhysicsFrameTime) / 1000
    lastPhysicsFrameTime = now

    timeAccumulator += deltaSeconds

    while (timeAccumulator >= PHYSICS_TIMESTEP) {
      tick(now)
      timeAccumulator -= PHYSICS_TIMESTEP
    }
  }

  function tick (now) {
    if (bot.physicsEnabled && shouldUsePhysics) {
      physics.simulatePlayer(new PlayerState(bot, controlState), world).apply(bot)
      bot.emit('physicsTick')
      bot.emit('physicTick') // Deprecated, only exists to support old plugins. May be removed in the future
    }
    updatePosition(now)
  }

  function cleanup () {
    clearInterval(doPhysicsTimer)
    doPhysicsTimer = null
  }

  function sendPacketPosition (position, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    const packet = {}
    packet.x = position.x
    packet.y = position.y
    packet.z = position.z
    packet.onGround = onGround
    bot._client.write('position', packet)
    bot.emit('move', oldPos)
  }

  function sendPacketLook (yaw, pitch, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    const packet = {}
    packet.yaw = yaw
    packet.pitch = pitch
    packet.onGround = onGround
    bot._client.write('look', packet)
    bot.emit('move', oldPos)
  }

  function sendPacketPositionAndLook (position, yaw, pitch, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    const packet = {}
    packet.x = position.x
    packet.y = position.y
    packet.z = position.z
    packet.yaw = yaw
    packet.pitch = pitch
    packet.onGround = onGround
    bot._client.write('position_look', packet)
    bot.emit('move', oldPos)
  }

  function lastSentPosition (position, onGround, now) {
    lastSent.x = position.x
    lastSent.y = position.y
    lastSent.z = position.z
    lastSent.onGround = onGround
    lastSent.time = now
  }

  function lastSentLook (yaw, pitch, onGround) {
    lastSent.yaw = yaw
    lastSent.pitch = pitch
    lastSent.onGround = onGround
  }

  function deltaYaw (yaw1, yaw2) {
    let dYaw = (yaw1 - yaw2) % PI_2
    if (dYaw < -PI) dYaw += PI_2
    else if (dYaw > PI) dYaw -= PI_2

    return dYaw
  }

  function updatePosition (now) {
    // If you're dead, you're probably on the ground though ...
    // You can be dead in the air however
    if (!isAlive) bot.entity.onGround = true

    // Increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    const dYaw = deltaYaw(bot.entity.yaw, lastSentYaw)

    // Vanilla doesn't clamp yaw, so we don't want to do it either
    const maxDeltaYaw = PHYSICS_TIMESTEP * physics.yawSpeed
    lastSentYaw += math.clamp(-maxDeltaYaw, dYaw, maxDeltaYaw)

    const yaw = Math.fround(conv.toNotchianYaw(lastSentYaw))
    const pitch = Math.fround(conv.toNotchianPitch(bot.entity.pitch))
    const position = bot.entity.position
    const onGround = bot.entity.onGround

    // Only send a position update if necessary, select the appropriate packet
    const positionUpdated = lastSent.x !== position.x || lastSent.y !== position.y || lastSent.z !== position.z || (Math.round((now - lastSent.time) / PHYSICS_INTERVAL_MS) * PHYSICS_INTERVAL_MS) >= 1000
    const lookUpdated = lastSent.yaw !== yaw || lastSent.pitch !== pitch

    if (isAlive === false) ticksDead++ // vanilla sends physics for 20 ticks after dying
    if (isAlive === true) ticksDead = 0
    if (ticksDead >= 20) return // return when threshold reached

    if (positionUpdated && lookUpdated) {
      sendPacketPositionAndLook(position, yaw, pitch, onGround)
    } else if (positionUpdated) {
      sendPacketPosition(position, onGround)
    } else if (lookUpdated) {
      sendPacketLook(yaw, pitch, onGround)
    } else if (bot.supportFeature('positionUpdateSentEveryTick') || onGround !== lastSent.onGround) {
      // For versions < 1.12, one player packet should be sent every tick
      // for the server to update health correctly
      bot._client.write('flying', { onGround: bot.entity.onGround })
      lastSent.onGround = bot.entity.onGround // this could be outside the if loop
    }
    // mimic vanilla client by setting lastSent after sending
    if (positionUpdated) lastSentPosition(position, onGround, now)
    if (lookUpdated) lastSentLook(yaw, pitch, onGround)
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

  bot.getControlState = (control) => {
    assert.ok(control in controlState, `invalid control: ${control}`)
    return controlState[control]
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

  bot._client.on('explosion', explosion => {
    // TODO: emit an explosion event with more info
    if (bot.physicsEnabled && bot.game.gameMode !== 'creative') {
      bot.entity.velocity.x += explosion.playerMotionX
      bot.entity.velocity.y += explosion.playerMotionY
      bot.entity.velocity.z += explosion.playerMotionZ
    }
  })

  bot.look = callbackify(async (yaw, pitch, force) => {
    if (!lookingTask.done) {
      lookingTask.finish() // finish the previous one
    }
    lookingTask = createTask()

    // this is done to bypass certain anticheat checks that detect the player's sensitivity
    // by calculating the gcd of how much they move the mouse each tick
    const sensitivity = conv.fromNotchianPitch(0.15) // this is equal to 100% sensitivity in vanilla
    const yawChange = Math.round((yaw - bot.entity.yaw) / sensitivity) * sensitivity
    const pitchChange = Math.round((pitch - bot.entity.pitch) / sensitivity) * sensitivity

    bot.entity.yaw += yawChange
    bot.entity.pitch += pitchChange

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
    const now = performance.now()
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
    }
    sendPacketPositionAndLook(pos, newYaw, newPitch, bot.entity.onGround) // this doesn't reset position timer or adjust lastSent values
    // lastSentPosition(pos, bot.entity.onGround, now)
    // lastSentLook(newYaw, newPitch, bot.entity.onGround)

    isAlive = true // if a position packet was sent, you are alive wow
    shouldUsePhysics = true
    bot.entity.timeSinceOnGround = 0
    lastSentYaw = bot.entity.yaw

    if (doPhysicsTimer === null) {
      lastPhysicsFrameTime = now
      // Force send an extra packet to be like vanilla client
      // Vanilla client only sends this once on physics engine startup
      tick(lastPhysicsFrameTime)
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
          bot.removeListener('physicsTick', tickListener)
          resolve()
        }
      }

      bot.on('physicsTick', tickListener)
    })
  }

  bot.on('mount', () => { shouldUsePhysics = false })
  bot.on('respawn', () => {
    shouldUsePhysics = false
    isAlive = false
  })
  bot.on('login', () => {
    shouldUsePhysics = false
    isAlive = false
  })
  bot.on('death', () => {
    isAlive = false
  })
  bot.on('end', cleanup)
}
