const assert = require('assert')
const vec3 = require('vec3')

module.exports = (bot, server, done) => {
  const blockPos = vec3(1, 65, 1)
  const playerPos = vec3(1.5, 66, 1.5)
  // eyeHeight is 1.62, so eye level at y=67.62 -> block at y=67
  // A second position where eye level has water: player at y=70, eye at y=71.62 -> block y=71
  const playerPos2 = vec3(1.5, 70, 1.5)
  const eyeLevelBlockPos2 = vec3(1, 71, 1)
  const dirtId = bot.registry.blocksByName.dirt.id
  const waterId = bot.registry.blocksByName.water.id
  const blockPos2 = vec3(1, 69, 1)

  bot.on('chunkColumnLoad', () => {
    // Set bot entity properties
    bot.entity.eyeHeight = 1.62
    bot.entity.onGround = true
    bot.entity.isInWater = false
    bot.entity.effects = {}
    bot.game = bot.game || {}
    bot.game.gameMode = 'survival'

    // Test 1: No water at eye level -> normal dig speed
    bot.entity.position = playerPos
    const block1 = bot.blockAt(blockPos)
    const digTimeNoWater = bot.digTime(block1)

    // Test 2: Water at eye level -> slower dig speed
    bot.entity.position = playerPos2
    const block2 = bot.blockAt(blockPos2)
    const digTimeWithWater = bot.digTime(block2)

    // Digging in water should be slower (higher dig time)
    assert(digTimeWithWater > digTimeNoWater,
      `Dig time with water at eye level (${digTimeWithWater}) should be greater than without (${digTimeNoWater})`)

    // Test 3: isInWater=true but no water block at eye level should NOT slow digging
    // (this is the bug that was fixed - previously isInWater incorrectly affected dig speed)
    bot.entity.position = playerPos
    bot.entity.isInWater = true
    const digTimeFeetInWater = bot.digTime(block1)
    assert.strictEqual(digTimeFeetInWater, digTimeNoWater,
      'isInWater should not affect dig time when eye level is not in water')

    done()
  })
  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    // Place dirt blocks to dig at two locations
    chunk.setBlockType(blockPos, dirtId)
    chunk.setBlockType(blockPos2, dirtId)
    // Place water only at the second eye-level position
    chunk.setBlockType(eyeLevelBlockPos2, waterId)
    client.write('map_chunk', bot.test.generateChunkPacket(chunk))
  })
}
