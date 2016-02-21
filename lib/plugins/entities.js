var Vec3 = require('vec3').Vec3;
var Entity = require('prismarine-entity');
var conv = require('../conversions');
var NAMED_ENTITY_HEIGHT = 1.62;
var CROUCH_HEIGHT = NAMED_ENTITY_HEIGHT - 0.08;
var objects = require('../minecraft-data').objects;
var mobs = require('../minecraft-data').mobs;
var version=require("../version");
var Item = require("prismarine-item")(version);

module.exports = inject;

var animationEvents = {
  0: 'entitySwingArm',
  1: 'entityHurt',
  2: 'entityWake',
  3: 'entityEat',
  4: 'entityCriticalEffect',
  5: 'entityMagicCriticalEffect'
};

var entityStatusEvents = {
  2: 'entityHurt',
  3: 'entityDead',
  6: 'entityTaming',
  7: 'entityTamed',
  8: 'entityShakingOffWater',
  10: 'entityEatingGrass',
};

function inject(bot) {

  bot.findPlayer = bot.findPlayers = function(filter) {
    var filterFn = function(entity) {
      if(entity.type !== 'player') return false;
      if(filter == null) return true;
      if(typeof filter === 'object' && filter instanceof RegExp) {
        return entity.username.search(filter) !== -1;
      } else if(typeof filter === 'function') {
        return filter(entity);
      } else if(typeof filter === 'string') {
        return entity.username.toLowerCase() === filter.toLowerCase();
      }
      return false;
    };
    var resultSet=Object.keys(bot.entities)
      .map(function(key){return bot.entities[key];})
      .filter(filterFn);

    if(typeof filter === 'string') {
      switch(resultSet.length) {
        case 0:
          return null;
        case 1:
          return resultSet[0];
        default:
          return resultSet;
      }
    }
    return resultSet;
  };

  bot.players = {};
  bot.uuidToUsername = {};
  bot.entities = {};

  bot._client.once('login', function(packet) {
    // login
    bot.entity = fetchEntity(packet.entityId);
    bot.entity.username = bot.username;
    bot.entity.type = 'player';
  });

  bot._client.on('entity_equipment', function(packet) {
    // entity equipment
    var entity = fetchEntity(packet.entityId);
    entity.setEquipment(packet.slot, packet.item ? Item.fromNotch(packet.item) : null);
    bot.emit('entityEquip', entity);
  });

  bot._client.on('bed', function(packet) {
    // use bed
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.location.x, packet.location.y, packet.location.z);
    bot.emit('entitySleep', entity);
  });

  bot._client.on('animation', function(packet) {
    // animation
    var entity = fetchEntity(packet.entityId);
    var eventName = animationEvents[packet.animation];
    if(eventName) bot.emit(eventName, entity);
  });

  bot._client.on('named_entity_spawn', function(packet) {
    // in case player_info packet was not sent before named_entity_spawn : ignore named_entity_spawn (see #213)
    if(packet.playerUUID in bot.uuidToUsername) {
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
    }
  });
  bot.on("entityCrouch", function(entity) {
    entity.height = CROUCH_HEIGHT;
  });
  bot.on("entityUncrouch", function(entity) {
    entity.height = NAMED_ENTITY_HEIGHT;
  });

  bot._client.on('collect', function(packet) {
    // collect item
    var collector = fetchEntity(packet.collectorEntityId);
    var collected = fetchEntity(packet.collectedEntityId);
    bot.emit('playerCollect', collector, collected);
  });

  bot._client.on('spawn_entity', function(packet) {
    // spawn object/vehicle
    var entity = fetchEntity(packet.entityId);
    var entityData = objects[packet.type];
    if(entityData) {
      entity.type = 'object';
      entity.objectType = entityData.displayName;
      entity.displayName = entityData.displayName;
      entity.entityType = entityData.id;
      entity.name = entityData.name;
      entity.kind = entityData.category;
    } else {
      // unknown entity
      entity.type = 'other';
      entity.entityType = packet.type;
    }
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.objectData = packet.objectData;
    bot.emit('entitySpawn', entity);
  });

  bot._client.on('spawn_entity_experience_orb', function(packet) {
    var entity = fetchEntity(packet.entityId);
    entity.type = 'orb';
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.count = packet.count;
    bot.emit('entitySpawn', entity);
  });

  bot._client.on('spawn_entity_living', function(packet) {
    // spawn mob
    var entity = fetchEntity(packet.entityId);
    entity.type = 'mob';
    var entityData = mobs[packet.type];
    entity.mobType = entityData.displayName;
    entity.displayName = entityData.displayName;
    entity.entityType = entityData.id;
    entity.name = entityData.name;
    entity.kind = entityData.category;
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    entity.headPitch = conv.fromNotchianPitchByte(packet.headPitch);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
    entity.metadata = parseMetadata(packet.metadata);
    bot.emit('entitySpawn', entity);
  });

  bot._client.on('entity_velocity', function(packet) {
    // entity velocity
    var entity = fetchEntity(packet.entityId);
    var notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ);
    entity.velocity.update(conv.fromNotchVelocity(notchVel));
  });

  bot._client.on('entity_destroy', function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var entity = fetchEntity(id);
      bot.emit('entityGone', entity);
      entity.isValid = false;
      if(entity.username && bot.players[entity.username]) {
        bot.players[entity.username].entity = null;
      }
      delete bot.entities[id];
    });
  });

  bot._client.on('rel_entity_move', function(packet) {
    // entity relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32);
    bot.emit('entityMoved', entity);
  });

  bot._client.on('entity_look', function(packet) {
    // entity look
    var entity = fetchEntity(packet.entityId);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot._client.on('entity_move_look', function(packet) {
    // entity look and relative move
    var entity = fetchEntity(packet.entityId);
    entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot._client.on('entity_teleport', function(packet) {
    // entity teleport
    var entity = fetchEntity(packet.entityId);
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32);
    entity.yaw = conv.fromNotchianYawByte(packet.yaw);
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch);
    bot.emit('entityMoved', entity);
  });

  bot._client.on('entity_head_rotation', function(packet) {
    // entity head look
    var entity = fetchEntity(packet.entityId);
    entity.headYaw = conv.fromNotchianYawByte(packet.headYaw);
    bot.emit('entityMoved', entity);
  });

  bot._client.on('entity_status', function(packet) {
    // entity status
    var entity = fetchEntity(packet.entityId);
    var eventName = entityStatusEvents[packet.entityStatus];
    if(eventName) bot.emit(eventName, entity);
  });

  bot._client.on('attach_entity', function(packet) {
    // attach entity
    var entity = fetchEntity(packet.entityId);
    if(packet.vehicleId === -1) {
      var vehicle = entity.vehicle;
      delete entity.vehicle;
      bot.emit('entityDetach', entity, vehicle);
    } else {
      entity.vehicle = fetchEntity(packet.vehicleId);
      bot.emit('entityAttach', entity, entity.vehicle);
    }
  });

  bot._client.on('entity_metadata', function(packet) {
    // entity metadata
    var entity = fetchEntity(packet.entityId);
    entity.metadata = parseMetadata(packet.metadata);
    bot.emit('entityUpdate', entity);
  });

  bot._client.on('entity_effect', function(packet) {
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

  bot._client.on('remove_entity_effect', function(packet) {
    // remove entity effect
    var entity = fetchEntity(packet.entityId);
    var effect = entity.effects[packet.effectId];
    if(effect) {
      delete entity.effects[effect.id];
    }
    else {
      // unknown effect
      effect = {
        id: packet.effectId,
        amplifier: -1,
        duration: -1,
      };
    }
    bot.emit('entityEffectEnd', entity, effect);
  });

  bot._client.on('spawn_entity_weather', function(packet) {
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
  bot._client.on('player_info', function(packet) {
    // player list item(s)
    packet.data.forEach(function(item) {
      var playerEntity = bot.findPlayers(item.name);
      var player = bot.uuidToUsername[item.UUID] ? bot.players[bot.uuidToUsername[item.UUID]] : null;
      if(packet.action === 0) {
        // New Player
        if(!player) {
          player = bot.players[item.name] = {username: item.name, ping: item.ping, uuid: item.UUID};
          bot.uuidToUsername[item.UUID] = item.name;
          bot.emit('playerJoined', player);
          // Just an Update
        } else player.ping = item.ping;

        player.entity = playerEntity;
      } else if(packet.action === 1) {
        // TODO: update gamemode
      } else if(packet.action === 2) {
        // TODO: update latency
      } else if(packet.action === 3) {
        // TODO: update display name
      } else if(packet.action === 4) {
        // Player has parted
        if(player) {
          player.entity = null;
          delete bot.players[player.username];
          delete bot.uuidToUsername[item.UUID];
          bot.emit('playerLeft', player);
        }
      }
    });
  });

  // attaching to a vehicle
  bot._client.on('attach_entity', function(packet) {
    if(packet.entityId !== bot.entity.id) return;
    var vehicle = bot.vehicle;
    if(packet.vehicleId === -1) {
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
  bot.moveVehicle = moveVehicle;

  function useOn(target) {
    // TODO: check if not crouching will make make this action always use the item
    useEntity(target, 0);
  }

  function attack(target, swing) {
    if(swing) {
      bot._client.write('arm_animation', {});
    }
    useEntity(target, 1);
  }

  function mount(target) {
    // TODO: check if crouching will make make this action always mount
    useEntity(target, 0);
  }

  function moveVehicle(left, forward) {
    bot._client.write('steer_vehicle', {
      "sideways": left,
      "forward": forward,
      "jump": 0x01
    });
  }

  function dismount() {
    if(bot.vehicle) {
      bot._client.write('steer_vehicle', {
        "sideways": 0.0,
        "forward": 0.0,
        "jump": 0x02
      });
    } else {
      bot.emit("error", new Error("dismount: not mounted"));
    }
  }

  function useEntity(target, leftClick, x, y, z) {
    if(x && y && z) {
      bot._client.write('use_entity', {
        target: target.id,
        mouse: leftClick,
        x: x,
        y: y,
        z: z
      });
    }
    else bot._client.write('use_entity', {
      target: target.id,
      mouse: leftClick
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
