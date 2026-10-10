/* eslint-env mocha */

const mineflayer = require('../')
const mc = require('minecraft-protocol')
const nbt = require('prismarine-nbt')
const { once } = require('../lib/promise_utils')
const { getPort } = require('./common/util')
const fs = require('fs')
const path = require('path')

for (const supportedVersion of mineflayer.testedVersions) {
  const registry = require('prismarine-registry')(supportedVersion)
  const Chunk = require('prismarine-chunk')(supportedVersion)

  function chatText (text) {
    // TODO: move this to prismarine-chat in a new ChatMessage(text).toNotch(asNbt) method
    return registry.supportFeature('chatPacketsUseNbtComponents')
      ? nbt.comp({ text: nbt.string(text) })
      : JSON.stringify({ text })
  }

  function generateChunkPacket (chunk) {
    const lights = chunk.dumpLight()
    return {
      x: 0,
      z: 0,
      groundUp: true,
      biomes: chunk.dumpBiomes !== undefined ? chunk.dumpBiomes() : undefined,
      heightmaps: {
        type: 'compound',
        name: '',
        value: {
          MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) }
        }
      }, // send fake heightmap
      bitMap: chunk.getMask(),
      chunkData: chunk.dump(),
      blockEntities: [],
      trustEdges: false,
      skyLightMask: lights?.skyLightMask,
      blockLightMask: lights?.blockLightMask,
      emptySkyLightMask: lights?.emptySkyLightMask,
      emptyBlockLightMask: lights?.emptyBlockLightMask,
      skyLight: lights?.skyLight,
      blockLight: lights?.blockLight
    }
  }

  describe(`mineflayer_internal ${supportedVersion}v`, function () {
    this.timeout(10 * 1000)
    let bot
    let server
    let PORT
    beforeEach(async function () {
      PORT = await getPort()
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
      bot.test = {}
      // Plugins are injected on a timer after createBot, which can lose the
      // race against the mock server's playerJoin
      bot.test.pluginsLoaded = new Promise(resolve => bot.once('inject_allowed', resolve))

      bot.test.buildChunk = () => {
        if (bot.supportFeature('tallWorld')) {
          return new Chunk({ minY: -64, worldHeight: 384 })
        } else {
          return new Chunk()
        }
      }

      bot.test.chatText = chatText
      bot.test.generateChunkPacket = generateChunkPacket
      bot.test.generateLoginPacket = () => {
        let loginPacket
        if (bot.supportFeature('usesLoginPacket')) {
          loginPacket = registry.loginPacket
          loginPacket.entityId = 0 // Default login packet in minecraft-data 1.16.5 is 1, so set it to 0
        } else {
          loginPacket = {
            entityId: 0,
            levelType: 'fogetaboutit',
            gameMode: 0,
            previousGameMode: 255,
            worldNames: ['minecraft:overworld'],
            dimension: 0,
            worldName: 'minecraft:overworld',
            hashedSeed: [0, 0],
            difficulty: 0,
            maxPlayers: 20,
            reducedDebugInfo: 1,
            enableRespawnScreen: true
          }
        }
        return loginPacket
      }
    })
    afterEach((done) => {
      if (bot._client.ended) done()
      else bot.on('end', () => done())
      server.close()
    })
    // One test per file under test/internalTests/<plugin>/<test-name>.js; the file name is the test
    // name and the folder name is its describe. A file exports (bot, server) returning a promise, or
    // (bot, server, done). One that needs this.skip() must be a `function`, not an arrow.
    const internalTestsFolder = path.join(__dirname, 'internalTests')
    for (const plugin of fs.readdirSync(internalTestsFolder)) {
      describe(plugin, () => {
        for (const file of fs.readdirSync(path.join(internalTestsFolder, plugin))) {
          const run = require(`./internalTests/${plugin}/${file}`)
          const name = path.basename(file, '.js').replace(/-/g, ' ')
          if (run.length > 2) it(name, function (done) { run.call(this, bot, server, done) })
          else it(name, function () { return run.call(this, bot, server) })
        }
      })
    }
  })
}
