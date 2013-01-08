var mineflayer = require('../')
  , vec3 = mineflayer.vec3
  , mc = require('minecraft-protocol')
  , assert = require('assert')
  , zlib = require('zlib')

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
  it("blockAt", function(done) {
    var server = mc.createServer({ 'online-mode': false } );
    var pos = vec3(1, 65, 1);
    var goldId = 41;
    server.on('listening', function() {
      var bot = mineflayer.createBot({
        username: "player",
      });
      bot.on('chunk', function(columnPoint) {
        assert.strictEqual(columnPoint.x, 0);
        assert.strictEqual(columnPoint.z, 0);
        assert.strictEqual(bot.blockAt(pos).type, goldId);
        server.close();
      });
      bot.on('end', done);
      server.on('login', function(client) {
        var buffer = new Buffer((4096 + 2048 + 2048 + 2048) * 4 + 256);
        buffer.fill(0);
        buffer.writeUInt8(goldId, 8192 + 273);
        zlib.deflate(buffer, function(err, compressed) {
          assert.ifError(err);
          client.write(0x33, {
            x: 0,
            z: 0,
            groundUp: true,
            bitMap: parseInt('00111100', 2),
            addBitMap: 0,
            compressedChunkData: compressed,
          });
        });
      });
    });
  });
});
