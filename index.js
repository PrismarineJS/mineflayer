var mc = require('minecraft-protocol');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var plugins = {
  bed: require('./lib/plugins/bed'),
  block_actions: require('./lib/plugins/block_actions'),
  blocks: require('./lib/plugins/blocks'),
  chat: require('./lib/plugins/chat'),
  chest: require('./lib/plugins/chest'),
  command_block: require('./lib/plugins/command_block'),
  craft: require('./lib/plugins/craft'),
  creative: require('./lib/plugins/creative'),
  digging: require('./lib/plugins/digging'),
  dispenser: require('./lib/plugins/dispenser'),
  enchantment_table: require('./lib/plugins/enchantment_table'),
  entities: require('./lib/plugins/entities'),
  experience: require('./lib/plugins/experience'),
  furnace: require('./lib/plugins/furnace'),
  game: require('./lib/plugins/game'),
  health: require('./lib/plugins/health'),
  inventory: require('./lib/plugins/inventory'),
  kick: require('./lib/plugins/kick'),
  physics: require('./lib/plugins/physics'),
  rain: require('./lib/plugins/rain'),
  scoreboard: require('./lib/plugins/scoreboard'),
  settings: require('./lib/plugins/settings'),
  simple_inventory: require('./lib/plugins/simple_inventory'),
  sound: require('./lib/plugins/sound'),
  spawn_point: require('./lib/plugins/spawn_point'),
  time: require('./lib/plugins/time')
};

var mcData = require('./lib/minecraft-data');
var version = require('./lib/version');

module.exports = {
  vec3: require('vec3'),
  createBot: createBot,
  Block: require("prismarine-block")(version),
  Location: require('./lib/location'),
  Biome: require("prismarine-biome")(version),
  Entity: require('prismarine-entity'),
  Painting: require('./lib/painting'),
  Item: require("prismarine-item")(version),
  Recipe: require('prismarine-recipe')(version).Recipe,
  windows: require('prismarine-windows')(version).windows,
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  ScoreBoard: require('./lib/scoreboard'),
  blocks: mcData.blocks,
  biomes: mcData.biomes,
  items: mcData.items,
  recipes: mcData.recipes,
  instruments: mcData.instruments,
  materials: mcData.materials,
  entities: mcData.entities,
  data: mcData,
  version:version
};

function createBot(options) {
  options = options || {};
  options.username = options.username || 'Player';
  var bot = new Bot();
  bot.connect(options);
  return bot;
}

function Bot() {
  EventEmitter.call(this);
  this._client = null;
}
util.inherits(Bot, EventEmitter);

Bot.prototype.connect = function(options) {
  var self = this;
  self._client = mc.createClient(options);
  self.username = self._client.username;
  self._client.on('session', function() {
    self.username = self._client.username;
  });
  self._client.on('connect', function() {
    self.emit('connect');
  });
  self._client.on('error', function(err) {
    self.emit('error', err);
  });
  self._client.on('end', function() {
    self.emit('end');
  });
  for(var pluginName in plugins) {
    plugins[pluginName](self, options);
  }
};

Bot.prototype.end = function() {
  this._client.end();
};
