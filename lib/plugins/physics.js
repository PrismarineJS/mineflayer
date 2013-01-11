var Vec3 = require('vec3').Vec3
  , assert = require('assert')

module.exports = inject;

var EPSILON = 0.000001
  , PI = Math.PI
  , PI_2 = Math.PI * 2
  , POSITION_UPDATE_INTERVAL_MS = 50
  , PHYSICS_INTERVAL_MS = 20

function inject(bot) {
  var physics = {
    maxGroundSpeed: 4.27, // according to the internet
    terminalVelocity: 20.0, // guess
    walkingAcceleration: 100.0, // seems good
    gravity: 27.0, // seems good
    groundFriction: 0.9, // seems good
    playerApothem: 0.32, // notch's client F3 says 0.30, but that caused spankings
    playerHeight: 1.74, // tested with a binary search
    jumpSpeed: 9.0, // seems good
    yawSpeed: 3.0, // seems good
  };

  var controlState = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  };
  var jumpQueued = false;
  var lastSentYaw = null;
  var positionUpdateTimer = null;
  var doPhysicsTimer = null;
  var lastPositionSentTime = null;
  var lastPhyicsFrameTime = null;

  function doPhysics() {
    var now = new Date();
    var deltaSeconds = (now - lastPhyicsFrameTime) / 1000;
    lastPhyicsFrameTime = now;
    nextFrame(deltaSeconds);
  }

  function stopPhysics() {
    clearInterval(positionUpdateTimer);
    clearInterval(doPhysicsTimer);
    positionUpdateTimer = null;
    doPhysicsTimer = null;
  }

  function nextFrame(deltaSeconds) {
    if (deltaSeconds < EPSILON) return; // too fast
    var pos = bot.entity.position;
    var vel = bot.entity.velocity;

    // derive xy movement vector from controls
    var movementRight = 0;
    if (controlState.right) movementRight += 1;
    if (controlState.left) movementRight -= 1;
    var movementForward = 0;
    if (controlState.forward) movementForward += 1;
    if (controlState.back) movementForward -= 1;

    // acceleration is m/s/s
    var acceleration = new Vec3(0, 0, 0);
    if (movementForward || movementRight) {
      // input acceleration
      var rotationFromInput = Math.atan2(-movementRight, movementForward);
      var inputYaw = bot.entity.yaw + rotationFromInput;
      acceleration.x += physics.walkingAcceleration * -Math.sin(inputYaw);
      acceleration.z += physics.walkingAcceleration * -Math.cos(inputYaw);
    }

    // jumping
    if ((controlState.jump || jumpQueued) && bot.entity.onGround) {
      vel.y = physics.jumpSpeed;
    }
    jumpQueued = false;

    // gravity
    acceleration.y -= physics.gravity;

    var oldGroundSpeedSquared = calcGroundSpeedSquared();
    if (oldGroundSpeedSquared < EPSILON) {
      // stopped
      vel.x = 0;
      vel.z = 0;
    } else {
      // non-zero ground speed
      var oldGroundSpeed = Math.sqrt(oldGroundSpeedSquared);
      var groundFriction = physics.groundFriction * physics.walkingAcceleration;
      // less friction for air
      if (! bot.entity.onGround) groundFriction *= 0.05;
      // if friction would stop the motion, do it
      var maybeNewGroundFriction = oldGroundSpeed / deltaSeconds;
      groundFriction = groundFriction > maybeNewGroundFriction ?
        maybeNewGroundFriction : groundFriction;
      acceleration.x -= vel.x / oldGroundSpeed * groundFriction;
      acceleration.z -= vel.z / oldGroundSpeed * groundFriction;
    }

    // calculate new speed
    vel.add(acceleration.scaled(deltaSeconds))

    // limit speed
    var groundSpeedSquared = calcGroundSpeedSquared();
    if (groundSpeedSquared > physics.maxGroundSpeed * physics.maxGroundSpeed) {
      var groundSpeed = Math.sqrt(groundSpeedSquared);
      var correctionScale = physics.maxGroundSpeed / groundSpeed;
      vel.x *= correctionScale;
      vel.z *= correctionScale;
    }
    vel.y = clamp(-physics.terminalVelocity, vel.y, physics.terminalVelocity);

    // calculate new positions and resolve collisions
    var boundingBox = getBoundingBox();
    var boundingBoxMin, boundingBoxMax;
    if (vel.x !== 0) {
      pos.x += vel.x * deltaSeconds;
      var blockX = Math.floor(pos.x + sign(vel.x) * physics.playerApothem);
      boundingBoxMin = new Vec3(blockX, boundingBox.min.y, boundingBox.min.z);
      boundingBoxMax = new Vec3(blockX, boundingBox.max.y, boundingBox.max.z);
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.x = blockX + (vel.x < 0 ? 1 + physics.playerApothem : -physics.playerApothem) * 1.001;
        vel.x = 0;
        boundingBox = getBoundingBox();
      }
    }

    if (vel.z !== 0) {
      pos.z += vel.z * deltaSeconds;
      var blockZ = Math.floor(pos.z + sign(vel.z) * physics.playerApothem);
      boundingBoxMin = new Vec3(boundingBox.min.x, boundingBox.min.y, blockZ);
      boundingBoxMax = new Vec3(boundingBox.max.x, boundingBox.max.y, blockZ);
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.z = blockZ + (vel.z < 0 ? 1 + physics.playerApothem : -physics.playerApothem) * 1.001;
        vel.z = 0;
        boundingBox = getBoundingBox();
      }
    }


    bot.entity.onGround = false;
    if (vel.y !== 0) {
      pos.y += vel.y * deltaSeconds;
      var playerHalfHeight = physics.playerHeight / 2;
      var blockY = Math.floor(pos.y + playerHalfHeight + sign(vel.y) * playerHalfHeight);
      boundingBoxMin = new Vec3(boundingBox.min.x, blockY, boundingBox.min.z);
      boundingBoxMax = new Vec3(boundingBox.max.x, blockY, boundingBox.max.z);
      if (collisionInRange(boundingBoxMin, boundingBoxMax)) {
        pos.y = blockY + (vel.y < 0 ? 1 : -physics.playerHeight) * 1.001;
        bot.entity.onGround = vel.y < 0 ? true : bot.entity.onGround;
        vel.y = 0;
      }
    }

    bot.emit('move');
  }

  function collisionInRange(boundingBoxMin, boundingBoxMax) {
    var cursor = new Vec3(0, 0, 0);
    var block;
    for (cursor.x = boundingBoxMin.x; cursor.x <= boundingBoxMax.x; cursor.x++) {
      for (cursor.y = boundingBoxMin.y; cursor.y <= boundingBoxMax.y; cursor.y++) {
        for (cursor.z = boundingBoxMin.z; cursor.z <= boundingBoxMax.z; cursor.z++) {
          block = bot.blockAt(cursor);
          if (block && block.boundingBox === 'block') return true;
        }
      }
    }

    return false;
  }

  function calcGroundSpeedSquared() {
    var vel = bot.entity.velocity;
    return vel.x * vel.x + vel.y * vel.y;
  }

  function getBoundingBox() {
    var pos = bot.entity.position;
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
      ).floor(),
    };
  }

  function sign(n) {
    return n > 0 ?  1 : n < 0 ?  -1 : 0;
  }

  function degreesToRadians(degrees) {
    return degrees / 180 * PI;
  }

  function radiansToDegrees(radians) {
    return radians / PI * 180;
  }

  function sendPositionAndLook(entity) {
    // sends data, no logic
    var packet = {
      x: entity.position.x,
      y: entity.position.y,
      z: entity.position.z,
      stance: entity.position.y + entity.height,
      onGround: entity.onGround,
    };
    toNotchianYawPitch(entity, packet);
    bot.client.write(0x0d, packet);
  }

  function sendPosition() {
    // increment the yaw in baby steps so that notchian clients (not the server) can keep up.
    var sentPosition = {
      yaw: bot.entity.yaw % PI_2,
      pitch: bot.entity.pitch,
      position: bot.entity.position,
      velocity: bot.entity.velocity,
      height: bot.entity.height,
      onGround: bot.entity.onGround,
    }
    var deltaYaw = sentPosition.yaw - lastSentYaw;
    deltaYaw = deltaYaw < 0 ?
      (deltaYaw < -PI ? deltaYaw + PI_2 : deltaYaw) :
      (deltaYaw >  PI ? deltaYaw - PI_2 : deltaYaw);
    var absDeltaYaw = Math.abs(deltaYaw);
    assert.ok(absDeltaYaw < PI + 0.001);

    var now = new Date();
    var deltaMs = now - lastPositionSentTime;
    lastPositionSentTime = now;
    var maxDeltaYaw = deltaMs / 1000 * physics.yawSpeed;
    deltaYaw = absDeltaYaw > maxDeltaYaw ? maxDeltaYaw * sign(deltaYaw) : deltaYaw;
    lastSentYaw = (lastSentYaw + deltaYaw) % PI_2;
    sentPosition.yaw = lastSentYaw;

    sendPositionAndLook(sentPosition);
  }

  function toNotchianYawPitch(position, packet) {
    packet.yaw = radiansToDegrees(PI - position.yaw);
    packet.pitch = radiansToDegrees(-position.pitch);
  }

  function fromNotchianYawPitch(position, yaw, pitch) {
    position.yaw = (PI - degreesToRadians(yaw)) % PI_2;
    position.pitch = (degreesToRadians(-pitch) + PI) % PI_2;
  }

  bot.physics = physics;

  bot.setControlState = function(control, state) {
    assert.ok(control in controlState, "invalid control: " + control);
    controlState[control] = state;
    if (state && control === 'jump') jumpQueued = true;
  };
  bot.clearControlStates = function() {
    for (var control in controlState) {
      controlState[control] = false;
    }
  };

  // player position and look
  bot.client.on(0x0d, function(packet) {
    bot.entity.velocity.set(0, 0, 0);
    bot.entity.position.set(packet.x, packet.y, packet.z);
    bot.entity.height = packet.stance - bot.entity.position.y;
    bot.entity.onGround = packet.onGround;

    // apologize to the notchian server by echoing an identical position back
    sendPositionAndLook(bot.entity);

    if (positionUpdateTimer == null) {
      // got first 0x0d. start the clocks
      fromNotchianYawPitch(bot.entity, packet.yaw, packet.pitch);
      lastSentYaw = euclideanMod(bot.entity.yaw, PI_2);
      lastPositionSentTime = new Date();
      lastPhyicsFrameTime = new Date();
      positionUpdateTimer = setInterval(sendPosition, POSITION_UPDATE_INTERVAL_MS);
      doPhysicsTimer = setInterval(doPhysics, PHYSICS_INTERVAL_MS);
    }
  });

  bot.on('respawn', stopPhysics);
  bot.on('end', stopPhysics);
}


function clamp(min, x, max) {
  return x < min ? min : x > max ? max : x;
}

function euclideanMod(numerator, denominator) {
  var result = numerator % denominator;
  return result < 0 ? result + denominator : result;
}
