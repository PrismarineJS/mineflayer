/**
 * Forge mod data parsing utilities
 * Handles parsing of mod metadata, dependencies, and version information
 */

/**
 * Parse Forge mod metadata from various sources
 */
class ForgeModParser {
  constructor () {
    this.knownForgeVersions = [
      '47.3.0', '47.2.0', '47.1.0', // 1.21.1
      '51.0.0', '50.1.0', '50.0.0', // 1.21
      '49.1.0', '49.0.0', // 1.20.6
      '48.1.0', '48.0.0', // 1.20.5
      '47.3.0', '47.2.0', '47.1.0', // 1.20.4
      '46.0.0', // 1.20.2
      '45.2.0', '45.1.0', '45.0.0' // 1.20.1
    ]
  }

  /**
   * Parse mod list data from handshake packet
   * @param {Buffer} data - Raw packet data
   * @returns {Object} - Parsed mod list
   */
  parseModListPacket (data) {
    const result = {
      mods: [],
      forgeVersion: null,
      modCount: 0,
      errors: []
    }

    try {
      let offset = 0
      
      // Read mod count
      if (data.length < 4) {
        result.errors.push('Packet too short for mod count')
        return result
      }
      
      const modCount = data.readUInt32BE(offset)
      offset += 4
      result.modCount = modCount

      // Parse each mod
      for (let i = 0; i < modCount && offset < data.length; i++) {
        try {
          const mod = this.parseModEntry(data, offset)
          if (mod.mod) {
            result.mods.push(mod.mod)
            offset = mod.nextOffset
            
            // Check if this is Forge itself
            if (mod.mod.id === 'forge' || mod.mod.id === 'minecraft_forge') {
              result.forgeVersion = mod.mod.version
            }
          } else {
            result.errors.push(`Failed to parse mod ${i + 1}`)
            break
          }
        } catch (err) {
          result.errors.push(`Error parsing mod ${i + 1}: ${err.message}`)
          break
        }
      }

      // Validate parsed mods
      this.validateModList(result)

    } catch (err) {
      result.errors.push(`Failed to parse mod list: ${err.message}`)
    }

    return result
  }

  /**
   * Parse individual mod entry from packet data
   * @param {Buffer} data - Packet data
   * @param {number} offset - Current offset
   * @returns {Object} - Parsed mod and next offset
   */
  parseModEntry (data, offset) {
    const result = { mod: null, nextOffset: offset }

    // Read mod ID length
    if (offset + 2 > data.length) {
      throw new Error('Not enough data for mod ID length')
    }
    
    const idLength = data.readUInt16BE(offset)
    offset += 2

    // Read mod ID
    if (offset + idLength > data.length) {
      throw new Error('Not enough data for mod ID')
    }
    
    const modId = data.slice(offset, offset + idLength).toString('utf8')
    offset += idLength

    // Read version length
    if (offset + 2 > data.length) {
      throw new Error('Not enough data for version length')
    }
    
    const versionLength = data.readUInt16BE(offset)
    offset += 2

    // Read version
    if (offset + versionLength > data.length) {
      throw new Error('Not enough data for version')
    }
    
    const version = data.slice(offset, offset + versionLength).toString('utf8')
    offset += versionLength

    // Parse additional metadata if present (newer Forge versions)
    const metadata = this.parseModMetadata(data, offset)
    offset = metadata.nextOffset

    result.mod = {
      id: modId,
      version: version,
      name: this.inferModName(modId),
      ...metadata.data
    }

    result.nextOffset = offset
    return result
  }

  /**
   * Parse additional mod metadata
   * @param {Buffer} data - Packet data
   * @param {number} offset - Current offset
   * @returns {Object} - Metadata and next offset
   */
  parseModMetadata (data, offset) {
    const metadata = { data: {}, nextOffset: offset }

    // Check if there's additional data
    if (offset + 1 <= data.length) {
      try {
        const hasMetadata = data.readUInt8(offset)
        offset += 1

        if (hasMetadata === 1 && offset + 2 <= data.length) {
          // Read metadata length
          const metadataLength = data.readUInt16BE(offset)
          offset += 2

          if (offset + metadataLength <= data.length) {
            // Parse metadata (simplified - real format varies by Forge version)
            const metadataString = data.slice(offset, offset + metadataLength).toString('utf8')
            offset += metadataLength

            try {
              const parsed = JSON.parse(metadataString)
              metadata.data = { ...parsed }
            } catch (err) {
              // Not JSON, treat as string
              metadata.data.description = metadataString
            }
          }
        }
      } catch (err) {
        // Ignore metadata parsing errors
      }
    }

    metadata.nextOffset = offset
    return metadata
  }

  /**
   * Infer mod display name from mod ID
   * @param {string} modId - Mod identifier
   * @returns {string} - Display name
   */
  inferModName (modId) {
    const nameMap = {
      'minecraft': 'Minecraft',
      'forge': 'Minecraft Forge',
      'minecraft_forge': 'Minecraft Forge',
      'fml': 'Forge Mod Loader',
      'thermal': 'Thermal Series',
      'thermalfoundation': 'Thermal Foundation',
      'thermalexpansion': 'Thermal Expansion',
      'enderio': 'Ender IO',
      'appliedenergistics2': 'Applied Energistics 2',
      'buildcraft': 'BuildCraft',
      'industrialcraft2': 'IndustrialCraft 2',
      'jei': 'Just Enough Items',
      'waila': 'What Am I Looking At',
      'hwyla': 'Here\'s What You\'re Looking At',
      'the_one_probe': 'The One Probe',
      'journeymap': 'JourneyMap',
      'nei': 'Not Enough Items',
      'cofhcore': 'CoFH Core',
      'cofhworld': 'CoFH World',
      'redstoneflux': 'Redstone Flux',
      'mantle': 'Mantle',
      'tconstruct': 'Tinkers\' Construct',
      'botania': 'Botania',
      'thaumcraft': 'Thaumcraft',
      'forestry': 'Forestry',
      'railcraft': 'Railcraft',
      'computercraft': 'ComputerCraft',
      'opencomputers': 'OpenComputers'
    }

    return nameMap[modId] || this.capitalizeModId(modId)
  }

