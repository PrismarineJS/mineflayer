const ModLoader = require('./base')
const ForgeModParser = require('../forge_mod_parser')

/**
 * Forge mod loader implementation
 * Handles Forge/NeoForge specific protocol handshake and registry synchronization
 */
class ForgeModLoader extends ModLoader {
  constructor (bot, options = {}) {
    super(bot, options)
    this.type = 'forge'
    this.handshakePhases = [
      'WAITINGSERVERDATA',
      'WAITINGSERVERCOMPLETE',
      'PENDINGCOMPLETE',
      'COMPLETE'
    ]
    this.currentPhaseIndex = 0
    this.handshakePhase = this.handshakePhases[0]
    this.expectedRegistries = new Set(['minecraft:block', 'minecraft:item', 'minecraft:entity_type'])
    this.receivedRegistries = new Set()
    this.handshakeTimeout = null
    this.isLegacyForge = false // pre-1.13
    this.reverseRegistryCache = new Map() // string -> numeric ID cache
    this.registryStats = new Map() // registry statistics
    this.modParser = new ForgeModParser() // Mod data parser
  }

  initialize () {
    // Check version compatibility first
    const compatCheck = this.checkVersionCompatibility(this.bot.version, this.version)
    if (!compatCheck.compatible && !compatCheck.canContinue) {
      this.errorHandler.logError(compatCheck.error, 'Initialization')
      this.emit('error', compatCheck.error)
      return
    }

    if (compatCheck.warning) {
      console.warn(`Forge Warning: ${compatCheck.warning}`)
      if (compatCheck.suggestion) {
        console.warn(`Suggestion: ${compatCheck.suggestion}`)
      }
    }

    // Determine if this is legacy Forge (pre-1.13)
    const version = this.bot.version
    if (version && this.isVersionLessThan(version, '1.13')) {
      this.isLegacyForge = true
    }

    // Register required channels
    this.registerForgeChannels()

    // Set up packet handlers
    this.setupPacketHandlers()

    // Set handshake timeout
    this.handshakeTimeout = setTimeout(() => {
      const error = new Error('Forge handshake timeout')
      const errorResult = this.handleHandshakeError(error)
      if (!errorResult.shouldRetry) {
        this.emit('error', errorResult.error)
      }
    }, this.options.handshakeTimeout || 30000)
  }

  requiresHandshake () {
    return true
  }

  registerForgeChannels () {
    const coreChannels = this.getCoreForgeChannels()

    // Register core Forge channels
    coreChannels.forEach(({ name, codec, handler }) => {
      this.registerChannel(name, codec)
      if (handler) {
        this.bot._client.on(name, handler.bind(this))
      }
    })

    // Register custom channels from configuration
    if (this.options.customChannels) {
      this.options.customChannels.forEach(channel => {
        this.registerChannel(channel, ['string', []])
      })
    }
  }

  getCoreForgeChannels () {
    if (this.isLegacyForge) {
      // Pre-1.13 channels
      return [
        { name: 'FML|HS', codec: ['string', []], handler: this.handleForgeHandshakeChannel },
        { name: 'FML', codec: ['string', []], handler: this.handleForgeDataChannel },
        { name: 'FML|MP', codec: ['raw'], handler: this.handleMultipartPacket },
        { name: 'FORGE', codec: ['string', []], handler: this.handleForgeChannel }
      ]
    } else {
      // 1.13+ uses login plugin system
      return [
        { name: 'fml:handshake', codec: ['string', []], handler: this.handleModernForgeHandshake },
        { name: 'FML|MP', codec: ['raw'], handler: this.handleMultipartPacket }
      ]
    }
  }

  handleForgeHandshakeChannel (data) {
    this.handleHandshakePacket('FML|HS', data)
  }

  handleForgeDataChannel (data) {
    this.handleHandshakePacket('FML', data)
  }

  handleForgeChannel (data) {
    this.handleHandshakePacket('FORGE', data)
  }

