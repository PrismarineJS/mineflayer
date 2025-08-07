const ForgeModLoader = require('./forge')
const NeoForgeModLoader = require('./neoforge')
const FabricModLoader = require('./fabric')
const { ModLoaderType } = require('../mod_loader_detection')

/**
 * Factory for creating mod loader instances based on detected type
 */
class ModLoaderFactory {
  /**
   * Create a mod loader instance for the detected type
   * @param {string} type - Mod loader type from ModLoaderType
   * @param {Object} bot - The bot instance
   * @param {Object} options - Configuration options
   * @returns {ModLoader|null} - Mod loader instance or null if not supported
   */
  static create (type, bot, options = {}) {
    switch (type) {
      case ModLoaderType.FORGE:
        return new ForgeModLoader(bot, options)
      
      case ModLoaderType.NEOFORGE:
        return new NeoForgeModLoader(bot, options)
      
      case ModLoaderType.FABRIC:
        return new FabricModLoader(bot, options)
      
      case ModLoaderType.VANILLA:
      default:
        return null // No mod loader needed for vanilla
    }
  }

  /**
   * Check if a mod loader type is supported
   * @param {string} type - Mod loader type
   * @returns {boolean} - Whether the type is supported
   */
  static isSupported (type) {
    return type === ModLoaderType.FORGE || 
           type === ModLoaderType.NEOFORGE || 
           type === ModLoaderType.FABRIC
  }

  /**
   * Get list of supported mod loader types
   * @returns {Array<string>} - Array of supported types
   */
  static getSupportedTypes () {
    return [ModLoaderType.FORGE, ModLoaderType.NEOFORGE, ModLoaderType.FABRIC]
  }
}

module.exports = ModLoaderFactory