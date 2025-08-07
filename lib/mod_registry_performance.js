/**
 * Performance-optimized mod registry with advanced caching and indexing
 * Provides significant performance improvements for large mod packs
 */

const { EventEmitter } = require('events')
const { ModCompatibilityChecker } = require('./mod_compatibility_checker')

/**
 * High-performance mod registry with advanced caching and indexing
 */
class OptimizedModRegistry extends EventEmitter {
  constructor (options = {}) {
    super()
    
    // Core data structures
    this.mods = new Map() // modId -> ModInfo
    this.dependencies = new Map() // modId -> Set of dependency modIds
    this.conflicts = new Map() // modId -> Set of conflicting modIds
    this.versionRequirements = new Map() // modId -> version requirements
    this.registryMappings = new Map() // registry type -> OptimizedModRegistryMapping
    
    // Performance optimization caches
    this.searchCache = new Map() // search pattern -> cached results
    this.dependencyCache = new Map() // modId -> resolved dependency tree
    this.compatibilityCache = new Map() // state hash -> compatibility report
    this.registryLookupCache = new Map() // registry:id -> resolved string
    
    // Search indices
    this.nameIndex = new Map() // normalized name -> Set of modIds
    this.tagIndex = new Map() // tag -> Set of modIds
    this.categoryIndex = new Map() // category -> Set of modIds
    this.authorIndex = new Map() // author -> Set of modIds
    
    // Performance metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      searchOperations: 0,
      registryLookups: 0,
      indexUpdates: 0
    }
    
    // Cache configuration
    this.config = {
      maxCacheSize: options.maxCacheSize || 1000,
      cacheExpiryMs: options.cacheExpiryMs || 300000, // 5 minutes
      enableMetrics: options.enableMetrics !== false,
      enableCompression: options.enableCompression || false,
      batchSize: options.batchSize || 100
    }
    
    // Initialize compatibility checker with performance options
    this.compatibilityChecker = new ModCompatibilityChecker(options)
    this.lastCompatibilityReport = null
    this.compatibilityStateHash = null
    
