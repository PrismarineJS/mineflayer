const conv = require('../conversions')

module.exports = inject

const animationEvents = {
  0: 'entitySwingArm',
  1: 'entityHurt',
  2: 'entityWake',
  3: 'entityEat',
  4: 'entityCriticalEffect',
  5: 'entityMagicCriticalEffect'
}

function inject (bot) {
  // ONLY 1.17 has this destroy_entity packet which is the same thing as entity_destroy packet except the entity is singular
  // 1.17.1 reverted this change so this is just a simpler fix
  bot._client.on('destroy_entity', (packet) => {
    bot._client.emit('entity_destroy', { entityIds: [packet.entityId] })
  })
  function positionConversion(x, y, z) {
    let position = {x: packet.x, y: packet.y, z: packet.z}
    if (bot.supportFeature('fixedPointPosition')) {
      position = {x: packet.x / 32, y: packet.y / 32, z: packet.z / 32}
    }
    return position
  }
  function deltaConversion(dX, dY, dZ) {
    if (bot.supportFeature('fixedPointDelta')) {
        delta = {dX: dX / 32, dY: dY / 32, dZ: dZ / 32}
    } else if (bot.supportFeature('fixedPointDelta128')) {
        delta = {dX: dX / (128 * 32), dY: dY / (128 * 32), dZ: dZ / (128 * 32)}
    }
    return delta
  }
  function angleConversion(yaw, pitch) {
    return {yaw: conv.fromNotchianYawByte(yaw),pitch: conv.fromNotchianPitchByte(pitch)}
    }


  // Reset list of players and entities on login
  bot._client.on('login', (packet) => {
    // login
    bot.entity = fetchEntity(packet.entityId)
    bot.username = bot._client.username
    bot.entity.username = bot._client.username
    bot.entity.type = 'player'
    bot.entity.name = 'player'
  })

  bot._client.on('entity_equipment', (packet) => {
    if (packet.equipments !== undefined) {
      packet.equipments.forEach(equipment => bot.world.entities.equipItem(packet.entityId, equipment.slot, equipment.item))
    } else {
      bot.world.entities.equipItem(packet.entityId, packet.slot, packet.item)
    }
  })

  bot._client.on('bed', (packet) => {
    bot.world.entities.entitySleep(packet.entityId, packet.location)
  })

  bot._client.on('animation', (packet) => {
    // animation
    const entity = bot.world.entities.fetchEntity(packet.entityId)
    const eventName = animationEvents[packet.animation]
    if (eventName) bot.emit(eventName, entity)
  })

  bot._client.on('named_entity_spawn', (packet) => {
    let position = positionConversion(packet.x, packet.y, packet.z)
    // in case player_info packet was not sent before named_entity_spawn : ignore named_entity_spawn (see #213)
    if (packet.playerUUID in bot.world.entities.uuidToUsername) {
      // spawn named entity
      bot.world.entities.spawnEntity(packet.entityId, packet.playerUUID, position, {yaw: packet.yaw, pitch: packet.pitch})
    }
  })
/*
  bot.on('entityCrouch', (entity) => {
    entity.height = CROUCH_HEIGHT
  })

  bot.on('entityUncrouch', (entity) => {
    entity.height = NAMED_ENTITY_HEIGHT
  })

  bot._client.on('collect', (packet) => {
    // collect item
    const collector = fetchEntity(packet.collectorEntityId)
    const collected = fetchEntity(packet.collectedEntityId)
    bot.emit('playerCollect', collector, collected)
  })*/

  // spawn object/vehicle on versions < 1.19, on versions > 1.19 handles all non-player entities
  bot._client.on('spawn_entity', (packet) => {
    let position = positionConversion(packet.x, packet.y, packet.z)
    let headPitch
    if (bot.supportFeature('consolidatedEntitySpawnPacket')) {
        headPitch = conv.fromNotchianPitchByte(packet.headPitch)
    }
    bot.world.entities.spawnEntity(packet.entityId, packet.type, packet.objectUUID, position, {yaw: packet.yaw, pitch: packet.pitch}, {headPitch})
  })

  bot._client.on('spawn_entity_experience_orb', (packet) => {
    bot.world.entities.spawnEntity(packet.entityId, packet.type, undefined)
  })

  bot._client.on('entity_velocity', (packet) => {
    bot.world.entities.setEntityVelocity(packet.entityId, packet.velocityX, packet.velocityY, packet.velocityZ)
  })

  bot._client.on('entity_destroy', (packet) => {
    bot.world.entities.destroyEntities(packet.entityIds)
  })

  bot._client.on('rel_entity_move', (packet) => {
    const delta = deltaConversion(packet.dX, packet.dY, packet.dZ)
    bot.world.entities.moveEntity(packet.entityId, {delta})
  })

  bot._client.on('entity_look', (packet) => {
    const angle = angleConversion(packet.yaw, packet.pitch)
    bot.world.entities.moveEntity(packet.entityId, {angle})
  })

  bot._client.on('entity_move_look', (packet) => {
    const delta = deltaConversion(packet.dX, packet.dY, packet.dZ)
    const angle = angleConversion(packet.yaw, packet.pitch)
    
    bot.world.entities.moveEntity(packet.entityId, {delta, angle})
  })

  bot._client.on('entity_teleport', (packet) => {
    position = positionConversion(packet.x, packet.y, packet.z)
    angle = angleConversion(packet.yaw, packet.pitch)
    bot.world.entities.moveEntity(packet.entityId, {position, angle})
  })

  bot._client.on('entity_head_rotation', (packet) => {
    bot.world.entities.rotateEntityHead(packet.entityId, packet.headYaw)
  })

  bot._client.on('entity_status', (packet) => {
    bot.world.entities.setEntityStatus(packet.entityId, packet.entityStatus)
  })

  bot._client.on('attach_entity', (packet) => {
    bot.world.entities.attachEntity(packet.entityId, packet.vehicleId)
  })

  bot._client.on('entity_metadata', (packet) => {
    bot.world.entities.processEntityMetadata(packet.entityId, packet.metadata)
  })

  const updateAttributes = (packet) => {
    bot.world.entities.setAttributes(packet.entityId, packet.properties)
  }
  bot._client.on('update_attributes', updateAttributes) // 1.8
  bot._client.on('entity_update_attributes', updateAttributes) // others

  bot._client.on('spawn_entity_weather', (packet) => {
    bot.world.entities.spawnEntity(packet.entityId, undefined, packet.entityUUID, undefined, {x: packet.x / 32, y: packet.y / 32, z: packet.z / 32})
    /*TODO move to world:
    entity.type = 'global'
    entity.globalType = 'thunderbolt'
    */
  })

  bot.on('spawn', () => {
    bot.emit('entitySpawn', bot.entity)
  })

  bot._client.on('set_passengers', ({ entityId, passengers }) => {
    if (passengers[0] !== bot.entity.id) return
    const vehicle = bot.vehicle
    if (entityId === -1) {
      bot.vehicle = null
      bot.emit('dismount', vehicle)
    } else {
      bot.vehicle = bot.entities[entityId]
      bot.emit('mount')
    }
  })

  bot.swingArm = swingArm
  bot.attack = attack
  bot.mount = mount
  bot.dismount = dismount
  bot.useOn = useOn
  bot.moveVehicle = moveVehicle

  function swingArm (arm = 'right', showHand = true) {
    const hand = arm === 'right' ? 0 : 1
    const packet = {}
    if (showHand) packet.hand = hand
    bot._client.write('arm_animation', packet)
  }

  function useOn (target) {
    // TODO: check if not crouching will make make this action always use the item
    useEntity(target, 0)
  }

  function attack (target, swing = true) {
    // arm animation comes before the use_entity packet on 1.8
    if (bot.supportFeature('armAnimationBeforeUse')) {
      if (swing) {
        swingArm()
      }
      useEntity(target, 1)
    } else {
      useEntity(target, 1)
      if (swing) {
        swingArm()
      }
    }
  }

  function mount (target) {
    // TODO: check if crouching will make make this action always mount
    useEntity(target, 0)
  }

  function moveVehicle (left, forward) {
    bot._client.write('steer_vehicle', {
      sideways: left,
      forward,
      jump: 0x01
    })
  }

  function dismount () {
    if (bot.vehicle) {
      bot._client.write('steer_vehicle', {
        sideways: 0.0,
        forward: 0.0,
        jump: 0x02
      })
    } else {
      bot.emit('error', new Error('dismount: not mounted'))
    }
  }

  function useEntity (target, leftClick, x, y, z) {
    const sneaking = bot.getControlState('sneak')
    if (x && y && z) {
      bot._client.write('use_entity', {
        target: target.id,
        mouse: leftClick,
        x,
        y,
        z,
        sneaking
      })
    } else {
      bot._client.write('use_entity', {
        target: target.id,
        mouse: leftClick,
        sneaking
      })
    }
  }
  return entityMetadata
}