  handleModernForgeHandshake (data) {
    this.handleHandshakePacket('fml:handshake', data)
  }

  setupPacketHandlers () {
    // Handle login plugin requests (1.13+) - not handled by channels
    if (!this.isLegacyForge) {
      this.bot._client.on('login_plugin_request', (packet) => this.handleLoginPluginRequest(packet))
    }

    // Handle configuration phase packets (1.20.2+)
    if (this.bot.supportFeature('configurationPhase')) {
      this.bot._client.on('registry_data', (packet) => this.handleRegistryDataPacket(packet))
    }
  }

  async startHandshake () {
    if (this.isLegacyForge) {
      // Send initial handshake
      this.sendHandshakePacket('FML|HS', this.createClientHello())
    } else {
      // Modern Forge uses login plugin system - wait for server request
      this.handshakePhase = 'WAITING_SERVER_REQUEST'
    }
  }

  async handleHandshakePacket (channel, data) {
    try {
      if (channel === 'FML|HS' || channel === 'fml:handshake') {
        return await this.handleForgeHandshake(data)
      } else if (channel === 'FML') {
        return await this.handleForgeData(data)
      } else if (channel === 'FORGE') {
        return await this.handleForgeRegistry(data)
      }
    } catch (err) {
      const errorResult = this.handleHandshakeError(err)
      if (!errorResult.shouldRetry) {
        this.emit('error', errorResult.error)
      }
    }
    return false
  }

  async handleForgeHandshake (data) {
    const packet = this.parseHandshakePacket(data)

    switch (packet.type) {
      case 'ServerHello':
        await this.handleServerHello(packet)
        break
      case 'ModList':
        await this.handleModList(packet)
        break
      case 'RegistryData':
        await this.handleRegistryData(packet)
        break
      case 'HandshakeAck':
        await this.handleHandshakeAck(packet)
        break
      case 'HandshakeReset':
        await this.handleHandshakeReset()
        break
      default:
        return false
    }
    return true
  }

  parseHandshakePacket (data) {
    if (!data || data.length === 0) {
      const error = new Error('Empty handshake packet')
      const errorResult = this.errorHandler.handleHandshakeError(error, this.type)
      this.errorHandler.logError(errorResult.error, 'Packet Parsing')
      throw errorResult.error
    }

    // Parse packet type (first byte)
    const type = data.readUInt8(0)
    const payload = data.slice(1)

    switch (type) {
      case 0: return { type: 'ServerHello', data: this.parseServerHello(payload) }
      case 1: return { type: 'ClientHello', data: payload }
      case 2: return { type: 'ModList', data: this.parseModList(payload) }
      case 3: return { type: 'RegistryData', data: this.parseRegistryData(payload) }
      case 255: return { type: 'HandshakeAck', data: this.parseHandshakeAck(payload) }
      case 254: return { type: 'HandshakeReset', data: payload }
      default: throw new Error(`Unknown handshake packet type: ${type}`)
    }
  }

  parseServerHello (data) {
    // ServerHello contains dimension information
    const offset = 0
    const dimension = data.readInt32BE(offset)
    return { dimension }
  }

  parseModList (data) {
    // Use enhanced mod parser
    return this.modParser.parseModListPacket(data)
  }

  parseRegistryData (data) {
    let offset = 0

    // Read registry name
    const nameLength = data.readUInt16BE(offset)
    offset += 2

    const registryName = data.slice(offset, offset + nameLength).toString('utf8')
    offset += nameLength

    // Read ID mappings
    const mappings = new Map()
    const entryCount = data.readUInt32BE(offset)
    offset += 4

    for (let i = 0; i < entryCount && offset < data.length; i++) {
      const id = data.readUInt32BE(offset)
      offset += 4

      const keyLength = data.readUInt16BE(offset)
      offset += 2

      if (offset + keyLength > data.length) break

      const key = data.slice(offset, offset + keyLength).toString('utf8')
      offset += keyLength

      mappings.set(id, key)
    }

    // Check if more registry data is coming
    const hasMore = offset < data.length ? data.readUInt8(offset) === 1 : false

    return { registryName, mappings, hasMore }
  }

