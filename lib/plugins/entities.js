var Vec3 = require('vec3').Vec3;

module.exports = inject;

var animationEvents = {
  1: 'entitySwingArm',
  2: 'entityHurt',
  3: 'entityWake',
  5: 'entityEat',
  104: 'entityCrouch',
  105: 'entityUncrouch',
};

var entityStatusEvents = {
  2: 'entityHurt',
  3: 'entityDead',
  6: 'entityTaming',
  7: 'entityTamed',
  8: 'entityShakingOffWater',
  10: 'entityEatingGrass',
};

var spawnedObjectTypes = {
  1: 'boat',
  2: 'itemStack',
  10: 'minecart',
  11: 'minecartChest',
  12: 'minecartPowered',
  50: 'activatedTnt',
  51: 'enderCrystal',
  60: 'arrowProjectile',
  61: 'snowballProjectile',
  62: 'eggProjectile',
  65: 'thrownEnderpearl',
  66: 'witherSkull',
  70: 'fallingObjects',
  71: 'itemFrames',
  72: 'eyeOfEnder',
  73: 'thrownPotion',
  74: 'fallingDragonEgg',
  75: 'thrownExperienceBottle',
  90: 'fishingFloat',
};

var mobTypes = {
  50: "creeper",
  51: "skeleton",
  52: "spider",
  53: "giantZombie",
  54: "zombie",
  55: "slime",
  56: "ghast",
  57: "zombiePigman",
  58: "enderman",
  59: "caveSpider",
  60: "silverfish",
  61: "blaze"  	,
  62: "magmaCube",
  63: "enderDragon"		,
  64: "wither",
  65: "bat",
  66: "witch",
  90: "pig",
  91: "sheep",
  92: "cow",
  93: "chicken",
  94: "squid",
  95: "wolf",
  96: "mooshroom",
  97: "snowman",
  98: "ocelot",
  99: "ironGolem",
  120: "villager",
};

function Entity(id) {
  this.id = id;
  this.type = null;
  this.position = new Vec3(0, 0, 0);
  this.velocity = new Vec3(0, 0, 0);
  this.yaw = 0;
  this.pitch = 0;
  this.onGround = true;
  this.height = 0;
  this.effects = [];
  // 0 = held item, 1-4 = armor slot
  this.equipment = new Array(5);
  // 5-8 = equipment, 1-4 = crafting, 0 = crafting output
  // 9-35 = main store, 36-44 = quick bar
  this.inventory = new Array(44);
  this.quickBar = new Array(8);
  this.heldSlot = 36;
  this.heldItem = this.equipment[0]; // shortcut to equipment[0]
}

Entity.prototype.setEquipment = function(index, item) {
  this.equipment[index] = item;
  this.heldItem = this.equipment[0];
  this.quickBar = this.inventory.slice(36, 45);
};

