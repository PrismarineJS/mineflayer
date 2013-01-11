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
    bot.once('chat', function(username, message) {
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
  describe("physics", function() {
    var pos = vec3(1, 65, 1);
    var goldId = 41;
    it("gravity + land on solid block + jump", function(done) {
      var y = 80;
      var terminal = 10;
      var hitTerminal = false;
      bot.on('move', function() {
        assert.ok(bot.entity.position.y <= y);
        assert.ok(bot.entity.position.y >= pos.y);
        y = bot.entity.position.y;
        if (bot.entity.velocity.y > -terminal) hitTerminal = true;
        if (bot.entity.velocity.y === 0) {
          assert.ok(hitTerminal);
          assert.ok(bot.entity.onGround);
          assert.ok(bot.entity.position.y, pos.y);
          done();
        } else {
          assert.strictEqual(bot.entity.onGround, false);
        }
      });
      server.on('login', function(client) {
        var buffer = new Buffer((4096 + 2048 + 2048 + 2048) * 4 + 256);
        buffer.fill(0);
        buffer.writeUInt8(goldId, 8192 + 273);
        zlib.deflate(buffer, function(err, compressed) {
          assert.ifError(err);
          client.write(0x01, {
            entityId: 0,
            levelType: "fogetaboutit",
            gameMode: 0,
            dimension: 0,
            difficulty: 0,
            maxPlayers: 20,
          });
          client.write(0x33, {
            x: 0,
            z: 0,
            groundUp: true,
            bitMap: parseInt('00111100', 2),
            addBitMap: 0,
            compressedChunkData: compressed,
          });
          client.write(0x0d, {
            x: 1.5,
            y: 80,
            z: 1.5,
            pitch: 0,
            yaw: 0,
            onGround: true,
            stance: 1,
          });
        });
      });
    });
  });
});
