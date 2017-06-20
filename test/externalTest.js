var assert = require("assert");
var mineflayer = require('../');
var commonTest = require('./externalTests/plugins/testCommon');
var mc = require('minecraft-protocol');
var fs = require("fs");
var path = require("path");

// set this to false if you want to test without starting a server automatically
var START_THE_SERVER = true;
// if you want to have time to look what's happening increase this (milliseconds)
var WAIT_TIME_BEFORE_STARTING = 1000;

var excludedTests = ["digEverything"];

var propOverrides = {
  'level-type': 'FLAT',
  'spawn-npcs': 'false',
  'spawn-animals': 'false',
  'online-mode': 'false',
  'gamemode': '1',
  'spawn-monsters': 'false',
  'generate-structures': 'false'
};


var Wrap = require('minecraft-wrap').Wrap;
var download = require('minecraft-wrap').download;

var MC_SERVER_PATH = path.join(__dirname, 'server');


const {firstVersion,lastVersion}=require("./common/parallel");
mineflayer.supportedVersions.forEach(function(supportedVersion,i) {
  if(!(i>=firstVersion && i<=lastVersion))
    return;

  var PORT = Math.round(30000 + Math.random() * 20000);
  var mcData = require("minecraft-data")(supportedVersion);
  var version = mcData.version;
  var MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR;
  var MC_SERVER_JAR = MC_SERVER_JAR_DIR + "/minecraft_server." + version.minecraftVersion + ".jar";
  var wrap = new Wrap(MC_SERVER_JAR, MC_SERVER_PATH + "_" + supportedVersion);
  wrap.on('line', function(line) {
    console.log(line);
  });

  describe("mineflayer_external " + version.minecraftVersion, function () {
    var bot;
    this.timeout(10 * 60 * 1000);
    before(function (done) {

      function begin() {
        bot = mineflayer.createBot({
          username: "flatbot",
          viewDistance: "tiny",
          verbose: true,
          port: PORT,
          host: "localhost",
          version:supportedVersion
        });
        commonTest(bot);

        console.log("starting bot");
        bot.once('login', function () {
          console.log("waiting a second...");
          // this wait is to get all the window updates out of the way before we start expecting exactly what we cause.
          // there are probably other updates coming in that we want to get out of the way too, like health updates.
          setTimeout(done, WAIT_TIME_BEFORE_STARTING);
        });
      }

      if (START_THE_SERVER) {
        console.log("downloading and starting server");
        download(version.minecraftVersion, MC_SERVER_JAR, (err) => {
          if(err) {
            console.log(err);
            done(err);
            return;
          }
          propOverrides['server-port']=PORT;
          wrap.startServer(propOverrides, function (err) {
            if (err) return done(err);
            console.log("pinging "+version.minecraftVersion+" port : "+PORT);
            mc.ping({port:PORT,version:supportedVersion}, function (err, results) {
              if (err) return done(err);
              console.log("pong");
              assert.ok(results.latency >= 0);
              assert.ok(results.latency <= 1000);
              wrap.writeServer("op flatbot\n");
              begin();
            });
          });
        });
      }
      else begin();

    });

    beforeEach(function (done) {
      bot.test.resetState(done)
    });

    after(function (done) {
      bot.quit();
      wrap.stopServer(function (err) {
        if (err)
          console.log(err);
        wrap.deleteServerData(function (err) {
          if (err)
            console.log(err);
          done(err);
        });
      });
    });

    fs.readdirSync("./test/externalTests")
      .filter(function (file) {
        return fs.statSync("./test/externalTests/" + file).isFile();
      })
      .forEach(function (test) {
        test = path.basename(test, ".js");
        var testFunctions = require("./externalTests/" + test)(supportedVersion);
        if (excludedTests.indexOf(test) === -1) {
          if (typeof testFunctions === 'object') {
            for (var testFunctionName in testFunctions) {
              if (testFunctions.hasOwnProperty(testFunctionName)) {
                it(test + " " + testFunctionName, (function (testFunctionName) {
                  return function (done) {
                    this.timeout(30000);
                    bot.test.sayEverywhere("starting " + test + " " + testFunctionName);
                    testFunctions[testFunctionName](bot, done);
                  };
                })(testFunctionName));
              }
            }
          }
          else
            it(test, function (done) {
              bot.test.sayEverywhere("starting " + test);
              testFunctions(bot, done);
            });
        }
      });
  });
});