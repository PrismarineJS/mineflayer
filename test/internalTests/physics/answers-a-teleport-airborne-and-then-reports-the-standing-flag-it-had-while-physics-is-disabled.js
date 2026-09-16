const assert = require('assert')
const vec3 = require('vec3')
const { once, sleep } = require('../../../lib/promise_utils')

module.exports = async function (bot, server) {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  const client = (await once(server, 'playerJoin'))[0]
  await client.write('login', bot.test.generateLoginPacket())
  const chunk = bot.test.buildChunk()
  chunk.setBlockType(pos, goldId)
  await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
  await once(bot, 'chunkColumnLoad')
  const onBlock = { x: pos.x + 0.5, y: pos.y + 1, z: pos.z + 0.5, dx: 0, dy: 0, dz: 0, pitch: 0, yaw: 0, teleportId: 1, flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0 }
  const landed = once(bot, 'forcedMove')
  await client.write('position', onBlock)
  await landed
  await bot.waitForTicks(5)
  assert.strictEqual(bot.entity.onGround, true, 'standing on the block')
  bot.physicsEnabled = false
  const moves = []
  const onPacket = (data, meta) => {
    if (!['position', 'position_look', 'look', 'flying'].includes(meta.name)) return
    moves.push({ name: meta.name, onGround: data.onGround ?? data.flags?.onGround })
  }
  client.on('packet', onPacket)
  const pinned = once(bot, 'forcedMove')
  await client.write('position', { ...onBlock, teleportId: 2 })
  await pinned
  await sleep(1500)
  client.off('packet', onPacket)
  // The reply to the teleport is the only packet that is not grounded.
  const airborne = moves.filter(m => m.onGround !== true)
  assert.deepStrictEqual(airborne, [{ name: 'position_look', onGround: false }], `the teleport reply alone is airborne: ${JSON.stringify(moves)}`)
  const reminders = moves.slice(moves.indexOf(airborne[0]) + 1)
  assert.ok(reminders.length > 0, 'the position reminder goes out with physics disabled')
}
