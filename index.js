var mc = require('minecraft-protocol')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , path = require('path')
  , requireIndex = require('requireindex')
  , plugins = requireIndex(path.join(__dirname, 'lib', 'plugins'))
  , mcData = require('minecraft-data')

module.exports = {
  vec3: require('vec3'),
  createBot: createBot,
  Block: require('./lib/block'),
  Location: require('./lib/location'),
  Biome: require('./lib/biome'),
  Entity: require('./lib/entity'),
  Painting: require('./lib/painting'),
  Item: require('./lib/item'),
  Recipe: require('./lib/recipe'),
  windows: require('./lib/windows'),
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  ItemIndex: require("./lib/item_index"),
  blocks: mcData.blocks,
  biomes: mcData.biomes,
  items: mcData.items,
  recipes: mcData.recipes,
  instruments: mcData.instruments,
  materials: mcData.materials
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
  this.client = null;
}
util.inherits(Bot, EventEmitter);

Bot.prototype.connect = function(options) {
  var self = this;
  self.client = mc.createClient(options);
  self.username = self.client.username;
  self.client.on('session', function() {
    self.username = self.client.username;
  });
  self.client.on('connect', function() {
    self.emit('connect');
  });
  self.client.on('error', function(err) {
    self.emit('error', err);
  });
  self.client.on('end', function() {
    self.emit('end');
  });
  for (var pluginName in plugins) {
    plugins[pluginName](self, options);
  }
};

Bot.prototype.end = function() {
  this.client.end();
};