  parseHandshakeAck (data) {
    const phase = data.readUInt8(0)
    return { phase }
  }

  async handleServerHello (packet) {
    // Store dimension info and send client hello
    this.serverDimension = packet.data.dimension
    this.sendHandshakePacket('FML|HS', this.createClientHello())
  }

  async handleModList (packet) {
    const parsedData = packet.data

    // Store server mods with enhanced information
    if (parsedData.mods) {
      parsedData.mods.forEach(mod => {
        // Extract dependencies if present
        const dependencies = this.modParser.extractDependencies(mod)

        // Parse version information
        const versionInfo = this.modParser.parseVersion(mod.version)

        // Add to registry with full information
        this.addMod(mod.id, {
          version: mod.version,
          name: mod.name || mod.id,
          dependencies,
          versionInfo,
          description: mod.description || '',
          metadata: mod
        })
      })
    }

    // Store Forge version if detected
    if (parsedData.forgeVersion) {
      this.version = parsedData.forgeVersion
      this.emit('forgeVersionDetected', parsedData.forgeVersion)
    }

    // Report parsing errors if any
    if (parsedData.errors && parsedData.errors.length > 0) {
      this.emit('modParsingErrors', parsedData.errors)
    }

    // Send client mod list (empty for now)
    this.sendHandshakePacket('FML|HS', this.createClientModList())

    // Emit enhanced mod data
    this.emit('modsReceived', {
      mods: parsedData.mods,
      modCount: parsedData.modCount,
      forgeVersion: parsedData.forgeVersion,
      errors: parsedData.errors
    })
  }

  async handleRegistryData (packet) {
    const { registryName, mappings, hasMore } = packet.data

    // Store registry mappings with enhanced processing
    this.processRegistryMapping(registryName, mappings)
    this.receivedRegistries.add(registryName)

    // Emit registry update event
    this.emit('registryReceived', {
      registryName,
      mappings,
      hasMore,
      totalRegistries: this.receivedRegistries.size
    })

    if (!hasMore && this.hasAllRequiredRegistries()) {
      // Send acknowledgment that we're ready
      this.sendHandshakePacket('FML|HS', this.createHandshakeAck('WAITINGSERVERCOMPLETE'))
      this.advanceHandshakePhase()
    }
  }

  /**
   * Process registry mapping with enhanced features
   * @param {string} registryName - Registry name
   * @param {Map} mappings - ID mappings
   */
  processRegistryMapping (registryName, mappings) {
    // Determine which mod owns these registry entries
    const modOwnership = this.determineRegistryOwnership(registryName, mappings)

    // Store in new registry system
    for (const [modId, modMappings] of modOwnership.entries()) {
      this.setRegistryMapping(registryName, modMappings, modId)
    }

    // Validate registry consistency
    this.validateRegistryMapping(registryName, mappings)

    // Cache frequently accessed mappings
    this.cacheRegistryMappings(registryName, mappings)
  }

  /**
   * Determine which mod owns which registry entries
   * @param {string} registryName - Registry name
   * @param {Map} mappings - ID mappings
   * @returns {Map} - Map of modId to their mappings
   */
  determineRegistryOwnership (registryName, mappings) {
    const ownership = new Map()

    for (const [numericId, stringId] of mappings) {
      // Extract mod ID from string identifier (e.g., "minecraft:stone" -> "minecraft")
      const parts = stringId.split(':')
      const modId = parts.length > 1 ? parts[0] : 'minecraft'

      if (!ownership.has(modId)) {
        ownership.set(modId, new Map())
      }
      ownership.get(modId).set(numericId, stringId)
    }

    return ownership
  }

