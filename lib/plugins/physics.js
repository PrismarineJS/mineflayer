const Vec3 = require('vec3').Vec3
const assert = require('assert')
const math = require('../math')
const conv = require('../conversions')

module.exports = inject

const EPSILON = 0.000001 // good enough so that the player can actually see the bot landing and so the bot doesn't die from "fell from high ground"
const PI = Math.PI
const PI_2 = Math.PI * 2
const POSITION_UPDATE_INTERVAL_MS = 50
const PHYSICS_INTERVAL_MS = 50
const MAX_PHYSICS_DELTA_SECONDS = 0.2
const WAIT_TIME_BEFORE_NEW_JUMP = 0.07

function inject (bot) {
  const physics = {
    maxGroundSpeed: 4.317, // according to the internet
    terminalVelocity: 20.0, // guess
    walkingAcceleration: 100.0, // seems good
    gravity: 27.0, // seems good
    groundFriction: 0.9, // seems good
    playerApothem: 0.32, // notch's client F3 says 0.30, but that caused spankings
    playerHeight: 1.74, // tested with a binary search
    jumpSpeed: 9.0, // seems good
    yawSpeed: 3.0, // seems good
    sprintSpeed: 1.3 // correct
  }
  physics.maxGroundSpeedSoulSand = physics.maxGroundSpeed * 0.4
  physics.maxGroundSpeedWater = physics.maxGroundSpeed * 0.3 // seems about right?

  const controlState = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    sneak: false
  }
  let jumpQueued = false
  let lastSentYaw = null
  let positionUpdateTimer = null
  let doPhysicsTimer = null
  let lastPositionSentTime = null
  let lastPhysicsFrameTime = null
  let lastFlyingUpdate = 0

  function doPhysics () {
    const now = new Date()
    const deltaSeconds = (now - lastPhysicsFrameTime) / 1000
    lastPhysicsFrameTime = now
    const deltaToUse = deltaSeconds < MAX_PHYSICS_DELTA_SECONDS
      ? deltaSeconds : MAX_PHYSICS_DELTA_SECONDS
    nextFrame(deltaToUse)
  }

  function cleanup () {
    stopPhysics()
    stopPositionUpdates()
  }

  function stopPositionUpdates () {
    clearInterval(positionUpdateTimer)
    positionUpdateTimer = null
  }

  function stopPhysics () {
    clearInterval(doPhysicsTimer)
    doPhysicsTimer = null
  }

  function nextFrame (deltaSeconds) {
    if (deltaSeconds < EPSILON) return // too fast
    const pos = bot.entity.position
    const vel = bot.entity.velocity

    // derive xy movement vector from controls
    let movementRight = 0
    if (controlState.right) movementRight += 1
    if (controlState.left) movementRight -= 1
    let movementForward = 0
    if (controlState.forward) movementForward += 1
    if (controlState.back) movementForward -= 1

    // acceleration is m/s/s
    const acceleration = new Vec3(0, 0, 0)
    if (movementForward || movementRight) {
      // input acceleration
      const rotationFromInput = Math.atan2(-movementRight, movementForward)
      const inputYaw = bot.entity.yaw + rotationFromInput
      acceleration.x += physics.walkingAcceleration * -Math.sin(inputYaw)
      acceleration.z += physics.walkingAcceleration * -Math.cos(inputYaw)
      if (controlState.sprint) {
        acceleration.x *= physics.sprintSpeed
        acceleration.z *= physics.sprintSpeed
      }
    }

    // jumping
    if ((controlState.jump || jumpQueued) && bot.entity.onGround && bot.entity.timeSinceOnGround > WAIT_TIME_BEFORE_NEW_JUMP) {
      vel.y = physics.jumpSpeed
    }
    jumpQueued = false

    // gravity
    acceleration.y -= physics.gravity

    const oldGroundSpeedSquared = calcGroundSpeedSquared()
    if (oldGroundSpeedSquared < EPSILON) {
      // stopped
      vel.x = 0
      vel.z = 0
    } else {
      // non-zero ground speed
      const oldGroundSpeed = Math.sqrt(oldGroundSpeedSquared)
      let groundFriction = physics.groundFriction * physics.walkingAcceleration
      // less friction for air
      if (!bot.entity.onGround) groundFriction *= 0.05
      // if friction would stop the motion, do it
      const maybeNewGroundFriction = oldGroundSpeed / deltaSeconds
      groundFriction = groundFriction > maybeNewGroundFriction
        ? maybeNewGroundFriction : groundFriction
      acceleration.x -= vel.x / oldGroundSpeed * groundFriction
      acceleration.z -= vel.z / oldGroundSpeed * groundFriction
    }

    // calculate new speed
    vel.add(acceleration.scaled(deltaSeconds))

    // limit speed
    let currentMaxGroundSpeed
    const underBlock = bot.blockAt(pos.offset(0, -1, 0))
    const inBlock = bot.blockAt(pos.offset(0, 0, 0))
    if (underBlock && underBlock.type === 88) {
      currentMaxGroundSpeed = physics.maxGroundSpeedSoulSand
    } else if (inBlock && inBlock.type === 9) {
      currentMaxGroundSpeed = physics.maxGroundSpeedWater
    } else {
      currentMaxGroundSpeed = physics.maxGroundSpeed
    }
    if (controlState.sprint) {
      currentMaxGroundSpeed *= physics.sprintSpeed
    }

    const groundSpeedSquared = calcGroundSpeedSquared()
    if (groundSpeedSquared > currentMaxGroundSpeed * currentMaxGroundSpeed) {
      const groundSpeed = Math.sqrt(groundSpeedSquared)
      const correctionScale = currentMaxGroundSpeed / groundSpeed
      vel.x *= correctionScale
      vel.z *= correctionScale
    }
    vel.y = math.clamp(-physics.terminalVelocity, vel.y, physics.terminalVelocity)

    // calculate new positions and resolve collisions
    let boundingBox = getBoundingBox()
    let boundingBoxMin
    let boundingBoxMax
    if (vel.x !== 0) {
      pos.x += vel.x * deltaSeconds
      const blockX = Math.floor(pos.x + math.sign(vel.x) * physics.playerApothem)
      boundingBoxMin = new Vec3(blockX, boundingBox.min.y, boundingBox.min.z)
      boundingBoxMax = new Vec3(blockX, boundingBox.max.y, boundingBox.max.z)
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.x = blockX + (vel.x < 0 ? 1 + physics.playerApothem : -physics.playerApothem) * 1.001
        vel.x = 0
        boundingBox = getBoundingBox()
      }
    }

    if (vel.z !== 0) {
      pos.z += vel.z * deltaSeconds
      const blockZ = Math.floor(pos.z + math.sign(vel.z) * physics.playerApothem)
      boundingBoxMin = new Vec3(boundingBox.min.x, boundingBox.min.y, blockZ)
      boundingBoxMax = new Vec3(boundingBox.max.x, boundingBox.max.y, blockZ)
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.z = blockZ + (vel.z < 0 ? 1 + physics.playerApothem : -physics.playerApothem) * 1.001
        vel.z = 0
        boundingBox = getBoundingBox()
      }
    }

    bot.entity.onGround = false
    if (vel.y !== 0) {
      pos.y += vel.y * deltaSeconds
      const playerHalfHeight = physics.playerHeight / 2
      const blockY = Math.floor(pos.y + playerHalfHeight + math.sign(vel.y) * playerHalfHeight)
      boundingBoxMin = new Vec3(boundingBox.min.x, blockY, boundingBox.min.z)
      boundingBoxMax = new Vec3(boundingBox.max.x, blockY, boundingBox.max.z)
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.y = blockY + (vel.y < 0 ? 1 : -physics.playerHeight) * 1.001
        bot.entity.onGround = vel.y < 0 ? true : bot.entity.onGround
        vel.y = 0
      }
    }
    if (bot.entity.onGround) {
      bot.entity.timeSinceOnGround += deltaSeconds
    } else {
      bot.entity.timeSinceOnGround = 0
    }
  }

  function collisionInRange (boundingBoxMin, boundingBoxMax) {
    const cursor = new Vec3(0, 0, 0)
    let block
    for (cursor.x = boundingBoxMin.x; cursor.x <= boundingBoxMax.x; cursor.x++) {
      for (cursor.y = boundingBoxMin.y; cursor.y <= boundingBoxMax.y; cursor.y++) {
        for (cursor.z = boundingBoxMin.z; cursor.z <= boundingBoxMax.z; cursor.z++) {
          block = bot.blockAt(cursor)
          if (block && block.boundingBox === 'block') return true
        }
      }
    }

    return false
  }

  function calcGroundSpeedSquared () {
    const vel = bot.entity.velocity
    return vel.x * vel.x + vel.z * vel.z
  }

  function getBoundingBox () {
    const pos = bot.entity.position
    return {
      min: new Vec3(
        pos.x - physics.playerApothem,
        pos.y,
        pos.z - physics.playerApothem
      ).floor(),
      max: new Vec3(
        pos.x + physics.playerApothem,
        pos.y + physics.playerHeight,
        pos.z + physics.playerApothem
      ).floor()
    }
  }

  function sendPositionAndLook (entity) {
    // sends data, no logic
    const packet = {
      x: entity.position.x,
      y: entity.position.y,
      z: entity.position.z,
      onGround: entity.onGround
    }
    packet.yaw = conv.toNotchianYaw(entity.yaw)
    packet.pitch = conv.toNotchianPitch(entity.pitch)
    bot._client.write('position_look', packet)

    bot.emit('move')
  }

  function sendPosition () {
    // increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    if (typeof bot.entity.height !== 'number' || isNaN(bot.entity.height) || bot.entity.height < 0.1 || bot.entity.height > 1.65) {
      // Sometimes this is NaN, not sure of why, it seems it's set via a position packet
      // Note seems some packets handled by 'position' event do not have a stance.
      bot.entity.height = 1.62
    }
    const sentPosition = {
      yaw: bot.entity.yaw % PI_2,
      pitch: bot.entity.pitch,
      position: bot.entity.position,
      velocity: bot.entity.velocity,
      height: bot.entity.height,
      onGround: bot.entity.onGround
    }
    let deltaYaw = math.euclideanMod(sentPosition.yaw - lastSentYaw, PI_2)
    deltaYaw = deltaYaw < 0
      ? (deltaYaw < -PI ? deltaYaw + PI_2 : deltaYaw)
      : (deltaYaw > PI ? deltaYaw - PI_2 : deltaYaw)
    const absDeltaYaw = Math.abs(deltaYaw)
    assert.ok(absDeltaYaw < PI + 0.001)

    const now = new Date()
    const deltaMs = now - lastPositionSentTime
    lastPositionSentTime = now
    const maxDeltaYaw = deltaMs / 1000 * physics.yawSpeed
    deltaYaw = absDeltaYaw > maxDeltaYaw ? maxDeltaYaw * math.sign(deltaYaw) : deltaYaw
    lastSentYaw = (lastSentYaw + deltaYaw) % PI_2
    sentPosition.yaw = lastSentYaw

    if (new Date() - lastFlyingUpdate > 1000) {
      // Always send flying messages
      // If you're dead, you're probably on the ground though ...
      if (!bot.isAlive) bot.entity.onGround = true
      bot._client.write('flying', { onGround: bot.entity.onGround })
      lastFlyingUpdate = new Date()
    }

    // Only send location when alive though
    if (bot.isAlive) {
      sendPositionAndLook(sentPosition)
    }
  }

  bot.physics = physics

  bot.setControlState = function setControlState (control, state) {
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
      if (Math.abs((lastSentYaw - yaw) % PI_2) < 0.001) {
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

  // player position and look
  bot._client.on('position', (packet) => {
    if (positionUpdateTimer === null) {
      // got first 0x0d. start the clocks
      bot.entity.yaw = conv.fromNotchianYaw(packet.yaw)
      bot.entity.pitch = conv.fromNotchianPitch(packet.pitch)
      positionUpdateTimer = setInterval(sendPosition, POSITION_UPDATE_INTERVAL_MS)
    }

    bot.entity.velocity.set(0, 0, 0)
    bot.entity.position.set(packet.x, packet.y, packet.z)

    // Packet 0x08 Player Position And Look, does not send a stance
    if (packet.stance) bot.entity.height = packet.stance - bot.entity.position.y
    else bot.entity.height = 1.62

    if (bot.majorVersion === '1.8') {
      sendPositionAndLook(bot.entity)
    }

    if (bot.majorVersion === '1.9' || bot.majorVersion === '1.10' || bot.majorVersion === '1.11' || bot.majorVersion === '1.12' || bot.majorVersion === '1.13') {
      bot._client.write('teleport_confirm', { teleportId: packet.teleportId })
      bot.emit('move')
    }

    if (doPhysicsTimer === null) {
      bot.entity.timeSinceOnGround = 0
      lastSentYaw = math.euclideanMod(bot.entity.yaw, PI_2)
      lastPositionSentTime = new Date()
      lastPhysicsFrameTime = new Date()
      doPhysicsTimer = setInterval(doPhysics, PHYSICS_INTERVAL_MS)
    }
    bot.emit('forcedMove')
  })

  bot.on('mount', stopPhysics)
  bot.on('respawn', stopPhysics)
  bot.on('end', cleanup)
}
