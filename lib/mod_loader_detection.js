/**
 * Mod loader detection utilities for identifying and parsing mod loader information
 * from server brand strings and handshake data
 */

const ModLoaderType = {
  VANILLA: 'vanilla',
  FORGE: 'forge',
  NEOFORGE: 'neoforge',
  FABRIC: 'fabric'
}

/**
 * Parse server brand string to identify mod loader type and version
 * @param {string} serverBrand - The server brand string from minecraft:brand channel
 * @returns {Object} - Parsed mod loader info
 */
function parseServerBrand (serverBrand) {
  if (!serverBrand || typeof serverBrand !== 'string') {
    return {
      type: ModLoaderType.VANILLA,
      version: null,
      raw: serverBrand
    }
  }

  const brand = serverBrand.toLowerCase()

  // Forge detection patterns
  if (brand.includes('forge')) {
    const forgeMatch = serverBrand.match(/forge[^\d]*(\d+\.\d+\.\d+(?:\.\d+)?)/i)
    return {
      type: ModLoaderType.FORGE,
      version: forgeMatch ? forgeMatch[1] : null,
      raw: serverBrand
    }
  }

  // NeoForge detection patterns
  if (brand.includes('neoforge') || brand.includes('neo-forge')) {
    const neoForgeMatch = serverBrand.match(/neoforge[^\d]*(\d+\.\d+\.\d+(?:\.\d+)?)/i)
    return {
      type: ModLoaderType.NEOFORGE,
      version: neoForgeMatch ? neoForgeMatch[1] : null,
      raw: serverBrand
    }
  }

  // Fabric detection patterns
  if (brand.includes('fabric')) {
    const fabricMatch = serverBrand.match(/fabric[^\d]*(\d+\.\d+\.\d+(?:\.\d+)?)/i)
    return {
      type: ModLoaderType.FABRIC,
      version: fabricMatch ? fabricMatch[1] : null,
      raw: serverBrand
    }
  }

  // Check for common modded server software that might not include mod loader in brand
  if (brand.includes('mohist') || brand.includes('catserver') || brand.includes('arclight')) {
    // These typically run Forge but may not include it in brand
    return {
      type: ModLoaderType.FORGE,
      version: null,
      raw: serverBrand,
      hybrid: true // Indicates hybrid server software
    }
  }

  // Default to vanilla
  return {
    type: ModLoaderType.VANILLA,
    version: null,
    raw: serverBrand
  }
}

/**
 * Determine required channels for mod loader handshake
 * @param {string} modLoaderType - Type of mod loader
 * @param {string} minecraftVersion - Minecraft version
 * @returns {Array<string>} - Array of channel names to register
 */
function getRequiredChannels (modLoaderType, minecraftVersion) {
  const channels = []

  switch (modLoaderType) {
    case ModLoaderType.FORGE:
    case ModLoaderType.NEOFORGE:
      // Pre-1.13 Forge channels
      if (isVersionLessThan(minecraftVersion, '1.13')) {
        channels.push('FML|HS', 'FML', 'FML|MP', 'FORGE')
      } else {
        // 1.13+ uses login plugin system
        channels.push('fml:handshake')
        // Still need multipart for large messages
        channels.push('FML|MP')
      }
      break

    case ModLoaderType.FABRIC:
      // Fabric uses configuration phase registration
      if (isVersionGreaterOrEqual(minecraftVersion, '1.20.5')) {
        channels.push('c:register')
      } else {
        channels.push('fabric-networking-api-v1:early_registration')
      }
      break

    case ModLoaderType.VANILLA:
    default:
      // No additional channels needed
      break
  }

  return channels
}

/**
 * Check if handshake is expected for this mod loader
 * @param {string} modLoaderType - Type of mod loader
 * @returns {boolean} - Whether handshake is required
 */
function requiresHandshake (modLoaderType) {
  return modLoaderType === ModLoaderType.FORGE || 
         modLoaderType === ModLoaderType.NEOFORGE
}

/**
 * Get handshake phases for mod loader
 * @param {string} modLoaderType - Type of mod loader
 * @returns {Array<string>} - Array of handshake phase names
 */
function getHandshakePhases (modLoaderType) {
  switch (modLoaderType) {
    case ModLoaderType.FORGE:
    case ModLoaderType.NEOFORGE:
      return [
        'WAITINGSERVERDATA',
        'WAITINGSERVERCOMPLETE', 
        'PENDINGCOMPLETE',
        'COMPLETE'
      ]
    case ModLoaderType.FABRIC:
      return ['CONFIGURATION']
    default:
      return []
  }
}

/**
 * Simple version comparison utility
 * @private
 */
function isVersionLessThan (version1, version2) {
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

function isVersionGreaterOrEqual (version1, version2) {
  return !isVersionLessThan(version1, version2)
}

module.exports = {
  ModLoaderType,
  parseServerBrand,
  getRequiredChannels,
  requiresHandshake,
  getHandshakePhases
}