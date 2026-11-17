/* eslint-env mocha */

const EventEmitter = require('events')
const assert = require('assert')
const { Vec3 } = require('vec3')
const inject = require('../lib/plugins/digging')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe('digging plugin refused digs', () => {
  const STONE = 1
  const DIRT = 10
  const AIR = 0
  const position = new Vec3(2, 64, 0)

  // A bot with just what bot.dig touches, a one-block world, and a server that is played by hand:
  // server.set(state) is a block_change, server.acknowledge(sequence) the acknowledgement.
  function createMockBot ({ acknowledgesSequence = true, digTime = 50, state = STONE } = {}) {
    const bot = new EventEmitter()
    bot.sent = []
    bot._client = new EventEmitter()
    bot._client.write = (name, params) => bot.sent.push({ name, ...params })
    bot.swingArm = () => {}
    bot.entity = { position: new Vec3(0.5, 64, 0.5), eyeHeight: 1.62, onGround: true, effects: {} }
    bot.lookAt = async () => {}
    let sequence = 0
    bot._nextSequence = () => ++sequence
    const blockOf = (stateId) => ({ name: stateId === AIR ? 'air' : stateId === STONE ? 'stone' : 'dirt', type: stateId, stateId, position, shapes: [] })
    bot.state = state
    bot.blockAt = () => blockOf(bot.state)
    const update = (stateId) => {
      const oldBlock = bot.blockAt()
      bot.state = stateId
      bot.emit(`blockUpdate:${position}`, oldBlock, bot.blockAt())
    }
    bot._updateBlockState = (point, stateId) => update(stateId)
    if (acknowledgesSequence) {
      bot.registry = { protocol: { play: { toClient: { types: { packet_acknowledge_player_digging: ['container', [{ name: 'sequenceId', type: 'varint' }]] } } } } }
    } else {
      bot.registry = { protocol: { play: { toClient: { types: { packet_acknowledge_player_digging: ['container', [{ name: 'location' }, { name: 'block' }, { name: 'status' }, { name: 'successful' }]] } } } } }
    }
    bot.events = []
    bot.on('diggingCompleted', () => bot.events.push('completed'))
    bot.on('diggingAborted', () => bot.events.push('aborted'))
    inject(bot)
    bot.digTime = () => digTime
    bot.server = {
      set: update,
      acknowledge: (sequenceId) => bot._client.emit('acknowledge_player_digging', { sequenceId })
    }
    return bot
  }

  // Starts a dig and waits until the finish packet is out. The start has sequence 1, the finish 2.
  async function digToFinish (bot, beforeFinish = () => {}) {
    const digging = bot.dig(bot.blockAt(), 'ignore')
    let outcome = 'pending'
    digging.then(() => { outcome = 'resolved' }, (error) => { outcome = error })
    beforeFinish()
    await sleep(80)
    assert.deepStrictEqual(bot.sent.filter(packet => packet.name === 'block_dig').map(packet => [packet.status, packet.sequence]), [[0, 1], [2, 2]])
    return { settle: async () => { await sleep(0); return outcome }, digging }
  }

  function assertRefused (bot, outcome, expectedState = STONE) {
    assert.ok(outcome instanceof Error, `expected a rejection, got ${outcome}`)
    assert.strictEqual(outcome.code, 'DigRefused')
    assert.strictEqual(outcome.block.position, position)
    assert.strictEqual(bot.state, expectedState, 'the block is back in the world')
    assert.deepStrictEqual(bot.events, ['aborted'])
  }

  describe('resolves', () => {
    it('when the server sets the block to air and acknowledges the finish', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => bot.server.acknowledge(1))
      assert.strictEqual(await dig.settle(), 'pending') // not before the server has answered
      assert.strictEqual(bot.state, AIR) // predicted meanwhile
      bot.server.set(AIR)
      assert.strictEqual(await dig.settle(), 'resolved')
      bot.server.acknowledge(2)
      assert.deepStrictEqual(bot.events, ['completed'])
    })

    it('when the block becomes something else than air', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(DIRT)
      bot.server.acknowledge(2)
      assert.strictEqual(await dig.settle(), 'resolved')
      assert.strictEqual(bot.state, DIRT)
    })

    it('when the block comes back right after it broke (a generator)', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(AIR)
      bot.server.acknowledge(2)
      bot.server.set(STONE)
      assert.strictEqual(await dig.settle(), 'resolved')
      assert.strictEqual(bot.state, STONE)
      assert.deepStrictEqual(bot.events, ['completed'])
    })

    it('when the server only acknowledges: silence does not prove a refusal', async () => {
      // a plugin that cancels the interact or damage event, and a proxy that acknowledges before the server answers
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => bot.server.acknowledge(1))
      bot.server.acknowledge(2)
      assert.strictEqual(await dig.settle(), 'resolved')
      bot.server.set(AIR) // the real answer of the server behind such a proxy
      assert.strictEqual(bot.state, AIR)
      assert.deepStrictEqual(bot.events, ['completed'])
    })

    it('when the server put the block back at the start but breaks it at the finish', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => { bot.server.set(STONE); bot.server.acknowledge(1) })
      bot.server.set(AIR)
      bot.server.acknowledge(2)
      assert.strictEqual(await dig.settle(), 'resolved')
    })

    it('when another player breaks the block during the dig', async () => {
      const bot = createMockBot({ digTime: 500 })
      const digging = bot.dig(bot.blockAt(), 'ignore')
      await sleep(20)
      bot.server.set(AIR)
      await digging
      assert.deepStrictEqual(bot.sent.filter(packet => packet.name === 'block_dig').map(packet => packet.status), [0])
      assert.deepStrictEqual(bot.events, ['completed'])
    })

    it('when the block is replaced during the dig and then broken', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => bot.server.set(DIRT))
      bot.server.set(AIR)
      bot.server.acknowledge(2)
      assert.strictEqual(await dig.settle(), 'resolved')
    })

    it('for an instant break, whether the answer comes before or after the finish', async () => {
      const before = createMockBot({ digTime: 0 })
      const first = before.dig(before.blockAt(), 'ignore')
      before.server.set(AIR) // the server breaks a creative dig on the start
      await first
      assert.deepStrictEqual(before.sent.filter(packet => packet.name === 'block_dig').map(packet => packet.status), [0])

      const after = createMockBot({ digTime: 0 })
      const second = after.dig(after.blockAt(), 'ignore')
      await sleep(20)
      after.server.set(AIR)
      after.server.acknowledge(2)
      await second
      assert.deepStrictEqual(after.events, ['completed'])
    })

    it('when the server acknowledges in one batch with a higher sequence', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(AIR)
      bot.server.acknowledge(7)
      assert.strictEqual(await dig.settle(), 'resolved')
    })

    it('when no acknowledgement comes at all, after 5 seconds', async function () {
      this.timeout(8000)
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(STONE) // even with the block put back: without the acknowledgement nothing is decided
      await sleep(4000)
      assert.strictEqual(await dig.settle(), 'pending')
      await sleep(1200)
      assert.strictEqual(await dig.settle(), 'resolved')
    })

    it('for a block that already is air', async () => {
      const bot = createMockBot({ state: AIR })
      const digging = bot.dig(bot.blockAt(), 'ignore')
      await sleep(80)
      await digging
    })

    it('at once before 1.19, where the acknowledgement has no sequence', async () => {
      const bot = createMockBot({ acknowledgesSequence: false })
      const digging = bot.dig(bot.blockAt(), 'ignore')
      await sleep(80)
      await digging
      assert.deepStrictEqual(bot.events, ['completed'])
      bot.server.set(STONE) // the server puts the block back afterwards: nothing changes for the caller, as before
      assert.strictEqual(bot.state, STONE)
    })
  })

  describe('rejects', () => {
    it('when the block is put back after the start and after the finish (a packet check)', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => { bot.server.set(STONE); bot.server.acknowledge(1) })
      bot.server.set(STONE)
      assert.strictEqual(await dig.settle(), 'pending')
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle())
    })

    it('when the block is put back after the start and the finish is only acknowledged (spawn protection, adventure mode)', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => { bot.server.set(STONE); bot.server.acknowledge(1) })
      assert.strictEqual(bot.state, AIR)
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle())
    })

    it('when the block is put back after the finish (a plugin cancels the break)', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => bot.server.acknowledge(1))
      bot.server.set(STONE)
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle())
    })

    it('however late the answer comes', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      await sleep(800)
      assert.strictEqual(await dig.settle(), 'pending')
      bot.server.set(STONE)
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle())
    })

    it('not on the acknowledgement of the start arriving after the finish was sent', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(STONE)
      bot.server.acknowledge(1)
      assert.strictEqual(await dig.settle(), 'pending')
      bot.server.set(AIR)
      assert.strictEqual(await dig.settle(), 'resolved')
    })

    it('when the server acknowledges in one batch with a higher sequence', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(STONE)
      bot.server.acknowledge(7)
      assertRefused(bot, await dig.settle())
    })

    it('with the state the server last gave when the block was replaced during the dig', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot, () => bot.server.set(DIRT))
      bot.server.set(DIRT)
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle(), DIRT)
    })

    it('and lets the next dig start', async () => {
      const bot = createMockBot()
      const dig = await digToFinish(bot)
      bot.server.set(STONE)
      bot.server.acknowledge(2)
      assertRefused(bot, await dig.settle())
      const again = bot.dig(bot.blockAt(), 'ignore')
      await sleep(80)
      bot.server.set(AIR)
      bot.server.acknowledge(4)
      await again
      assert.deepStrictEqual(bot.events, ['aborted', 'completed'])
    })
  })
})
