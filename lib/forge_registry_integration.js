/**
 * Integration layer between Forge registry system and mineflayer's block/item system
 * Handles translation between Forge numeric IDs and vanilla string identifiers
 */

const { extendBlocksPlugin } = require('./forge_blocks_plugin')
const { installModAwareResolver } = require('./mod_aware_resolver')

/**
 * Create Forge-aware block/item resolver
 * @param {Object} bot - The bot instance
 * @returns {Object} - Resolver functions
 */
function createForgeResolver (bot) {
  const resolver = {
    /**
     * Resolve a Forge block ID to a vanilla block object
     * @param {number} forgeId - Forge numeric block ID
     * @returns {Object|null} - Block object or null if not found
     */
    resolveBlock (forgeId) {
      if (!bot.modLoader || !bot.modLoader.isReady()) {
        return null
      }

      // Get string identifier from Forge mapping
      const stringId = bot.modLoader.resolveId('minecraft:block', forgeId)
      if (!stringId) {
        return null
      }

      // Convert to vanilla block using prismarine-block
      try {
        const Block = require('prismarine-block')(bot.registry)
        return Block.fromStateId(bot.registry.blocksByName[stringId]?.defaultState || 0)
      } catch (err) {
        // If block doesn't exist in vanilla registry, create a placeholder
        return createPlaceholderBlock(stringId, forgeId)
      }
    },

    /**
     * Resolve a Forge item ID to a vanilla item object
     * @param {number} forgeId - Forge numeric item ID
     * @returns {Object|null} - Item object or null if not found
     */
    resolveItem (forgeId) {
      if (!bot.modLoader || !bot.modLoader.isReady()) {
        return null
      }

      // Get string identifier from Forge mapping
      const stringId = bot.modLoader.resolveId('minecraft:item', forgeId)
      if (!stringId) {
        return null
      }

      // Convert to vanilla item using prismarine-item
      try {
        const Item = require('prismarine-item')(bot.registry)
        const itemType = bot.registry.itemsByName[stringId]
        return new Item(itemType?.id || forgeId, 1, itemType?.metadata || 0)
      } catch (err) {
        // If item doesn't exist in vanilla registry, create a placeholder
        return createPlaceholderItem(stringId, forgeId)
      }
    },

    /**
     * Get Forge ID for a vanilla block/item string identifier
     * @param {string} registryType - 'minecraft:block' or 'minecraft:item'
     * @param {string} stringId - String identifier (e.g., 'minecraft:stone')
     * @returns {number|null} - Forge numeric ID or null if not found
     */
    getForgeId (registryType, stringId) {
      if (!bot.modLoader || !bot.modLoader.isReady()) {
        return null
      }

      return bot.modLoader.reverseResolveId(registryType, stringId)
    },

    /**
     * Check if a block/item ID is from a mod
     * @param {string} stringId - String identifier
     * @returns {boolean} - Whether the ID is from a mod (not minecraft)
     */
    isModded (stringId) {
      return stringId && !stringId.startsWith('minecraft:')
    },

    /**
     * Get mod ID from a string identifier
     * @param {string} stringId - String identifier
     * @returns {string} - Mod ID
     */
    getModId (stringId) {
      if (!stringId) return 'unknown'
      const parts = stringId.split(':')
      return parts.length > 1 ? parts[0] : 'minecraft'
    },

    /**
     * Get available registry types
     * @returns {Array<string>} - Array of registry type names
     */
    getRegistryTypes () {
      if (!bot.modLoader || !bot.modLoader.isReady()) {
        return []
      }

      return Array.from(bot.modLoader.registryMappings.keys())
    },

    /**
     * Get all entries for a registry type
     * @param {string} registryType - Registry type
     * @returns {Map<number, string>} - Map of Forge ID to string identifier
     */
    getRegistryEntries (registryType) {
      if (!bot.modLoader || !bot.modLoader.isReady()) {
        return new Map()
      }

      return bot.modLoader.getRegistryMapping(registryType) || new Map()
    }
  }

  return resolver
}

/**
 * Create a placeholder block for unknown modded blocks
 * @param {string} stringId - String identifier
 * @param {number} forgeId - Forge numeric ID
 * @returns {Object} - Placeholder block object
 */
function createPlaceholderBlock (stringId, forgeId) {
  return {
    type: forgeId,
    name: stringId,
    displayName: stringId.split(':').pop() || 'Unknown Block',
    hardness: 0,
    stackSize: 64,
    metadata: 0,
    variations: [],
    minStateId: forgeId,
    maxStateId: forgeId,
    defaultState: forgeId,
    isModded: true,
    modId: stringId.split(':')[0] || 'unknown'
  }
}

/**
 * Create a placeholder item for unknown modded items
 * @param {string} stringId - String identifier
 * @param {number} forgeId - Forge numeric ID
 * @returns {Object} - Placeholder item object
 */
function createPlaceholderItem (stringId, forgeId) {
  return {
    type: forgeId,
    count: 1,
    metadata: 0,
    name: stringId,
    displayName: stringId.split(':').pop() || 'Unknown Item',
    stackSize: 64,
    isModded: true,
    modId: stringId.split(':')[0] || 'unknown'
  }
}

/**
 * Extend bot with Forge registry integration
 * @param {Object} bot - The bot instance
 */
function extendBotWithForgeRegistry (bot) {
  if (bot._forgeResolverInstalled) {
    return // Already installed
  }

  const resolver = createForgeResolver(bot)

  // Add resolver methods to bot
  bot.forgeResolver = resolver

  // Extend existing block methods
  const originalBlockAt = bot.blockAt
  if (originalBlockAt) {
    bot.blockAt = function (point) {
      const block = originalBlockAt.call(this, point)
      
      // If block is null and we have a mod loader, try Forge resolution
      if (!block && this.modLoader && this.modLoader.isReady()) {
        // This would require integration with the world/chunk system
        // For now, return the original result
      }
      
      return block
    }
  }

  // Add new methods for Forge-specific functionality
  bot.getBlockByForgeId = (forgeId) => resolver.resolveBlock(forgeId)
  bot.getItemByForgeId = (forgeId) => resolver.resolveItem(forgeId)
  bot.getForgeBlockId = (stringId) => resolver.getForgeId('minecraft:block', stringId)
  bot.getForgeItemId = (stringId) => resolver.getForgeId('minecraft:item', stringId)
  
  // Utility methods
  bot.isModdedBlock = (stringId) => resolver.isModded(stringId)
  bot.isModdedItem = (stringId) => resolver.isModded(stringId)
  bot.getModIdFromString = (stringId) => resolver.getModId(stringId)

  // Extend blocks plugin with Forge support
  extendBlocksPlugin(bot)

  // Install mod-aware resolver
  installModAwareResolver(bot)

  bot._forgeResolverInstalled = true
}

module.exports = {
  createForgeResolver,
  extendBotWithForgeRegistry,
  createPlaceholderBlock,
  createPlaceholderItem
}