/**
 * Mod-aware block and item resolution system
 * Provides unified access to vanilla and modded content with fallback handling
 */

const { Vec3 } = require('vec3')

/**
 * Create a mod-aware resolver for blocks and items
 * @param {Object} bot - Bot instance
 * @returns {Object} - Resolver with enhanced capabilities
 */
function createModAwareResolver (bot) {
  const resolver = {
    /**
     * Resolve block by name or ID with mod awareness
     * @param {string|number} identifier - Block name, Forge ID, or vanilla ID
     * @returns {Object|null} - Block object or null
     */
    resolveBlock (identifier) {
      if (typeof identifier === 'string') {
        return this.resolveBlockByName(identifier)
      } else if (typeof identifier === 'number') {
        return this.resolveBlockById(identifier)
      }
      return null
    },

    /**
     * Resolve block by string name
     * @param {string} name - Block name (e.g., 'stone', 'minecraft:stone', 'thermal:copper_ore')
     * @returns {Object|null} - Block object or null
     */
    resolveBlockByName (name) {
      // Normalize name
      const normalizedName = this.normalizeName(name)
      
      // Try vanilla registry first
      try {
        const Block = require('prismarine-block')(bot.registry)
        const blockType = bot.registry.blocksByName[normalizedName]
        if (blockType) {
          return Block.fromStateId(blockType.defaultState)
        }
      } catch (err) {
        // Continue to mod resolution
      }

      // Try mod loader resolution
      if (bot.modLoader && bot.modLoader.isReady()) {
        const forgeId = bot.modLoader.reverseResolveId('minecraft:block', normalizedName)
        if (forgeId !== null) {
          return bot.forgeResolver.resolveBlock(forgeId)
        }
      }

      return null
    },

    /**
     * Resolve block by numeric ID
     * @param {number} id - Block ID (could be vanilla state ID or Forge ID)
     * @returns {Object|null} - Block object or null
     */
    resolveBlockById (id) {
      // Try vanilla first (state IDs are typically larger numbers)
      if (id > 1000) {
        try {
          const Block = require('prismarine-block')(bot.registry)
          return Block.fromStateId(id)
        } catch (err) {
          // Continue to mod resolution
        }
      }

      // Try Forge ID resolution
      if (bot.modLoader && bot.modLoader.isReady()) {
        return bot.forgeResolver.resolveBlock(id)
      }

      // Fallback: try vanilla with the ID anyway
      try {
        const Block = require('prismarine-block')(bot.registry)
        return Block.fromStateId(id)
      } catch (err) {
        return null
      }
    },

    /**
     * Resolve item by name or ID with mod awareness
     * @param {string|number} identifier - Item name, Forge ID, or vanilla ID
     * @returns {Object|null} - Item object or null
     */
    resolveItem (identifier) {
      if (typeof identifier === 'string') {
        return this.resolveItemByName(identifier)
      } else if (typeof identifier === 'number') {
        return this.resolveItemById(identifier)
      }
      return null
    },

    /**
     * Resolve item by string name
     * @param {string} name - Item name
     * @returns {Object|null} - Item object or null
     */
    resolveItemByName (name) {
      // Normalize name
      const normalizedName = this.normalizeName(name)
      
      // Try vanilla registry first
      try {
        const Item = require('prismarine-item')(bot.registry)
        const itemType = bot.registry.itemsByName[normalizedName]
        if (itemType) {
          return new Item(itemType.id, 1, itemType.metadata || 0)
        }
      } catch (err) {
        // Continue to mod resolution
      }

      // Try mod loader resolution
      if (bot.modLoader && bot.modLoader.isReady()) {
        const forgeId = bot.modLoader.reverseResolveId('minecraft:item', normalizedName)
        if (forgeId !== null) {
          return bot.forgeResolver.resolveItem(forgeId)
        }
      }

      return null
    },

    /**
     * Resolve item by numeric ID
     * @param {number} id - Item ID
     * @returns {Object|null} - Item object or null
     */
    resolveItemById (id) {
      // Try vanilla first
      try {
        const Item = require('prismarine-item')(bot.registry)
        const itemType = bot.registry.itemsArray[id]
        if (itemType) {
          return new Item(id, 1, 0)
        }
      } catch (err) {
        // Continue to mod resolution
      }

      // Try Forge ID resolution
      if (bot.modLoader && bot.modLoader.isReady()) {
        return bot.forgeResolver.resolveItem(id)
      }

      return null
    },

    /**
     * Search blocks by pattern with mod support
     * @param {string|RegExp} pattern - Search pattern
     * @param {Object} options - Search options
     * @returns {Array} - Array of matching blocks
     */
    findBlocks (pattern, options = {}) {
      const results = []
      const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
      const { includeVanilla = true, includeMods = true, limit = 100 } = options

      // Search vanilla blocks
      if (includeVanilla) {
        for (const [name, blockType] of Object.entries(bot.registry.blocksByName || {})) {
          if (regex.test(name) && results.length < limit) {
            const block = this.resolveBlockByName(name)
            if (block) {
              results.push({ name, block, type: 'vanilla' })
            }
          }
        }
      }

      // Search mod blocks
      if (includeMods && bot.modLoader && bot.modLoader.isReady()) {
        const registryEntries = bot.forgeResolver.getRegistryEntries('minecraft:block')
        for (const [forgeId, stringId] of registryEntries) {
          if (regex.test(stringId) && results.length < limit) {
            const block = bot.forgeResolver.resolveBlock(forgeId)
            if (block) {
              results.push({ 
                name: stringId, 
                block, 
                forgeId,
                type: 'modded',
                modId: this.getModId(stringId)
              })
            }
          }
        }
      }

      return results
    },

    /**
     * Search items by pattern with mod support
     * @param {string|RegExp} pattern - Search pattern
     * @param {Object} options - Search options
     * @returns {Array} - Array of matching items
     */
    findItems (pattern, options = {}) {
      const results = []
      const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
      const { includeVanilla = true, includeMods = true, limit = 100 } = options

      // Search vanilla items
      if (includeVanilla) {
        for (const [name, itemType] of Object.entries(bot.registry.itemsByName || {})) {
          if (regex.test(name) && results.length < limit) {
            const item = this.resolveItemByName(name)
            if (item) {
              results.push({ name, item, type: 'vanilla' })
            }
          }
        }
      }

      // Search mod items
      if (includeMods && bot.modLoader && bot.modLoader.isReady()) {
        const registryEntries = bot.forgeResolver.getRegistryEntries('minecraft:item')
        for (const [forgeId, stringId] of registryEntries) {
          if (regex.test(stringId) && results.length < limit) {
            const item = bot.forgeResolver.resolveItem(forgeId)
            if (item) {
              results.push({ 
                name: stringId, 
                item, 
                forgeId,
                type: 'modded',
                modId: this.getModId(stringId)
              })
            }
          }
        }
      }

      return results
    },

    /**
     * Find blocks in the world at specified locations
     * @param {Array|Object} positions - Position or array of positions
     * @param {Object} options - Search options
     * @returns {Array} - Array of found blocks with positions
     */
    findBlocksInWorld (positions, options = {}) {
      const results = []
      const posArray = Array.isArray(positions) ? positions : [positions]
      const { enhanceWithModInfo = true } = options

      for (const pos of posArray) {
        const block = bot.blockAt(pos)
        if (block) {
          const result = { position: pos, block }
          
          // Enhance with mod information if available
          if (enhanceWithModInfo && bot.modLoader && bot.modLoader.isReady()) {
            this.enhanceBlockWithModInfo(result.block)
          }
          
          results.push(result)
        }
      }

      return results
    },

    /**
     * Get blocks in a region with mod awareness
     * @param {Vec3} start - Start position
     * @param {Vec3} end - End position
     * @param {Object} options - Options
     * @returns {Array} - Array of blocks in region
     */
    getBlocksInRegion (start, end, options = {}) {
      const results = []
      const { filter = null, maxBlocks = 10000 } = options

      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)
      const minZ = Math.min(start.z, end.z)
      const maxZ = Math.max(start.z, end.z)

      let blockCount = 0
      for (let x = minX; x <= maxX && blockCount < maxBlocks; x++) {
        for (let y = minY; y <= maxY && blockCount < maxBlocks; y++) {
          for (let z = minZ; z <= maxZ && blockCount < maxBlocks; z++) {
            const pos = new Vec3(x, y, z)
            const block = bot.blockAt(pos)
            
            if (block && (!filter || filter(block))) {
              // Enhance with mod info
              if (bot.modLoader && bot.modLoader.isReady()) {
                this.enhanceBlockWithModInfo(block)
              }
              
              results.push({ position: pos, block })
              blockCount++
            }
          }
        }
      }

      return results
    },

    /**
     * Enhance block with mod information
     * @param {Object} block - Block object to enhance
     */
    enhanceBlockWithModInfo (block) {
      if (!block || !bot.modLoader || !bot.modLoader.isReady()) {
        return
      }

      // Try to determine if this is a modded block
      const blockName = block.name || `block_${block.type}`
      if (blockName && !blockName.startsWith('minecraft:')) {
        block.isModded = true
        block.modId = this.getModId(blockName)
        
        // Try to get Forge ID
        const forgeId = bot.modLoader.reverseResolveId('minecraft:block', blockName)
        if (forgeId !== null) {
          block.forgeId = forgeId
        }
      } else {
        block.isModded = false
        block.modId = 'minecraft'
      }
    },

    /**
     * Normalize block/item name
     * @param {string} name - Name to normalize
     * @returns {string} - Normalized name
     */
    normalizeName (name) {
      if (!name) return ''
      
      // Add minecraft: prefix if no namespace
      if (!name.includes(':')) {
        return `minecraft:${name}`
      }
      
      return name.toLowerCase()
    },

    /**
     * Extract mod ID from namespaced name
     * @param {string} name - Namespaced name
     * @returns {string} - Mod ID
     */
    getModId (name) {
      if (!name || typeof name !== 'string') return 'unknown'
      const parts = name.split(':')
      return parts.length > 1 ? parts[0] : 'minecraft'
    },

    /**
     * Get comprehensive resolver statistics
     * @returns {Object} - Resolver statistics
     */
    getStats () {
      const stats = {
        vanillaBlocks: Object.keys(bot.registry.blocksByName || {}).length,
        vanillaItems: Object.keys(bot.registry.itemsByName || {}).length,
        moddedBlocks: 0,
        moddedItems: 0,
        totalMods: 0
      }

      if (bot.modLoader && bot.modLoader.isReady()) {
        const blockEntries = bot.forgeResolver.getRegistryEntries('minecraft:block')
        const itemEntries = bot.forgeResolver.getRegistryEntries('minecraft:item')
        
        stats.moddedBlocks = blockEntries.size
        stats.moddedItems = itemEntries.size
        stats.totalMods = bot.modLoader.registry.getModCount()
        
        // Count blocks/items by mod
        stats.modBreakdown = {}
        for (const [, stringId] of blockEntries) {
          const modId = this.getModId(stringId)
          if (modId !== 'minecraft') {
            stats.modBreakdown[modId] = (stats.modBreakdown[modId] || 0) + 1
          }
        }
      }

      return stats
    }
  }

  return resolver
}

/**
 * Install mod-aware resolver on bot
 * @param {Object} bot - Bot instance
 */
function installModAwareResolver (bot) {
  if (bot._modAwareResolverInstalled) {
    return
  }

  const resolver = createModAwareResolver(bot)
  bot.modAwareResolver = resolver

  // Add convenience methods to bot
  bot.resolveBlock = (identifier) => resolver.resolveBlock(identifier)
  bot.resolveItem = (identifier) => resolver.resolveItem(identifier)
  bot.findBlocks = (pattern, options) => resolver.findBlocks(pattern, options)
  bot.findItems = (pattern, options) => resolver.findItems(pattern, options)
  bot.getBlocksInRegion = (start, end, options) => resolver.getBlocksInRegion(start, end, options)

  bot._modAwareResolverInstalled = true
}

module.exports = {
  createModAwareResolver,
  installModAwareResolver
}