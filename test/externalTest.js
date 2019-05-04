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

const excludedTests = ['digEverything']

const propOverrides = {
  'level-type': 'FLAT',
  'spawn-npcs': 'false',
  'spawn-animals': 'false',
  'online-mode': 'false',
  'gamemode': '1',
  'spawn-monsters': 'false',
  'generate-structures': 'false'
}

const Wrap = require('minecraft-wrap').Wrap
const download = require('minecraft-wrap').download

const MC_SERVER_PATH = path.join(__dirname, 'server')

const { firstVersion, lastVersion } = require('./common/parallel')
mineflayer.supportedVersions.forEach((supportedVersion, i) => {
  if (!(i >= firstVersion && i <= lastVersion)) {
    return
  }

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
          verbose: true,
          port: PORT,
          host: 'localhost',
          version: supportedVersion
        })
        commonTest(bot)

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

    fs.readdirSync('./test/externalTests')
      .filter(file => fs.statSync(`./test/externalTests/${file}`).isFile())
      .forEach((test) => {
        test = path.basename(test, '.js')
        const testFunctions = require(`./externalTests/${test}`)(supportedVersion)
        if (excludedTests.indexOf(test) === -1) {
          if (typeof testFunctions === 'object') {
            for (const testFunctionName in testFunctions) {
              if (testFunctions.hasOwnProperty(testFunctionName)) {
                it(`${test} ${testFunctionName}`, ((testFunctionName => function (done) {
                  this.timeout(30000)
                  bot.test.sayEverywhere(`starting ${test} ${testFunctionName}`)
                  testFunctions[testFunctionName](bot, done)
                }))(testFunctionName))
              }
            }
          } else {
            it(test, (done) => {
              bot.test.sayEverywhere(`starting ${test}`)
              testFunctions(bot, done)
            })
          }
        }
      })
  })
})
