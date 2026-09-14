/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events').EventEmitter
const Vec3 = require('vec3').Vec3
const registryLoader = require('prismarine-registry')

const VERSION = '1.21.4'
const registry = registryLoader(VERSION)
const World = require('prismarine-world')(registry)
const Chunk = require('prismarine-chunk')(registry)

// generic_place only wants a registry, a world, an entity to aim from and somewhere to write, so
// the packet it produces can be checked without a server.
function fakeBot () {
  const bot = new EventEmitter()
  bot.registry = registry
  bot.version = VERSION
  bot.supportFeature = registry.supportFeature.bind(registry)
  bot.world = new World(null).sync
  for (const cz of [-1, 0]) bot.world.setColumn(0, cz, new Chunk({ minY: -64, worldHeight: 384 }))
  bot.entity = { position: new Vec3(0.5, 64, 0.5), yaw: 0, pitch: 0, eyeHeight: 1.62 }
  bot.heldItem = { type: registry.itemsByName.stone.id, name: 'stone', count: 1, metadata: 0 }
  bot.written = []
  bot._client = { write: (name, params) => bot.written.push({ name, params }) }
  bot.swingArm = () => {}
  bot.look = async (yaw, pitch) => { bot.entity.yaw = yaw; bot.entity.pitch = pitch }
  bot.lookAt = async (point) => {
    const delta = point.minus(bot.entity.position.offset(0, bot.entity.eyeHeight, 0))
    const yaw = Math.atan2(-delta.x, -delta.z)
    const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z)
    await bot.look(yaw, Math.atan2(delta.y, groundDistance))
  }
  require('../lib/plugins/generic_place')(bot)
  return bot
}

function setBlock (bot, pos, name) {
  bot.world.setBlockStateId(pos, registry.blocksByName[name].defaultState)
}

// Where the bot's own crosshair lands, the way the client's pick does it.
function crosshairHit (bot) {
  const eye = bot.entity.position.offset(0, bot.entity.eyeHeight, 0)
  const dir = new Vec3(
    -Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch),
    Math.sin(bot.entity.pitch),
    -Math.cos(bot.entity.yaw) * Math.cos(bot.entity.pitch)
  )
  return bot.world.raycast(eye, dir, 8)
}

function assertPacketMatchesCrosshair (bot) {
  const packet = bot.written.find(p => p.name === 'block_place')
  assert.ok(packet, 'a block_place went out')
  const hit = crosshairHit(bot)
  assert.ok(hit, 'the crosshair hits something')
  assert.deepStrictEqual(
    [hit.position.x, hit.position.y, hit.position.z],
    [packet.params.location.x, packet.params.location.y, packet.params.location.z],
    'the packet names the block the crosshair is on'
  )
  assert.strictEqual(hit.face, packet.params.direction, 'the packet names the face the crosshair hits')
  const cursor = new Vec3(packet.params.cursorX, packet.params.cursorY, packet.params.cursorZ)
  assert.ok(hit.position.plus(cursor).distanceTo(hit.intersect) < 1e-6, `cursor ${cursor} is the ray's own hit point`)
  return packet
}

describe('_genericPlace aims the way the client does', () => {
  it('a face in view is sent as the raycast found it', async () => {
    const bot = fakeBot()
    // a block one down and two along: its near side face is in plain view
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    setBlock(bot, new Vec3(0, 63, -2), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, -2)), new Vec3(0, 0, 1), { forceLook: true, swingArm: 'right' })
    assertPacketMatchesCrosshair(bot)
  })

  it('a top face underfoot is sent as the raycast found it', async () => {
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 1, 0), { forceLook: true })
    const packet = assertPacketMatchesCrosshair(bot)
    assert.strictEqual(packet.params.direction, 1)
  })

  it('the bridging case: the side face of the block underfoot is not one the crosshair can reach', async () => {
    // Standing on a block, every ray from the eye leaves it through the top face first, so the
    // side face cannot be the hit. This is the placement the old code always got wrong.
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 0, 1), { forceLook: true })
    const packet = bot.written.find(p => p.name === 'block_place')
    const hit = crosshairHit(bot)
    assert.strictEqual(packet.params.direction, 3, 'without strictFace the requested face is still sent')
    assert.strictEqual(hit.face, 1, 'and the crosshair is on the top face, as it must be')
  })

  it('...but it is, once the bot sneaks its hitbox out over the lip', async () => {
    // Sneaking lets the box hang ~0.3 past the edge, which puts the eye outside the block's own
    // column; from there the side face is the first thing the ray meets. This is how a player
    // bridges, and the raycast finds it.
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 1.25)
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 0, 1), { forceLook: true, strictFace: true })
    const packet = assertPacketMatchesCrosshair(bot)
    assert.strictEqual(packet.params.direction, 3, 'the south face, as asked for')
  })

  it('strictFace refuses that placement instead of sending it', async () => {
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await assert.rejects(
      () => bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 0, 1), { forceLook: true, strictFace: true }),
      /not visible/
    )
    assert.strictEqual(bot.written.length, 0)
  })

  it('bot.placeFaceStrict turns it on for every placement', async () => {
    const bot = fakeBot()
    bot.placeFaceStrict = true
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await assert.rejects(
      () => bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 0, 1), { forceLook: true }),
      /not visible/
    )
  })

  it('a reference block with no collision box keeps the old aim', async () => {
    // examples/digger places against the air it just dug; there is no face to raycast onto.
    const bot = fakeBot()
    bot.placeFaceStrict = true
    setBlock(bot, new Vec3(0, 62, 0), 'stone')
    bot.entity.position = new Vec3(0.5, 64, 0.5)
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 0)), new Vec3(0, 1, 0), { forceLook: true })
    const packet = bot.written.find(p => p.name === 'block_place')
    assert.deepStrictEqual([packet.params.location.x, packet.params.location.y, packet.params.location.z], [0, 63, 0])
    assert.strictEqual(packet.params.direction, 1)
  })

  it('keeps the requested face when the caller supplies its own cursor', async () => {
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 0), 'stone')
    setBlock(bot, new Vec3(0, 63, 1), 'stone')
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 1)), new Vec3(0, 0, 1), { delta: new Vec3(0.5, 0.5, 1), forceLook: true })
    assert.strictEqual(bot.written.find(p => p.name === 'block_place').params.direction, 3)
  })

  it('keeps the requested face when it is told not to look', async () => {
    const bot = fakeBot()
    setBlock(bot, new Vec3(0, 63, 1), 'stone')
    await bot._genericPlace(bot.world.getBlock(new Vec3(0, 63, 1)), new Vec3(0, 0, 1), { forceLook: 'ignore' })
    assert.strictEqual(bot.written.find(p => p.name === 'block_place').params.direction, 3)
  })
})
