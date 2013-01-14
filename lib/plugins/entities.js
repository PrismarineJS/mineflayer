var Vec3 = require('vec3').Vec3
  , Entity = require('../entity')
  , conv = require('../conversions')
  , NAMED_ENTITY_HEIGHT = 1.62
  , CROUCH_HEIGHT = NAMED_ENTITY_HEIGHT - 0.08

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
  61: "blaze"		,
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

function inject(bot) {
  // maps username to {ping, username, entity}
  bot.players = {};
  bot.entities = {};

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
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.metadata = packet.metadata;
    entity.height = NAMED_ENTITY_HEIGHT;
    bot.emit('entitySpawn', entity);
  });
  bot.on("entityCrouch", function(entity) {
    entity.height = CROUCH_HEIGHT;
  });
  bot.on("entityUncrouch", function(entity) {
    entity.height = NAMED_ENTITY_HEIGHT;
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
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.objectData = packet.objectData;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x1a, function(packet) {
    var entity = fetchEntity(packet.entityId);
    entity.type = 'orb';
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.count = packet.count;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x18, function(packet) {
    // spawn mob
    var entity = fetchEntity(packet.entityId);
    entity.type = 'mob';
    entity.mobType = mobTypes[packet.type];
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.headYaw = conv.fromNotchianYawByte(packet.headYaw);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
    entity.metadata = packet.metadata;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on(0x1c, function(packet) {
    // entity velocity
    var entity = fetchEntity(packet.entityId);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
  });

  bot.client.on(0x1d, function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var entity = fetchEntity(id);
      bot.emit('entityGone', entity);
      delete bot.entities[id];
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
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x21, function(packet) {
    // entity look and relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dx / 32, packet.dy / 32, packet.dz / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x22, function(packet) {
    // entity teleport
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on(0x23, function(packet) {
    // entity head look
    var entity = fetchEntity(packet.entityId);
    entity.headYaw = conv.fromNotchianYawByte(packet.headYaw);
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
    var player = bot.players[entity.username];
    if (! player) {
      player = {username: entity.username};
      bot.players[entity.username] = player;
    }
    player.entity = entity;
  });
  bot.client.on(0xc9, function(packet) {
    // player list item
    var player = bot.players[packet.playerName];
    if (packet.online) {
      if (! player) {
        // new person. add and emit event.
        player = {
          ping: packet.ping,
          username: packet.playerName,
        };
        bot.players[player.username] = player;
        bot.emit('playerJoined', player);
      }
    } else {
      if (player) {
        // remove the player
        delete bot.players[player.username];
        bot.emit('playerLeft', player);
      }
    }
  });

  // attaching to a vehicle
  bot.client.on(0x27, function(packet) {
    if (packet.entityId !== bot.entity.id) return;
    var vehicle = bot.vehicle;
    if (packet.vehicleId === -1) {
      bot.vehicle = null;
      bot.emit("dismount", vehicle);
    } else {
      bot.vehicle = bot.entities[packet.vehicleId];
      bot.emit("mount");
    }
  });


  bot.attack = attack;
  bot.mount = mount;
  bot.dismount = dismount;

  function attack(target) {
    useEntity(target, true);
  }

  function mount(target) {
    useEntity(target, false);
  }

  function dismount(target) {
    if (bot.vehicle) {
      mount(bot.vehicle);
    } else {
      bot.emit("error", new Error("dismount: not mounted"));
    }
  }

  function useEntity(target, leftClick) {
    bot.client.write(0x07, {
      user: bot.entity.id,
      target: target.id,
      leftClick: leftClick,
    });
  }

  function fetchEntity(id) {
    return bot.entities[id] || (bot.entities[id] = new Entity(id));
  }
}
