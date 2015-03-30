var assert = require("assert");
var Vec3 = require('vec3').Vec3;
var mineflayer = require('../');
var commonTest= require('./externalTests/plugins/testCommon');
var startServer = require("./lib/start_server");
var mc = require('minecraft-protocol');
var fs = require("fs");
var path= require("path");



describe("mineflayer_external", function() {
  var mcServer;
  var bot;
  this.timeout(10 * 60 * 1000);
  before(function(done){
    var startTheServer=true; // set this to false if you want to test without starting a server automatically

    function begin()
    {
      bot=mineflayer.createBot({
        username: "flatbot",
        viewDistance: "tiny",
        verbose: true,
        port:25565,
        host:"localhost"
      });
      commonTest(bot);

      bot.on('login', function() {
        console.log("waiting a second...");
        // this wait is to get all the window updates out of the way before we start expecting exactly what we cause.
        // there are probably other updates coming in that we want to get out of the way too, like health updates.
        setTimeout(done, 1000);
      });
    }

    if(startTheServer) {
      startServer.start({
        motd: 'test1234',
        'max-players': 120,
      }, function (mcServer_,err) {
        if (err) return done(err);
        mcServer=mcServer_;
        mc.ping({}, function (err, results) {
          if (err) return done(err);
          assert.ok(results.latency >= 0);
          assert.ok(results.latency <= 1000);
          begin();
        });
      });
    }
    else begin();

  });

  beforeEach(function(done){bot.test.resetState(done)});

  after(function(done){
    bot.quit();
    if (mcServer)
      startServer.quit(mcServer,done);
    else
      done();
  });

  fs.readdirSync("./test/externalTests")
    .filter(function (file) {
    return fs.statSync("./test/externalTests/"+file).isFile();
  })
    .forEach(function(test){
      test=path.basename(test,".js");
      it(test,function(done){require("./externalTests/"+test)(bot,done);
    });
  });
});
