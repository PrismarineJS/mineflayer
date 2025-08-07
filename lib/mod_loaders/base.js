const { EventEmitter } = require('events')
const { ModRegistry } = require('../mod_registry')
const { OptimizedModRegistry } = require('../mod_registry_performance')
const { ModLoaderErrorHandler } = require('../mod_loader_error_handler')

/**
 * Abstract base class for all mod loader implementations
 * Provides common interface and functionality that all mod loaders must implement
 */
class ModLoader extends EventEmitter {
  constructor (bot, options = {}) {
    super()
    this.bot = bot
    this.options = options
    this.type = 'unknown'
    this.version = null
    this.handshakePhase = null
    this.handshakeComplete = false
    // Use optimized registry for better performance with large mod packs
    this.registry = options.useOptimizedRegistry !== false 
      ? new OptimizedModRegistry(options)
      : new ModRegistry(options)
    this.mods = new Map() // modId -> mod info (legacy compatibility)
    this.registryMappings = new Map() // registry name -> id mappings (legacy compatibility)
    this.channels = new Set() // registered channels
    this.multipartBuffer = new Map() // channel -> message parts

    // Initialize error handler
    this.errorHandler = new ModLoaderErrorHandler(options)

    // Initialize mod loader
    this.initialize()
  }

  /**
   * Initialize the mod loader - called in constructor
   * Override in subclasses to set up specific initialization
   */
  initialize () {
    throw new Error('ModLoader.initialize() must be implemented by subclass')
  }

  /**
   * Get the type of this mod loader
   * @returns {string} - Mod loader type (forge, neoforge, fabric, etc.)
   */
  getType () {
    return this.type
  }

  /**
   * Get the version of this mod loader
   * @returns {string|null} - Mod loader version
   */
  getVersion () {
    return this.version
  }

  /**
   * Check if handshake is required for this mod loader
   * @returns {boolean} - Whether handshake is required
   */
  requiresHandshake () {
    throw new Error('ModLoader.requiresHandshake() must be implemented by subclass')
  }

  /**
   * Start the handshake process with the server
   * @returns {Promise<void>} - Resolves when handshake is complete
   */
  async startHandshake () {
    if (!this.requiresHandshake()) {
      this.handshakeComplete = true
      this.emit('handshakeComplete')
      return
    }

    throw new Error('ModLoader.startHandshake() must be implemented by subclass')
  }

  /**
   * Process an incoming handshake packet
   * @param {string} channel - The channel the packet was received on
   * @param {Buffer} data - The packet data
   * @returns {Promise<boolean>} - Whether the packet was handled
   */
  async handleHandshakePacket (channel, data) {
    throw new Error('ModLoader.handleHandshakePacket() must be implemented by subclass')
  }

  /**
   * Register a channel for mod communication
   * @param {string} channel - Channel name to register
   * @param {Array} codec - Codec for the channel (optional)
   */
  registerChannel (channel, codec = ['string', []]) {
    if (this.channels.has(channel)) {
      return // Already registered
    }

    try {
      this.bot._client.registerChannel(channel, codec)
      this.channels.add(channel)
      this.emit('channelRegistered', channel)
    } catch (err) {
      if (!err.message.includes('already registered')) {
        const errorResult = this.errorHandler.handleChannelRegistrationError(err, channel, this.type)
        this.errorHandler.logError(errorResult.error, `Channel: ${channel}`)
        if (!errorResult.canContinue) {
          throw errorResult.error
        }
      }
      this.channels.add(channel)
    }
  }

  /**
   * Handle multipart message assembly
   * @param {string} channel - Channel the message was received on
   * @param {Buffer} data - Message data
   * @returns {Buffer|null} - Complete message if all parts received, null otherwise
   */
  handleMultipartMessage (channel, data) {
    if (!data || data.length === 0) return null

    // Check if this is a multipart message (first byte is part number)
    const partNumber = data.readUInt8(0)
    const messageData = data.slice(1)

    if (!this.multipartBuffer.has(channel)) {
      this.multipartBuffer.set(channel, new Map())
    }

    const channelBuffer = this.multipartBuffer.get(channel)
    channelBuffer.set(partNumber, messageData)

    // Check if we have all parts (part 0xFF indicates end)
    let hasAllParts = false
    let maxPart = -1
    for (const part of channelBuffer.keys()) {
      if (part === 0xFF) {
        hasAllParts = true
        break
      }
      if (part > maxPart) maxPart = part
    }

    if (!hasAllParts && channelBuffer.size < 256) {
      return null // Still waiting for more parts
    }

    // Assemble complete message
    const parts = []
    for (let i = 0; i <= maxPart; i++) {
      if (channelBuffer.has(i)) {
        parts.push(channelBuffer.get(i))
      }
    }

    // Clear buffer
    this.multipartBuffer.delete(channel)

    return Buffer.concat(parts)
  }

  /**
   * Add a mod to the mod registry
   * @param {string} modId - The mod identifier
   * @param {Object} modInfo - Mod information object
   */
  addMod (modId, modInfo) {
    // Add to new registry system
    this.registry.addMod(modId, modInfo)

    // Maintain legacy compatibility
    this.mods.set(modId, {
      id: modId,
      version: modInfo.version || 'unknown',
      name: modInfo.name || modId,
      ...modInfo
    })
    this.emit('modAdded', modId, this.mods.get(modId))
    
    // Check compatibility after adding mod
    if (this.registry.getModCount() > 1) {
      const report = this.registry.validateCompatibility()
      if (report.summary.critical > 0 || report.summary.errors > 0) {
        this.emit('compatibilityIssuesDetected', report)
      }
    }
  }

