/* eslint-env mocha */

const assert = require('assert')
const mineflayer = require('../')
const commonTest = require('./externalTests/plugins/testCommon')
const mc = require('minecraft-protocol')
const fs = require('fs')
const path = require('path')

// set this to false if you want to test without starting a server automatically
const START_THE_SERVER = true
// if you want to have time to look what's happening increase this (milliseconds)
const WAIT_TIME_BEFORE_STARTING = 5000
const TEST_TIMEOUT_MS = 60000

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
  const PORT = Math.round(30000 + Math.random() * 20000)
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
        bot.once('login', () => {
          wrap.writeServer('op flatbot\n')
          console.log('waiting a second...')
          // this wait is to get all the window updates out of the way before we start expecting exactly what we cause.
          // there are probably other updates coming in that we want to get out of the way too, like health updates.
          setTimeout(done, WAIT_TIME_BEFORE_STARTING)
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

    beforeEach((done) => {
      console.log('reset state')
      bot.test.resetState(done)
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
