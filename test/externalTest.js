/* eslint-env mocha */

const assert = require('assert')
const mineflayer = require('../')
const commonTest = require('./externalTests/plugins/testCommon')
const mc = require('minecraft-protocol')
const fs = require('fs')
const path = require('path')

const { getPort } = require('./common/util')

// set this to false if you want to test without starting a server automatically
const START_THE_SERVER = true
// if you want to have time to look what's happening increase this (milliseconds)
const TEST_TIMEOUT_MS = 90000

const excludedTests = ['digEverything', 'book', 'anvil', 'placeEntity']

const propOverrides = {
  'level-type': 'FLAT',
  'spawn-npcs': 'true',
  'spawn-animals': 'false',
  'online-mode': 'false',
  gamemode: '1',
  'spawn-monsters': 'false',
  'generate-structures': 'false',
  'enable-command-block': 'true',
  'use-native-transport': 'false' // java 16 throws errors without this, https://www.spigotmc.org/threads/unable-to-access-address-of-buffer.311602
}

const Wrap = require('minecraft-wrap').Wrap
const download = require('minecraft-wrap').download

const MC_SERVER_PATH = path.join(__dirname, 'server')

for (const supportedVersion of mineflayer.testedVersions) {
  let PORT = 25565
  const mcData = require('minecraft-data')(supportedVersion)
  const version = mcData.version
  const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || `${process.cwd()}/server_jars`
  const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${version.minecraftVersion}.jar`
  const wrap = new Wrap(MC_SERVER_JAR, `${MC_SERVER_PATH}_${supportedVersion}`)
  wrap.on('line', (line) => {
    console.log(line)
  })

  describe(`mineflayer_external ${version.minecraftVersion}`, function () {
    let bot
    this.timeout(10 * 60 * 1000)
    before(async function () {
      PORT = await getPort()
      console.log(`Port chosen: ${PORT}`)
    })
    before((done) => {
      function begin () {
        bot = mineflayer.createBot({
          username: 'flatbot',
          viewDistance: 'tiny',
          port: PORT,
          host: 'localhost',
          version: supportedVersion
        })
        commonTest(bot)
        bot.test.port = PORT

        console.log('starting bot')
        bot.once('spawn', () => {
          wrap.writeServer('op flatbot\n')
          bot.once('messagestr', msg => {
            if (msg === '[Server: Made flatbot a server operator]' || msg === '[Server: Opped flatbot]') {
              done()
            }
          })
        })
      }

      if (START_THE_SERVER) {
        console.log('downloading and starting server')
        download(version.minecraftVersion, MC_SERVER_JAR, (err) => {
          if (err) {
            console.log(err)
            done(err)
            return
          }
          propOverrides['server-port'] = PORT
          wrap.startServer(propOverrides, (err) => {
            if (err) return done(err)
            console.log(`pinging ${version.minecraftVersion} port : ${PORT}`)
            mc.ping({
              port: PORT,
              version: supportedVersion
            }, (err, results) => {
              if (err) return done(err)
              console.log('pong')
              assert.ok(results.latency >= 0)
              assert.ok(results.latency <= 1000)
              begin()
            })
          })
        })
      } else begin()
    })

    beforeEach(async () => {
      console.log('reset state')
      await bot.test.resetState()
    })

    after((done) => {
      bot.quit()
      wrap.stopServer((err) => {
        if (err) {
          console.log(err)
        }
        wrap.deleteServerData((err) => {
          if (err) {
            console.log(err)
          }
          done(err)
        })
      })
    })

    const externalTestsFolder = path.resolve(__dirname, './externalTests')
    fs.readdirSync(externalTestsFolder)
      .filter(file => fs.statSync(path.join(externalTestsFolder, file)).isFile())
      .forEach((test) => {
        test = path.basename(test, '.js')
        const testFunctions = require(`./externalTests/${test}`)(supportedVersion)
        const runTest = (testName, testFunction) => {
          return function (done) {
            this.timeout(TEST_TIMEOUT_MS)
            bot.test.sayEverywhere(`starting ${testName}`)
            testFunction(bot, done).then(res => done()).catch(e => done(e))
          }
        }
        if (excludedTests.indexOf(test) === -1) {
          if (typeof testFunctions === 'object') {
            for (const testFunctionName in testFunctions) {
              if (testFunctions[testFunctionName] !== undefined) {
                it(`${test} ${testFunctionName}`, (testFunctionName => runTest(`${test} ${testFunctionName}`, testFunctions[testFunctionName]))(testFunctionName))
              }
            }
          } else {
            it(test, runTest(test, testFunctions))
          }
        }
      })
  })
}
