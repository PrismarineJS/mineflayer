/**
 * Advanced mod compatibility checking and warnings system
 * Provides comprehensive analysis of mod dependencies, conflicts, and compatibility issues
 */

const { EventEmitter } = require('events')

/**
 * Compatibility issue types with severity levels
 */
const IssueType = {
  MISSING_DEPENDENCY: 'missing_dependency',
  VERSION_MISMATCH: 'version_mismatch',
  MOD_CONFLICT: 'mod_conflict',
  CIRCULAR_DEPENDENCY: 'circular_dependency',
  INCOMPATIBLE_VERSIONS: 'incompatible_versions',
  OPTIONAL_DEPENDENCY: 'optional_dependency',
  DEPRECATED_MOD: 'deprecated_mod',
  UNKNOWN_DEPENDENCY: 'unknown_dependency'
}

const Severity = {
  CRITICAL: 'critical',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info'
}

/**
 * Comprehensive mod compatibility checker
 */
class ModCompatibilityChecker extends EventEmitter {
  constructor (options = {}) {
    super()
    this.options = {
      strictMode: options.strictMode || false,
      checkVersionCompatibility: options.checkVersionCompatibility !== false,
      allowOptionalDependencies: options.allowOptionalDependencies !== false,
      warnAboutDeprecated: options.warnAboutDeprecated !== false,
      maxCircularDepthCheck: options.maxCircularDepthCheck || 10,
      ...options
    }
    
    this.knownIncompatibilities = new Map() // modId -> Set of incompatible mod IDs
    this.versionRules = new Map() // modId -> version compatibility rules
    this.deprecatedMods = new Set() // deprecated mod IDs
    this.alternativeRecommendations = new Map() // deprecated/problematic mod -> recommended alternatives
    
    this.initializeKnownIncompatibilities()
  }

  /**
   * Initialize known mod incompatibilities and deprecations
   */
  initializeKnownIncompatibilities () {
    // Common known incompatibilities in Forge ecosystem
    this.addIncompatibility('optifine', ['sodium', 'phosphor', 'lithium'])
    this.addIncompatibility('thermal_foundation', ['immersive_engineering'], 'version_specific')
    
    // Deprecated mods with alternatives
    this.addDeprecatedMod('endercore', ['enderio_core'])
    this.addDeprecatedMod('codechickencore', ['codechicken_lib'])
    
    // Version compatibility rules
    this.addVersionRule('forge', {
      minecraft: {
        '1.20.1': ['47.0.0', '47.3.0'],
        '1.19.2': ['43.0.0', '43.4.0'],
        '1.18.2': ['40.0.0', '40.2.0']
      }
    })
  }

  /**
   * Add known incompatibility between mods
   * @param {string} modId - Primary mod ID
   * @param {Array<string>} incompatibleMods - Array of incompatible mod IDs
   * @param {string} [reason] - Reason for incompatibility
   */
  addIncompatibility (modId, incompatibleMods, reason = 'conflict') {
    if (!this.knownIncompatibilities.has(modId)) {
      this.knownIncompatibilities.set(modId, new Map())
    }
    
    const conflicts = this.knownIncompatibilities.get(modId)
    incompatibleMods.forEach(incompatibleId => {
      conflicts.set(incompatibleId, reason)
    })
  }

  /**
   * Add deprecated mod with alternatives
   * @param {string} modId - Deprecated mod ID
   * @param {Array<string>} alternatives - Alternative mod IDs
   */
  addDeprecatedMod (modId, alternatives = []) {
    this.deprecatedMods.add(modId)
    if (alternatives.length > 0) {
      this.alternativeRecommendations.set(modId, alternatives)
    }
  }

  /**
   * Add version compatibility rule
   * @param {string} modId - Mod ID
   * @param {Object} rules - Version compatibility rules
   */
  addVersionRule (modId, rules) {
    this.versionRules.set(modId, rules)
  }

