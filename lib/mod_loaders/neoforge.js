const ForgeModLoader = require('./forge')

/**
 * NeoForge mod loader implementation
 * Extends ForgeModLoader as NeoForge is a Forge fork with mostly compatible protocol
 */
class NeoForgeModLoader extends ForgeModLoader {
  constructor (bot, options = {}) {
    super(bot, options)
    this.type = 'neoforge'
  }

  initialize () {
    // NeoForge uses the same initialization as Forge for now
    super.initialize()
    
    // Add NeoForge-specific initialization if needed
    this.setupNeoForgeSpecific()
  }

  setupNeoForgeSpecific () {
    // NeoForge-specific setup will go here
    // For now, it's identical to Forge but this allows for future divergence
    
    // Handle NeoForge-specific packets if they exist
    if (this.bot.supportFeature('neoforgeSpecificFeatures')) {
      // Setup NeoForge-specific packet handlers
      this.setupNeoForgePacketHandlers()
    }
  }

  setupNeoForgePacketHandlers () {
    // Placeholder for future NeoForge-specific packet handling
    // Currently NeoForge uses the same protocol as Forge
  }

  getCoreForgeChannels () {
    // NeoForge may use different channel names in the future
    const channels = super.getCoreForgeChannels()
    
    // Add NeoForge-specific channels if needed
    if (!this.isLegacyForge) {
      // Modern NeoForge might have additional channels
      channels.push({
        name: 'neoforge:handshake',
        codec: ['string', []],
        handler: this.handleNeoForgeHandshake
      })
    }
    
    return channels
  }

  handleNeoForgeHandshake (data) {
    // Handle NeoForge-specific handshake if different from Forge
    // For now, delegate to Forge handler
    this.handleHandshakePacket('neoforge:handshake', data)
  }

  parseServerBrand (serverBrand) {
    // Enhanced brand parsing for NeoForge
    const result = super.parseServerBrand?.(serverBrand) || {}
    
    // Check for NeoForge-specific brand patterns
    if (serverBrand && serverBrand.toLowerCase().includes('neoforge')) {
      result.isNeoForge = true
      
      // Extract NeoForge version if present
      const neoForgeMatch = serverBrand.match(/neoforge[^\d]*(\d+\.\d+\.\d+(?:[.-]\w+)?)/i)
      if (neoForgeMatch) {
        result.neoForgeVersion = neoForgeMatch[1]
        this.version = result.neoForgeVersion
      }
    }
    
    return result
  }

  /**
   * Handle NeoForge-specific registry format if it diverges from Forge
   */
  async handleRegistryData (packet) {
    // NeoForge currently uses the same registry format as Forge
    // This method can be overridden if NeoForge changes its registry protocol
    return super.handleRegistryData(packet)
  }

  /**
   * NeoForge-specific mod list parsing
   */
  parseModList (data) {
    // For now, use the same parsing as Forge
    const result = super.parseModList(data)
    
    // Add NeoForge-specific processing if needed
    if (result.mods) {
      result.mods.forEach(mod => {
        // Mark mods as NeoForge context
        mod.modLoaderContext = 'neoforge'
      })
    }
    
    return result
  }

  /**
   * Get NeoForge-specific statistics
   */
  getStats () {
    const stats = super.getStats()
    stats.modLoaderType = 'neoforge'
    stats.isNeoForge = true
    return stats
  }
}

module.exports = NeoForgeModLoader