const { Vec3 } = require('vec3')
const conv = require('../conversions')
// These values are only accurate for versions 1.14 and above (crouch hitbox changes)
// Todo: hitbox sizes for sleeping, swimming/crawling, and flying with elytra
const PLAYER_HEIGHT = 1.8
const CROUCH_HEIGHT = 1.5
const PLAYER_WIDTH = 0.6
const PLAYER_EYEHEIGHT = 1.62
const CROUCH_EYEHEIGHT = 1.27

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
  10: 'entityEatingGrass',
  55: 'entityHandSwap'
}

function inject (bot) {
  const { mobs } = bot.registry
  const Entity = require('prismarine-entity')(bot.version)
  const Item = require('prismarine-item')(bot.version)
  const ChatMessage = require('prismarine-chat')(bot.registry)

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

  bot._playerFromUUID = (uuid) => Object.values(bot.players).find(player => player.uuid === uuid)

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
    bot.entity.height = PLAYER_HEIGHT
    bot.entity.width = PLAYER_WIDTH
    bot.entity.eyeHeight = PLAYER_EYEHEIGHT
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

  bot.on('entityCrouch', (entity) => {
    entity.eyeHeight = CROUCH_EYEHEIGHT
    entity.height = CROUCH_HEIGHT
  })

  bot.on('entityUncrouch', (entity) => {
    entity.eyeHeight = PLAYER_EYEHEIGHT
    entity.height = PLAYER_HEIGHT
  })

  bot._client.on('collect', (packet) => {
    // collect item
    const collector = fetchEntity(packet.collectorEntityId)
    const collected = fetchEntity(packet.collectedEntityId)
    bot.emit('playerCollect', collector, collected)
  })

  // What is internalId?
  const entityDataByInternalId = Object.fromEntries(bot.registry.entitiesArray.map((e) => [e.internalId, e]))

  function setEntityData (entity, type, entityData) {
    entityData ??= entityDataByInternalId[type]
    if (entityData) {
      entity.type = entityData.type || 'object'
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
      entity.displayName = 'unknown'
      entity.name = 'unknown'
      entity.kind = 'unknown'
    }
  }

  function updateEntityPos (entity, pos) {
    if (bot.supportFeature('fixedPointPosition')) {
      entity.position.set(pos.x / 32, pos.y / 32, pos.z / 32)
    } else if (bot.supportFeature('doublePosition')) {
      entity.position.set(pos.x, pos.y, pos.z)
    }
    entity.yaw = conv.fromNotchianYawByte(pos.yaw)
    entity.pitch = conv.fromNotchianPitchByte(pos.pitch)
  }

  function addNewPlayer (entityId, uuid, pos) {
    const entity = fetchEntity(entityId)
    entity.type = 'player'
    entity.name = 'player'
    entity.username = bot.uuidToUsername[uuid]
    entity.uuid = uuid
    updateEntityPos(entity, pos)
    entity.eyeHeight = PLAYER_EYEHEIGHT
    entity.height = PLAYER_HEIGHT
    entity.width = PLAYER_WIDTH
    if (bot.players[entity.username] !== undefined && !bot.players[entity.username].entity) {
      bot.players[entity.username].entity = entity
    }
    return entity
  }

  function addNewNonPlayer (entityId, uuid, entityType, pos) {
    const entity = fetchEntity(entityId)
    const entityData = bot.registry.entities[entityType]
    setEntityData(entity, entityType, entityData)
    updateEntityPos(entity, pos)
    entity.uuid = uuid
    return entity
  }

  bot._client.on('named_entity_spawn', (packet) => {
    // in case player_info packet was not sent before named_entity_spawn : ignore named_entity_spawn (see #213)
    if (packet.playerUUID in bot.uuidToUsername) {
      // spawn named entity
      const entity = addNewPlayer(packet.entityId, packet.playerUUID, packet, packet.metadata)
      entity.dataBlobs = packet.data // this field doesn't appear to be listed on any version
      entity.metadata = parseMetadata(packet.metadata, entity.metadata) // 1.8
      bot.emit('entitySpawn', entity)
    }
  })

  // spawn object/vehicle on versions < 1.19, on versions > 1.19 handles all non-player entities
  // on versions >= 1.20.2, this also handles player entities
  bot._client.on('spawn_entity', (packet) => {
    const entityData = entityDataByInternalId[packet.type]
    const entity = entityData?.type === 'player'
      ? addNewPlayer(packet.entityId, packet.objectUUID, packet)
      : addNewNonPlayer(packet.entityId, packet.objectUUID, packet.type, packet)
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

  // This packet is removed since 1.19 and merged into spawn_entity
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

  // 1.21.3 - merges the packets above
  bot._client.on('sync_entity_position', (packet) => {
    const entity = fetchEntity(packet.entityId)
    entity.position.set(packet.x, packet.y, packet.z)
    entity.velocity.update(packet.dx, packet.dy, packet.dz)
    entity.yaw = packet.yaw
    entity.pitch = packet.pitch
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

    if (eventName === 'entityHandSwap' && entity.equipment) {
      [entity.equipment[0], entity.equipment[1]] = [entity.equipment[1], entity.equipment[0]]
      entity.heldItem = entity.equipment[0] // Update held item like prismarine-entity does upon equipment updates
    }

    if (eventName) bot.emit(eventName, entity)
  })

  bot._client.on('damage_event', (packet) => { // 1.20+
    const entity = bot.entities[packet.entityId]
    const source = bot.entities[packet.sourceCauseId - 1] // damage_event : SourceCauseId : The ID + 1 of the entity responsible for the damage, if present. If not present, the value is 0
    bot.emit('entityHurt', entity, source)
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

  bot.fireworkRocketDuration = 0
  function setElytraFlyingState (entity, elytraFlying) {
    let startedFlying = false
    if (elytraFlying) {
      startedFlying = !entity.elytraFlying
      entity.elytraFlying = true
    } else if (entity.elytraFlying) {
      entity.elytraFlying = false
    }
    if (bot.fireworkRocketDuration !== 0 && entity.id === bot.entity?.id && !elytraFlying) {
      bot.fireworkRocketDuration = 0
      knownFireworks.clear()
    }

    if (startedFlying) {
      bot.emit('entityElytraFlew', entity)
    }
  }

  const knownFireworks = new Set()
  function handleBotUsedFireworkRocket (fireworkEntityId, fireworkInfo) {
    if (knownFireworks.has(fireworkEntityId)) return
    knownFireworks.add(fireworkEntityId)
    let flightDur = fireworkInfo?.nbtData?.value?.Fireworks?.value?.Flight.value ?? 1
    if (typeof flightDur !== 'number') { flightDur = 1 }
    const baseDuration = 10 * (flightDur + 1)
    const randomDuration = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 7)
    bot.fireworkRocketDuration = baseDuration + randomDuration

    bot.emit('usedFirework', fireworkEntityId)
  }

  let fireworkEntityName
  if (bot.supportFeature('fireworkNamePlural')) {
    fireworkEntityName = 'fireworks_rocket'
  } else if (bot.supportFeature('fireworkNameSingular')) {
    fireworkEntityName = 'firework_rocket'
  }

  let fireworkMetadataIdx
  let fireworkMetadataIsOpt
  if (bot.supportFeature('fireworkMetadataVarInt7')) {
    fireworkMetadataIdx = 7
    fireworkMetadataIsOpt = false
  } else if (bot.supportFeature('fireworkMetadataOptVarInt8')) {
    fireworkMetadataIdx = 8
    fireworkMetadataIsOpt = true
  } else if (bot.supportFeature('fireworkMetadataOptVarInt9')) {
    fireworkMetadataIdx = 9
    fireworkMetadataIsOpt = true
  }
  const hasFireworkSupport = fireworkEntityName !== undefined && fireworkMetadataIdx !== undefined && fireworkMetadataIsOpt !== undefined

  bot._client.on('entity_metadata', (packet) => {
    // entity metadata
    const entity = fetchEntity(packet.entityId)
    const metadata = parseMetadata(packet.metadata, entity.metadata)
    entity.metadata = metadata
    bot.emit('entityUpdate', entity)

    if (bot.supportFeature('mcDataHasEntityMetadata')) {
      const metadataKeys = bot.registry.entitiesByName[entity.name]?.metadataKeys
      const metas = metadataKeys ? Object.fromEntries(packet.metadata.map(e => [metadataKeys[e.key], e.value])) : {}
      if (packet.metadata.some(m => m.type === 'item_stack')) {
        bot.emit('itemDrop', entity)
      }
      if (metas.sleeping_pos || metas.pose === 2) {
        bot.emit('entitySleep', entity)
      }

      if (hasFireworkSupport && fireworkEntityName === entity.name && metas.attached_to_target !== undefined) {
        // fireworkMetadataOptVarInt9 and later is implied by
        // mcDataHasEntityMetadata, so no need to check metadata index and type
        // (eg fireworkMetadataOptVarInt8)
        if (metas.attached_to_target !== 0) {
          const entityId = metas.attached_to_target - 1
          if (entityId === bot.entity?.id) {
            handleBotUsedFireworkRocket(entity.id, metas.fireworks_item)
          }
        }
      }

      if (metas.shared_flags != null) {
        if (bot.supportFeature('hasElytraFlying')) {
          const elytraFlying = metas.shared_flags & 0x80
          setElytraFlyingState(entity, Boolean(elytraFlying))
        }

        if (metas.shared_flags & 2) {
          entity.crouching = true
          bot.emit('entityCrouch', entity)
        } else if (entity.crouching) { // prevent the initial entity_metadata packet from firing off an uncrouch event
          entity.crouching = false
          bot.emit('entityUncrouch', entity)
        }
      }

      // Breathing (formerly in breath.js)
      if (metas.air_supply != null) {
        bot.oxygenLevel = Math.round(metas.air_supply / 15)
        bot.emit('breath')
      }
    } else {
      const typeSlot = (bot.supportFeature('itemsAreAlsoBlocks') ? 5 : 6) + (bot.supportFeature('entityMetadataHasLong') ? 1 : 0)
      const slot = packet.metadata.find(e => e.type === typeSlot)
      if (entity.name && (entity.name.toLowerCase() === 'item' || entity.name === 'item_stack') && slot) {
        bot.emit('itemDrop', entity)
      }

      const typePose = bot.supportFeature('entityMetadataHasLong') ? 19 : 18
      const pose = packet.metadata.find(e => e.type === typePose)
      if (pose && pose.value === 2) {
        bot.emit('entitySleep', entity)
      }

      if (hasFireworkSupport && fireworkEntityName === entity.name) {
        const attachedToTarget = packet.metadata.find(e => e.key === fireworkMetadataIdx)
        if (attachedToTarget !== undefined) {
          let entityId
          if (fireworkMetadataIsOpt) {
            if (attachedToTarget.value !== 0) {
              entityId = attachedToTarget.value - 1
            } // else, not attached to an entity
          } else {
            entityId = attachedToTarget.value
          }
          if (entityId !== undefined && entityId === bot.entity?.id) {
            const fireworksItem = packet.metadata.find(e => e.key === (fireworkMetadataIdx - 1))
            handleBotUsedFireworkRocket(entity.id, fireworksItem?.value)
          }
        }
      }

      const bitField = packet.metadata.find(p => p.key === 0)
      if (bitField !== undefined) {
        if (bot.supportFeature('hasElytraFlying')) {
          const elytraFlying = bitField.value & 0x80
          setElytraFlyingState(entity, Boolean(elytraFlying))
        }

        if ((bitField.value & 2) !== 0) {
          entity.crouching = true
          bot.emit('entityCrouch', entity)
        } else if (entity.crouching) { // prevent the initial entity_metadata packet from firing off an uncrouch event
          entity.crouching = false
          bot.emit('entityUncrouch', entity)
        }
      }
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

    if (typeof packet.action !== 'number') {
      // the features checks below this will be un-needed with https://github.com/PrismarineJS/minecraft-data/pull/948
      for (const update of packet.data) {
        let player = bot.uuidToUsername[update.uuid] ? bot.players[bot.uuidToUsername[update.uuid]] : null
        let newPlayer = false

        const obj = {
          uuid: update.uuid
        }

        if (!player) newPlayer = true

        player ||= obj

        if (packet.action.add_player) {
          obj.username = update.player.name
          obj.displayName = player.displayName || new ChatMessage({ text: '', extra: [{ text: update.player.name }] })
          obj.skinData = extractSkinInformation(update.player.properties)
        }

        if (packet.action.update_game_mode) {
          obj.gamemode = update.gamemode
        }

        if (packet.action.update_latency) {
          obj.ping = update.latency
        }

        if (update.displayName) {
          obj.displayName = ChatMessage.fromNotch(update.displayName)
        }

        if (newPlayer) {
          if (!obj.username) continue // Should be unreachable
          player = bot.players[obj.username] = obj
          bot.uuidToUsername[obj.uuid] = obj.username
        } else {
          Object.assign(player, obj)
        }

        const playerEntity = Object.values(bot.entities).find(e => e.type === 'player' && e.username === player.username)
        player.entity = playerEntity

        if (playerEntity === bot.entity) {
          bot.player = player
        }

        if (newPlayer) {
          bot.emit('playerJoined', player)
        } else {
          bot.emit('playerUpdated', player)
        }
      }
      return
    }

    if (bot.supportFeature('playerInfoActionIsBitfield')) {
      for (const item of packet.data) {
        let player = bot.uuidToUsername[item.uuid] ? bot.players[bot.uuidToUsername[item.uuid]] : null
        let newPlayer = false

        const obj = {
          uuid: item.uuid
        }

        if (!player) newPlayer = true

        player = player || obj

        if (packet.action & 1) {
          obj.username = item.player.name
          obj.displayName = player.displayName || new ChatMessage({ text: '', extra: [{ text: item.player.name }] })
          obj.skinData = extractSkinInformation(item.player.properties)
        }

        if (packet.action & 4) {
          obj.gamemode = item.gamemode
        }

        if (packet.action & 16) {
          obj.ping = item.latency
        }

        if (item.displayName) {
          obj.displayName = ChatMessage.fromNotch(item.displayName)
        } else if (packet.action & 32) obj.displayName = new ChatMessage({ text: '', extra: [{ text: player.username || obj.username }] })

        if (newPlayer) {
          if (!obj.username) continue // Should be unreachable
          player = bot.players[obj.username] = obj
          bot.uuidToUsername[obj.uuid] = obj.username
        } else {
          Object.assign(player, obj)
        }

        const playerEntity = Object.values(bot.entities).find(e => e.type === 'player' && e.username === player.username)
        player.entity = playerEntity

        if (playerEntity === bot.entity) {
          bot.player = player
        }

        if (newPlayer) {
          bot.emit('playerJoined', player)
        } else {
          bot.emit('playerUpdated', player)
        }
      }
    } else {
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
              displayName: new ChatMessage({ text: '', extra: [{ text: item.name }] }),
              skinData: extractSkinInformation(item.properties),
              profileKeys: item.crypto
                ? {
                    publicKey: item.crypto.publicKey, // DER-encoded public key
                    signature: item.crypto.signature // Signature
                  }
                : null
            }

            bot.uuidToUsername[item.UUID] = item.name
            bot.emit('playerJoined', player)
            newPlayer = true
          } else {
            // Just an Update
            player.gamemode = item.gamemode
            player.ping = item.ping
            player.skinData = extractSkinInformation(item.properties)
            if (item.crypto) {
              player.profileKeys = {
                publicKey: item.crypto.publicKey,
                signature: item.crypto.signature
              }
            }
          }

          if (item.displayName) {
            player.displayName = ChatMessage.fromNotch(item.displayName)
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
            player.displayName = ChatMessage.fromNotch(item.displayName)
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
    }
  })

  // (1.19.3) player(s) leave the game
  bot._client.on('player_remove', (packet) => {
    for (const uuid of packet.players) {
      const player = bot.uuidToUsername[uuid] ? bot.players[bot.uuidToUsername[uuid]] : null

      if (!player || player.entity === bot.entity) continue

      player.entity = null
      delete bot.players[player.username]
      delete bot.uuidToUsername[uuid]
      bot.emit('playerLeft', player)
    }
  })

  // attaching to a vehicle
  bot._client.on('attach_entity', (packet) => {
    const passenger = fetchEntity(packet.entityId)
    const vehicle = packet.vehicleId === -1 ? null : fetchEntity(packet.vehicleId)

    const originalVehicle = passenger.vehicle
    if (originalVehicle) {
      const index = originalVehicle.passengers.indexOf(passenger)
      originalVehicle.passengers.splice(index, 1)
    }
    passenger.vehicle = vehicle
    if (vehicle) {
      vehicle.passengers.push(passenger)
    }

    if (packet.entityId === bot.entity.id) {
      const vehicle = bot.vehicle
      if (packet.vehicleId === -1) {
        bot.vehicle = null
        bot.emit('dismount', vehicle)
      } else {
        bot.vehicle = bot.entities[packet.vehicleId]
        bot.emit('mount')
      }
    }
  })

  bot._client.on('set_passengers', ({ entityId, passengers }) => {
    const passengerEntities = passengers.map((passengerId) => fetchEntity(passengerId))
    const vehicle = entityId === -1 ? null : bot.entities[entityId]

    for (const passengerEntity of passengerEntities) {
      const originalVehicle = passengerEntity.vehicle
      if (originalVehicle) {
        const index = originalVehicle.passengers.indexOf(passengerEntity)
        originalVehicle.passengers.splice(index, 1)
      }
      passengerEntity.vehicle = vehicle
      if (vehicle) {
        vehicle.passengers.push(passengerEntity)
      }
    }

    if (passengers.includes(bot.entity.id)) {
      const originalVehicle = bot.vehicle
      if (entityId === -1) {
        bot.vehicle = null
        bot.emit('dismount', originalVehicle)
      } else {
        bot.vehicle = bot.entities[entityId]
        bot.emit('mount')
      }
    }
  })

  // dismounting when the vehicle is gone
  bot._client.on('entityGone', (entity) => {
    if (bot.vehicle === entity) {
      bot.vehicle = null
      bot.emit('dismount', (entity))
    }
    if (entity.passengers) {
      for (const passenger of entity.passengers) {
        passenger.vehicle = null
      }
    }
    if (entity.vehicle) {
      const index = entity.vehicle.passengers.indexOf(entity)
      if (index !== -1) {
        entity.vehicle.passengers.splice(index, 1)
      }
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
    if (bot.supportFeature('newPlayerInputPacket')) {
      // docs:
      // * left can take -1 or 1 : -1 means right, 1 means left
      // * forward can take -1 or 1 : -1 means backward, 1 means forward
      bot._client.write('player_input', {
        inputs: {
          forward: forward > 0,
          backward: forward < 0,
          left: left > 0,
          right: left < 0
        }
      })
    } else {
      bot._client.write('steer_vehicle', {
        sideways: left,
        forward,
        jump: 0x01
      })
    }
  }

  function dismount () {
    if (bot.vehicle) {
      if (bot.supportFeature('newPlayerInputPacket')) {
        bot._client.write('player_input', {
          inputs: {
            jump: true
          }
        })
      } else {
        bot._client.write('steer_vehicle', {
          sideways: 0.0,
          forward: 0.0,
          jump: 0x02
        })
      }
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

function extractSkinInformation (properties) {
  if (!properties) {
    return undefined
  }

  const props = Object.fromEntries(properties.map((e) => [e.name, e]))
  if (!props.textures || !props.textures.value) {
    return undefined
  }

  const skinTexture = JSON.parse(Buffer.from(props.textures.value, 'base64').toString('utf8'))

  const skinTextureUrl = skinTexture?.textures?.SKIN?.url ?? undefined
  const skinTextureModel = skinTexture?.textures?.SKIN?.metadata?.model ?? undefined

  if (!skinTextureUrl) {
    return undefined
  }

  return { url: skinTextureUrl, model: skinTextureModel }
}
