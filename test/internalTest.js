var mineflayer = require('../');
var vec3 = mineflayer.vec3;
var mc = require('minecraft-protocol');
var assert = require('assert');

describe("mineflayer_internal", function() {
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
      var message = JSON.stringify({
        translate: 'chat.type.text',
        with: [{text: 'gary'
      },'hello']
      });
      client.write('chat', { message: message, position:0 });
      client.on('chat', function(packet) {
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
      client.write('spawn_entity_living', {
        entityId: 8, // random
        type: 50, // creeper
        x: 10,
        y: 11,
        z: 12,
        yaw: 13,
        pitch: 14,
        headPitch: 14,
        velocityX: 16,
        velocityY: 17,
        velocityZ: 18,
        metadata: []
      });
      client.write('entity_effect', {
        entityId: 8,
        effectId: 10,
        amplifier: 1,
        duration: 11,
        hideParticles: false
      });
    });
  });
  it.skip("blockAt", function(done) {
    var pos = vec3(1, 65, 1);
    var goldId = 41;
    bot.on('chunkColumnLoad', function(columnPoint) {
      assert.strictEqual(columnPoint.x, 0);
      assert.strictEqual(columnPoint.z, 0);
      assert.strictEqual(bot.blockAt(pos).type, goldId);
      done();
    });
    server.on('login', function(client) {
      var buffer = new Buffer((4096 + 4096 + 2048 + 2048) * 4 + 256);
      buffer.fill(0);
      buffer.writeUInt8(goldId, 8192 + 273);
      client.write('map_chunk', {
        x: 0,
        z: 0,
        groundUp: true,
        bitMap: parseInt('00111100', 2),
        chunkData: buffer
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
        var buffer = new Buffer((4096 + 4096 + 2048 + 2048) * 4 + 256);
        buffer.fill(0);
        buffer.writeUInt8(goldId, 8192 + 273);
        client.write('login', {
          entityId: 0,
          levelType: "fogetaboutit",
          gameMode: 0,
          dimension: 0,
          difficulty: 0,
          maxPlayers: 20,
          reducedDebugInfo:true
        });
        client.write('map_chunk', {
          x: 0,
          z: 0,
          groundUp: true,
          bitMap: parseInt('00111100', 2),
          chunkData: buffer
        });
        client.write('position', {
          x: 1.5,
          y: 80,
          z: 1.5,
          pitch: 0,
          yaw: 0,
          flags: 0
        });
      });
    });
  });
  describe("entities", function() {
    it("sets players[player].entity to null upon despawn", function(done) {
      var serverClient = null;
      bot.once('entitySpawn', function(entity) {
        serverClient.write('entity_destroy', {
          entityIds: [8],
        });
      });
      bot.once("entityGone", function(entity) {
        assert.equal(bot.players[entity.username], null);
        done();
      });
      server.on('login', function(client) {
        serverClient = client;

        client.write('player_info',{ id: 56,
          state: 'play',
          action: 0,
          length: 1,
          data:
            [ { UUID: [1,2,3,4],
              name: 'bot5',
              propertiesLength: 0,
              properties: [],
              gamemode: 0,
              ping: 0,
              hasDisplayName: false } ] });

        client.write('named_entity_spawn', {
          entityId: 56,
          playerUUID: [1,2,3,4],
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

describe("mojangson",function(){
  var mojangson=require("../lib/mojangson.js");
  var data=[
    ['{}',{}],
    ['{key:value}', {key:"value"}],
    ['{key:"value"}', {key:"value"}],
    ['{key:"va,lue"}', {key:"va,lue"}],
    ['{k1:v1,k2:v2}', {k1:"v1", k2:"v2"}],
    ['{number:0s}', {number:0}],
    ['{number:123b}', {number:123}],
    ['{nest:{}}', {nest:{}}],
    ['{nest:{nest:{}}}', {nest:{nest:{}}}],
    ["{id:35,Damage:5,Count:2,tag:{display:{Name:Testing}}}", {id:35,Damage:5,Count:2,tag:{display:{Name:"Testing"}}}],
    ['{id:"minecraft:dirt",Damage:0s,Count:1b}', {id:"minecraft:dirt",Damage:0, Count:1}],
    ['{key:value,}', {key:"value"}],
    ['[0:v1,1:v2]', ["v1","v2"]],
    ['[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
    ']',
      ["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]],

    ['{id:1s,Damage:0s,Count:1b,tag:{display:{Name:"§r§6Class' +
    ': Civilian",Lore:[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
    '],},},}',
      {id:1,Damage:0, Count:1,tag:{display:{Name:"§r§6Class: Civilian",Lore:["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]}}}]
  ];
  data.forEach(function(a){
    it("should be equal",function(){
      assert.deepEqual(mojangson.parse(a[0]),a[1]);
    });
  });
});

