/* eslint-env mocha */

const mineflayer = require('../')
const mc = require('minecraft-protocol')
const assert = require('assert')
const { once } = require('../lib/promise_utils')
const { getPort } = require('./common/util')

for (const supportedVersion of mineflayer.testedVersions) {
  describe(`chunk batch empty batch guard ${supportedVersion}v`, function () {
    this.timeout(10 * 1000)
    let bot
    let server

    beforeEach(async function () {
      const PORT = await getPort()
      server = mc.createServer({
        'online-mode': false,
        version: supportedVersion,
        port: PORT
      })
      await once(server, 'listening')
      bot = mineflayer.createBot({
        username: 'player',
        version: supportedVersion,
        port: PORT
      })
      await once(bot, 'inject_allowed')
    })

    afterEach((done) => {
      if (bot._client.ended) done()
      else bot.on('end', () => done())
      server.close()
    })

    it('does not poison chunksPerTick with an empty chunk batch (#4171)', async function () {
      // Pin Date.now so the elapsed time is exactly 0 — the case from #4171 where
      // (Date.now() - chunkBatchStartTime) / 0 yields NaN, which Math.min/Math.max
      // propagates, permanently corrupting the running average.
      const realNow = Date.now
      Date.now = () => 1234567890000
      const writes = []
      const realWrite = bot._client.write.bind(bot._client)
      bot._client.write = (name, params) => {
        if (name === 'chunk_batch_received') writes.push(params)
        return realWrite(name, params)
      }
      try {
        bot._client.emit('chunk_batch_start', {})
        bot._client.emit('chunk_batch_finished', { batchSize: 0 })
        assert.strictEqual(writes.length, 1)
        assert.ok(
          Number.isFinite(writes[0].chunksPerTick),
          `chunksPerTick is ${writes[0].chunksPerTick}, expected a finite number`
        )
        // A subsequent healthy batch must still produce finite values:
        // NaN is absorbing, so a poisoned average stays NaN forever.
        bot._client.emit('chunk_batch_start', {})
        bot._client.emit('chunk_batch_finished', { batchSize: 10 })
        assert.strictEqual(writes.length, 2)
        assert.ok(
          Number.isFinite(writes[1].chunksPerTick),
          `chunksPerTick after a healthy batch is ${writes[1].chunksPerTick}, expected a finite number`
        )
      } finally {
        Date.now = realNow
        bot._client.write = realWrite
      }
    })
  })
}
