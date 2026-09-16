const assert = require('assert')
const vec3 = require('vec3')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  const loginPacket = bot.test.generateLoginPacket()
  let respawnPacket
  if (bot.supportFeature('usesLoginPacket')) {
    loginPacket.worldName = 'minecraft:overworld'
    loginPacket.hashedSeed = [0, 0]
    loginPacket.entityId = 0
    respawnPacket = {
      // 1.19+ the `dimension` filed is a string in respawn packet and undefined in login packet, in previous versions it's same NBT data in login/respawn
      dimension: bot.supportFeature('dimensionDataInCodec') ? 'minecraft:overworld' : loginPacket.dimension,
      worldName: loginPacket.worldName,
      hashedSeed: loginPacket.hashedSeed,
      gamemode: 0,
      previousGamemode: 255,
      isDebug: false,
      isFlat: false,
      copyMetadata: true,
      death: {
        dimensionName: '',
        location: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    }
    if (bot.supportFeature('spawnRespawnWorldDataField')) {
      respawnPacket = {
        worldState: respawnPacket
      }
      respawnPacket.worldState.name = loginPacket.worldName
      respawnPacket.worldState.dimension = loginPacket.dimension
    }
  } else {
    respawnPacket = {
      dimension: 0,
      hashedSeed: [0, 0],
      gamemode: 0,
      levelType: 'default'
    }
  }
  const chunk = bot.test.buildChunk()
  chunk.setBlockType(pos, goldId)
  const chunkPacket = bot.test.generateChunkPacket(chunk)
  const positionPacket = {
    x: 1.5,
    y: 80,
    z: 1.5,
    pitch: 0,
    yaw: 0,
    flags: 0,
    teleportId: 0
  }
  server.on('playerJoin', async (client) => {
    await bot.test.pluginsLoaded
    bot.once('respawn', () => {
      assert.ok(bot.world.getColumn(0, 0) !== undefined)
      bot.once('respawn', () => {
        assert.ok(bot.world.getColumn(0, 0) === undefined)
        done()
      })
      if (bot.supportFeature('spawnRespawnWorldDataField')) {
        respawnPacket.worldState.name = 'minecraft:nether'
      } else {
        respawnPacket.worldName = 'minecraft:nether'
      }
      if (bot.supportFeature('spawnRespawnWorldDataField')) {
        respawnPacket.worldState.dimension = 1
      } else if (bot.supportFeature('usesLoginPacket')) {
        respawnPacket.dimension.name = 'e'
      } else {
        respawnPacket.dimension = 1
      }
      client.write('respawn', respawnPacket)
    })
    await client.write('login', loginPacket)
    await client.write('map_chunk', chunkPacket)
    await client.write('position', positionPacket)
    await client.write('update_health', {
      health: 20,
      food: 20,
      foodSaturation: 0
    })
    await bot.waitForTicks(1)
    await client.write('respawn', respawnPacket)
  })
}
