var mc = require('minecraft-protocol');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var pluginLoader = require('./lib/plugin_loader');
var plugins = {
  bed: require('./lib/plugins/bed'),
  block_actions: require('./lib/plugins/block_actions'),
  blocks: require('./lib/plugins/blocks'),
  book: require('./lib/plugins/book'),
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
  time: require('./lib/plugins/time'),
  villager: require('./lib/plugins/villager')
};

var supportedVersions = require("./lib/version").supportedVersions;

module.exports = {
  createBot: createBot,
  Location: require('./lib/location'),
  Painting: require('./lib/painting'),
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  ScoreBoard: require('./lib/scoreboard'),
  supportedVersions: supportedVersions
};

function createBot(options) {
  options = options || {};
  options.username = options.username || 'Player';
  options.version = options.version || false;
  var bot = new Bot();
  pluginLoader(bot, options);
  bot.loadPlugins(Object.keys(plugins).map(function(key){ return plugins[key] }));
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
  if (!self._client.wait_connect) next();
  else self._client.once('connect_allowed', next);
  function next() {
    var version = require('minecraft-data')(self._client.version).version
    if (supportedVersions.indexOf(version.majorVersion) === -1) {
      throw new Error('Version ' + version.minecraftVersion + ' is not supported.');
    }
    self.majorVersion = version.majorVersion;
    self.version = version.minecraftVersion;
    options.version = version.minecraftVersion;
    self.emit('inject_allowed');
  }
};

Bot.prototype.end = function() {
  this._client.end();
};
