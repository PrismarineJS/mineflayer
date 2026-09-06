const { Vec3 } = require('vec3')
const assert = require('assert')
const math = require('../math')
const conv = require('../conversions')
const { performance } = require('perf_hooks')
const { createDoneTask, createTask } = require('../promise_utils')

const { Physics, PlayerState } = require('prismarine-physics')

module.exports = inject

const PI = Math.PI
const PI_2 = Math.PI * 2
const PHYSICS_INTERVAL_MS = 50
const PHYSICS_TIMESTEP = PHYSICS_INTERVAL_MS / 1000 // 0.05

function inject (bot, { physicsEnabled, maxCatchupTicks }) {
  const PHYSICS_CATCHUP_TICKS = maxCatchupTicks ?? 4
  const world = { getBlock: (pos) => { return bot.blockAt(pos, false) } }
  const physics = Physics(bot.registry, world)

  const positionUpdateSentEveryTick = bot.supportFeature('positionUpdateSentEveryTick')
  const hasConfigurationState = bot.supportFeature('hasConfigurationState') // 1.20.2+
  // player_input is sent only when the key set changes; tick_end after every tick.
  // Servers before 1.21.6 ignore the shift bit of player_input; from 1.21.6 entity_action has no shift entries.
  const hasPlayerInputPacket = bot.supportFeature('newPlayerInputPacket')
  const hasTickEndPacket = 'packet_tick_end' in bot.registry.protocol.play.toServer.types
  const sneakUsesEntityAction = bot.supportFeature('sneakUsesEntityAction')

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
  let lastSentPitch = null
  let lastSentSneak = false
  let lastSentSprinting = false
  let lastSentInputs = null
  // Ticks since the last position packet; a position packet goes out before it passes 20.
  let positionReminder = 0
  // Only updateSprinting sets this; the sprint key alone never does.
  let sprinting = false
  let doPhysicsTimer = null
  let lastPhysicsFrameTime = null
  let shouldUsePhysics = false
  bot.physicsEnabled = physicsEnabled ?? true
  let deadTicks = 21

  const lastSent = {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    onGround: false,
    hasHorizontalCollision: false,
    time: 0,
    flags: { onGround: false, hasHorizontalCollision: false }
  }

  const collidedHorizontally = () => bot.entity.isCollidedHorizontally === true

  // This function should be executed each tick (every 0.05 seconds)
  // How it works: https://gafferongames.com/post/fix_your_timestep/

  // WARNING: THIS IS NOT ACCURATE ON WINDOWS (15.6 Timer Resolution)
  // use WSL or switch to Linux
  // see: https://discord.com/channels/413438066984747026/519952494768685086/901948718255833158
  let timeAccumulator = 0
  let catchupTicks = 0
  function doPhysics () {
    const now = performance.now()
    const deltaSeconds = (now - lastPhysicsFrameTime) / 1000
    lastPhysicsFrameTime = now

    timeAccumulator += deltaSeconds
    catchupTicks = 0
    while (timeAccumulator >= PHYSICS_TIMESTEP) {
      tickPhysics(now)
      timeAccumulator -= PHYSICS_TIMESTEP
      catchupTicks++
      if (catchupTicks >= PHYSICS_CATCHUP_TICKS) break
    }
  }

  function tickPhysics (now) {
    if (bot._client.state !== 'play') return // do nothing outside of the play state (e.g. server transfer configuration phase)
    if (!bot.entity?.position || !Number.isFinite(bot.entity.position.x)) return // entity not ready
    if (bot.blockAt(bot.entity.position) == null) return // check if chunk is unloaded
    if (bot.physicsEnabled && shouldUsePhysics) {
      updateSprinting()
      physics.simulatePlayer(new PlayerState(bot, { ...controlState, sprint: sprinting }), world).apply(bot)
      bot.emit('physicsTick')
      bot.emit('physicTick') // Deprecated, only exists to support old plugins. May be removed in the future
    }
    if (shouldUsePhysics) {
      sendInputPackets()
      updatePosition(now)
      if (hasTickEndPacket) bot._client.write('tick_end', {})
    }
  }

  // remove this when 'physicTick' is removed
  bot.on('newListener', (name) => {
    if (name === 'physicTick') console.warn('Mineflayer detected that you are using a deprecated event (physicTick)! Please use this event (physicsTick) instead.')
  })

  function cleanup () {
    clearInterval(doPhysicsTimer)
    doPhysicsTimer = null
  }

  function sendPacketPosition (position, onGround) {
    // sends data, no logic
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z)) return
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.x = position.x
    lastSent.y = position.y
    lastSent.z = position.z
    lastSent.onGround = onGround
    lastSent.flags = { onGround, hasHorizontalCollision: collidedHorizontally() } // 1.21.3+
    bot._client.write('position', lastSent)
    bot.emit('move', oldPos)
  }

  function sendPacketLook (yaw, pitch, onGround) {
    // sends data, no logic
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.yaw = yaw
    lastSent.pitch = pitch
    lastSent.onGround = onGround
    lastSent.flags = { onGround, hasHorizontalCollision: collidedHorizontally() } // 1.21.3+
    bot._client.write('look', lastSent)
    bot.emit('move', oldPos)
  }

  function sendPacketPositionAndLook (position, yaw, pitch, onGround) {
    // sends data, no logic
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z)) return
    const oldPos = new Vec3(lastSent.x, lastSent.y, lastSent.z)
    lastSent.x = position.x
    lastSent.y = position.y
    lastSent.z = position.z
    lastSent.yaw = yaw
    lastSent.pitch = pitch
    lastSent.onGround = onGround
    lastSent.flags = { onGround, hasHorizontalCollision: collidedHorizontally() } // 1.21.3+
    bot._client.write('position_look', lastSent)
    bot.emit('move', oldPos)
  }

  function deltaYaw (yaw1, yaw2) {
    let dYaw = (yaw1 - yaw2) % PI_2
    if (dYaw < -PI) dYaw += PI_2
    else if (dYaw > PI) dYaw -= PI_2

    return dYaw
  }

  // returns false if bot should send position packets
  function isEntityRemoved () {
    if (bot.isAlive === true) deadTicks = 0
    if (bot.isAlive === false && deadTicks <= 20) deadTicks++
    if (deadTicks >= 20) return true
    return false
  }

  function updatePosition (now) {
    // Only send updates for 20 ticks after death
    if (isEntityRemoved()) return
    // Don't send position with invalid coordinates (NaN after death)
    if (!Number.isFinite(bot.entity.position.x)) return

    // Increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    const dYaw = deltaYaw(bot.entity.yaw, lastSentYaw)
    const dPitch = bot.entity.pitch - (lastSentPitch || 0)

    // Vanilla doesn't clamp yaw, so we don't want to do it either
    const maxDeltaYaw = PHYSICS_TIMESTEP * physics.yawSpeed
    const maxDeltaPitch = PHYSICS_TIMESTEP * physics.pitchSpeed
    lastSentYaw += math.clamp(-maxDeltaYaw, dYaw, maxDeltaYaw)
    lastSentPitch += math.clamp(-maxDeltaPitch, dPitch, maxDeltaPitch)

    const yaw = Math.fround(conv.toNotchianYaw(lastSentYaw))
    const pitch = Math.fround(conv.toNotchianPitch(lastSentPitch))
    const position = bot.entity.position
    const onGround = bot.entity.onGround
    const hasHorizontalCollision = collidedHorizontally()

    // Vanilla thresholds: 2e-4 blocks of movement or 20 ticks since the last position packet.
    positionReminder++
    const dx = position.x - lastSent.x
    const dy = position.y - lastSent.y
    const dz = position.z - lastSent.z
    const positionUpdated = dx * dx + dy * dy + dz * dz > 4e-8 || positionReminder >= 20
    const lookUpdated = lastSent.yaw !== yaw || lastSent.pitch !== pitch

    if (positionUpdated && lookUpdated) {
      sendPacketPositionAndLook(position, yaw, pitch, onGround)
    } else if (positionUpdated) {
      sendPacketPosition(position, onGround)
    } else if (lookUpdated) {
      sendPacketLook(yaw, pitch, onGround)
    } else if (positionUpdateSentEveryTick || onGround !== lastSent.onGround || hasHorizontalCollision !== lastSent.hasHorizontalCollision) {
      // For versions < 1.12, one player packet should be sent every tick
      // for the server to update health correctly
      bot._client.write('flying', {
        onGround,
        flags: { onGround, hasHorizontalCollision } // 1.21.3+
      })
    }
    if (positionUpdated) {
      positionReminder = 0
      lastSent.time = now
    }

    lastSent.onGround = onGround // onGround is always set
    lastSent.hasHorizontalCollision = hasHorizontalCollision
  }

  // Packet order must match LocalPlayer.tick: shift key, key set, sprinting state, then the movement packet.
  function sendInputPackets () {
    if (controlState.sneak !== lastSentSneak) {
      lastSentSneak = controlState.sneak
      if (sneakUsesEntityAction) {
        bot._client.write('entity_action', {
          entityId: bot.entity.id,
          actionId: controlState.sneak ? 0 : 1,
          jumpBoost: 0
        })
      }
    }
    if (hasPlayerInputPacket) {
      const inputs = {
        forward: controlState.forward,
        backward: controlState.back,
        left: controlState.left,
        right: controlState.right,
        jump: controlState.jump,
        shift: controlState.sneak,
        sprint: controlState.sprint
      }
      if (lastSentInputs === null || Object.keys(inputs).some(k => inputs[k] !== lastSentInputs[k])) {
        lastSentInputs = inputs
        bot._client.write('player_input', { inputs })
      }
    }
    if (sprinting !== lastSentSprinting) {
      lastSentSprinting = sprinting
      bot._client.write('entity_action', {
        entityId: bot.entity.id,
        actionId: bot.supportFeature('entityActionUsesStringMapper')
          ? (sprinting ? 'start_sprinting' : 'stop_sprinting')
          : (sprinting ? 3 : 4),
        jumpBoost: 0
      })
    }
  }

  // Must mirror LocalPlayer.aiStep: the simulation and start/stop_sprinting both read this state.
  function updateSprinting () {
    const mcData = bot.registry
    const forward = controlState.forward && !controlState.back
    const enoughFood = bot.food === undefined || bot.food > 6 || bot.game.gameMode === 'creative'
    const slow = controlState.sneak || bot.usingHeldItem
    const blind = getEffectLevel(mcData, 'Blindness', bot.entity.effects ?? {}) > 0
    if (!sprinting) {
      if (controlState.sprint && forward && enoughFood && !slow && !blind && bot.entity.onGround && !bot.entity.isInWater) sprinting = true
    }
    if (sprinting) {
      const vel = bot.entity.velocity
      const blocked = collidedHorizontally() && vel.x * vel.x + vel.z * vel.z < 0.06 * 0.06
      if (!forward || !enoughFood || slow || blind || blocked || bot.entity.isInWater) sprinting = false
    }
  }

  bot.physics = physics

  function getEffectLevel (mcData, effectName, effects) {
    const effectDescriptor = mcData.effectsByName[effectName]
    if (!effectDescriptor) {
      return 0
    }
    const effectInfo = effects[effectDescriptor.id]
    if (!effectInfo) {
      return 0
    }
    return effectInfo.amplifier + 1
  }

  bot.elytraFly = async () => {
    if (bot.entity.elytraFlying) {
      throw new Error('Already elytra flying')
    } else if (bot.entity.onGround) {
      throw new Error('Unable to fly from ground')
    } else if (bot.entity.isInWater) {
      throw new Error('Unable to elytra fly while in water')
    }

    const mcData = require('minecraft-data')(bot.version)
    if (getEffectLevel(mcData, 'Levitation', bot.entity.effects) > 0) {
      throw new Error('Unable to elytra fly with levitation effect')
    }

    const torsoSlot = bot.getEquipmentDestSlot('torso')
    const item = bot.inventory.slots[torsoSlot]
    if (item == null || item.name !== 'elytra') {
      throw new Error('Elytra must be equip to start flying')
    }
    bot._client.write('entity_action', {
      entityId: bot.entity.id,
      actionId: bot.supportFeature('entityActionUsesStringMapper') ? 'start_elytra_flying' : 8,
      jumpBoost: 0
    })
  }

  bot.setControlState = (control, state) => {
    assert.ok(control in controlState, `invalid control: ${control}`)
    assert.ok(typeof state === 'boolean', `invalid state: ${state}`)
    if (controlState[control] === state) return
    controlState[control] = state
    if (control === 'jump' && state) {
      bot.jumpQueued = true
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
      if (explosion.playerKnockback) { // 1.21.3+
        // Fixes issue #3635
        bot.entity.velocity.x += explosion.playerKnockback.x
        bot.entity.velocity.y += explosion.playerKnockback.y
        bot.entity.velocity.z += explosion.playerKnockback.z
      }
      if ('playerMotionX' in explosion) {
        bot.entity.velocity.x += explosion.playerMotionX
        bot.entity.velocity.y += explosion.playerMotionY
        bot.entity.velocity.z += explosion.playerMotionZ
      }
    }
  })

  bot.look = async (yaw, pitch, force) => {
    if (!lookingTask.done) {
      lookingTask.finish() // finish the previous one
    }
    lookingTask = createTask()

    // this is done to bypass certain anticheat checks that detect the player's sensitivity
    // by calculating the gcd of how much they move the mouse each tick
    const sensitivity = conv.fromNotchianPitch(0.15) // this is equal to 100% sensitivity in vanilla
    const yawChange = Math.round((yaw - bot.entity.yaw) / sensitivity) * sensitivity
    const pitchChange = Math.round((pitch - bot.entity.pitch) / sensitivity) * sensitivity

    if (yawChange === 0 && pitchChange === 0) {
      return
    }

    bot.entity.yaw += yawChange
    bot.entity.pitch += pitchChange

    if (force) {
      lastSentYaw = yaw
      lastSentPitch = pitch
      return
    }

    await lookingTask.promise
  }

  bot.lookAt = async (point, force) => {
    const delta = point.minus(bot.entity.position.offset(0, bot.entity.eyeHeight, 0))
    const yaw = Math.atan2(-delta.x, -delta.z)
    const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z)
    const pitch = Math.atan2(delta.y, groundDistance)
    await bot.look(yaw, pitch, force)
  }

  // 1.21.3+
  bot._client.on('player_rotation', (packet) => {
    bot.entity.yaw = conv.fromNotchianYaw(packet.yaw)
    bot.entity.pitch = conv.fromNotchianPitch(packet.pitch)
  })

  // player position and look (clientbound)
  bot._client.on('position', (packet) => {
    // Is this necessary? Feels like it might wrongly overwrite hitbox size sometimes
    // e.g. when crouching/crawling/swimming. Can someone confirm?
    bot.entity.height = 1.8

    const vel = bot.entity.velocity
    const pos = bot.entity.position
    let newYaw, newPitch

    // Note: 1.20.5+ uses a bitflags object, older versions use a bitmask number
    if (typeof packet.flags === 'object') {
      // Modern path with bitflags object
      // Velocity is only set to 0 if the flag is not set, otherwise keep current velocity
      vel.set(
        packet.flags.x ? vel.x : 0,
        packet.flags.y ? vel.y : 0,
        packet.flags.z ? vel.z : 0
      )
      // If flag is set, then the corresponding value is relative, else it is absolute
      pos.set(
        packet.flags.x ? (pos.x + packet.x) : packet.x,
        packet.flags.y ? (pos.y + packet.y) : packet.y,
        packet.flags.z ? (pos.z + packet.z) : packet.z
      )
      newYaw = (packet.flags.yaw ? conv.toNotchianYaw(bot.entity.yaw) : 0) + packet.yaw
      newPitch = (packet.flags.pitch ? conv.toNotchianPitch(bot.entity.pitch) : 0) + packet.pitch
    } else {
      // Legacy path with bitmask number
      // Velocity is only set to 0 if the flag is not set, otherwise keep current velocity
      vel.set(
        packet.flags & 1 ? vel.x : 0,
        packet.flags & 2 ? vel.y : 0,
        packet.flags & 4 ? vel.z : 0
      )
      // If flag is set, then the corresponding value is relative, else it is absolute
      pos.set(
        packet.flags & 1 ? (pos.x + packet.x) : packet.x,
        packet.flags & 2 ? (pos.y + packet.y) : packet.y,
        packet.flags & 4 ? (pos.z + packet.z) : packet.z
      )
      newYaw = (packet.flags & 8 ? conv.toNotchianYaw(bot.entity.yaw) : 0) + packet.yaw
      newPitch = (packet.flags & 16 ? conv.toNotchianPitch(bot.entity.pitch) : 0) + packet.pitch
    }

    bot.entity.yaw = conv.fromNotchianYaw(newYaw)
    bot.entity.pitch = conv.fromNotchianPitch(newPitch)
    bot.entity.onGround = false

    if (bot.supportFeature('teleportUsesOwnPacket')) {
      bot._client.write('teleport_confirm', { teleportId: packet.teleportId })
    }

    // After death/respawn, delay the forced position_look response.
    // Sending it immediately causes "Invalid move player packet" kicks
    // on older servers, but the server needs it to complete the respawn.
    if (respawnTimer > 0 && Date.now() - respawnTimer < 2000) {
      respawnTimer = 0 // only delay once
      const delayedPos = pos.clone()
      const delayedYaw = newYaw
      const delayedPitch = newPitch
      const delayedOnGround = bot.entity.onGround
      setTimeout(() => {
        sendPacketPositionAndLook(delayedPos, delayedYaw, delayedPitch, delayedOnGround)
        shouldUsePhysics = true
        bot.jumpTicks = 0
        lastSentYaw = bot.entity.yaw
        lastSentPitch = bot.entity.pitch
        bot.emit('forcedMove')
      }, 1500)
      return
    }

    sendPacketPositionAndLook(pos, newYaw, newPitch, bot.entity.onGround)

    shouldUsePhysics = true
    bot.jumpTicks = 0
    lastSentYaw = bot.entity.yaw
    lastSentPitch = bot.entity.pitch

    bot.emit('forcedMove')
  })

  bot.waitForTicks = async function (ticks) {
    if (ticks <= 0) return
    await new Promise((resolve, reject) => {
      // Assuming 20 ticks per second, add extra time for lag
      const timeout = setTimeout(() => {
        bot.removeListener('physicsTick', tickListener)
        reject(new Error(`Timeout waiting for ${ticks} ticks after ${(ticks * 50 + 5000)}ms`))
      }, ticks * 50 + 5000) // 50ms per tick + 5s buffer

      const tickListener = () => {
        ticks--
        if (ticks === 0) {
          clearTimeout(timeout)
          bot.removeListener('physicsTick', tickListener)
          resolve()
        }
      }

      bot.on('physicsTick', tickListener)
    })
  }

  let respawnTimer = 0
  bot.on('mount', () => { shouldUsePhysics = false })
  bot.on('death', () => {
    shouldUsePhysics = false
    respawnTimer = Date.now()
  })
  bot.on('respawn', () => { shouldUsePhysics = false })
  bot.on('login', () => {
    shouldUsePhysics = false
    if (doPhysicsTimer === null) {
      lastPhysicsFrameTime = performance.now()
      doPhysicsTimer = setInterval(doPhysics, PHYSICS_INTERVAL_MS)
    }
  })
  // A proxy (e.g. Velocity) transferring us to another server makes the client
  // re-enter the configuration phase, during which play-state movement packets
  // are not allowed. Physics is re-enabled by the position packet handler once
  // the server finishes configuration and play resumes.
  if (hasConfigurationState) {
    bot._client.on('start_configuration', () => { shouldUsePhysics = false })
  }
  bot.on('end', cleanup)
}
