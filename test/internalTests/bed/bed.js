const assert = require('assert')
const vec3 = require('vec3')

module.exports = (bot, server, done) => {
  const blocks = bot.registry.blocksByName
  const entities = bot.registry.entitiesByName

  const playerPos = vec3(10, 0, 0)
  const zombiePos = vec3(0, 0, 0)
  const beds = [
    { head: vec3(10, 0, 3), foot: vec3(10, 0, 2), facing: 2, throws: false },
    { head: vec3(9, 0, 4), foot: vec3(10, 0, 4), facing: 3, throws: true, error: new Error('the bed is too far') },
    { head: vec3(8, 0, 0), foot: vec3(8, 0, 1), facing: 0, throws: true, error: new Error('there are monsters nearby') },
    { head: vec3(12, 0, 0), foot: vec3(11, 0, 0), facing: 1, throws: false }
  ]

  const zombieId = entities.zombie ? entities.zombie.id : entities.Zombie.id
  let bedBlock
  if (bot.supportFeature('oneBlockForSeveralVariations', bot.registry.version.majorVersion)) {
    bedBlock = blocks.bed
  } else if (bot.supportFeature('blockSchemeIsFlat', bot.registry.version.majorVersion)) {
    bedBlock = blocks.red_bed
  }
  const bedId = bedBlock.id

  bot.once('chunkColumnLoad', (columnPoint) => {
    for (const bed in beds) {
      const bedBock = bot.blockAt(beds[bed].foot)
      const bedBockMetadata = bot.parseBedMetadata(bedBock)
      assert.strictEqual(bedBockMetadata.facing, beds[bed].facing, 'The facing property seems to be wrong')
      assert.strictEqual(bedBockMetadata.part, false, 'The part property seems to be wrong') // Is the foot

      if (beds[bed].throws) {
        bot.sleep(bedBock).catch(err => assert.strictEqual(err, beds[bed].error))
      } else {
        bot.sleep(bedBock).catch(err => assert.ifError(err))
      }
    }

    done()
  })

  server.once('playerJoin', (client) => {
    const loginPacket = bot.test.generateLoginPacket()
    client.write('login', loginPacket)
    // Set timeOfDay after login is processed so bot.time is initialized
    bot.once('login', () => { bot.time.timeOfDay = 18000 })

    const chunk = bot.test.buildChunk()

    for (const bed in beds) {
      chunk.setBlockType(beds[bed].head, bedId)
      chunk.setBlockType(beds[bed].foot, bedId)
    }

    if (bot.supportFeature('blockStateId', bot.registry.version.majorVersion)) {
      chunk.setBlockStateId(beds[0].foot, 3 + bedBlock.minStateId) // { facing: north, occupied: false, part: foot }
      chunk.setBlockStateId(beds[0].head, 2 + bedBlock.minStateId) // { facing:north, occupied: false, part: head }

      chunk.setBlockStateId(beds[1].foot, 15 + bedBlock.minStateId) // { facing: east, occupied:false, part:foot }
      chunk.setBlockStateId(beds[1].head, 14 + bedBlock.minStateId) // { facing: east, occupied: false, part: head }

      chunk.setBlockStateId(beds[2].foot, 7 + bedBlock.minStateId) // { facing: south, occupied: false, part: foot }
      chunk.setBlockStateId(beds[2].head, 6 + bedBlock.minStateId) // { facing: south, occupied: false, part: head }

      chunk.setBlockStateId(beds[3].foot, 11 + bedBlock.minStateId) // { facing: west, occupied: false, part: foot }
      chunk.setBlockStateId(beds[3].head, 10 + bedBlock.minStateId) // { facing: west, occupied: false, part: head }
    } else if (bot.supportFeature('blockMetadata', bot.registry.version.majorVersion)) {
      chunk.setBlockData(beds[0].foot, 2) // { facing: north, occupied: false, part: foot }
      chunk.setBlockData(beds[0].head, 10) // { facing:north, occupied: false, part: head }

      chunk.setBlockData(beds[1].foot, 3) // { facing: east, occupied:false, part:foot }
      chunk.setBlockData(beds[1].head, 11) // { facing: east, occupied: false, part: head }

      chunk.setBlockData(beds[2].foot, 0) // { facing: south, occupied: false, part: foot }
      chunk.setBlockData(beds[2].head, 8) // { facing: south, occupied: false, part: head }

      chunk.setBlockData(beds[3].foot, 1) // { facing: west, occupied: false, part: foot }
      chunk.setBlockData(beds[3].head, 9) // { facing: west, occupied: false, part: head }
    }

    client.write('position', {
      x: playerPos.x,
      y: playerPos.y,
      z: playerPos.z,
      yaw: 0,
      pitch: 0,
      flags: 0,
      teleportId: 1
    })

    client.write(bot.registry.supportFeature('consolidatedEntitySpawnPacket') ? 'spawn_entity' : 'spawn_entity_living', {
      entityId: 8,
      entityUUID: '00112233-4455-6677-8899-aabbccddeeff',
      objectUUID: '00112233-4455-6677-8899-aabbccddeeff',
      type: zombieId,
      x: zombiePos.x,
      y: zombiePos.y,
      z: zombiePos.z,
      yaw: 0,
      pitch: 0,
      headPitch: 0,
      velocity: { x: 0, y: 0, z: 0 },
      metadata: []
    })

    client.write('map_chunk', bot.test.generateChunkPacket(chunk))
  })
}