  /**
   * Get information about a specific mod
   * @param {string} modId - The mod identifier
   * @returns {Object|null} - Mod information or null if not found
   */
  getMod (modId) {
    return this.mods.get(modId) || null
  }

  /**
   * Get all loaded mods
   * @returns {Map<string, Object>} - Map of mod ID to mod info
   */
  getAllMods () {
    return new Map(this.mods)
  }

  /**
   * Set registry mapping for mod loader specific IDs
   * @param {string} registryName - Name of the registry (e.g., 'minecraft:block')
   * @param {Map} idMapping - Map of numeric ID to string identifier
   * @param {string} [modId] - Mod that owns these mappings
   */
  setRegistryMapping (registryName, idMapping, modId = 'unknown') {
    try {
      // Add to new registry system
      this.registry.addRegistryMapping(registryName, modId, idMapping)

      // Maintain legacy compatibility
      this.registryMappings.set(registryName, idMapping)
      this.emit('registryMappingUpdated', registryName, idMapping)
    } catch (err) {
      const errorResult = this.errorHandler.handleRegistryError(err, registryName)
      this.errorHandler.logError(errorResult.error, `Registry: ${registryName}`)

      if (errorResult.canContinue && errorResult.fallbackAction === 'skip_registry') {
        console.warn(`Skipping registry ${registryName} due to error: ${err.message}`)
        return
      }

      if (!errorResult.canContinue) {
        throw errorResult.error
      }
    }
  }

  /**
   * Get registry mapping for a specific registry
   * @param {string} registryName - Name of the registry
   * @returns {Map|null} - ID mapping or null if not found
   */
  getRegistryMapping (registryName) {
    return this.registryMappings.get(registryName) || null
  }

  /**
   * Resolve a mod loader specific ID to vanilla equivalent
   * @param {string} registryName - Name of the registry
   * @param {number} numericId - Numeric ID from mod loader
   * @returns {string|null} - String identifier or null if not found
   */
  resolveId (registryName, numericId) {
    const mapping = this.getRegistryMapping(registryName)
    return mapping ? mapping.get(numericId) : null
  }

  /**
   * Check if the mod loader is ready for normal operation
   * @returns {boolean} - Whether the mod loader is ready
   */
  isReady () {
    return this.handshakeComplete
  }

  /**
   * Get current handshake phase
   * @returns {string|null} - Current handshake phase
   */
  getHandshakePhase () {
    return this.handshakePhase
  }

  /**
   * Handle errors during handshake with retry logic
   * @param {Error} error - The error that occurred
   * @returns {Object} - Error handling result
   */
  handleHandshakeError (error) {
    const connectionId = `${this.bot.username || 'bot'}_${Date.now()}`
    const result = this.errorHandler.handleHandshakeError(error, this.type, connectionId)

    this.errorHandler.logError(result.error, 'Handshake')

    if (result.shouldRetry) {
      setTimeout(() => {
        this.emit('retryHandshake', result.retryDelay)
      }, result.retryDelay)
    } else if (result.fallbackTreatment === 'vanilla') {
      this.emit('fallbackToVanilla')
    }

    return result
  }

  /**
   * Check version compatibility before starting
   * @param {string} minecraftVersion - Minecraft version
   * @param {string} modLoaderVersion - Mod loader version
   * @returns {Object} - Compatibility check result
   */
  checkVersionCompatibility (minecraftVersion, modLoaderVersion) {
    return this.errorHandler.checkVersionCompatibility(this.type, minecraftVersion, modLoaderVersion)
  }
  
  /**
   * Perform comprehensive mod compatibility check
   * @returns {Object} - Detailed compatibility report
   */
  checkModCompatibility () {
    return this.registry.validateCompatibility()
  }
  
  /**
   * Get compatibility status summary
   * @returns {Object} - Compatibility status
   */
  getCompatibilityStatus () {
    return this.registry.getCompatibilityStatus()
  }
  
  /**
   * Format compatibility report as human-readable text
   * @returns {string} - Formatted compatibility report
   */
  formatCompatibilityReport () {
    return this.registry.formatCompatibilityReport()
  }
  
  /**
   * Add known incompatibility between mods
   * @param {string} modId - Primary mod ID
   * @param {Array<string>} incompatibleMods - Incompatible mod IDs
   * @param {string} [reason] - Reason for incompatibility
   */
  addIncompatibility (modId, incompatibleMods, reason = 'conflict') {
    this.registry.addIncompatibility(modId, incompatibleMods, reason)
  }
  
  /**
   * Mark mod as deprecated
   * @param {string} modId - Deprecated mod ID
   * @param {Array<string>} alternatives - Alternative mod IDs
   */
  markAsDeprecated (modId, alternatives = []) {
    this.registry.markAsDeprecated(modId, alternatives)
  }

  /**
   * Clean up mod loader resources
   */
  cleanup () {
    this.removeAllListeners()
    this.mods.clear()
    this.registryMappings.clear()
    this.channels.clear()
    this.multipartBuffer.clear()
    this.errorHandler.resetRetries(this.bot.username || 'bot')
  }
}

module.exports = ModLoader
