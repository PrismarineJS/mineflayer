const assert = require('assert')
const vec3 = require('vec3')
const { once, onceWithCleanup } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  const pos = vec3(1, 65, 1)
  const chestId = bot.registry.blocksByName.chest.id
  const location = { x: pos.x, y: pos.y, z: pos.z }
  const [client] = await once(server, 'playerJoin')
  client.write('login', bot.test.generateLoginPacket())
  const chunk = bot.test.buildChunk()
  chunk.setBlockType(pos, chestId)
  client.write('map_chunk', bot.test.generateChunkPacket(chunk))
  await once(bot, 'chunkColumnLoad')
  const chestStateId = bot.blockAt(pos).stateId

  const opened = onceWithCleanup(bot, 'chestLidMove', { timeout: 2000 })
  client.write('block_action', { location, byte1: 1, byte2: 1, blockId: chestId })
  await opened

  // Breaking the chest while it is open never yields a closing block
  // action, so the open count must not survive the block change.
  client.write('block_change', { location, type: 0 })
  client.write('block_change', { location, type: chestStateId })
  const reopened = onceWithCleanup(bot, 'chestLidMove', { timeout: 2000 })
  client.write('block_action', { location, byte1: 1, byte2: 1, blockId: chestId })
  const [block, isOpen] = await reopened
  assert.ok(block.position.equals(pos))
  assert.strictEqual(isOpen, 1)
}
