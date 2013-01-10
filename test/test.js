var mineflayer = require('../')
  , vec3 = mineflayer.vec3
  , mc = require('minecraft-protocol')
  , assert = require('assert')
  , zlib = require('zlib')

describe("mineflayer", function() {
  var bot, server;
  beforeEach(function(done) {
    server = mc.createServer({ 'online-mode': false } );
    server.on('listening', function() {
      bot = mineflayer.createBot({
        username: "player",
      });
      done();
    });
  });
  afterEach(function(done) {
    bot.on('end', done);
    server.close();
  });
  it("chat", function(done) {
    bot.on('chat', function(username, message) {
      assert.strictEqual(username, "gary");
      assert.strictEqual(message, "hello");
      bot.chat("hi");
    });
    server.on('login', function(client) {
      client.write(0x03, { message: "<gary> hello" } );
      client.on(0x03, function(packet) {
        assert.strictEqual(packet.message, "hi");
        done();
      });
    });
  });
  it("blockAt", function(done) {
    var pos = vec3(1, 65, 1);
    var goldId = 41;
    bot.on('chunkColumnLoad', function(columnPoint) {
      assert.strictEqual(columnPoint.x, 0);
      assert.strictEqual(columnPoint.z, 0);
      assert.strictEqual(bot.blockAt(pos).type, goldId);
      done();
    });
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