  /**
   * Capitalize mod ID for display
   * @param {string} modId - Mod identifier
   * @returns {string} - Capitalized name
   */
  capitalizeModId (modId) {
    return modId
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Validate parsed mod list
   * @param {Object} result - Parsed mod list result
   */
  validateModList (result) {
    // Check for duplicate mod IDs
    const seenIds = new Set()
    const duplicates = []
    
    for (const mod of result.mods) {
      if (seenIds.has(mod.id)) {
        duplicates.push(mod.id)
      }
      seenIds.add(mod.id)
    }

    if (duplicates.length > 0) {
      result.errors.push(`Duplicate mod IDs found: ${duplicates.join(', ')}`)
    }

    // Check for required mods
    const hasMinecraft = result.mods.some(mod => mod.id === 'minecraft')
    const hasForge = result.mods.some(mod => 
      mod.id === 'forge' || mod.id === 'minecraft_forge' || mod.id === 'fml'
    )

    if (!hasMinecraft) {
      result.errors.push('Minecraft mod entry not found')
    }

    if (!hasForge) {
      result.errors.push('Forge mod entry not found')
    }

    // Validate versions
    for (const mod of result.mods) {
      if (!this.isValidVersion(mod.version)) {
        result.errors.push(`Invalid version format for mod ${mod.id}: ${mod.version}`)
      }
    }
  }

  /**
   * Check if version string is valid
   * @param {string} version - Version string
   * @returns {boolean} - Whether version is valid
   */
  isValidVersion (version) {
    if (!version || typeof version !== 'string') {
      return false
    }

    // Basic version patterns
    const patterns = [
      /^\d+\.\d+\.\d+$/, // 1.2.3
      /^\d+\.\d+\.\d+\.\d+$/, // 1.2.3.4
      /^\d+\.\d+$/, // 1.2
      /^\d+\.\d+\.\d+-\w+$/, // 1.2.3-beta
      /^\d+\.\d+\.\d+_\w+$/, // 1.2.3_mc1.20
      /^[a-zA-Z]+$/, // alpha, beta, etc.
      /^\$\{.*\}$/ // ${version} placeholder
    ]

    return patterns.some(pattern => pattern.test(version))
  }

  /**
   * Parse version string into components
   * @param {string} version - Version string
   * @returns {Object} - Parsed version components
   */
  parseVersion (version) {
    const result = {
      raw: version,
      major: 0,
      minor: 0,
      patch: 0,
      build: 0,
      suffix: '',
      isSnapshot: false,
      isValid: false
    }

    if (!version || typeof version !== 'string') {
      return result
    }

    // Handle placeholder versions
    if (version.startsWith('${') && version.endsWith('}')) {
      result.suffix = version
      result.isValid = true
      return result
    }

    // Parse numeric version
    const parts = version.split(/[-_]/)
    const numericPart = parts[0]
    const suffix = parts.slice(1).join('-')

    const numbers = numericPart.split('.').map(n => parseInt(n, 10))
    
    if (numbers.length > 0 && !isNaN(numbers[0])) {
      result.major = numbers[0]
      result.minor = numbers[1] || 0
      result.patch = numbers[2] || 0
      result.build = numbers[3] || 0
      result.suffix = suffix
      result.isSnapshot = suffix.toLowerCase().includes('snapshot') || 
                        suffix.toLowerCase().includes('alpha') ||
                        suffix.toLowerCase().includes('beta')
      result.isValid = true
    }

    return result
  }

  /**
   * Compare two version objects
   * @param {Object} version1 - First version
   * @param {Object} version2 - Second version
   * @returns {number} - Comparison result (-1, 0, 1)
   */
  compareVersions (version1, version2) {
    const v1 = typeof version1 === 'string' ? this.parseVersion(version1) : version1
    const v2 = typeof version2 === 'string' ? this.parseVersion(version2) : version2

    if (!v1.isValid || !v2.isValid) {
      return v1.raw.localeCompare(v2.raw)
    }

    // Compare numeric parts
    const parts = ['major', 'minor', 'patch', 'build']
    for (const part of parts) {
      if (v1[part] !== v2[part]) {
        return v1[part] - v2[part]
      }
    }

    // Compare suffixes
    return v1.suffix.localeCompare(v2.suffix)
  }

  /**
   * Extract mod dependencies from mod metadata
   * @param {Object} mod - Mod object
   * @returns {Array} - Array of dependencies
   */
  extractDependencies (mod) {
    const dependencies = []

    if (mod.dependencies) {
      if (Array.isArray(mod.dependencies)) {
        dependencies.push(...mod.dependencies)
      } else if (typeof mod.dependencies === 'string') {
        // Parse dependency string (format varies)
        dependencies.push(...this.parseDependencyString(mod.dependencies))
      }
    }

    return dependencies
  }

  /**
   * Parse dependency string
   * @param {string} depString - Dependency string
   * @returns {Array} - Parsed dependencies
   */
  parseDependencyString (depString) {
    const dependencies = []
    
    // Simple parsing - real format is more complex
    const parts = depString.split(/[,;]/)
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed) {
        dependencies.push({ id: trimmed, required: true })
      }
    }

    return dependencies
  }
}

module.exports = ForgeModParser