    // Cache cleanup interval
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupExpiredCaches()
    }, this.config.cacheExpiryMs)
    
    // Forward compatibility events
    this.compatibilityChecker.on('compatibilityReport', (report) => {
      this.lastCompatibilityReport = report
      this.emit('compatibilityReport', report)
    })
  }

  /**
   * Add a mod to the registry with performance optimizations
   * @param {string} modId - Unique mod identifier
   * @param {Object} modInfo - Mod information
   */
  addMod (modId, modInfo) {
    const startTime = this.config.enableMetrics ? performance.now() : 0
    
    // Prepare optimized mod object
    const optimizedMod = this.createOptimizedMod(modId, modInfo)
    
    // Store mod
    this.mods.set(modId, optimizedMod)
    
    // Update indices
    this.updateSearchIndices(modId, optimizedMod)
    
    // Process dependencies and conflicts
    if (optimizedMod.dependencies.length > 0) {
      this.dependencies.set(modId, new Set(optimizedMod.dependencies))
    }
    
    if (optimizedMod.conflicts.length > 0) {
      this.conflicts.set(modId, new Set(optimizedMod.conflicts))
    }
    
    // Clear related caches
    this.invalidateRelevantCaches(modId)
    
    // Update metrics
    if (this.config.enableMetrics) {
      this.metrics.indexUpdates++
      const duration = performance.now() - startTime
      if (duration > 10) { // Log slow operations
        console.debug(`Slow mod addition: ${modId} took ${duration.toFixed(2)}ms`)
      }
    }
    
    this.emit('modAdded', modId, optimizedMod)
    this.scheduleCompatibilityCheck()
  }
  
  /**
   * Create optimized mod object with computed properties
   */
  createOptimizedMod (modId, modInfo) {
    const mod = {
      id: modId,
      version: modInfo.version || 'unknown',
      name: modInfo.name || modId,
      dependencies: modInfo.dependencies || [],
      conflicts: modInfo.conflicts || [],
      metadata: modInfo.metadata || {},
      addedAt: Date.now(),
      
      // Computed optimization properties
      normalizedName: this.normalizeString(modInfo.name || modId),
      searchTerms: this.extractSearchTerms(modId, modInfo),
      tags: modInfo.tags || this.inferTags(modId, modInfo),
      category: modInfo.category || this.inferCategory(modId, modInfo),
      author: modInfo.author || this.inferAuthor(modId, modInfo),
      
      // Performance hints
      _searchScore: this.calculateSearchScore(modId, modInfo),
      _popularityScore: this.calculatePopularityScore(modId, modInfo)
    }
    
    return mod
  }
  
  /**
   * Update search indices for fast lookups
   */
  updateSearchIndices (modId, mod) {
    // Name index
    this.addToIndex(this.nameIndex, mod.normalizedName, modId)
    
    // Search terms index
    mod.searchTerms.forEach(term => {
      this.addToIndex(this.nameIndex, term, modId)
    })
    
    // Tag index
    if (mod.tags && mod.tags.length > 0) {
      mod.tags.forEach(tag => {
        this.addToIndex(this.tagIndex, tag, modId)
      })
    }
    
    // Category index
    if (mod.category) {
      this.addToIndex(this.categoryIndex, mod.category, modId)
    }
    
    // Author index
    if (mod.author) {
      this.addToIndex(this.authorIndex, mod.author, modId)
    }
  }
  
  /**
   * Helper to add to index maps
   */
  addToIndex (index, key, value) {
    if (!index.has(key)) {
      index.set(key, new Set())
    }
    index.get(key).add(value)
  }
  
  /**
   * High-performance mod search with caching and ranking
   * @param {string|RegExp} pattern - Search pattern
   * @param {Object} options - Search options
   * @returns {Array<Object>} - Ranked search results
   */
  findMods (pattern, options = {}) {
    const startTime = this.config.enableMetrics ? performance.now() : 0
    this.metrics.searchOperations++
    
    // Create cache key
    const cacheKey = this.createSearchCacheKey(pattern, options)
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey)
    if (cached && !this.isCacheExpired(cached)) {
      this.metrics.cacheHits++
      return cached.data
    }
    
    this.metrics.cacheMisses++
    
    // Perform optimized search
    const results = this.performOptimizedSearch(pattern, options)
    
    // Cache results
    this.searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
      accessCount: 1
    })
    
    // Cleanup cache if too large
    if (this.searchCache.size > this.config.maxCacheSize) {
      this.cleanupSearchCache()
    }
    
    if (this.config.enableMetrics) {
      const duration = performance.now() - startTime
      if (duration > 5) {
        console.debug(`Slow search: "${pattern}" took ${duration.toFixed(2)}ms`)
      }
    }
    
    return results
  }
  
  /**
   * Optimized search implementation using indices
   */
  performOptimizedSearch (pattern, options) {
    const {
      limit = Infinity,
      category = null,
      author = null,
      tags = null,
      sortBy = 'relevance',
      includeMetadata = false
    } = options
    
    let candidates = new Set()
    
    if (typeof pattern === 'string') {
      const normalizedPattern = this.normalizeString(pattern)
      
      // Use indices for exact matches first
      const exactMatches = this.nameIndex.get(normalizedPattern)
      if (exactMatches) {
        exactMatches.forEach(id => candidates.add(id))
      }
      
      // Fuzzy search through indices
      for (const [indexedTerm, modIds] of this.nameIndex) {
        if (indexedTerm.includes(normalizedPattern) || normalizedPattern.includes(indexedTerm)) {
          modIds.forEach(id => candidates.add(id))
        }
      }
    } else if (pattern instanceof RegExp) {
      // RegExp search - fall back to iteration but optimize
      for (const mod of this.mods.values()) {
        if (pattern.test(mod.id) || pattern.test(mod.name)) {
          candidates.add(mod.id)
        }
      }
    }
    
    // Filter by category, author, tags
    if (category && this.categoryIndex.has(category)) {
      candidates = this.intersectSets(candidates, this.categoryIndex.get(category))
    }
    
    if (author && this.authorIndex.has(author)) {
      candidates = this.intersectSets(candidates, this.authorIndex.get(author))
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      for (const tag of tagArray) {
        if (this.tagIndex.has(tag)) {
          candidates = this.intersectSets(candidates, this.tagIndex.get(tag))
        }
      }
    }
    
    // Convert to mod objects and rank
    let results = Array.from(candidates)
      .map(id => this.mods.get(id))
      .filter(Boolean)
    
    // Sort results
    results = this.sortSearchResults(results, sortBy, pattern)
    
    // Apply limit
    if (limit < results.length) {
      results = results.slice(0, limit)
    }
    
    // Add metadata if requested
    if (includeMetadata) {
      results = results.map(mod => ({
        ...mod,
        _searchMetadata: {
          score: mod._searchScore,
          popularity: mod._popularityScore
        }
      }))
    }
    
    return results
  }
  
  /**
   * Optimized registry ID resolution with multi-level caching
   */
  resolveId (registryType, numericId) {
    const startTime = this.config.enableMetrics ? performance.now() : 0
    this.metrics.registryLookups++
    
    // Create cache key
    const cacheKey = `${registryType}:${numericId}`
    
    // Check L1 cache (hot lookups)
    const cached = this.registryLookupCache.get(cacheKey)
    if (cached && !this.isCacheExpired(cached)) {
      this.metrics.cacheHits++
      cached.accessCount++
      return cached.data
    }
    
    this.metrics.cacheMisses++
    
    // Perform lookup
    const mapping = this.getRegistryMapping(registryType)
    const result = mapping ? mapping.resolve(numericId) : null
    
    // Cache result with usage tracking
    this.registryLookupCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      accessCount: 1
    })
    
    if (this.config.enableMetrics) {
      const duration = performance.now() - startTime
      if (duration > 1) {
        console.debug(`Slow registry lookup: ${cacheKey} took ${duration.toFixed(2)}ms`)
      }
    }
    
    return result
  }
  
  /**
   * Batch operations for better performance
   */
  async addModsBatch (modsArray) {
    const startTime = this.config.enableMetrics ? performance.now() : 0
    
    // Temporarily disable event emission for performance
    const originalEmit = this.emit
    const events = []
    
    this.emit = (event, ...args) => {
      events.push({ event, args })
    }
    
    try {
      // Process mods in batches
      for (let i = 0; i < modsArray.length; i += this.config.batchSize) {
        const batch = modsArray.slice(i, i + this.config.batchSize)
        batch.forEach(({ modId, modInfo }) => {
          this.addMod(modId, modInfo)
        })
        
        // Allow event loop breathing room for large batches
        if (batch.length === this.config.batchSize) {
          await new Promise(resolve => setImmediate(resolve))
        }
      }
    } finally {
      // Restore event emission
      this.emit = originalEmit
      
      // Emit buffered events
      events.forEach(({ event, args }) => {
        this.emit(event, ...args)
      })
    }
    
    if (this.config.enableMetrics) {
      const duration = performance.now() - startTime
      console.log(`Batch added ${modsArray.length} mods in ${duration.toFixed(2)}ms`)
    }
  }
  
  /**
   * Advanced compatibility validation with caching
   */
  validateCompatibility () {
    const stateHash = this.calculateStateHash()
    
    // Return cached report if state hasn't changed
    if (this.compatibilityStateHash === stateHash && this.lastCompatibilityReport) {
      return this.lastCompatibilityReport
    }
    
    // Check cache
    const cached = this.compatibilityCache.get(stateHash)
    if (cached && !this.isCacheExpired(cached)) {
      this.lastCompatibilityReport = cached.data
      this.compatibilityStateHash = stateHash
      return cached.data
    }
    
    // Perform expensive compatibility check
    const report = this.compatibilityChecker.checkCompatibility(this)
    
    // Cache result
    this.compatibilityCache.set(stateHash, {
      data: report,
      timestamp: Date.now()
    })
    
    this.lastCompatibilityReport = report
    this.compatibilityStateHash = stateHash
    
    // Emit legacy compatibility issues for backward compatibility
    const legacyIssues = this.convertToLegacyFormat(report)
    if (legacyIssues.length > 0) {
      this.emit('compatibilityIssues', legacyIssues)
    }
    
    return report
  }
  
  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics () {
    const memoryUsage = process.memoryUsage()
    
    return {
      ...this.metrics,
      cacheStats: {
        searchCacheSize: this.searchCache.size,
        registryLookupCacheSize: this.registryLookupCache.size,
        compatibilityCacheSize: this.compatibilityCache.size,
        totalCacheEntries: this.getTotalCacheEntries()
      },
      indexStats: {
        nameIndexSize: this.nameIndex.size,
        tagIndexSize: this.tagIndex.size,
        categoryIndexSize: this.categoryIndex.size,
        authorIndexSize: this.authorIndex.size,
        totalIndexedTerms: this.getTotalIndexedTerms()
      },
      memoryStats: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      hitRatio: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses),
      averageSearchTime: this.calculateAverageSearchTime()
    }
  }
  
  // Helper methods for optimization
  
  normalizeString (str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '')
  }
  
  extractSearchTerms (modId, modInfo) {
    const terms = new Set()
    
    // Add variations of mod ID
    terms.add(this.normalizeString(modId))
    if (modId.includes('_')) {
      modId.split('_').forEach(part => terms.add(this.normalizeString(part)))
    }
    
    // Add name variations
    if (modInfo.name) {
      terms.add(this.normalizeString(modInfo.name))
      modInfo.name.split(/[\s_-]+/).forEach(word => terms.add(this.normalizeString(word)))
    }
    
    return Array.from(terms)
  }
  
  inferTags (modId, modInfo) {
    const tags = []
    
    // Common mod categories
    if (modId.match(/thermal|tech|industrial|mekanism|applied/i)) {
      tags.push('technology', 'machinery')
    }
    if (modId.match(/biome|world|dimension|terrain/i)) {
      tags.push('world-generation', 'biomes')
    }
    if (modId.match(/jei|nei|waila|journey/i)) {
      tags.push('utility', 'interface')
    }
    
    return tags
  }
  
  inferCategory (modId, modInfo) {
    if (modId.match(/thermal|tech|industrial|mekanism|applied/i)) return 'technology'
    if (modId.match(/biome|world|dimension/i)) return 'world-gen'
    if (modId.match(/jei|nei|waila|journey/i)) return 'utility'
    if (modId.match(/tinker|craft|recipe/i)) return 'crafting'
    return 'misc'
  }
  
  inferAuthor (modId, modInfo) {
    // Common author patterns
    const authorPatterns = {
      thermal: 'TeamCoFH',
      enderio: 'CrazyPants',
      applied: 'AlgorithmX2',
      tinker: 'mDiyo',
      jei: 'mezz'
    }
    
    for (const [pattern, author] of Object.entries(authorPatterns)) {
      if (modId.includes(pattern)) return author
    }
    
    return null
  }
  
  calculateSearchScore (modId, modInfo) {
    let score = 0
    
    // Popularity indicators
    if (modInfo.downloads) score += Math.log10(modInfo.downloads)
    if (modInfo.endorsements) score += modInfo.endorsements / 100
    
    // Name quality
    if (modInfo.name && modInfo.name !== modId) score += 10
    
    return score
  }
  
  calculatePopularityScore (modId, modInfo) {
    // Simple popularity heuristic
    const popularMods = ['jei', 'thermal', 'enderio', 'applied', 'botania']
    return popularMods.some(mod => modId.includes(mod)) ? 100 : 0
  }
  
  createSearchCacheKey (pattern, options) {
    return JSON.stringify({ pattern: pattern.toString(), options })
  }
  
  intersectSets (set1, set2) {
    const intersection = new Set()
    for (const item of set1) {
      if (set2.has(item)) {
        intersection.add(item)
      }
    }
    return intersection
  }
  
  sortSearchResults (results, sortBy, pattern) {
    switch (sortBy) {
      case 'popularity':
        return results.sort((a, b) => b._popularityScore - a._popularityScore)
      case 'name':
        return results.sort((a, b) => a.name.localeCompare(b.name))
      case 'relevance':
      default:
        return results.sort((a, b) => {
          // Exact matches first
          if (typeof pattern === 'string') {
            const aExact = a.id === pattern || a.name === pattern
            const bExact = b.id === pattern || b.name === pattern
            if (aExact !== bExact) return bExact - aExact
          }
          
          // Then by search score
          return b._searchScore - a._searchScore
        })
    }
  }
  
  isCacheExpired (cached) {
    return Date.now() - cached.timestamp > this.config.cacheExpiryMs
  }
  
  invalidateRelevantCaches (modId) {
    // Clear search caches that might include this mod
    const keysToDelete = []
    for (const key of this.searchCache.keys()) {
      if (key.includes(modId) || key.includes('all')) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.searchCache.delete(key))
    
    // Clear compatibility cache
    this.compatibilityCache.clear()
    this.compatibilityStateHash = null
  }
  
  scheduleCompatibilityCheck () {
    // Debounce compatibility checks
    if (this.compatibilityCheckTimeout) {
      clearTimeout(this.compatibilityCheckTimeout)
    }
    
    this.compatibilityCheckTimeout = setTimeout(() => {
      if (this.mods.size > 1) {
        const report = this.validateCompatibility()
        if (report.summary.critical > 0 || report.summary.errors > 0) {
          this.emit('compatibilityIssuesDetected', report)
        }
      }
    }, 100) // 100ms debounce
  }
  
  calculateStateHash () {
    // Simple hash of mod IDs and versions
    const state = Array.from(this.mods.entries())
      .map(([id, mod]) => `${id}:${mod.version}`)
      .sort()
      .join('|')
    
    return this.simpleHash(state)
  }
  
  simpleHash (str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }
  
  cleanupExpiredCaches () {
    const now = Date.now()
    
    // Cleanup search cache
    for (const [key, cached] of this.searchCache) {
      if (now - cached.timestamp > this.config.cacheExpiryMs) {
        this.searchCache.delete(key)
      }
    }
    
    // Cleanup registry lookup cache
    for (const [key, cached] of this.registryLookupCache) {
      if (now - cached.timestamp > this.config.cacheExpiryMs) {
        this.registryLookupCache.delete(key)
      }
    }
    
    // Cleanup compatibility cache
    for (const [key, cached] of this.compatibilityCache) {
      if (now - cached.timestamp > this.config.cacheExpiryMs) {
        this.compatibilityCache.delete(key)
      }
    }
  }
  
  cleanupSearchCache () {
    // Remove least recently used entries
    const entries = Array.from(this.searchCache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
    
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.2))
    toRemove.forEach(([key]) => this.searchCache.delete(key))
  }
  
  getTotalCacheEntries () {
    return this.searchCache.size + this.registryLookupCache.size + this.compatibilityCache.size
  }
  
  getTotalIndexedTerms () {
    return this.nameIndex.size + this.tagIndex.size + this.categoryIndex.size + this.authorIndex.size
  }
  
  calculateAverageSearchTime () {
    // This would require tracking search times - simplified here
    return this.metrics.cacheMisses > 0 ? this.metrics.cacheMisses / this.metrics.searchOperations * 5 : 0
  }
  
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
  
  // Implement remaining interface methods with optimizations...
  
  removeMod (modId) {
    if (!this.mods.has(modId)) {
      return false
    }

    const mod = this.mods.get(modId)
    this.mods.delete(modId)
    this.dependencies.delete(modId)
    this.conflicts.delete(modId)
    
    // Remove from indices
    this.removeFromIndices(modId, mod)
    
    // Invalidate caches
    this.invalidateRelevantCaches(modId)

    this.emit('modRemoved', modId, mod)
    this.scheduleCompatibilityCheck()
    return true
  }
  
  removeFromIndices (modId, mod) {
    // Remove from name index
    this.removeFromIndex(this.nameIndex, mod.normalizedName, modId)
    mod.searchTerms.forEach(term => {
      this.removeFromIndex(this.nameIndex, term, modId)
    })
    
    // Remove from other indices
    if (mod.tags) {
      mod.tags.forEach(tag => this.removeFromIndex(this.tagIndex, tag, modId))
    }
    if (mod.category) {
      this.removeFromIndex(this.categoryIndex, mod.category, modId)
    }
    if (mod.author) {
      this.removeFromIndex(this.authorIndex, mod.author, modId)
    }
  }
  
  removeFromIndex (index, key, value) {
    const set = index.get(key)
    if (set) {
      set.delete(value)
      if (set.size === 0) {
        index.delete(key)
      }
    }
  }
  
  getMod (modId) {
    return this.mods.get(modId) || null
  }
  
  getAllMods () {
    return new Map(this.mods)
  }
  
  hasMod (modId) {
    return this.mods.has(modId)
  }
  
  getModCount () {
    return this.mods.size
  }
  
  // Registry mapping methods remain similar but with caching
  addRegistryMapping (registryType, modId, idMapping) {
    if (!this.registryMappings.has(registryType)) {
      this.registryMappings.set(registryType, new OptimizedModRegistryMapping(registryType))
    }

    const mapping = this.registryMappings.get(registryType)
    mapping.addModMapping(modId, idMapping)

    // Clear related registry cache
    for (const key of this.registryLookupCache.keys()) {
      if (key.startsWith(registryType + ':')) {
        this.registryLookupCache.delete(key)
      }
    }

    this.emit('registryMappingAdded', registryType, modId, idMapping)
  }
  
  getRegistryMapping (registryType) {
    return this.registryMappings.get(registryType) || null
  }
  
  // Compatibility methods with caching
  getCompatibilityReport () {
    return this.lastCompatibilityReport
  }
  
  getCompatibilityStatus () {
    if (!this.lastCompatibilityReport) {
      return { status: 'unknown', message: 'No compatibility check performed' }
    }
    
    return this.compatibilityChecker.getCompatibilityStatus(this.lastCompatibilityReport)
  }
  
  formatCompatibilityReport () {
    if (!this.lastCompatibilityReport) {
      return 'No compatibility report available. Run validateCompatibility() first.'
    }
    
    return this.compatibilityChecker.formatReport(this.lastCompatibilityReport)
  }
  
  addIncompatibility (modId, incompatibleMods, reason = 'conflict') {
    this.compatibilityChecker.addIncompatibility(modId, incompatibleMods, reason)
    this.compatibilityStateHash = null // Invalidate compatibility cache
  }
  
  markAsDeprecated (modId, alternatives = []) {
    this.compatibilityChecker.addDeprecatedMod(modId, alternatives)
    this.compatibilityStateHash = null // Invalidate compatibility cache
  }
  
  getStats () {
    const registryStats = {}
    for (const [type, mapping] of this.registryMappings) {
      registryStats[type] = mapping.getStats()
    }
    
    const stats = {
      totalMods: this.mods.size,
      totalDependencies: this.dependencies.size,
      totalConflicts: this.conflicts.size,
      registries: registryStats,
      performance: this.getPerformanceMetrics()
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
  
  clear () {
    this.mods.clear()
    this.dependencies.clear()
    this.conflicts.clear()
    this.versionRequirements.clear()
    this.registryMappings.clear()
    
    // Clear caches and indices
    this.searchCache.clear()
    this.registryLookupCache.clear()
    this.compatibilityCache.clear()
    this.nameIndex.clear()
    this.tagIndex.clear()
    this.categoryIndex.clear()
    this.authorIndex.clear()
    
    this.lastCompatibilityReport = null
    this.compatibilityStateHash = null
    
    this.emit('cleared')
  }
  
  destroy () {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval)
    }
    if (this.compatibilityCheckTimeout) {
      clearTimeout(this.compatibilityCheckTimeout)
    }
    this.clear()
  }
}

