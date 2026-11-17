/* eslint-env mocha */

const EventEmitter = require('events')
const assert = require('assert')
const { Vec3 } = require('vec3')
const inject = require('../lib/plugins/digging')

describe('digging plugin default face', () => {
  const BOTTOM = 0
  const TOP = 1
  const NORTH = 2
  const SOUTH = 3
  const WEST = 4
  const EAST = 5

  // A bot standing at 0.5, 64, 0.5 with its eyes at y 65.62, and just what bot.dig touches.
  function createMockBot (raycast = () => null) {
    const bot = new EventEmitter()
    bot.sent = []
    bot._client = { write: (name, params) => bot.sent.push({ name, ...params }) }
    bot.swingArm = () => {}
    bot.entity = { position: new Vec3(0.5, 64, 0.5), eyeHeight: 1.62, onGround: true, effects: {} }
    bot.lookAt = async () => {}
    bot.world = { raycast }
    bot._nextSequence = () => 1
    bot._updateBlockState = (position, stateId) => bot.emit(`blockUpdate:${position}`, null, { type: stateId })
    inject(bot)
    bot.digTime = () => 0
    return bot
  }

  const block = (x, y, z) => ({ name: 'stone', position: new Vec3(x, y, z), shapes: [[0, 0, 0, 1, 1, 1]] })

  // The face of the start and of the finish packet of one dig.
  async function facesOf (bot, target, ...args) {
    bot.sent.length = 0
    await bot.dig(target, ...args)
    const [start, finish] = bot.sent.filter(packet => packet.name === 'block_dig')
    assert.strictEqual(start.status, 0)
    assert.strictEqual(finish.status, 2)
    assert.strictEqual(finish.face, start.face, 'start and finish carry the same face')
    return start.face
  }

  it('keeps the top face while the eyes are above the top of the block', async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(0, 63, 0)), TOP) // under the feet
    assert.strictEqual(await facesOf(bot, block(2, 63, 0)), TOP) // in the floor, two blocks away
    assert.strictEqual(await facesOf(bot, block(2, 64, 0)), TOP) // at foot level: its top is at 65, the eyes at 65.62
    assert.strictEqual(await facesOf(bot, block(0, 64, -3)), TOP)
  })

  it('sends the side the eyes are in front of for a block at head height', async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(2, 65, 0)), WEST) // the bot is on its west side
    assert.strictEqual(await facesOf(bot, block(-2, 65, 0)), EAST)
    assert.strictEqual(await facesOf(bot, block(0, 65, 2)), NORTH)
    assert.strictEqual(await facesOf(bot, block(0, 65, -2)), SOUTH)
    assert.strictEqual(await facesOf(bot, block(3, 65, 1)), WEST) // further out along x than along z
  })

  it('sends the bottom face for a block overhead and a side for one above and further away', async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(0, 66, 0)), BOTTOM)
    assert.strictEqual(await facesOf(bot, block(0, 68, 1)), BOTTOM)
    assert.strictEqual(await facesOf(bot, block(3, 66, 0)), WEST)
  })

  it('keeps the top face when the eyes are inside the block', async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(0, 65, 0)), TOP)
  })

  it("applies with forceLook 'ignore' as well", async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(2, 65, 0), 'ignore'), WEST)
    assert.strictEqual(await facesOf(bot, block(2, 63, 0), 'ignore'), TOP)
  })

  it('leaves a face given by the caller alone', async () => {
    const bot = createMockBot()
    assert.strictEqual(await facesOf(bot, block(2, 65, 0), true, new Vec3(0, 1, 0)), TOP)
    assert.strictEqual(await facesOf(bot, block(2, 65, 0), true, new Vec3(1, 0, 0)), EAST)
    assert.strictEqual(await facesOf(bot, block(0, 63, 0), true, new Vec3(0, -1, 0)), BOTTOM)
  })

  it("leaves 'raycast' alone", async () => {
    // the ray reports the south face of the block it was sent to
    const target = block(2, 65, 0)
    const bot = createMockBot((from, direction) => ({ position: target.position, face: SOUTH, intersect: new Vec3(2.5, 65.5, 1) }))
    assert.strictEqual(await facesOf(bot, target, true, 'raycast'), SOUTH)
  })
})
