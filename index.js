const mc = require('minecraft-protocol');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const path = require('path');
const plugins = {
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

const defaultVersion=require("./lib/version").defaultVersion;

export default {
  createBot,
  Location: require('./lib/location'),
  Painting: require('./lib/painting'),
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  ScoreBoard: require('./lib/scoreboard'),
  supportedVersions:require("./lib/version").supportedVersions,
  defaultVersion:require("./lib/version").defaultVersion
};

function createBot(options={}) {
  options.username = options.username || 'Player';
  options.version = options.version || defaultVersion;
  const bot = new Bot();
  bot.majorVersion=require('minecraft-data')(options.version).version.majorVersion;
  bot.version=options.version;
  bot.connect(options);
  return bot;
}

class Bot {
  constructor() {
    EventEmitter.call(this);
    this._client = null;
  }

  connect(options) {
    const self = this;
    self._client = mc.createClient(options);
    self.username = self._client.username;
    self._client.on('session', () => {
      self.username = self._client.username;
    });
    self._client.on('connect', () => {
      self.emit('connect');
    });
    self._client.on('error', err => {
      self.emit('error', err);
    });
    self._client.on('end', () => {
      self.emit('end');
    });
    for(const pluginName in plugins) {
      plugins[pluginName](self, options);
    }
  }

  end() {
    this._client.end();
  }
}

util.inherits(Bot, EventEmitter);