function inject(bot) {
  var entities = {};

  function fetchEntity(id) {
    return entities[id] || (entities[id] = new Entity(id));
  }

  // we share bot.game with spawn plugin
  bot.game = bot.game || {};
  // maps username to {ping, username, entity}
  bot.game.players = {};

  bot.client.once(0x01, function(packet) {
    // login
    bot.entity = fetchEntity(packet.entityId);
    bot.entity.username = bot.username;
    bot.entity.type = 'player';
  });

  bot.client.on(0x05, function(packet) {
    // entity equipment
    var entity = fetchEntity(packet.entityId);
    entity.setEquipment(packet.slot, packet.item);
    bot.emit('entityEquip', entity);
  });

  bot.client.on(0x0d, function(packet) {
    // player position and look
    bot.entity.position.set(packet.x, packet.y, packet.z);
    bot.entity.stance = packet.stance;
    bot.entity.yaw = fromNotchianYaw(packet.yaw);
    bot.entity.pitch = fromNotchianPitch(packet.pitch);
    bot.entity.onGround = packet.onGround;
    bot.entity.height = packet.stance - bot.entity.position.y;
  });

  bot.client.on(0x11, function(packet) {
    // use bed
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x, packet.y, packet.z);
    bot.emit('entitySleep', entity);
  });

  bot.client.on(0x12, function(packet) {
    // animation
    var entity = fetchEntity(packet.entityId);
    var eventName = animationEvents[packet.animation];
    if (eventName) bot.emit(eventName, entity);
  });

  bot.client.on(0x14, function(packet) {
    // spawn named entity
    var entity = fetchEntity(packet.entityId);
    entity.type = 'player';
    entity.username = packet.name;
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    entity.metadata = packet.metadata;
    // TODO: change this when crouching
    entity.height = 1.62;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x16, function(packet) {
    // collect item
    var collector = fetchEntity(packet.collectorId);
    var collected = fetchEntity(packet.collectedId);
    bot.emit('playerCollect', collector, collected);
  });

  bot.client.on(0x17, function(packet) {
    // spawn object/vehicle
    var entity = fetchEntity(packet.entityId);
    entity.type = 'object';
    entity.objectType = spawnedObjectTypes[packet.type];
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    entity.objectData = packet.objectData;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x18, function(packet) {
    // spawn mob
    var entity = fetchEntity(packet.entityId);
    entity.type = 'mob';
    entity.mobType = mobTypes[packet.type];
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    entity.headYaw = fromNotchianYawByte(packet.headYaw);
    entity.velocity.set(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.metadata = packet.metadata;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x1c, function(packet) {
    // entity velocity
    var entity = fetchEntity(packet.entityId);
    entity.velocity.set(packet.velocityX, packet.velocityY, packet.velocityZ);
  });

  bot.client.on(0x1d, function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var entity = fetchEntity(id);
      bot.emit('entityGone', entity);
      delete entities[id];
    });
  });

  bot.client.on(0x1f, function(packet) {
    // entity relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dx / 32, packet.dy / 32, packet.dz / 32);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x20, function(packet) {
    // entity look
    var entity = fetchEntity(packet.entityId);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x21, function(packet) {
    // entity look and relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dx / 32, packet.dy / 32, packet.dz / 32);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x22, function(packet) {
    // entity teleport
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = fromNotchianYawByte(packet.yaw);
    entity.pitch = fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x23, function(packet) {
    // entity head look
    var entity = fetchEntity(packet.entityId);
    entity.headYaw = fromNotchianYawByte(packet.headYaw);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x26, function(packet) {
    // entity status
    var entity = fetchEntity(packet.entityId);
    var eventName = entityStatusEvents[packet.status];
    if (eventName) bot.emit(eventName, entity);
  });

  bot.client.on(0x27, function(packet) {
    // attach entity
    var entity = fetchEntity(packet.entityId);
    if (packet.vehicleId === -1) {
      var vehicle = entity.vehicle;
      delete entity.vehicle;
      bot.emit('entityDetach', entity, vehicle);
    } else {
      entity.vehicle = fetchEntity(packet.vehicleId);
      bot.emit('entityAttach', entity, entity.vehicle);
    }
  });

  bot.client.on(0x28, function(packet) {
    // entity metadata
    var entity = fetchEntity(packet.entityId);
    entity.metadata = packet.metadata;
    bot.emit('entityUpdate', entity);
  });

  bot.client.on(0x29, function(packet) {
    // entity effect
    var entity = fetchEntity(packet.entityId);
    var effect = {
      id: packet.effectId,
      amplifier: packet.amplifier,
      duration: packet.duration,
    };
    entity.effects[effect.id] = effect;
    bot.emit('entityEffect', entity, effect);
  });

  bot.client.on(0x2a, function(packet) {
    // remove entity effect
    var entity = fetchEntity(packet.entityId);
    var effect = entity.effects[packet.effectId];
    delete entity.effects[effect.id];
    bot.emit('entityEffectEnd', entity, effect);
  });

  bot.client.on(0x47, function(packet) {
    // spawn global entity
    var entity = fetchEntity(packet.entityId);
    entity.type = 'global';
    entity.globalType = 'thunderbolt';
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    bot.emit('entitySpawn', entity);
  });

  bot.on('spawn', function() {
    bot.emit('entitySpawn', bot.entity);
  });
  bot.on('entitySpawn', function(entity) {
    if (entity.type !== 'player') return;
    var player = bot.game.players[entity.username];
    if (! player) {
      player = {username: entity.username};
      bot.game.players[entity.username] = player;
    }
    player.entity = entity;
  });
  bot.client.on(0xc9, function(packet) {
    // player list item
    var player = bot.game.players[packet.playerName];
    if (packet.online) {
      if (! player) {
        // new person. add and emit event.
        player = {
          ping: packet.ping,
          username: packet.playerName,
        };
        bot.game.players[player.username] = player;
        bot.emit('playerJoined', player);
      }
    } else {
      if (player) {
        // remove the player
        delete bot.game.players[player.username];
        bot.emit('playerLeft', player);
      }
    }
  });
}

function degreesToRadians(degrees) {
  return degrees / 180 * Math.PI;
}

function toNotchianYaw(yaw) {
  return radiansToDegrees(Math.PI - yaw);
}

function toNotchianPitch(pitch) {
  return radiansToDegrees(-pitch);
}

function fromNotchianYaw(yaw) {
  return (Math.PI - degreesToRadians(yaw)) % (Math.PI * 2);
}

function fromNotchianPitch(pitch) {
  return (degreesToRadians(-pitch) + Math.PI) % (Math.PI * 2);
}

function fromNotchianYawByte(yaw) {
  return fromNotchianYaw(yaw / 256 * 360);
}

function fromNotchianPitchByte(pitch) {
  return fromNotchianPitch(pitch / 256 * 360);
}