  /**
   * Validate registry mapping for consistency
   * @param {string} registryName - Registry name
   * @param {Map} mappings - ID mappings
   */
  validateRegistryMapping (registryName, mappings) {
    const issues = []

    // Check for duplicate IDs
    const seenIds = new Set()
    const seenNames = new Set()

    for (const [numericId, stringId] of mappings) {
      if (seenIds.has(numericId)) {
        issues.push({
          type: 'duplicate_id',
          registry: registryName,
          id: numericId,
          message: `Duplicate numeric ID ${numericId} in ${registryName}`
        })
      }

      if (seenNames.has(stringId)) {
        issues.push({
          type: 'duplicate_name',
          registry: registryName,
          name: stringId,
          message: `Duplicate string ID ${stringId} in ${registryName}`
        })
      }

      seenIds.add(numericId)
      seenNames.add(stringId)
    }

    // Check for gaps in ID ranges (warn only)
    const sortedIds = Array.from(seenIds).sort((a, b) => a - b)
    for (let i = 1; i < sortedIds.length; i++) {
      const gap = sortedIds[i] - sortedIds[i - 1]
      if (gap > 100) { // Large gap might indicate issues
        issues.push({
          type: 'id_gap',
          registry: registryName,
          gap,
          message: `Large gap (${gap}) in ${registryName} ID range between ${sortedIds[i - 1]} and ${sortedIds[i]}`
        })
      }
    }

    if (issues.length > 0) {
      this.emit('registryValidationIssues', registryName, issues)
    }
  }

  /**
   * Cache frequently accessed registry mappings
   * @param {string} registryName - Registry name
   * @param {Map} mappings - ID mappings
   */
  cacheRegistryMappings (registryName, mappings) {
    // Cache reverse mappings for quick lookup
    if (!this.reverseRegistryCache) {
      this.reverseRegistryCache = new Map()
    }

    if (!this.reverseRegistryCache.has(registryName)) {
      this.reverseRegistryCache.set(registryName, new Map())
    }

    const reverseCache = this.reverseRegistryCache.get(registryName)
    for (const [numericId, stringId] of mappings) {
      reverseCache.set(stringId, numericId)
    }
  }

  async handleHandshakeAck (packet) {
    // Server acknowledged our phase, advance to next
    this.advanceHandshakePhase()

    if (this.isHandshakeComplete()) {
      this.completeHandshake()
    }
  }

  async handleHandshakeReset () {
    // Server requested handshake reset
    this.resetHandshake()
    await this.startHandshake()
  }

  createClientHello () {
    const buffer = Buffer.alloc(5)
    buffer.writeUInt8(1, 0) // ClientHello type
    buffer.writeUInt32BE(this.serverDimension || 0, 1)
    return buffer
  }

  createClientModList () {
    // Send empty mod list for now - could be extended to send client mods
    const buffer = Buffer.alloc(5)
    buffer.writeUInt8(2, 0) // ModList type
    buffer.writeUInt32BE(0, 1) // 0 mods
    return buffer
  }

  createHandshakeAck (phase) {
    const phaseIndex = this.handshakePhases.indexOf(phase)
    const buffer = Buffer.alloc(2)
    buffer.writeUInt8(255, 0) // HandshakeAck type
    buffer.writeUInt8(phaseIndex, 1)
    return buffer
  }

  sendHandshakePacket (channel, data) {
    if (this.bot._client && !this.bot._client.ended) {
      this.bot._client.writeChannel(channel, data)
    }
  }

  handleMultipartPacket (data) {
    const completeMessage = this.handleMultipartMessage('FML|MP', data)
    if (completeMessage) {
      // Process the complete multipart message
      this.handleHandshakePacket('FML', completeMessage)
    }
  }

  handleLoginPluginRequest (packet) {
    if (packet.channel === 'fml:handshake') {
      // Modern Forge handshake via login plugins
      this.handleHandshakePacket('fml:handshake', packet.data)

      // Send response
      this.bot._client.write('login_plugin_response', {
        messageId: packet.messageId,
        successful: true,
        data: this.createClientHello()
      })
    }
  }

  hasAllRequiredRegistries () {
    for (const registry of this.expectedRegistries) {
      if (!this.receivedRegistries.has(registry)) {
        return false
      }
    }
    return true
  }

