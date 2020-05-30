const Vec3 = require('vec3').Vec3
const assert = require('assert')
const math = require('../math')
const conv = require('../conversions')
const { performance } = require('perf_hooks')

const AABB = require('../aabb')

module.exports = inject

const PI = Math.PI
const PI_2 = Math.PI * 2
const PHYSICS_INTERVAL_MS = 50
const PHYSICS_TIMESTEP = PHYSICS_INTERVAL_MS / 1000

function inject (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const blocksByName = mcData.blocksByName

  // Block Slipperiness
  // https://www.mcpk.wiki/w/index.php?title=Slipperiness
  const blockSlipperiness = {}
  if (blocksByName.slime_block) {
    blockSlipperiness[blocksByName.slime_block.id] = 0.8
  } else {
    blockSlipperiness[blocksByName.slime.id] = 0.8
  }
  blockSlipperiness[blocksByName.ice.id] = 0.98
  blockSlipperiness[blocksByName.packed_ice.id] = 0.98
  if (blocksByName.frosted_ice) { // 1.9+
    blockSlipperiness[blocksByName.frosted_ice.id] = 0.98
  }
  if (blocksByName.blue_ice) { // 1.13+
    blockSlipperiness[blocksByName.blue_ice.id] = 0.989
  }

  // Block ids
  const soulsandId = blocksByName.soul_sand.id
  const webId = blocksByName.cobweb ? blocksByName.cobweb.id : blocksByName.web.id
  const waterId = blocksByName.water.id
  const lavaId = blocksByName.lava.id
  // const ladderId = blocksByName.ladder.id
  // const vineId = blocksByName.vine.id

  const physics = {
    gravity: 0.08, // blocks/tick^2 https://minecraft.gamepedia.com/Entity#Motion_of_entities
    yawSpeed: 3.0, // seems good
    sprintSpeed: 1.3, // correct
    negligeableVelocity: 0.003 // actually 0.005 for 1.8, but seems fine
  }

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

  let jumpQueued = false
  let jumpTicks = 0 // autojump cooldown

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
        updatePlayer()
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

  function getPlayerBB (pos) {
    return new AABB(-0.3, 0, -0.3, 0.3, 1.8, 0.3).offset(pos.x, pos.y, pos.z)
  }

  function getSurroundingBBs (queryBB) {
    const surroundingBBs = []
    const cursor = new Vec3(0, 0, 0)
    for (cursor.y = Math.floor(queryBB.minY); cursor.y <= Math.floor(queryBB.maxY); cursor.y++) {
      for (cursor.z = Math.floor(queryBB.minZ); cursor.z <= Math.floor(queryBB.maxZ); cursor.z++) {
        for (cursor.x = Math.floor(queryBB.minX); cursor.x <= Math.floor(queryBB.maxX); cursor.x++) {
          const block = bot.blockAt(cursor)
          if (block) {
            const blockPos = block.position
            for (const shape of block.shapes) {
              const blockBB = new AABB(shape[0], shape[1], shape[2], shape[3], shape[4], shape[5])
              blockBB.offset(blockPos.x, blockPos.y, blockPos.z)
              surroundingBBs.push(blockBB)
            }
          }
        }
      }
    }
    return surroundingBBs
  }

  physics.adjustPositionHeight = (pos) => {
    const playerBB = getPlayerBB(pos)
    const queryBB = playerBB.clone().extend(0, -1, 0)
    const surroundingBBs = getSurroundingBBs(queryBB)

    let dy = -1
    for (const blockBB of surroundingBBs) {
      dy = blockBB.computeOffsetY(playerBB, dy)
    }
    pos.y += dy
  }

  function moveEntity (dx, dy, dz) {
    const entity = bot.entity
    const vel = entity.velocity
    const pos = entity.position

    if (bot.entity.isInWeb) {
      dx *= 0.25
      dy *= 0.05
      dz *= 0.25
      vel.x = 0
      vel.y = 0
      vel.z = 0
      bot.entity.isInWeb = false
    }

    const oldVelX = dx
    const oldVelY = dy
    const oldVelZ = dz

    const playerBB = getPlayerBB(pos)
    const queryBB = playerBB.clone().extend(dx, dy, dz)
    const surroundingBBs = getSurroundingBBs(queryBB)

    for (const blockBB of surroundingBBs) {
      dy = blockBB.computeOffsetY(playerBB, dy)
    }
    playerBB.offset(0, dy, 0)
    pos.y += dy

    for (const blockBB of surroundingBBs) {
      dx = blockBB.computeOffsetX(playerBB, dx)
    }
    playerBB.offset(dx, 0, 0)
    pos.x += dx

    for (const blockBB of surroundingBBs) {
      dz = blockBB.computeOffsetZ(playerBB, dz)
    }
    playerBB.offset(0, 0, dz)
    pos.z += dz

    entity.isCollidedHorizontally = dx !== oldVelX || dz !== oldVelZ
    entity.isCollidedVertically = dy !== oldVelY
    entity.onGround = entity.isCollidedVertically && oldVelY < 0

    if (dx !== oldVelX) vel.x = 0
    if (dy !== oldVelY) vel.y = 0
    if (dz !== oldVelZ) vel.z = 0

    // Finally, apply block collisions (web, soulsand...)
    playerBB.contract(0.001, 0.001, 0.001)
    const cursor = new Vec3(0, 0, 0)
    for (cursor.y = Math.floor(playerBB.minY); cursor.y <= Math.floor(playerBB.maxY); cursor.y++) {
      for (cursor.z = Math.floor(playerBB.minZ); cursor.z <= Math.floor(playerBB.maxZ); cursor.z++) {
        for (cursor.x = Math.floor(playerBB.minX); cursor.x <= Math.floor(playerBB.maxX); cursor.x++) {
          const block = bot.blockAt(cursor)
          if (block) {
            if (block.type === soulsandId) {
              vel.x *= 0.4
              vel.z *= 0.4
            } else if (block.type === webId) {
              bot.entity.isInWeb = true
            }
          }
        }
      }
    }
  }

  function applyHeading (strafe, forward, multiplier) {
    let speed = Math.sqrt(strafe * strafe + forward * forward)
    if (speed < 0.01) return new Vec3(0, 0, 0)

    speed = multiplier / Math.max(speed, 1)

    strafe *= speed
    forward *= speed

    const yaw = PI - bot.entity.yaw
    const sin = Math.sin(yaw)
    const cos = Math.cos(yaw)

    const vel = bot.entity.velocity
    vel.x += strafe * cos - forward * sin
    vel.z += forward * cos + strafe * sin
  }

  function moveEntityWithHeading (strafe, forward) {
    const vel = bot.entity.velocity
    const pos = bot.entity.position

    if (!bot.entity.isInWater && !bot.entity.isInLava) {
      // Normal movement
      let acceleration = 0.02 // airborne
      let inertia = 0.91
      const blockUnder = bot.blockAt(pos.offset(0, -1, 0))
      if (bot.entity.onGround && blockUnder) {
        inertia = (blockSlipperiness[blockUnder.type] || 0.6) * 0.91
        acceleration = 0.1 * (0.1627714 / (inertia * inertia * inertia))
      }
      if (controlState.sprint) acceleration *= physics.sprintSpeed

      applyHeading(strafe, forward, acceleration)
      // TODO: ladder handling
      moveEntity(vel.x, vel.y, vel.z)

      // Apply friction and gravity
      vel.y -= physics.gravity
      vel.y *= 0.98 // air drag
      vel.x *= inertia
      vel.z *= inertia
    } else {
      // Water / Lava movement
      const acceleration = 0.02
      const inertia = bot.entity.isInWater ? 0.8 : 0.5
      // TODO: depth strider enchantement (for water)
      applyHeading(strafe, forward, acceleration)
      moveEntity(vel.x, vel.y, vel.z)
      vel.y *= inertia
      vel.y -= 0.02
      vel.x *= inertia
      vel.z *= inertia

      if (bot.entity.isCollidedHorizontally) { // TODO: && isOffsetPositionInLiquid
        vel.y = 0.3 // jump out of liquid
      }
    }
  }

  function isMaterialInBB (queryBB, type) {
    const cursor = new Vec3(0, 0, 0)
    for (cursor.y = Math.floor(queryBB.minY); cursor.y <= Math.floor(queryBB.maxY); cursor.y++) {
      for (cursor.z = Math.floor(queryBB.minZ); cursor.z <= Math.floor(queryBB.maxZ); cursor.z++) {
        for (cursor.x = Math.floor(queryBB.minX); cursor.x <= Math.floor(queryBB.maxX); cursor.x++) {
          const block = bot.blockAt(cursor)
          if (block && block.type === type) return true
        }
      }
    }
    return false
  }

  function updatePlayer () {
    const vel = bot.entity.velocity
    const pos = bot.entity.position

    const waterBB = getPlayerBB(pos).contract(0.001, 0.401, 0.001)
    const lavaBB = getPlayerBB(pos).contract(0.1, 0.4, 0.1)

    bot.entity.isInWater = isMaterialInBB(waterBB, waterId) // TODO: liquid flow
    bot.entity.isInLava = isMaterialInBB(lavaBB, lavaId)

    // Reset velocity component if it falls under the threshold
    if (Math.abs(vel.x) < physics.negligeableVelocity) vel.x = 0
    if (Math.abs(vel.y) < physics.negligeableVelocity) vel.y = 0
    if (Math.abs(vel.z) < physics.negligeableVelocity) vel.z = 0

    // Handle inputs
    if (controlState.jump || jumpQueued) {
      if (jumpTicks > 0) jumpTicks--
      if (bot.entity.isInWater || bot.entity.isInLava) {
        vel.y += 0.04
      } else if (bot.entity.onGround && jumpTicks === 0) {
        vel.y = 0.42
        // TODO: jump potion effect
        if (controlState.sprint) {
          const yaw = PI - bot.entity.yaw
          vel.x -= Math.sin(yaw) * 0.2
          vel.z += Math.cos(yaw) * 0.2
        }
        jumpTicks = 10 // activate autojump cooldown (0.5s)
      }
    } else {
      jumpTicks = 0 // reset autojump cooldown
    }
    jumpQueued = false

    let strafe = (controlState.right - controlState.left) * 0.98
    let forward = (controlState.forward - controlState.back) * 0.98

    if (controlState.sneak) {
      strafe *= 0.3
      forward *= 0.3
    }

    moveEntityWithHeading(strafe, forward)
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

  function updatePosition (dt) {
    // If you're dead, you're probably on the ground though ...
    if (!bot.isAlive) bot.entity.onGround = true

    // Increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    let deltaYaw = (bot.entity.yaw - lastSentYaw) % PI_2
    if (deltaYaw < -PI) deltaYaw += PI_2
    else if (deltaYaw > PI) deltaYaw -= PI_2

    // Vanilla doesn't clamp yaw, so we don't want to do it either
    const maxDeltaYaw = dt * physics.yawSpeed
    lastSentYaw += math.clamp(-maxDeltaYaw, deltaYaw, maxDeltaYaw)

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
      jumpQueued = true
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

  function noop (err) {
    if (err) throw err
  }

  bot.look = (yaw, pitch, force, cb) => {
    const haveCb = !!cb
    cb = cb || noop
    bot.entity.yaw = yaw
    bot.entity.pitch = pitch
    if (force) lastSentYaw = yaw
    function checkYaw () {
      if (Math.abs(((lastSentYaw % PI_2) - yaw) % PI_2) < 0.001) {
        bot.removeListener('move', checkYaw)
        cb()
      }
    }
    if (haveCb) bot.on('move', checkYaw)
  }

  bot.lookAt = (point, force, cb) => {
    const delta = point.minus(bot.entity.position.offset(0, bot.entity.height, 0))
    const yaw = Math.atan2(-delta.x, -delta.z)
    const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z)
    const pitch = Math.atan2(delta.y, groundDistance)
    bot.look(yaw, pitch, force, cb)
  }

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

    if (bot.supportFeature('teleportUsesPositionPacket')) {
      sendPacketPositionAndLook(pos, newYaw, newPitch, bot.entity.onGround)
    } else if (bot.supportFeature('teleportUsesOwnPacket')) {
      bot._client.write('teleport_confirm', { teleportId: packet.teleportId })
    }

    physicEnabled = true
    bot.entity.timeSinceOnGround = 0
    lastSentYaw = bot.entity.yaw

    if (doPhysicsTimer === null) {
      lastPhysicsFrameTime = performance.now()
      doPhysicsTimer = setInterval(doPhysics, PHYSICS_INTERVAL_MS)
    }
    bot.emit('forcedMove')
  })

  bot.on('mount', () => { physicEnabled = false })
  bot.on('respawn', () => { physicEnabled = false })
  bot.on('end', cleanup)
}
