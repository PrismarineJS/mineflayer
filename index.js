var mc = require('minecraft-protocol');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var requireIndex = require('requireindex');
var plugins = requireIndex(path.join(__dirname, 'lib', 'plugins'));
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
  Recipe: require('./lib/recipe'),
  windows: require('./lib/windows'),
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  blocks: mcData.blocks,
  biomes: mcData.biomes,
  items: mcData.items,
  recipes: mcData.recipes,
  instruments: mcData.instruments,
  materials: mcData.materials,
  entities: mcData.entities,
  data: mcData
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
