var Vec3 = require('vec3').Vec3
  , _ = require('lodash')
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
  61: "blaze",
  62: "magmaCube",
  63: "enderDragon",
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
  
  bot.findPlayer = bot.findPlayers = function(filter) {
    var filterFn =  function(entity) {
      if(entity.type !== 'player') return false;
      if(filter == null) return true;
      if(typeof filter === 'object' && filter instanceof RegExp) {
        return entity.username.search(filter) !== -1;
      }else if(typeof filter === 'function') {
        return filter(entity);
      }else if(typeof filter === 'string') {
        return entity.username.toLowerCase() === filter.toLowerCase();
      }
      return false;
    }
    var resultSet = _.transform(bot.entities, function(players, entity) {
      if(filterFn(entity)) players.push(entity);
    }, []);

    if(typeof filter === 'string') {
      switch(resultSet.length) {
        case 0: return null;
        case 1: return resultSet[0];
        default: return resultSet;
      }
    }
    return resultSet;
  }

  bot.players = {};
  bot.uuidToUsername = {};
  bot.entities = {};

  bot.client.once('login', function(packet) {
    // login
    bot.entity = fetchEntity(packet.entityId);
    bot.entity.username = bot.username;
    bot.entity.type = 'player';
  });

  bot.client.on('entity_equipment', function(packet) {
    // entity equipment
    var entity = fetchEntity(packet.entityId);
    entity.setEquipment(packet.slot, packet.item);
    bot.emit('entityEquip', entity);
  });

  bot.client.on('bed', function(packet) {
    // use bed
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x, packet.y, packet.z);
    bot.emit('entitySleep', entity);
  });

  bot.client.on('animation', function(packet) {
    // animation
    var entity = fetchEntity(packet.entityId);
    var eventName = animationEvents[packet.animation];
    if (eventName) bot.emit(eventName, entity);
  });

  bot.client.on('named_entity_spawn', function(packet) {
    // spawn named entity
    var entity = fetchEntity(packet.entityId);
    entity.type = 'player';
    entity.username = bot.uuidToUsername[packet.playerUUID];
    entity.uuid = packet.playerUUID;
    entity.dataBlobs = packet.data;
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.height = NAMED_ENTITY_HEIGHT;
    entity.metadata = parseMetadata(packet.metadata);
    if(!bot.players[entity.username].entity) {
      bot.players[entity.username].entity = entity;
    }
    bot.emit('entitySpawn', entity);
  });
  bot.on("entityCrouch", function(entity) {
    entity.height = CROUCH_HEIGHT;
  });
  bot.on("entityUncrouch", function(entity) {
    entity.height = NAMED_ENTITY_HEIGHT;
  });

  bot.client.on('collect', function(packet) {
    // collect item
    var collector = fetchEntity(packet.collectorEntityId);
    var collected = fetchEntity(packet.collectedEntityId);
    bot.emit('playerCollect', collector, collected);
  });

  bot.client.on('spawn_entity', function(packet) {
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

  bot.client.on('spawn_entity_experience_orb', function(packet) {
    var entity = fetchEntity(packet.entityId);
    entity.type = 'orb';
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.count = packet.count;
    bot.emit('entitySpawn', entity);
  });

  bot.client.on('spawn_entity_living', function(packet) {
    // spawn mob
    var entity = fetchEntity(packet.entityId);
    entity.type = 'mob';
    entity.mobType = mobTypes[packet.type];
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.headPitch = conv.fromNotchianPitchByte(packet.headPitch);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
    entity.metadata = parseMetadata(packet.metadata);
    bot.emit('entitySpawn', entity);
  });

  bot.client.on('entity_velocity', function(packet) {
    // entity velocity
    var entity = fetchEntity(packet.entityId);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
  });

  bot.client.on('entity_destroy', function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var entity = fetchEntity(id);
      bot.emit('entityGone', entity);
      entity.isValid = false;
      if(entity.username && bot.players[entity.username]) {
        bot.players[entity.username].entity = null;
        bot.uuidToUsername[bot.players[entity.username].entity.uuid] = null;
      }
      delete bot.entities[id];
    });
  });

  bot.client.on('rel_entity_move', function(packet) {
    // entity relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32);
    bot.emit('entityMoved', entity);
  });

  bot.client.on('entity_look', function(packet) {
    // entity look
    var entity = fetchEntity(packet.entityId);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on('entity_move_look', function(packet) {
    // entity look and relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on('entity_teleport', function(packet) {
    // entity teleport
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot.client.on('entity_head_rotation', function(packet) {
    // entity head look
    var entity = fetchEntity(packet.entityId);
    entity.headYaw = conv.fromNotchianYawByte(packet.headYaw);
    bot.emit('entityMoved', entity);
  });

  bot.client.on('entity_status', function(packet) {
    // entity status
    var entity = fetchEntity(packet.entityId);
    var eventName = entityStatusEvents[packet.status];
    if (eventName) bot.emit(eventName, entity);
  });

  bot.client.on('attach_entity', function(packet) {
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

  bot.client.on('entity_metadata', function(packet) {
    // entity metadata
    var entity = fetchEntity(packet.entityId);
    entity.metadata = parseMetadata(packet.metadata);
    bot.emit('entityUpdate', entity);
  });

  bot.client.on('entity_effect', function(packet) {
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

  bot.client.on('remove_entity_effect', function(packet) {
    // remove entity effect
    var entity = fetchEntity(packet.entityId);
    var effect = entity.effects[packet.effectId];
    delete entity.effects[effect.id];
    bot.emit('entityEffectEnd', entity, effect);
  });

  bot.client.on('spawn_entity_weather', function(packet) {
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
  bot.client.on('player_info', function(packet) {
    // player list item(s)
    packet.data.forEach(function(item) {
      var playerEntity = bot.findPlayers(item.name);
      var player = bot.players[item.name];
      if(packet.action === 0) {
        // New Player
        if(!player) {
          player = bot.players[item.name] = { username: item.name, ping: item.ping , uuid: item.UUID};
          bot.uuidToUsername[item.UUID]=item.name;
          bot.emit('playerJoined', player);
          // Just an Update
        } else player.ping = item.ping;

        player.entity = playerEntity;
      } else if (packet.action === 1) {
        // TODO: update gamemode
      } else if (packet.action === 2) {
        // TODO: update latency
      } else if (packet.action === 3) {
        // TODO: update display name
      } else if (packet.action === 4) {
        // Player has parted
        player.entity = null;
        delete bot.players[item.name];
        delete bot.uuidToUsername[item.UUID]
        bot.emit('playerLeft', player);
      }
    });
  });

  // attaching to a vehicle
  bot.client.on('attach_entity', function(packet) {
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
  bot.useOn = useOn;

  function useOn(target) {
    // TODO: check if not crouching will make make this action always use the item
    useEntity(target, false);
  }

  function attack(target, swing) {
    if(swing)
    {
      bot.client.write('arm_animation', {
        entityId: target.id,
        animation: 1
      });
    }
    useEntity(target, true);
  }

  function mount(target) {
    // TODO: check if crouching will make make this action always mount
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
    bot.client.write('use_entity', {
      target: target.id,
      leftClick: leftClick,
    });
  }

  function fetchEntity(id) {
    return bot.entities[id] || (bot.entities[id] = new Entity(id));
  }
}

function parseMetadata(metadata) {
  var o = {};
  metadata.forEach(function(pair) {
    o[pair.key] = pair.value;
  });
  return o;
}
