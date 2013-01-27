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
      client.write(0x03, { message: "<gary> §0hello" } );
      client.on(0x03, function(packet) {
        assert.strictEqual(packet.message, "hi");
        done();
      });
    });
  });
  it("entity effects", function(done) {
    bot.once('entityEffect', function(entity, effect) {
      assert.strictEqual(entity.mobType, "creeper");
      assert.strictEqual(effect.id, 10);
      assert.strictEqual(effect.amplifier, 1);
      assert.strictEqual(effect.duration, 11);
      done();
    });
    server.on('login', function(client) {
      client.write(0x18, {
        entityId: 8, // random
        type: 50, // creeper
        x: 10,
        y: 11,
        z: 12,
        yaw: 13,
        pitch: 14,
        headYaw: 15,
        velocityX: 16,
        velocityY: 17,
        velocityZ: 18,
        metadata: [],
      });
      client.write(0x29, {
        entityId: 8,
        effectId: 10,
        amplifier: 1,
        duration: 11,
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
  describe("entities", function() {
    it("sets players[player].entity to null upon despawn", function(done) {
      var serverClient = null;
      bot.once('entitySpawn', function(entity) {
        assert.ok(bot.players.playerName.entity);
        serverClient.write(0x1d, {
          entityIds: [8],
        });
      });
      bot.once("entityGone", function(entity) {
        assert.equal(bot.players.playerName.entity, null);
        done();
      });
      server.on('login', function(client) {
        serverClient = client;
        client.write(0x14, {
          entityId: 8,
          name: "playerName",
          x: 1,
          y: 2,
          z: 3,
          yaw: 0,
          pitch: 0,
          currentItem: -1,
          metadata: [],
        });
      });
    });
  });
});
