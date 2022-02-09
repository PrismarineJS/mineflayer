const { Vec3 } = require('vec3')
const conv = require('../conversions')
const NAMED_ENTITY_HEIGHT = 1.62
const NAMED_ENTITY_WIDTH = 0.6
const CROUCH_HEIGHT = NAMED_ENTITY_HEIGHT - 0.08

module.exports = inject

const animationEvents = {
  0: 'entitySwingArm',
  1: 'entityHurt',
  2: 'entityWake',
  3: 'entityEat',
  4: 'entityCriticalEffect',
  5: 'entityMagicCriticalEffect'
}

const entityStatusEvents = {
  2: 'entityHurt',
  3: 'entityDead',
  6: 'entityTaming',
  7: 'entityTamed',
  8: 'entityShakingOffWater',
  10: 'entityEatingGrass'
}

function inject (bot, { version }) {
  const Entity = require('prismarine-entity')(version)
  const objects = require('minecraft-data')(version).objects
  const mobs = require('minecraft-data')(version).mobs
  const entitiesArray = require('minecraft-data')(version).entitiesArray
  const Item = require('prismarine-item')(version)
  const ChatMessage = require('prismarine-chat')(version)
  // ONLY 1.17 has this destroy_entity packet which is the same thing as entity_destroy packet except the entity is singular
  // 1.17.1 reverted this change so this is just a simpler fix
  bot._client.on('destroy_entity', (packet) => {
    bot._client.emit('entity_destroy', { entityIds: [packet.entityId] })
  })

  bot.findPlayer = bot.findPlayers = (filter) => {
    const filterFn = (entity) => {
      if (entity.type !== 'player') return false
      if (filter === null) return true
      if (typeof filter === 'object' && filter instanceof RegExp) {
        return entity.username.search(filter) !== -1
      } else if (typeof filter === 'function') {
        return filter(entity)
      } else if (typeof filter === 'string') {
        return entity.username.toLowerCase() === filter.toLowerCase()
      }
      return false
    }
    const resultSet = Object.values(bot.entities)
      .filter(filterFn)

    if (typeof filter === 'string') {
      switch (resultSet.length) {
        case 0:
          return null
        case 1:
          return resultSet[0]
        default:
          return resultSet
      }
    }
    return resultSet
  }

  bot.players = {}
  bot.uuidToUsername = {}
  bot.entities = {}

  bot.nearestEntity = (match = (entity) => { return true }) => {
    let best = null
    let bestDistance = Number.MAX_VALUE

    for (const entity of Object.values(bot.entities)) {
      if (entity === bot.entity || !match(entity)) {
        continue
      }

      const dist = bot.entity.position.distanceSquared(entity.position)
      if (dist < bestDistance) {
        best = entity
        bestDistance = dist
      }
    }

    return best
  }

  // Reset list of players and entities on login
  bot._client.on('login', (packet) => {
    bot.players = {}
    bot.uuidToUsername = {}
    bot.entities = {}
    // login
    bot.entity = fetchEntity(packet.entityId)
    bot.username = bot._client.username
    bot.entity.username = bot._client.username
    bot.entity.type = 'player'
    bot.entity.name = 'player'
  })

  bot._client.on('entity_equipment', (packet) => {
    // entity equipment
    const entity = fetchEntity(packet.entityId)
    if (packet.equipments !== undefined) {
      packet.equipments.forEach(equipment => entity.setEquipment(equipment.slot, equipment.item ? Item.fromNotch(equipment.item) : null))
    } else {
      entity.setEquipment(packet.slot, packet.item ? Item.fromNotch(packet.item) : null)
    }
    bot.emit('entityEquip', entity)
  })

  bot._client.on('bed', (packet) => {
    // use bed
    const entity = fetchEntity(packet.entityId)
    entity.position.set(packet.location.x, packet.location.y, packet.location.z)
    bot.emit('entitySleep', entity)
  })

  bot._client.on('animation', (packet) => {
    // animation
    const entity = fetchEntity(packet.entityId)
    const eventName = animationEvents[packet.animation]
    if (eventName) bot.emit(eventName, entity)
  })

  bot._client.on('named_entity_spawn', (packet) => {
    // in case player_info packet was not sent before named_entity_spawn : ignore named_entity_spawn (see #213)
    if (packet.playerUUID in bot.uuidToUsername) {
      // spawn named entity
      const entity = fetchEntity(packet.entityId)
      entity.type = 'player'
      entity.name = 'player'
      entity.username = bot.uuidToUsername[packet.playerUUID]
      entity.uuid = packet.playerUUID
      entity.dataBlobs = packet.data
      if (bot.supportFeature('fixedPointPosition')) {
        entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
      } else if (bot.supportFeature('doublePosition')) {
        entity.position.set(packet.x, packet.y, packet.z)
      }
      entity.yaw = conv.fromNotchianYawByte(packet.yaw)
      entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
      entity.height = NAMED_ENTITY_HEIGHT
      entity.width = NAMED_ENTITY_WIDTH
      entity.metadata = parseMetadata(packet.metadata, entity.metadata)
      if (bot.players[entity.username] !== undefined && !bot.players[entity.username].entity) {
        bot.players[entity.username].entity = entity
      }
      bot.emit('entitySpawn', entity)
    }
  })

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
  })

  function setEntityData (entity, type, entityData) {
    if (entityData === undefined) {
      entityData = entitiesArray.find(entity => entity.internalId === type)
    }
    if (entityData) {
      entity.mobType = entityData.displayName
      entity.objectType = entityData.displayName
      entity.displayName = entityData.displayName
      entity.entityType = entityData.id
      entity.name = entityData.name
      entity.kind = entityData.category
      entity.height = entityData.height
      entity.width = entityData.width
    } else {
      // unknown entity
      entity.type = 'other'
      entity.entityType = type
      entity.mobType = 'unknown'
      entity.displayName = 'unknown'
      entity.name = 'unknown'
      entity.kind = 'unknown'
    }
  }

  bot._client.on('spawn_entity', (packet) => {
    // spawn object/vehicle
    const entity = fetchEntity(packet.entityId)
    const entityData = objects[packet.type]

    entity.type = 'object'
    setEntityData(entity, packet.type, entityData)

    if (bot.supportFeature('fixedPointPosition')) {
      entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
    } else if (bot.supportFeature('doublePosition')) {
      entity.position.set(packet.x, packet.y, packet.z)
    }

    entity.uuid = packet.objectUUID
    entity.yaw = conv.fromNotchianYawByte(packet.yaw)
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
    entity.objectData = packet.objectData
    bot.emit('entitySpawn', entity)
  })

  bot._client.on('spawn_entity_experience_orb', (packet) => {
    const entity = fetchEntity(packet.entityId)
    entity.type = 'orb'
    entity.name = 'experience_orb'
    entity.width = 0.5
    entity.height = 0.5

    if (bot.supportFeature('fixedPointPosition')) {
      entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
    } else if (bot.supportFeature('doublePosition')) {
      entity.position.set(packet.x, packet.y, packet.z)
    }

    entity.count = packet.count
    bot.emit('entitySpawn', entity)
  })

  bot._client.on('spawn_entity_living', (packet) => {
    // spawn mob
    const entity = fetchEntity(packet.entityId)
    entity.type = 'mob'
    entity.uuid = packet.entityUUID
    const entityData = mobs[packet.type]

    setEntityData(entity, packet.type, entityData)

    if (bot.supportFeature('fixedPointPosition')) {
      entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
    } else if (bot.supportFeature('doublePosition')) {
      entity.position.set(packet.x, packet.y, packet.z)
    }

    entity.yaw = conv.fromNotchianYawByte(packet.yaw)
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
    entity.headPitch = conv.fromNotchianPitchByte(packet.headPitch)

    const notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ)
    entity.velocity.update(conv.fromNotchVelocity(notchVel))
    entity.metadata = parseMetadata(packet.metadata, entity.metadata)

    bot.emit('entitySpawn', entity)
  })

  bot._client.on('entity_velocity', (packet) => {
    // entity velocity
    const entity = fetchEntity(packet.entityId)
    const notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ)
    entity.velocity.update(conv.fromNotchVelocity(notchVel))
  })

  bot._client.on('entity_destroy', (packet) => {
    // destroy entity
    packet.entityIds.forEach((id) => {
      const entity = fetchEntity(id)
      bot.emit('entityGone', entity)
      entity.isValid = false
      if (entity.username && bot.players[entity.username]) {
        bot.players[entity.username].entity = null
      }
      delete bot.entities[id]
    })
  })

  bot._client.on('rel_entity_move', (packet) => {
    // entity relative move
    const entity = fetchEntity(packet.entityId)
    if (bot.supportFeature('fixedPointDelta')) {
      entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32)
    } else if (bot.supportFeature('fixedPointDelta128')) {
      entity.position.translate(packet.dX / (128 * 32), packet.dY / (128 * 32), packet.dZ / (128 * 32))
    }
    bot.emit('entityMoved', entity)
  })

  bot._client.on('entity_look', (packet) => {
    // entity look
    const entity = fetchEntity(packet.entityId)
    entity.yaw = conv.fromNotchianYawByte(packet.yaw)
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
    bot.emit('entityMoved', entity)
  })

  bot._client.on('entity_move_look', (packet) => {
    // entity look and relative move
    const entity = fetchEntity(packet.entityId)
    if (bot.supportFeature('fixedPointDelta')) {
      entity.position.translate(packet.dX / 32, packet.dY / 32, packet.dZ / 32)
    } else if (bot.supportFeature('fixedPointDelta128')) {
      entity.position.translate(packet.dX / (128 * 32), packet.dY / (128 * 32), packet.dZ / (128 * 32))
    }
    entity.yaw = conv.fromNotchianYawByte(packet.yaw)
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
    bot.emit('entityMoved', entity)
  })

  bot._client.on('entity_teleport', (packet) => {
    // entity teleport
    const entity = fetchEntity(packet.entityId)
    if (bot.supportFeature('fixedPointPosition')) {
      entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
    }
    if (bot.supportFeature('doublePosition')) {
      entity.position.set(packet.x, packet.y, packet.z)
    }
    entity.yaw = conv.fromNotchianYawByte(packet.yaw)
    entity.pitch = conv.fromNotchianPitchByte(packet.pitch)
    bot.emit('entityMoved', entity)
  })

  bot._client.on('entity_head_rotation', (packet) => {
    // entity head look
    const entity = fetchEntity(packet.entityId)
    entity.headYaw = conv.fromNotchianYawByte(packet.headYaw)
    bot.emit('entityMoved', entity)
  })

  bot._client.on('entity_status', (packet) => {
    // entity status
    const entity = fetchEntity(packet.entityId)
    const eventName = entityStatusEvents[packet.entityStatus]
    if (eventName) bot.emit(eventName, entity)
  })

  bot._client.on('attach_entity', (packet) => {
    // attach entity
    const entity = fetchEntity(packet.entityId)
    if (packet.vehicleId === -1) {
      const vehicle = entity.vehicle
      delete entity.vehicle
      bot.emit('entityDetach', entity, vehicle)
    } else {
      entity.vehicle = fetchEntity(packet.vehicleId)
      bot.emit('entityAttach', entity, entity.vehicle)
    }
  })

  bot._client.on('entity_metadata', (packet) => {
    // entity metadata
    const entity = fetchEntity(packet.entityId)
    const metadata = parseMetadata(packet.metadata, entity.metadata)
    entity.metadata = metadata
    bot.emit('entityUpdate', entity)

    const typeSlot = bot.supportFeature('itemsAreAlsoBlocks') ? 5 : 6
    const slot = packet.metadata.find(e => e.type === typeSlot)
    if (entity.name && (entity.name.toLowerCase() === 'item' || entity.name === 'item_stack') && slot) {
      bot.emit('itemDrop', entity)
    }

    const pose = packet.metadata.find(e => e.type === 18)
    if (pose && pose.value === 2) {
      bot.emit('entitySleep', entity)
    }

    const bitField = packet.metadata.find(p => p.key === 0)
    if (bitField === undefined) {
      return
    }
    if ((bitField.value & 2) !== 0) {
      entity.crouching = true
      bot.emit('entityCrouch', entity)
    } else if (entity.crouching) { // prevent the initial entity_metadata packet from firing off an uncrouch event
      entity.crouching = false
      bot.emit('entityUncrouch', entity)
    }
  })

  bot._client.on('entity_effect', (packet) => {
    // entity effect
    const entity = fetchEntity(packet.entityId)
    const effect = {
      id: packet.effectId,
      amplifier: packet.amplifier,
      duration: packet.duration
    }
    entity.effects[effect.id] = effect
    bot.emit('entityEffect', entity, effect)
  })

  bot._client.on('remove_entity_effect', (packet) => {
    // remove entity effect
    const entity = fetchEntity(packet.entityId)
    let effect = entity.effects[packet.effectId]
    if (effect) {
      delete entity.effects[effect.id]
    } else {
      // unknown effect
      effect = {
        id: packet.effectId,
        amplifier: -1,
        duration: -1
      }
    }
    bot.emit('entityEffectEnd', entity, effect)
  })

  const updateAttributes = (packet) => {
    const entity = fetchEntity(packet.entityId)
    if (!entity.attributes) entity.attributes = {}
    for (const prop of packet.properties) {
      entity.attributes[prop.key] = {
        value: prop.value,
        modifiers: prop.modifiers
      }
    }
    bot.emit('entityAttributes', entity)
  }
  bot._client.on('update_attributes', updateAttributes) // 1.8
  bot._client.on('entity_update_attributes', updateAttributes) // others

  bot._client.on('spawn_entity_weather', (packet) => {
    // spawn global entity
    const entity = fetchEntity(packet.entityId)
    entity.type = 'global'
    entity.globalType = 'thunderbolt'
    entity.uuid = packet.entityUUID
    entity.position.set(packet.x / 32, packet.y / 32, packet.z / 32)
    bot.emit('entitySpawn', entity)
  })

  bot.on('spawn', () => {
    bot.emit('entitySpawn', bot.entity)
  })

  bot._client.on('player_info', (packet) => {
    // player list item(s)
    for (const item of packet.data) {
      let player = bot.uuidToUsername[item.UUID] ? bot.players[bot.uuidToUsername[item.UUID]] : null
      if (packet.action === 0) {
        let newPlayer = false

        // New Player
        if (!player) {
          player = bot.players[item.name] = {
            username: item.name,
            ping: item.ping,
            uuid: item.UUID,
            displayName: new ChatMessage({ text: '', extra: [{ text: item.name }] })
          }

          bot.uuidToUsername[item.UUID] = item.name
          bot.emit('playerJoined', player)
          newPlayer = true
        } else {
          // Just an Update
          player.gamemode = item.gamemode
          player.ping = item.ping
        }

        if (item.displayName) {
          player.displayName = new ChatMessage(JSON.parse(item.displayName))
        }

        const playerEntity = Object.values(bot.entities).find(e => e.type === 'player' && e.username === item.name)
        player.entity = playerEntity

        if (playerEntity === bot.entity) {
          bot.player = player
        }

        if (!newPlayer) {
          bot.emit('playerUpdated', player)
        }
      } else if (player) {
        if (packet.action === 1) {
          player.gamemode = item.gamemode
        } else if (packet.action === 2) {
          player.ping = item.ping
        } else if (packet.action === 3 && !item.displayName) {
          player.displayName = new ChatMessage({ text: '', extra: [{ text: player.username }] })
        } else if (packet.action === 3 && item.displayName) {
          player.displayName = new ChatMessage(JSON.parse(item.displayName))
        } else if (packet.action === 4) {
          if (player.entity === bot.entity) continue

          player.entity = null
          delete bot.players[player.username]
          delete bot.uuidToUsername[item.UUID]
          bot.emit('playerLeft', player)
          continue
        } else {
          continue
        }

        bot.emit('playerUpdated', player)
      }
    }
  })

  // attaching to a vehicle
  bot._client.on('attach_entity', (packet) => {
    if (packet.entityId !== bot.entity.id) return
    const vehicle = bot.vehicle
    if (packet.vehicleId === -1) {
      bot.vehicle = null
      bot.emit('dismount', vehicle)
    } else {
      bot.vehicle = bot.entities[packet.vehicleId]
      bot.emit('mount')
    }
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
      forward: forward,
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

  function fetchEntity (id) {
    return bot.entities[id] || (bot.entities[id] = new Entity(id))
  }
}

function parseMetadata (metadata, entityMetadata = {}) {
  if (metadata !== undefined) {
    for (const { key, value } of metadata) {
      entityMetadata[key] = value
    }
  }

  return entityMetadata
}
