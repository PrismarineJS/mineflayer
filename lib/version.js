const testedVersions = ['1.8.8', '1.9.4', '1.10.2', '1.11.2', '1.12.2', '1.13.2', '1.14.4', '1.15.2', '1.16.5', '1.17.1', '1.18.2', '1.19', '1.19.2', '1.19.3', '1.19.4', '1.20.1', '1.20.2', '1.20.4', '1.20.6', '1.21.1', '1.21.3', '1.21.4', '1.21.5']

// Supported Forge versions for each Minecraft version
const supportedForgeVersions = {
  '1.21.5': ['51.0.33', '51.0.32', '51.0.31', '51.0.30'],
  '1.21.4': ['51.0.29', '51.0.28', '51.0.27'],
  '1.21.3': ['51.0.22', '51.0.21', '51.0.20'],
  '1.21.1': ['47.3.10', '47.3.9', '47.3.8', '47.3.7'],
  '1.21': ['51.0.19', '51.0.18', '51.0.17'],
  '1.20.6': ['50.1.16', '50.1.15', '50.1.14'],
  '1.20.4': ['49.1.14', '49.1.13', '49.1.12'],
  '1.20.2': ['48.1.12', '48.1.11', '48.1.10'],
  '1.20.1': ['47.3.0', '47.2.23', '47.2.22'],
  '1.19.4': ['45.3.0', '45.2.21', '45.2.20'],
  '1.19.2': ['43.4.4', '43.4.3', '43.4.2'],
  '1.18.2': ['40.2.21', '40.2.20', '40.2.19'],
  '1.17.1': ['37.1.1', '37.1.0', '37.0.109'],
  '1.16.5': ['36.2.39', '36.2.38', '36.2.37'],
  '1.15.2': ['31.2.57', '31.2.56', '31.2.55'],
  '1.14.4': ['28.2.26', '28.2.25', '28.2.24'],
  '1.13.2': ['25.0.223', '25.0.222', '25.0.221'],
  '1.12.2': ['14.23.5.2860', '14.23.5.2859', '14.23.5.2858']
}

// Supported NeoForge versions (NeoForge started with 1.20.1)
const supportedNeoForgeVersions = {
  '1.21.5': ['21.5.14-beta', '21.5.13-beta', '21.5.12-beta'],
  '1.21.4': ['21.4.27-beta', '21.4.26-beta', '21.4.25-beta'],
  '1.21.3': ['21.3.56-beta', '21.3.55-beta', '21.3.54-beta'],
  '1.21.1': ['21.1.90', '21.1.89', '21.1.88'],
  '1.20.6': ['20.6.147-beta', '20.6.146-beta', '20.6.145-beta'],
  '1.20.4': ['20.4.237', '20.4.236', '20.4.235'],
  '1.20.2': ['20.2.88', '20.2.87', '20.2.86'],
  '1.20.1': ['47.1.106', '47.1.105', '47.1.104']
}

// Supported Fabric versions (Fabric Loader versions)
const supportedFabricVersions = {
  '1.21.5': ['0.16.9', '0.16.8', '0.16.7'],
  '1.21.4': ['0.16.9', '0.16.8', '0.16.7'],
  '1.21.3': ['0.16.9', '0.16.8', '0.16.7'],
  '1.21.1': ['0.16.4', '0.16.3', '0.16.2'],
  '1.20.6': ['0.15.11', '0.15.10', '0.15.9'],
  '1.20.4': ['0.15.7', '0.15.6', '0.15.5'],
  '1.20.2': ['0.14.25', '0.14.24', '0.14.23'],
  '1.20.1': ['0.14.21', '0.14.20', '0.14.19'],
  '1.19.4': ['0.14.18', '0.14.17', '0.14.16'],
  '1.19.2': ['0.14.10', '0.14.9', '0.14.8']
}

/**
 * Check if a mod loader version is supported for a given Minecraft version
 * @param {string} modLoaderType - 'forge', 'neoforge', or 'fabric'
 * @param {string} minecraftVersion - Minecraft version
 * @param {string} modLoaderVersion - Mod loader version
 * @returns {boolean} - Whether the combination is supported
 */
