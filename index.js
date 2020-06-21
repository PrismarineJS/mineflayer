const mc = require('minecraft-protocol')
const EventEmitter = require('events').EventEmitter
const pluginLoader = require('./lib/plugin_loader')
const supportFeature = require('./lib/supportFeature')
const plugins = {
  bed: require('./lib/plugins/bed'),
  title: require('./lib/plugins/title'),
  block_actions: require('./lib/plugins/block_actions'),
  blocks: require('./lib/plugins/blocks'),
  book: require('./lib/plugins/book'),
  boss_bar: require('./lib/plugins/boss_bar'),
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
  ray_trace: require('./lib/plugins/ray_trace'),
  scoreboard: require('./lib/plugins/scoreboard'),
  settings: require('./lib/plugins/settings'),
  simple_inventory: require('./lib/plugins/simple_inventory'),
  sound: require('./lib/plugins/sound'),
  spawn_point: require('./lib/plugins/spawn_point'),
  tablist: require('./lib/plugins/tablist'),
  time: require('./lib/plugins/time'),
  villager: require('./lib/plugins/villager')
}
const supportedVersions = require('./lib/version').supportedVersions
const testedVersions = require('./lib/version').testedVersions

module.exports = {
  createBot,
  Location: require('./lib/location'),
  Painting: require('./lib/painting'),
  Chest: require('./lib/chest'),
  Furnace: require('./lib/furnace'),
  Dispenser: require('./lib/dispenser'),
  EnchantmentTable: require('./lib/enchantment_table'),
  ScoreBoard: require('./lib/scoreboard'),
  BossBar: require('./lib/bossbar'),
  supportedVersions,
  testedVersions,
  supportFeature
}

function createBot (options = {}) {
  options.username = options.username || 'Player'
  options.version = options.version || false
  options.plugins = options.plugins || {}
  options.logErrors = options.logErrors === undefined ? true : options.logErrors
  options.loadInternalPlugins = options.loadInternalPlugins !== false
  const bot = new Bot()
  if (options.logErrors) {
    bot.on('error', err => {
      if (!options.hideErrors) {
        console.log(err)
      }
    })
  }

  pluginLoader(bot, options)
  const internalPlugins = Object.keys(plugins)
    .filter(key => {
      if (typeof options.plugins[key] === 'function') return
      if (options.plugins[key] === false) return
      return options.plugins[key] || options.loadInternalPlugins
    }).map(key => plugins[key])
  const externalPlugins = Object.keys(options.plugins)
    .filter(key => {
      return typeof options.plugins[key] === 'function'
    }).map(key => options.plugins[key])
  bot.loadPlugins([...internalPlugins, ...externalPlugins])

  bot.connect(options)
  return bot
}

class Bot extends EventEmitter {
  constructor () {
    super()
    this._client = null
  }

  connect (options) {
    const self = this
    self._client = mc.createClient(options)
    self.username = self._client.username
    self._client.on('session', () => {
      self.username = self._client.username
    })
    self._client.on('connect', () => {
      self.emit('connect')
    })
    self._client.on('error', (err) => {
      self.emit('error', err)
    })
    self._client.on('end', () => {
      self.emit('end')
    })
    if (!self._client.wait_connect) next()
    else self._client.once('connect_allowed', next)
    function next () {
      const version = require('minecraft-data')(self._client.version).version
      if (supportedVersions.indexOf(version.majorVersion) === -1) {
        throw new Error(`Version ${version.minecraftVersion} is not supported.`)
      }
      self.protocolVersion = version.version
      self.majorVersion = version.majorVersion
      self.version = version.minecraftVersion
      options.version = version.minecraftVersion
      self.supportFeature = feature => supportFeature(feature, version.majorVersion)
      self.emit('inject_allowed')
    }
  }

  end () {
    this._client.end()
  }
}