/**
 * Optimized registry mapping with enhanced caching
 */
class OptimizedModRegistryMapping {
  constructor (type) {
    this.type = type
    this.modMappings = new Map() // modId -> Map<number, string>
    this.globalMapping = new Map() // number -> string (combined mapping)
    this.reverseMapping = new Map() // string -> number
    
    // Optimization: frequently accessed entries cache
    this.hotCache = new Map() // Recently accessed mappings
    this.hotCacheMaxSize = 100
    
    // Statistics
    this.stats = {
      lookups: 0,
      cacheHits: 0,
      lastAccessed: new Map() // id -> timestamp
    }
  }

  addModMapping (modId, idMapping) {
    this.modMappings.set(modId, new Map(idMapping))
    
    // Update global mappings
    for (const [numericId, stringId] of idMapping) {
      this.globalMapping.set(numericId, stringId)
      this.reverseMapping.set(stringId, numericId)
    }
    
    // Clear hot cache when mappings change
    this.hotCache.clear()
  }

  resolve (numericId) {
    this.stats.lookups++
    
    // Check hot cache first
    if (this.hotCache.has(numericId)) {
      this.stats.cacheHits++
      this.stats.lastAccessed.set(numericId, Date.now())
      return this.hotCache.get(numericId)
    }
    
    // Resolve from main mapping
    const result = this.globalMapping.get(numericId) || null
    
    // Add to hot cache if found
    if (result !== null) {
      this.addToHotCache(numericId, result)
    }
    
    return result
  }

