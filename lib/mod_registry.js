const { EventEmitter } = require('events')
const { ModCompatibilityChecker } = require('./mod_compatibility_checker')

/**
 * Registry system for tracking loaded mods, versions, and dependencies
 * Provides centralized mod management and compatibility checking
 */
class ModRegistry extends EventEmitter {
  constructor (options = {}) {
    super()
    this.mods = new Map() // modId -> ModInfo
    this.dependencies = new Map() // modId -> Set of dependency modIds
    this.conflicts = new Map() // modId -> Set of conflicting modIds
    this.versionRequirements = new Map() // modId -> version requirements
    this.registryMappings = new Map() // registry type -> ModRegistryMapping
    
    // Initialize compatibility checker
    this.compatibilityChecker = new ModCompatibilityChecker(options)
    this.lastCompatibilityReport = null
    
    // Forward compatibility events
    this.compatibilityChecker.on('compatibilityReport', (report) => {
      this.lastCompatibilityReport = report
      this.emit('compatibilityReport', report)
    })
  }

  /**
   * Add a mod to the registry
   * @param {string} modId - Unique mod identifier
   * @param {Object} modInfo - Mod information
   * @param {string} modInfo.version - Mod version
   * @param {string} [modInfo.name] - Display name
   * @param {Array<string>} [modInfo.dependencies] - Required mod dependencies
   * @param {Array<string>} [modInfo.conflicts] - Conflicting mods
   * @param {Object} [modInfo.metadata] - Additional metadata
   */
  addMod (modId, modInfo) {
    const mod = {
      id: modId,
      version: modInfo.version || 'unknown',
      name: modInfo.name || modId,
      dependencies: modInfo.dependencies || [],
      conflicts: modInfo.conflicts || [],
      metadata: modInfo.metadata || {},
      addedAt: Date.now()
    }

    this.mods.set(modId, mod)

    // Process dependencies
    if (mod.dependencies.length > 0) {
      this.dependencies.set(modId, new Set(mod.dependencies))
    }

    // Process conflicts
    if (mod.conflicts.length > 0) {
      this.conflicts.set(modId, new Set(mod.conflicts))
    }

    this.emit('modAdded', modId, mod)
    this.validateCompatibility()
  }

  /**
   * Remove a mod from the registry
   * @param {string} modId - Mod identifier to remove
   * @returns {boolean} - Whether the mod was removed
   */
  removeMod (modId) {
    if (!this.mods.has(modId)) {
      return false
    }

    const mod = this.mods.get(modId)
    this.mods.delete(modId)
    this.dependencies.delete(modId)
    this.conflicts.delete(modId)

    this.emit('modRemoved', modId, mod)
    this.validateCompatibility()
    return true
  }

  /**
   * Get mod information
   * @param {string} modId - Mod identifier
   * @returns {Object|null} - Mod information or null if not found
   */
  getMod (modId) {
    return this.mods.get(modId) || null
  }

  /**
   * Get all registered mods
   * @returns {Map<string, Object>} - Map of all mods
   */
  getAllMods () {
    return new Map(this.mods)
  }

  /**
   * Check if a mod is registered
   * @param {string} modId - Mod identifier
   * @returns {boolean} - Whether the mod is registered
   */
  hasMod (modId) {
    return this.mods.has(modId)
  }

  /**
   * Get mod count
   * @returns {number} - Number of registered mods
   */
  getModCount () {
    return this.mods.size
  }

  /**
   * Get mods by name pattern
   * @param {string|RegExp} pattern - Search pattern
   * @returns {Array<Object>} - Matching mods
   */
  findMods (pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
    const results = []

    for (const mod of this.mods.values()) {
      if (regex.test(mod.id) || regex.test(mod.name)) {
        results.push(mod)
      }
    }

    return results
  }

  /**
   * Validate mod compatibility and emit warnings
   * @returns {Object} - Comprehensive compatibility report
   */
  validateCompatibility () {
    // Use advanced compatibility checker
    const report = this.compatibilityChecker.checkCompatibility(this)
    
    // Emit legacy compatibility issues for backward compatibility
    const legacyIssues = this.convertToLegacyFormat(report)
    if (legacyIssues.length > 0) {
      this.emit('compatibilityIssues', legacyIssues)
    }
    
    return report
  }
  
  /**
   * Convert new compatibility report to legacy format
   * @param {Object} report - New format report
   * @returns {Array} - Legacy format issues
   */
  convertToLegacyFormat (report) {
    const legacyIssues = []
    
    // Convert issues
    report.issues.forEach(issue => {
      legacyIssues.push({
        type: issue.type,
        modId: issue.modId,
        dependency: issue.dependency,
        conflictWith: issue.conflictWith,
        message: issue.message
      })
    })
    
    // Convert critical warnings
    report.warnings.forEach(warning => {
      if (warning.severity === 'error') {
        legacyIssues.push({
          type: warning.type,
          modId: warning.modId,
          message: warning.message
        })
      }
    })
    
    return legacyIssues
  }

  /**
   * Add registry mapping for mod loader specific IDs
   * @param {string} registryType - Registry type (e.g., 'blocks', 'items')
   * @param {string} modId - Mod that owns the registry entries
   * @param {Map<number, string>} idMapping - Numeric ID to string identifier mapping
   */
  addRegistryMapping (registryType, modId, idMapping) {
    if (!this.registryMappings.has(registryType)) {
      this.registryMappings.set(registryType, new ModRegistryMapping(registryType))
    }

    const mapping = this.registryMappings.get(registryType)
    mapping.addModMapping(modId, idMapping)

    this.emit('registryMappingAdded', registryType, modId, idMapping)
  }

