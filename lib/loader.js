const mc = require('minecraft-protocol')
const { EventEmitter } = require('events')
const pluginLoader = require('./plugin_loader')
const plugins = {
  bed: require('./plugins/bed'),
  title: require('./plugins/title'),
  block_actions: require('./plugins/block_actions'),
  blocks: require('./plugins/blocks'),
  book: require('./plugins/book'),
  boss_bar: require('./plugins/boss_bar'),
  breath: require('./plugins/breath'),
  chat: require('./plugins/chat'),
  chest: require('./plugins/chest'),
  command_block: require('./plugins/command_block'),
  craft: require('./plugins/craft'),
  creative: require('./plugins/creative'),
  digging: require('./plugins/digging'),
  enchantment_table: require('./plugins/enchantment_table'),
  entities: require('./plugins/entities'),
  experience: require('./plugins/experience'),
  explosion: require('./plugins/explosion'),
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
  resource_pack: require('./plugins/resource_pack'),
  scoreboard: require('./plugins/scoreboard'),
  team: require('./plugins/team'),
  settings: require('./plugins/settings'),
  simple_inventory: require('./plugins/simple_inventory'),
  sound: require('./plugins/sound'),
  spawn_point: require('./plugins/spawn_point'),
  tablist: require('./plugins/tablist'),
  time: require('./plugins/time'),
  villager: require('./plugins/villager'),
  anvil: require('./plugins/anvil'),
  place_entity: require('./plugins/place_entity'),
  generic_place: require('./plugins/generic_place'),
  particle: require('./plugins/particle')
}

const minecraftData = require('minecraft-data')
const { testedVersions, latestSupportedVersion, oldestSupportedVersion } = require('./version')

module.exports = {
  createBot,
  Location: require('./location'),
  Painting: require('./painting'),
  ScoreBoard: require('./scoreboard'),
  BossBar: require('./bossbar'),
  Particle: require('./particle'),
  latestSupportedVersion,
  oldestSupportedVersion,
  testedVersions,
  supportFeature: (feature, version) => minecraftData(version).supportFeature(feature)
}

function createBot (options = {}) {
  options.username = options.username ?? 'Player'
  options.version = options.version ?? false
  options.plugins = options.plugins ?? {}
  options.hideErrors = options.hideErrors ?? false
  options.logErrors = options.logErrors ?? true
  options.loadInternalPlugins = options.loadInternalPlugins ?? true
  options.client = options.client ?? null
  options.brand = options.brand ?? 'vanilla'
  options.respawn = options.respawn ?? true
  const bot = new EventEmitter()
  bot._client = options.client
  bot.end = (reason) => bot._client.end(reason)
  bot._warn = function (...message) {
    if (options.hideErrors) return
    console.warn('[mineflayer]', ...message)
  }
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

  options.validateChannelProtocol = false
  bot._client = bot._client ?? mc.createClient(options)
  bot._client.on('connect', () => {
    bot.emit('connect')
  })
  bot._client.on('error', (err) => {
    bot.emit('error', err)
  })
  bot._client.on('end', (reason) => {
    bot.emit('end', reason)
  })
  if (!bot._client.wait_connect) next()
  else bot._client.once('connect_allowed', next)
  function next () {
    const serverPingVersion = bot._client.version
    bot.registry = require('prismarine-registry')(serverPingVersion)
    if (!bot.registry?.version) throw new Error(`Server version '${serverPingVersion}' is not supported, no data for version`)

    const versionData = bot.registry.version
    if (versionData['>'](latestSupportedVersion)) {
      throw new Error(`Server version '${serverPingVersion}' is not supported. Latest supported version is '${latestSupportedVersion}'.`)
    } else if (versionData['<'](oldestSupportedVersion)) {
      throw new Error(`Server version '${serverPingVersion}' is not supported. Oldest supported version is '${oldestSupportedVersion}'.`)
    }

    bot.protocolVersion = versionData.version
    bot.majorVersion = versionData.majorVersion
    bot.version = versionData.minecraftVersion
    options.version = versionData.minecraftVersion
    bot.supportFeature = bot.registry.supportFeature
    setTimeout(() => bot.emit('inject_allowed'), 0)
  }
  return bot
}