  advanceHandshakePhase () {
    if (this.currentPhaseIndex < this.handshakePhases.length - 1) {
      this.currentPhaseIndex++
      this.handshakePhase = this.handshakePhases[this.currentPhaseIndex]
      this.emit('handshakePhaseChanged', this.handshakePhase)
    }
  }

  isHandshakeComplete () {
    return this.currentPhaseIndex >= this.handshakePhases.length - 1
  }

  completeHandshake () {
    this.handshakeComplete = true
    if (this.handshakeTimeout) {
      clearTimeout(this.handshakeTimeout)
      this.handshakeTimeout = null
    }
    this.emit('handshakeComplete')
  }

  resetHandshake () {
    this.currentPhaseIndex = 0
    this.handshakePhase = this.handshakePhases[0]
    this.handshakeComplete = false
    this.receivedRegistries.clear()
    this.mods.clear()
    this.registryMappings.clear()
  }

  /**
   * Handle registry data packet (1.20.2+)
   */
  handleRegistryDataPacket (packet) {
    try {
      // Modern registry sync via configuration phase
      if (packet.codec) {
        this.bot.registry.loadDimensionCodec(packet.codec || packet)
      }

      this.emit('registryDataReceived', packet)
    } catch (err) {
      this.emit('error', new Error(`Failed to process registry data: ${err.message}`))
    }
  }

  /**
   * Send a message to a Forge channel
   * @param {string} channel - Channel name
   * @param {Buffer|string} data - Data to send
   */
  sendChannelMessage (channel, data) {
    if (!this.channels.has(channel)) {
      throw new Error(`Channel ${channel} is not registered`)
    }

    try {
      this.bot._client.writeChannel(channel, data)
      this.emit('messageSent', channel, data)
    } catch (err) {
      this.emit('error', new Error(`Failed to send message to channel ${channel}: ${err.message}`))
    }
  }

  /**
   * Get list of registered channels
   * @returns {Array<string>} - Array of channel names
   */
  getRegisteredChannels () {
    return Array.from(this.channels)
  }

  /**
   * Check if a channel is registered
   * @param {string} channel - Channel name
   * @returns {boolean} - Whether the channel is registered
   */
  isChannelRegistered (channel) {
    return this.channels.has(channel)
  }

  /**
   * Get registry statistics
   * @returns {Object} - Registry statistics
   */
  getRegistryStats () {
    const stats = {
      totalRegistries: this.receivedRegistries.size,
      expectedRegistries: this.expectedRegistries.size,
      registryDetails: {}
    }

    for (const registryName of this.receivedRegistries) {
      const mapping = this.getRegistryMapping(registryName)
      const reverseCache = this.reverseRegistryCache.get(registryName)

      stats.registryDetails[registryName] = {
        entries: mapping ? mapping.size : 0,
        cached: reverseCache ? reverseCache.size : 0
      }
    }

    return stats
  }

  /**
   * Resolve string identifier to numeric ID
   * @param {string} registryName - Registry name
   * @param {string} stringId - String identifier
   * @returns {number|null} - Numeric ID or null
   */
  reverseResolveId (registryName, stringId) {
    const reverseCache = this.reverseRegistryCache.get(registryName)
    return reverseCache ? reverseCache.get(stringId) : null
  }

  /**
   * Clear registry caches
   */
  clearRegistryCaches () {
    this.reverseRegistryCache.clear()
    this.registryStats.clear()
  }

  isVersionLessThan (version1, version2) {
    if (!version1 || !version2) return false
    const parts1 = version1.split('.').map(Number)
    const parts2 = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      if (part1 < part2) return true
      if (part1 > part2) return false
    }
    return false
  }

  cleanup () {
    if (this.handshakeTimeout) {
      clearTimeout(this.handshakeTimeout)
      this.handshakeTimeout = null
    }
    super.cleanup()
  }
}

module.exports = ForgeModLoader