function isModLoaderVersionSupported (modLoaderType, minecraftVersion, modLoaderVersion) {
  let supportedVersions
  
  switch (modLoaderType.toLowerCase()) {
    case 'forge':
      supportedVersions = supportedForgeVersions[minecraftVersion]
      break
    case 'neoforge':
      supportedVersions = supportedNeoForgeVersions[minecraftVersion]
      break
    case 'fabric':
      supportedVersions = supportedFabricVersions[minecraftVersion]
      break
    default:
      return false
  }

  if (!supportedVersions || !Array.isArray(supportedVersions)) {
    return false
  }

  // Check exact match first
  if (supportedVersions.includes(modLoaderVersion)) {
    return true
  }

  // For Forge, also check partial matches (major.minor compatibility)
  if (modLoaderType.toLowerCase() === 'forge') {
    return checkForgeVersionCompatibility(supportedVersions, modLoaderVersion)
  }

  return false
}

/**
 * Check Forge version compatibility with partial matching
 * @param {Array<string>} supportedVersions - Array of supported versions
 * @param {string} actualVersion - Actual Forge version
 * @returns {boolean} - Whether compatible
 */
function checkForgeVersionCompatibility (supportedVersions, actualVersion) {
  if (!actualVersion || typeof actualVersion !== 'string') {
    return false
  }

  // Extract major.minor from actual version
  const actualParts = actualVersion.split('.')
  if (actualParts.length < 2) {
    return false
  }

  const actualMajorMinor = `${actualParts[0]}.${actualParts[1]}`

  // Check if any supported version has matching major.minor
  return supportedVersions.some(supportedVersion => {
    const supportedParts = supportedVersion.split('.')
    if (supportedParts.length < 2) {
      return false
    }
    
    const supportedMajorMinor = `${supportedParts[0]}.${supportedParts[1]}`
    return supportedMajorMinor === actualMajorMinor
  })
}

/**
 * Get supported mod loader versions for a Minecraft version
 * @param {string} modLoaderType - 'forge', 'neoforge', or 'fabric'
 * @param {string} minecraftVersion - Minecraft version
 * @returns {Array<string>} - Array of supported mod loader versions
 */
function getSupportedModLoaderVersions (modLoaderType, minecraftVersion) {
  switch (modLoaderType.toLowerCase()) {
    case 'forge':
      return supportedForgeVersions[minecraftVersion] || []
    case 'neoforge':
      return supportedNeoForgeVersions[minecraftVersion] || []
    case 'fabric':
      return supportedFabricVersions[minecraftVersion] || []
    default:
      return []
  }
}

/**
 * Check if a Minecraft version supports mod loaders
 * @param {string} minecraftVersion - Minecraft version
 * @returns {Object} - Object indicating which mod loaders are supported
 */
function getModLoaderSupport (minecraftVersion) {
  return {
    forge: !!supportedForgeVersions[minecraftVersion],
    neoforge: !!supportedNeoForgeVersions[minecraftVersion],
    fabric: !!supportedFabricVersions[minecraftVersion]
  }
}

/**
 * Get the latest supported version for a mod loader and Minecraft version
 * @param {string} modLoaderType - Mod loader type
 * @param {string} minecraftVersion - Minecraft version
 * @returns {string|null} - Latest supported version or null
 */
function getLatestModLoaderVersion (modLoaderType, minecraftVersion) {
  const versions = getSupportedModLoaderVersions(modLoaderType, minecraftVersion)
  return versions.length > 0 ? versions[0] : null
}

module.exports = {
  testedVersions,
  latestSupportedVersion: testedVersions[testedVersions.length - 1],
  oldestSupportedVersion: testedVersions[0],
  
  // Mod loader version support
  supportedForgeVersions,
  supportedNeoForgeVersions,
  supportedFabricVersions,
  
  // Helper functions
  isModLoaderVersionSupported,
  getSupportedModLoaderVersions,
  getModLoaderSupport,
  getLatestModLoaderVersion
}
