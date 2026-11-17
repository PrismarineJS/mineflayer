/* eslint-env mocha */

const EventEmitter = require('events')
const assert = require('assert')
const { performance } = require('perf_hooks')
const { Vec3 } = require('vec3')
const inject = require('../lib/plugins/digging')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe('digging plugin pacing', () => {
  // A bot with just what bot.dig touches. Every packet is recorded with the tick it was written in.
  function createMockBot (options, digTime) {
    const bot = new EventEmitter()
    bot.sent = []
    bot.tick = 0
    bot.inTick = false
    bot._client = {
      write: (name, params) => bot.sent.push({ name, status: params.status, tick: bot.tick, inTick: bot.inTick, at: performance.now() })
    }
    bot.swingArm = () => bot._client.write('arm_animation', {})
    bot.entity = { position: new Vec3(0.5, 64, 0.5), eyeHeight: 1.62, onGround: true, effects: {} }
    bot.lookAt = async () => {}
    let sequence = 0
    bot._nextSequence = () => ++sequence
    bot._updateBlockState = (position, stateId) => bot.emit(`blockUpdate:${position}`, null, { type: stateId })
    inject(bot, options)
    bot.digTime = () => digTime
    return bot
  }

  const block = (x) => ({ name: 'stone', position: new Vec3(x, 64, 0), shapes: [[0, 0, 0, 1, 1, 1]] })
  // What was sent, tick by tick: 'start', 'finish', 'abort' or 'swing'.
  const names = { 0: 'start', 1: 'abort', 2: 'finish' }
  const label = (packet) => packet.name === 'block_dig' ? names[packet.status] : 'swing'
  const perTick = (bot, from, to) => {
    const rows = []
    for (let tick = from; tick <= to; tick++) rows.push(bot.sent.filter(packet => packet.tick === tick && packet.inTick).map(label))
    return rows
  }
  async function runTicks (bot, count) {
    for (let i = 0; i < count; i++) {
      bot.tick++
      bot.inTick = true
      bot.emit('physicsTick')
      bot.inTick = false
      await sleep(50)
    }
  }

  it("is 'immediate' unless the option says otherwise", () => {
    assert.strictEqual(createMockBot(undefined, 100).digPacing, 'immediate')
    assert.strictEqual(createMockBot({}, 100).digPacing, 'immediate')
    assert.strictEqual(createMockBot({ digPacing: 'vanilla' }, 100).digPacing, 'vanilla')
  })

  describe("'immediate' (the default)", () => {
    it('sends the start and a swing at once and the finish when the dig time is over, outside any tick', async () => {
      const bot = createMockBot(undefined, 100)
      const digging = bot.dig(block(2), 'ignore')
      assert.deepStrictEqual(bot.sent.map(label), ['start', 'swing'])
      await digging
      assert.deepStrictEqual(bot.sent.map(label), ['start', 'swing', 'finish'])
      const elapsed = bot.sent[2].at - bot.sent[0].at
      assert.ok(elapsed >= 95 && elapsed < 160, `finish after ${elapsed} ms`)
      assert.ok(bot.sent.every(packet => !packet.inTick))
    })

    it('swings every 350 ms and starts the next dig without a pause', async () => {
      const bot = createMockBot({}, 800)
      await bot.dig(block(2), 'ignore')
      assert.deepStrictEqual(bot.sent.map(label), ['start', 'swing', 'swing', 'swing', 'finish'])
      const finishedAt = bot.sent[4].at
      const next = bot.dig(block(3), 'ignore')
      assert.strictEqual(label(bot.sent[5]), 'start')
      assert.ok(bot.sent[5].at - finishedAt < 40)
      bot.stopDigging()
      await assert.rejects(next, /Digging aborted/)
      assert.strictEqual(label(bot.sent[bot.sent.length - 1]), 'abort')
    })
  })

  describe("'vanilla'", () => {
    it('sends nothing until a tick, the start one tick after the look, one swing per tick and the finish inside a tick', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 100)
      const digging = bot.dig(block(2), true)
      await sleep(20)
      assert.deepStrictEqual(bot.sent, [])
      await runTicks(bot, 5)
      await digging
      assert.deepStrictEqual(perTick(bot, 1, 5), [
        [], // the look leaves with this tick's movement packet
        ['start', 'swing'],
        ['swing'],
        ['finish', 'swing'], // 100 ms: two ticks after the start
        []
      ])
      assert.ok(bot.sent.every(packet => packet.inTick), 'every packet belongs to a tick')
    })

    it("starts in the first tick when the bot does not turn (forceLook 'ignore')", async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 100)
      const digging = bot.dig(block(2), 'ignore')
      await runTicks(bot, 3)
      await digging
      assert.deepStrictEqual(perTick(bot, 1, 3), [['start', 'swing'], ['swing'], ['finish', 'swing']])
    })

    it('starts the next block no sooner than 6 ticks (300 ms) after a finish', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 100)
      const first = bot.dig(block(2), 'ignore')
      await runTicks(bot, 3)
      await first
      const second = bot.dig(block(3), 'ignore')
      await runTicks(bot, 12)
      await second
      const [, finish, start] = bot.sent.filter(packet => packet.name === 'block_dig')
      assert.strictEqual(label(finish), 'finish')
      assert.strictEqual(label(start), 'start')
      assert.ok(start.at - finish.at >= 295, `start ${start.at - finish.at} ms after the finish`)
    })

    it('does not wait after an instant break', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 0)
      const first = bot.dig(block(2), 'ignore')
      await runTicks(bot, 1)
      await first
      const second = bot.dig(block(3), 'ignore')
      await runTicks(bot, 1)
      await second
      assert.deepStrictEqual(perTick(bot, 1, 2), [['start', 'finish', 'swing'], ['start', 'finish', 'swing']])
    })

    it('sends no abort for a dig that has not started', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 100)
      const digging = bot.dig(block(2), true)
      await runTicks(bot, 1)
      bot.stopDigging()
      await assert.rejects(digging, /Digging aborted/)
      await runTicks(bot, 2)
      assert.deepStrictEqual(bot.sent, [])
    })

    it('aborts a started dig and stops swinging', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 1000)
      const digging = bot.dig(block(2), 'ignore')
      await runTicks(bot, 2)
      bot.stopDigging()
      await assert.rejects(digging, /Digging aborted/)
      await runTicks(bot, 2)
      assert.deepStrictEqual(bot.sent.map(label), ['start', 'swing', 'swing', 'abort'])
    })

    it('still digs when no physics tick runs', async () => {
      const bot = createMockBot({ digPacing: 'vanilla' }, 100)
      await bot.dig(block(2), 'ignore')
      assert.deepStrictEqual(bot.sent.filter(packet => packet.name === 'block_dig').map(label), ['start', 'finish'])
    })

    it('can be switched on a running bot', async () => {
      const bot = createMockBot({}, 100)
      bot.digPacing = 'vanilla'
      const digging = bot.dig(block(2), 'ignore')
      assert.deepStrictEqual(bot.sent, [])
      await runTicks(bot, 3)
      await digging
      bot.digPacing = 'immediate'
      await sleep(320)
      const last = bot.dig(block(3), 'ignore')
      assert.strictEqual(label(bot.sent[bot.sent.length - 2]), 'start')
      bot.stopDigging()
      await assert.rejects(last, /Digging aborted/)
    })
  })
})