  /**
   * Perform comprehensive compatibility check on mod registry
   * @param {ModRegistry} modRegistry - Mod registry to check
   * @returns {Object} - Detailed compatibility report
   */
  checkCompatibility (modRegistry) {
    const report = {
      timestamp: Date.now(),
      totalMods: modRegistry.getModCount(),
      issues: [],
      warnings: [],
      recommendations: [],
      summary: {
        critical: 0,
        errors: 0,
        warnings: 0,
        info: 0
      }
    }

    // Get all mods for analysis
    const allMods = modRegistry.getAllMods()

    // 1. Check missing dependencies
    this.checkMissingDependencies(allMods, report)

    // 2. Check version compatibility
    if (this.options.checkVersionCompatibility) {
      this.checkVersionCompatibility(allMods, report)
    }

    // 3. Check mod conflicts
    this.checkModConflicts(allMods, report)

    // 4. Check circular dependencies
    this.checkCircularDependencies(allMods, report)

    // 5. Check known incompatibilities
    this.checkKnownIncompatibilities(allMods, report)

    // 6. Check deprecated mods
    if (this.options.warnAboutDeprecated) {
      this.checkDeprecatedMods(allMods, report)
    }

    // 7. Generate recommendations
    this.generateRecommendations(allMods, report)

    // Calculate summary
    this.calculateSummary(report)

    // Emit compatibility report
    this.emit('compatibilityReport', report)

    return report
  }

  /**
   * Check for missing dependencies
   */
  checkMissingDependencies (allMods, report) {
    for (const [modId, mod] of allMods) {
      if (!mod.dependencies || mod.dependencies.length === 0) continue

      for (const dep of mod.dependencies) {
        const depId = this.extractModId(dep)
        const isOptional = this.isOptionalDependency(dep)
        
        if (!allMods.has(depId)) {
          const issue = {
            type: isOptional ? IssueType.OPTIONAL_DEPENDENCY : IssueType.MISSING_DEPENDENCY,
            severity: isOptional ? Severity.WARNING : Severity.ERROR,
            modId,
            dependency: depId,
            optional: isOptional,
            message: isOptional
              ? `Optional dependency '${depId}' is missing for mod '${modId}'`
              : `Required dependency '${depId}' is missing for mod '${modId}'`,
            suggestions: this.getDependencySuggestions(depId)
          }
          
          if (isOptional) {
            report.warnings.push(issue)
          } else {
            report.issues.push(issue)
          }
        }
      }
    }
  }

  /**
   * Check version compatibility between mods
   */
  checkVersionCompatibility (allMods, report) {
    for (const [modId, mod] of allMods) {
      // Check against version rules
      if (this.versionRules.has(modId)) {
        const rules = this.versionRules.get(modId)
        this.validateVersionRules(mod, rules, report)
      }

      // Check dependency version requirements
      if (mod.dependencies) {
        for (const dep of mod.dependencies) {
          const { modId: depId, versionRange } = this.parseDependency(dep)
          if (versionRange && allMods.has(depId)) {
            const depMod = allMods.get(depId)
            if (!this.isVersionCompatible(depMod.version, versionRange)) {
              report.issues.push({
                type: IssueType.VERSION_MISMATCH,
                severity: Severity.ERROR,
                modId,
                dependency: depId,
                requiredVersion: versionRange,
                actualVersion: depMod.version,
                message: `Mod '${modId}' requires '${depId}' version ${versionRange}, but ${depMod.version} is installed`
              })
            }
          }
        }
      }
    }
  }

  /**
   * Check for mod conflicts
   */
  checkModConflicts (allMods, report) {
    for (const [modId, mod] of allMods) {
      if (!mod.conflicts || mod.conflicts.length === 0) continue

      for (const conflictId of mod.conflicts) {
        if (allMods.has(conflictId)) {
          report.issues.push({
            type: IssueType.MOD_CONFLICT,
            severity: Severity.CRITICAL,
            modId,
            conflictWith: conflictId,
            message: `Mod '${modId}' conflicts with '${conflictId}'`,
            suggestions: [`Remove either '${modId}' or '${conflictId}' to resolve conflict`]
          })
        }
      }
    }
  }

