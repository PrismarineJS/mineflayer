const mc = require('minecraft-protocol')
const EventEmitter = require('events').EventEmitter
const pluginLoader = require('./plugin_loader')
const supportFeature = require('./supportFeature')
const plugins = {
  bed: require('./plugins/bed'),
  title: require('./plugins/title'),
  block_actions: require('./plugins/block_actions'),
  blocks: require('./plugins/blocks'),
  book: require('./plugins/book'),
  boss_bar: require('./plugins/boss_bar'),
  chat: require('./plugins/chat'),
  chest: require('./plugins/chest'),
  command_block: require('./plugins/command_block'),
  craft: require('./plugins/craft'),
  creative: require('./plugins/creative'),
  digging: require('./plugins/digging'),
  enchantment_table: require('./plugins/enchantment_table'),
  entities: require('./plugins/entities'),
  experience: require('./plugins/experience'),
  fishing: require('./plugins/fishing'),
  furnace: require('./plugins/furnace'),
  game: require('./plugins/game'),
  health: require('./plugins/health'),
  inventory: require('./plugins/inventory'),
  kick: require('./plugins/kick'),
  physics: require('./plugins/physics'),
  place_block: require('./plugins/place_block'),
  rain: require('./plugins/rain'),
  ray_trace: require('./plugins/ray_trace'),
  scoreboard: require('./plugins/scoreboard'),
  settings: require('./plugins/settings'),
  simple_inventory: require('./plugins/simple_inventory'),
  sound: require('./plugins/sound'),
  spawn_point: require('./plugins/spawn_point'),
  tablist: require('./plugins/tablist'),
  time: require('./plugins/time'),
  villager: require('./plugins/villager'),
  anvil: require('./plugins/anvil')
}

const supportedVersions = require('./version').supportedVersions
const testedVersions = require('./version').testedVersions

module.exports = {
  createBot,
  Location: require('./location'),
  Painting: require('./painting'),
  ScoreBoard: require('./scoreboard'),
  BossBar: require('./bossbar'),
  supportedVersions,
  testedVersions,
  supportFeature
}

function createBot (options = {}) {
  options.username = options.username ?? 'Player'
  options.version = options.version ?? false
  options.plugins = options.plugins ?? {}
  options.hideErrors = options.hideErrors ?? true
  options.logErrors = options.logErrors ?? true
  options.loadInternalPlugins = options.loadInternalPlugins ?? true
  const bot = new EventEmitter()
  bot._client = null
  bot.end = () => bot._client.end()
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
      if (typeof options.plugins[key] === 'function') return false
      if (options.plugins[key] === false) return false
      return options.plugins[key] || options.loadInternalPlugins
    }).map(key => plugins[key])
  const externalPlugins = Object.keys(options.plugins)
    .filter(key => {
      return typeof options.plugins[key] === 'function'
    }).map(key => options.plugins[key])
  bot.loadPlugins([...internalPlugins, ...externalPlugins])

  bot._client = mc.createClient(options)
  bot._client.on('connect', () => {
    bot.emit('connect')
  })
  bot._client.on('error', (err) => {
    bot.emit('error', err)
  })
  bot._client.on('end', () => {
    bot.emit('end')
  })
  if (!bot._client.wait_connect) next()
  else bot._client.once('connect_allowed', next)
  function next () {
    const version = require('minecraft-data')(bot._client.version).version
    if (supportedVersions.indexOf(version.majorVersion) === -1) {
      throw new Error(`Version ${version.minecraftVersion} is not supported.`)
    }

    const latestTestedVersion = testedVersions[testedVersions.length - 1]
    const latestProtocolVersion = require('minecraft-data')(latestTestedVersion).protocolVersion
    if (version.protocolVersion > latestProtocolVersion) {
      throw new Error(`Version ${version.minecraftVersion} is not supported. Latest supported version is ${latestTestedVersion}.`)
    }

    bot.protocolVersion = version.version
    bot.majorVersion = version.majorVersion
    bot.version = version.minecraftVersion
    options.version = version.minecraftVersion
    bot.supportFeature = feature => supportFeature(feature, version.minecraftVersion)
    bot.emit('inject_allowed')
  }
  return bot
}
