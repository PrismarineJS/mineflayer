const ModLoader = require('./base')

/**
 * Fabric mod loader implementation
 * Handles Fabric-specific protocol and mod management
 */
class FabricModLoader extends ModLoader {
  constructor (bot, options = {}) {
    super(bot, options)
    this.type = 'fabric'
    this.fabricApiVersion = null
    this.fabricLoaderVersion = null
    this.configurationPhase = false
    this.registrySync = new Map() // Fabric registry sync data
    this.modMetadata = new Map() // Fabric mod metadata
  }

  initialize () {
    // Fabric uses a different approach than Forge
    this.setupFabricChannels()
    this.setupFabricPacketHandlers()
    
    // Fabric doesn't require a complex handshake like Forge
    this.handshakeComplete = false
  }

  requiresHandshake () {
    // Fabric has a simpler handshake process
    return true
  }

  setupFabricChannels () {
    // Register Fabric-specific channels
    const channels = this.getFabricChannels()
    
    channels.forEach(({ name, codec, handler }) => {
      this.registerChannel(name, codec)
      if (handler) {
        this.bot._client.on(name, handler.bind(this))
      }
    })
  }

  getFabricChannels () {
    const channels = []
    
    // Modern Fabric (1.20.2+) uses configuration phase
    if (this.bot.supportFeature('configurationPhase')) {
      channels.push({
        name: 'c:register',
        codec: ['string', []],
        handler: this.handleChannelRegistration
      })
      
      channels.push({
        name: 'fabric-networking-api-v1:version_sync',
        codec: ['string', []],
        handler: this.handleVersionSync
      })
    } else {
      // Legacy Fabric channel registration
      channels.push({
        name: 'fabric-networking-api-v1:early_registration',
        codec: ['string', []],
        handler: this.handleEarlyRegistration
      })
    }
    
    // Common Fabric channels
    channels.push({
      name: 'fabric-networking-api-v1:play_registry',
      codec: ['string', []],
      handler: this.handlePlayRegistry
    })
    
    return channels
  }

  setupFabricPacketHandlers () {
    // Handle configuration phase for modern Fabric
    if (this.bot.supportFeature('configurationPhase')) {
      this.bot._client.on('start_configuration', () => {
        this.configurationPhase = true
        this.startFabricConfiguration()
      })
      
      this.bot._client.on('finish_configuration', () => {
        this.configurationPhase = false
        this.completeFabricSetup()
      })
    }
    
    // Handle registry sync
    this.bot._client.on('registry_data', (packet) => {
      this.handleRegistrySync(packet)
    })
  }

  async startHandshake () {
    if (this.bot.supportFeature('configurationPhase')) {
      // Modern Fabric: wait for configuration phase
      this.emit('handshakeStarted', 'configuration_phase')
    } else {
      // Legacy Fabric: immediate setup
      this.setupLegacyFabric()
    }
  }

  async handleHandshakePacket (channel, data) {
    switch (channel) {
      case 'c:register':
        return this.handleChannelRegistration(data)
      case 'fabric-networking-api-v1:version_sync':
        return this.handleVersionSync(data)
      case 'fabric-networking-api-v1:early_registration':
        return this.handleEarlyRegistration(data)
      case 'fabric-networking-api-v1:play_registry':
        return this.handlePlayRegistry(data)
      default:
        return false
    }
  }

  handleChannelRegistration (data) {
    try {
      // Parse channel registration data
      const channels = this.parseChannelList(data)
      
      channels.forEach(channel => {
        this.registerChannel(channel, ['string', []])
      })
      
      this.emit('channelsRegistered', channels)
      return true
    } catch (err) {
      this.emit('error', new Error(`Failed to process channel registration: ${err.message}`))
      return false
    }
  }

  handleVersionSync (data) {
    try {
      // Parse version sync data
      const versionInfo = this.parseVersionSync(data)
      
      this.fabricApiVersion = versionInfo.fabricApi
      this.fabricLoaderVersion = versionInfo.fabricLoader
      
      this.emit('fabricVersionSync', versionInfo)
      return true
    } catch (err) {
      this.emit('error', new Error(`Failed to process version sync: ${err.message}`))
      return false
    }
  }

  handleEarlyRegistration (data) {
    // Legacy Fabric early registration
    try {
      const registrationData = this.parseEarlyRegistration(data)
      this.emit('earlyRegistration', registrationData)
      return true
    } catch (err) {
      this.emit('error', new Error(`Failed to process early registration: ${err.message}`))
      return false
    }
  }

  handlePlayRegistry (data) {
    try {
      // Handle Fabric play registry data
      const registryData = this.parsePlayRegistry(data)
      
      // Store registry data
      this.registrySync.set(registryData.registryName, registryData)
      
      this.emit('playRegistry', registryData)
      return true
    } catch (err) {
      this.emit('error', new Error(`Failed to process play registry: ${err.message}`))
      return false
    }
  }

