const assert = require('assert')
const vec3 = require('vec3')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = bot.registry.blocksByName.gold_block.id
  bot.on('chunkColumnLoad', (columnPoint) => {
    assert.strictEqual(columnPoint.x, 0)
    assert.strictEqual(columnPoint.z, 0)
    assert.strictEqual(bot.blockAt(pos).type, goldId)
    done()
  })
  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    chunk.setBlockType(pos, goldId)
    client.write('map_chunk', bot.test.generateChunkPacket(chunk))
  })
}