  /**
   * Check for circular dependencies
   */
  checkCircularDependencies (allMods, report) {
    const visited = new Set()
    const recursionStack = new Set()

    for (const modId of allMods.keys()) {
      if (!visited.has(modId)) {
        const cycle = this.findCircularDependency(modId, allMods, visited, recursionStack, [])
        if (cycle.length > 0) {
          report.issues.push({
            type: IssueType.CIRCULAR_DEPENDENCY,
            severity: Severity.ERROR,
            cycle,
            message: `Circular dependency detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
            suggestions: ['Review mod dependencies and break the circular chain']
          })
        }
      }
    }
  }

  /**
   * Check for known incompatibilities
   */
  checkKnownIncompatibilities (allMods, report) {
    for (const [modId, mod] of allMods) {
      if (!this.knownIncompatibilities.has(modId)) continue

      const incompatibilities = this.knownIncompatibilities.get(modId)
      for (const [incompatibleId, reason] of incompatibilities) {
        if (allMods.has(incompatibleId)) {
          report.issues.push({
            type: IssueType.INCOMPATIBLE_VERSIONS,
            severity: Severity.CRITICAL,
            modId,
            conflictWith: incompatibleId,
            reason,
            message: `Known incompatibility: '${modId}' cannot run with '${incompatibleId}' (${reason})`,
            suggestions: [`Remove either '${modId}' or '${incompatibleId}'`]
          })
        }
      }
    }
  }

  /**
   * Check for deprecated mods
   */
  checkDeprecatedMods (allMods, report) {
    for (const [modId, mod] of allMods) {
      if (this.deprecatedMods.has(modId)) {
        const alternatives = this.alternativeRecommendations.get(modId) || []
        report.warnings.push({
          type: IssueType.DEPRECATED_MOD,
          severity: Severity.WARNING,
          modId,
          message: `Mod '${modId}' is deprecated`,
          suggestions: alternatives.length > 0
            ? [`Consider replacing with: ${alternatives.join(', ')}`]
            : ['Consider finding a more modern alternative']
        })
      }
    }
  }

  /**
   * Generate compatibility recommendations
   */
  generateRecommendations (allMods, report) {
    const recommendations = []

    // Recommend performance mods
    const hasOptifine = allMods.has('optifine')
    const hasModernPerformanceMods = ['sodium', 'lithium', 'phosphor'].some(mod => allMods.has(mod))
    
    if (!hasOptifine && !hasModernPerformanceMods) {
      recommendations.push({
        type: 'performance_optimization',
        message: 'Consider adding performance optimization mods',
        suggestions: ['Sodium (rendering)', 'Lithium (general)', 'Phosphor (lighting)']
      })
    }

    // Recommend utility mods
    if (!allMods.has('jei') && !allMods.has('rei') && allMods.size > 5) {
      recommendations.push({
        type: 'utility_recommendation',
        message: 'Consider adding a recipe viewer for complex modpacks',
        suggestions: ['JEI (Just Enough Items)', 'REI (Roughly Enough Items)']
      })
    }

    report.recommendations.push(...recommendations)
  }

  /**
   * Find circular dependency using DFS
   */
  findCircularDependency (modId, allMods, visited, recursionStack, path) {
    visited.add(modId)
    recursionStack.add(modId)
    path.push(modId)

    const mod = allMods.get(modId)
    if (mod && mod.dependencies) {
      for (const dep of mod.dependencies) {
        const depId = this.extractModId(dep)
        
        if (!visited.has(depId)) {
          const cycle = this.findCircularDependency(depId, allMods, visited, recursionStack, [...path])
          if (cycle.length > 0) return cycle
        } else if (recursionStack.has(depId)) {
          // Found cycle
          const cycleStart = path.indexOf(depId)
          return path.slice(cycleStart)
        }
      }
    }

    recursionStack.delete(modId)
    return []
  }

  /**
   * Extract mod ID from dependency string
   */
  extractModId (dependency) {
    if (typeof dependency === 'object' && dependency.id) {
      return dependency.id
    }
    if (typeof dependency === 'string') {
      // Handle format like "modid@version" or "modid:version"
      return dependency.split(/[@:]/)[0]
    }
    return dependency
  }

  /**
   * Check if dependency is optional
   */
  isOptionalDependency (dependency) {
    if (typeof dependency === 'object') {
      return dependency.optional === true || dependency.required === false
    }
    if (typeof dependency === 'string') {
      return dependency.startsWith('?') || dependency.includes('optional')
    }
    return false
  }

  /**
   * Parse dependency string to extract mod ID and version range
   */
  parseDependency (dependency) {
    if (typeof dependency === 'object') {
      return {
        modId: dependency.id || dependency.modId,
        versionRange: dependency.version || dependency.versionRange
      }
    }

    if (typeof dependency === 'string') {
      const parts = dependency.split(/[@:]/)
      return {
        modId: parts[0],
        versionRange: parts[1] || null
      }
    }

    return { modId: dependency, versionRange: null }
  }

  /**
   * Check if version is compatible with range
   */
  isVersionCompatible (version, versionRange) {
    if (!versionRange) return true

    // Simple version comparison - can be enhanced with semver
    try {
      if (versionRange.includes('-')) {
        const [min, max] = versionRange.split('-')
        return this.compareVersions(version, min) >= 0 && 
               this.compareVersions(version, max) <= 0
      } else if (versionRange.startsWith('>=')) {
        return this.compareVersions(version, versionRange.slice(2)) >= 0
      } else if (versionRange.startsWith('>')) {
        return this.compareVersions(version, versionRange.slice(1)) > 0
      } else if (versionRange.startsWith('<=')) {
        return this.compareVersions(version, versionRange.slice(2)) <= 0
      } else if (versionRange.startsWith('<')) {
        return this.compareVersions(version, versionRange.slice(1)) < 0
      } else {
        return version === versionRange
      }
    } catch (err) {
      return true // Default to compatible if parsing fails
    }
  }

  /**
   * Compare two version strings
   * @returns {number} - -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions (v1, v2) {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    const maxLength = Math.max(parts1.length, parts2.length)

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      
      if (part1 < part2) return -1
      if (part1 > part2) return 1
    }
    
    return 0
  }

  /**
   * Validate mod against version rules
   */
  validateVersionRules (mod, rules, report) {
    // Implementation depends on rule structure
    // This is a placeholder for complex version validation
  }

  /**
   * Get suggestions for missing dependency
   */
  getDependencySuggestions (depId) {
    const suggestions = []
    
    if (this.alternativeRecommendations.has(depId)) {
      suggestions.push(`Try alternatives: ${this.alternativeRecommendations.get(depId).join(', ')}`)
    }
    
    suggestions.push(`Download '${depId}' from CurseForge or Modrinth`)
    suggestions.push(`Check if '${depId}' is included in another mod`)
    
    return suggestions
  }

  /**
   * Calculate issue summary
   */
  calculateSummary (report) {
    report.issues.forEach(issue => {
      report.summary[issue.severity]++
    })
    
    report.warnings.forEach(warning => {
      report.summary[warning.severity]++
    })
  }

  /**
   * Get human-readable compatibility status
   */
  getCompatibilityStatus (report) {
    if (report.summary.critical > 0) {
      return { status: 'incompatible', message: 'Critical compatibility issues detected' }
    } else if (report.summary.errors > 0) {
      return { status: 'problematic', message: 'Compatibility errors detected' }
    } else if (report.summary.warnings > 0) {
      return { status: 'compatible_with_warnings', message: 'Compatible with warnings' }
    } else {
      return { status: 'fully_compatible', message: 'All mods are compatible' }
    }
  }

  /**
   * Export compatibility report as formatted text
   */
  formatReport (report) {
    let output = `\n=== MOD COMPATIBILITY REPORT ===\n`
    output += `Generated: ${new Date(report.timestamp).toISOString()}\n`
    output += `Total Mods: ${report.totalMods}\n`
    
    const status = this.getCompatibilityStatus(report)
    output += `Status: ${status.status} - ${status.message}\n\n`

    if (report.issues.length > 0) {
      output += `CRITICAL ISSUES (${report.issues.length}):\n`
      report.issues.forEach((issue, i) => {
        output += `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}\n`
        if (issue.suggestions) {
          issue.suggestions.forEach(suggestion => output += `   → ${suggestion}\n`)
        }
      })
      output += '\n'
    }

    if (report.warnings.length > 0) {
      output += `WARNINGS (${report.warnings.length}):\n`
      report.warnings.forEach((warning, i) => {
        output += `${i + 1}. [${warning.severity.toUpperCase()}] ${warning.message}\n`
        if (warning.suggestions) {
          warning.suggestions.forEach(suggestion => output += `   → ${suggestion}\n`)
        }
      })
      output += '\n'
    }

    if (report.recommendations.length > 0) {
      output += `RECOMMENDATIONS (${report.recommendations.length}):\n`
      report.recommendations.forEach((rec, i) => {
        output += `${i + 1}. ${rec.message}\n`
        if (rec.suggestions) {
          rec.suggestions.forEach(suggestion => output += `   → ${suggestion}\n`)
        }
      })
    }

    return output
  }
}

module.exports = {
  ModCompatibilityChecker,
  IssueType,
  Severity
}