  reverseResolve (stringId) {
    return this.reverseMapping.get(stringId) || null
  }
  
  addToHotCache (key, value) {
    // Manage hot cache size
    if (this.hotCache.size >= this.hotCacheMaxSize) {
      // Remove least recently used
      let oldestKey = null
      let oldestTime = Date.now()
      
      for (const [k] of this.hotCache) {
        const lastAccess = this.stats.lastAccessed.get(k) || 0
        if (lastAccess < oldestTime) {
          oldestTime = lastAccess
          oldestKey = k
        }
      }
      
      if (oldestKey !== null) {
        this.hotCache.delete(oldestKey)
        this.stats.lastAccessed.delete(oldestKey)
      }
    }
    
    this.hotCache.set(key, value)
    this.stats.lastAccessed.set(key, Date.now())
  }

  getModMapping (modId) {
    return this.modMappings.get(modId) || null
  }

  getAllMappings () {
    return new Map(this.globalMapping)
  }

  getStats () {
    return {
      totalMods: this.modMappings.size,
      totalMappings: this.globalMapping.size,
      type: this.type,
      performance: {
        lookups: this.stats.lookups,
        cacheHits: this.stats.cacheHits,
        hitRatio: this.stats.lookups > 0 ? this.stats.cacheHits / this.stats.lookups : 0,
        hotCacheSize: this.hotCache.size
      }
    }
  }

  clear () {
    this.modMappings.clear()
    this.globalMapping.clear()
    this.reverseMapping.clear()
    this.hotCache.clear()
    this.stats.lastAccessed.clear()
  }
}

module.exports = { 
  OptimizedModRegistry, 
  OptimizedModRegistryMapping 
}