  /**
   * Get registry mapping for a type
   * @param {string} registryType - Registry type
   * @returns {ModRegistryMapping|null} - Registry mapping or null
   */
  getRegistryMapping (registryType) {
    return this.registryMappings.get(registryType) || null
  }

  /**
   * Resolve a numeric ID to string identifier
   * @param {string} registryType - Registry type
   * @param {number} numericId - Numeric ID
   * @returns {string|null} - String identifier or null if not found
   */
  resolveId (registryType, numericId) {
    const mapping = this.getRegistryMapping(registryType)
    return mapping ? mapping.resolve(numericId) : null
  }

  /**
   * Get detailed compatibility report
   * @returns {Object|null} - Latest compatibility report or null
   */
  getCompatibilityReport () {
    return this.lastCompatibilityReport
  }
  
  /**
   * Get compatibility status summary
   * @returns {Object} - Compatibility status
   */
  getCompatibilityStatus () {
    if (!this.lastCompatibilityReport) {
      return { status: 'unknown', message: 'No compatibility check performed' }
    }
    
    return this.compatibilityChecker.getCompatibilityStatus(this.lastCompatibilityReport)
  }
  
  /**
   * Format compatibility report as readable text
   * @returns {string} - Formatted report
   */
  formatCompatibilityReport () {
    if (!this.lastCompatibilityReport) {
      return 'No compatibility report available. Run validateCompatibility() first.'
    }
    
    return this.compatibilityChecker.formatReport(this.lastCompatibilityReport)
  }
  
  /**
   * Add known mod incompatibility
   * @param {string} modId - Primary mod ID
   * @param {Array<string>} incompatibleMods - Incompatible mod IDs
   * @param {string} [reason] - Reason for incompatibility
   */
  addIncompatibility (modId, incompatibleMods, reason = 'conflict') {
    this.compatibilityChecker.addIncompatibility(modId, incompatibleMods, reason)
  }
  
  /**
   * Mark mod as deprecated with alternatives
   * @param {string} modId - Deprecated mod ID
   * @param {Array<string>} alternatives - Alternative mod IDs
   */
  markAsDeprecated (modId, alternatives = []) {
    this.compatibilityChecker.addDeprecatedMod(modId, alternatives)
  }

  /**
   * Get statistics about the registry
   * @returns {Object} - Registry statistics
   */
  getStats () {
    const registryStats = {}
    for (const [type, mapping] of this.registryMappings) {
      registryStats[type] = mapping.getStats()
    }
    
    const stats = {
      totalMods: this.mods.size,
      totalDependencies: this.dependencies.size,
      totalConflicts: this.conflicts.size,
      registries: registryStats
    }
    
    // Add compatibility statistics if available
    if (this.lastCompatibilityReport) {
      stats.compatibility = {
        status: this.getCompatibilityStatus().status,
        critical: this.lastCompatibilityReport.summary.critical,
        errors: this.lastCompatibilityReport.summary.errors,
        warnings: this.lastCompatibilityReport.summary.warnings,
        lastCheck: new Date(this.lastCompatibilityReport.timestamp).toISOString()
      }
    }
    
    return stats
  }

  /**
   * Clear all registry data
   */
  clear () {
    this.mods.clear()
    this.dependencies.clear()
    this.conflicts.clear()
    this.versionRequirements.clear()
    this.registryMappings.clear()
    this.emit('cleared')
  }
}

/**
 * Registry mapping for a specific type (blocks, items, etc.)
 */
class ModRegistryMapping {
  constructor (type) {
    this.type = type
    this.modMappings = new Map() // modId -> Map<number, string>
    this.globalMapping = new Map() // number -> string (combined mapping)
    this.reverseMapping = new Map() // string -> number
  }

  /**
   * Add mapping for a specific mod
   * @param {string} modId - Mod identifier
   * @param {Map<number, string>} idMapping - ID mappings
   */
  addModMapping (modId, idMapping) {
    this.modMappings.set(modId, new Map(idMapping))
    
    // Update global mappings
    for (const [numericId, stringId] of idMapping) {
      this.globalMapping.set(numericId, stringId)
      this.reverseMapping.set(stringId, numericId)
    }
  }

  /**
   * Resolve numeric ID to string identifier
   * @param {number} numericId - Numeric ID
   * @returns {string|null} - String identifier or null
   */
  resolve (numericId) {
    return this.globalMapping.get(numericId) || null
  }

  /**
   * Resolve string identifier to numeric ID
   * @param {string} stringId - String identifier
   * @returns {number|null} - Numeric ID or null
   */
  reverseResolve (stringId) {
    return this.reverseMapping.get(stringId) || null
  }

  /**
   * Get mappings for a specific mod
   * @param {string} modId - Mod identifier
   * @returns {Map<number, string>|null} - Mod mappings or null
   */
  getModMapping (modId) {
    return this.modMappings.get(modId) || null
  }

  /**
   * Get all mappings
   * @returns {Map<number, string>} - All ID mappings
   */
  getAllMappings () {
    return new Map(this.globalMapping)
  }

  /**
   * Get statistics for this registry type
   * @returns {Object} - Registry statistics
   */
  getStats () {
    return {
      totalMods: this.modMappings.size,
      totalMappings: this.globalMapping.size,
      type: this.type
    }
  }

  /**
   * Clear all mappings
   */
  clear () {
    this.modMappings.clear()
    this.globalMapping.clear()
    this.reverseMapping.clear()
  }
}

module.exports = { ModRegistry, ModRegistryMapping }