  startFabricConfiguration () {
    // Start Fabric configuration phase
    this.emit('configurationStarted')
    
    // Request mod list and registry data
    this.requestFabricModList()
    this.requestFabricRegistries()
  }

  completeFabricSetup () {
    // Fabric setup is complete
    this.handshakeComplete = true
    this.emit('handshakeComplete')
  }

  setupLegacyFabric () {
    // Legacy Fabric setup
    this.handshakeComplete = true
    this.emit('handshakeComplete')
  }

  requestFabricModList () {
    // Request mod list from Fabric server
    // This is handled differently than Forge - Fabric may not send explicit mod lists
    // Instead, we collect mod information from various sources
  }

  requestFabricRegistries () {
    // Request registry data from Fabric server
    // Fabric uses vanilla registries with data attachments
  }

  handleRegistrySync (packet) {
    try {
      // Handle Fabric registry synchronization
      const registryName = packet.registryId || packet.registry
      const entries = packet.entries || []
      
      // Process registry entries
      const mappings = new Map()
      entries.forEach((entry, index) => {
        if (entry.id) {
          mappings.set(index, entry.id)
        }
      })
      
      // Store mappings
      this.setRegistryMapping(registryName, mappings)
      
      this.emit('registrySync', { registryName, mappings })
    } catch (err) {
      this.emit('error', new Error(`Failed to handle registry sync: ${err.message}`))
    }
  }

  parseChannelList (data) {
    // Parse Fabric channel list
    const channels = []
    
    if (Buffer.isBuffer(data)) {
      const channelString = data.toString('utf8')
      const channelList = channelString.split('\0') // Fabric uses null separator
      channels.push(...channelList.filter(ch => ch.length > 0))
    }
    
    return channels
  }

  parseVersionSync (data) {
    // Parse Fabric version sync data
    const versionInfo = {
      fabricApi: null,
      fabricLoader: null,
      minecraft: null
    }
    
    if (Buffer.isBuffer(data)) {
      try {
        const jsonString = data.toString('utf8')
        const parsed = JSON.parse(jsonString)
        
        versionInfo.fabricApi = parsed.fabricApi || parsed['fabric-api']
        versionInfo.fabricLoader = parsed.fabricLoader || parsed['fabric-loader']
        versionInfo.minecraft = parsed.minecraft
      } catch (err) {
        // Not JSON, try simple parsing
        const versionString = data.toString('utf8')
        const parts = versionString.split('|')
        if (parts.length >= 2) {
          versionInfo.fabricLoader = parts[0]
          versionInfo.fabricApi = parts[1]
        }
      }
    }
    
    return versionInfo
  }

  parseEarlyRegistration (data) {
    // Parse early registration data
    return {
      timestamp: Date.now(),
      data: data.toString('utf8')
    }
  }

  parsePlayRegistry (data) {
    // Parse Fabric play registry data
    return {
      registryName: 'fabric:play_registry',
      data: data,
      timestamp: Date.now()
    }
  }

  /**
   * Get Fabric mod information
   * Fabric doesn't send explicit mod lists like Forge, so we infer from other data
   */
  getFabricMods () {
    const mods = []
    
    // Add known Fabric components
    if (this.fabricLoaderVersion) {
      mods.push({
        id: 'fabric-loader',
        version: this.fabricLoaderVersion,
        name: 'Fabric Loader',
        type: 'loader'
      })
    }
    
    if (this.fabricApiVersion) {
      mods.push({
        id: 'fabric-api',
        version: this.fabricApiVersion,
        name: 'Fabric API',
        type: 'api'
      })
    }
    
    // Add other detected mods
    for (const [modId, metadata] of this.modMetadata) {
      mods.push({
        id: modId,
        ...metadata
      })
    }
    
    return mods
  }

  /**
   * Get Fabric-specific statistics
   */
  getStats () {
    const baseStats = {
      modLoaderType: 'fabric',
      fabricLoaderVersion: this.fabricLoaderVersion,
      fabricApiVersion: this.fabricApiVersion,
      registriesSynced: this.registrySync.size,
      modsDetected: this.modMetadata.size,
      configurationPhase: this.configurationPhase
    }
    
    return baseStats
  }

  /**
   * Check if Fabric setup is complete
   */
  isReady () {
    return this.handshakeComplete && (!this.configurationPhase || this.bot.supportFeature('configurationPhase'))
  }

  cleanup () {
    this.registrySync.clear()
    this.modMetadata.clear()
    super.cleanup()
  }
}

module.exports = FabricModLoader