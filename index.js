var mc = require('minecraft-protocol')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , path = require('path')
  , requireIndex = require('requireindex')
  , plugins = requireIndex(path.join(__dirname, 'lib', 'plugins'))

module.exports = {
  vec3: require('vec3'),
  createBot: createBot,
  Block: require('./lib/block'),
  Biome: require('./lib/biome'),
  Entity: require('./lib/entity'),
  Painting: require('./lib/painting'),
  Item: require('./lib/item'),
  blocks: require('./lib/enums/blocks'),
  biomes: require('./lib/enums/biomes'),
  items: require('./lib/enums/items'),
  recipes: require('./lib/enums/recipes'),
  instruments: require('./lib/enums/instruments'),
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
