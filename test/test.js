var mineflayer = require('../')
  , mc = require('minecraft-protocol')
  , assert = require('assert')

describe("mineflayer", function() {
  it("chat", function(done) {
    var server = mc.createServer({ 'online-mode': false } );
    server.on('listening', function() {
      var bot = mineflayer.createBot({
        username: "player",
      });
      bot.on('chat', function(username, message) {
        assert.strictEqual(username, "gary");
        assert.strictEqual(message, "hello");
        bot.chat("hi");
      });
      bot.on('end', done);
      server.on('login', function(client) {
        client.write(0x03, { message: "<gary> hello" } );
        client.on(0x03, function(packet) {
          assert.strictEqual(packet.message, "hi");
          server.close();
        });
      });
    });
  });
});
