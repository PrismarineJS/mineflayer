/**
 * Forge blocks plugin extension
 * Extends the existing blocks plugin to work with Forge registry IDs
 */

/**
 * Extend blocks plugin with Forge support
 * @param {Object} bot - Bot instance
 */
function extendBlocksPlugin (bot) {
  if (!bot.modLoader || bot._forgeBlocksExtended) {
    return
  }

  // Store original block methods
  const originalBlockAt = bot.blockAt
  const originalBlockInSight = bot.blockInSight

  /**
   * Enhanced blockAt that can handle Forge blocks
   */
  bot.blockAt = function (point, extraInfos = true) {
    const block = originalBlockAt ? originalBlockAt.call(this, point, extraInfos) : null
    
    if (block && this.modLoader && this.modLoader.isReady()) {
      // Enhance block with Forge information
      enhanceBlockWithForgeInfo(block, this.modLoader)
    }
    
    return block
  }

  /**
   * Enhanced blockInSight that can handle Forge blocks
   */
  if (originalBlockInSight) {
    bot.blockInSight = function (maxDistance, matcher) {
      const block = originalBlockInSight.call(this, maxDistance, matcher)
      
      if (block && this.modLoader && this.modLoader.isReady()) {
        // Enhance block with Forge information
        enhanceBlockWithForgeInfo(block, this.modLoader)
      }
      
      return block
    }
  }

  /**
   * Get block by Forge ID at position
   */
  bot.getForgeBlockAt = function (point, forgeId) {
    if (!this.modLoader || !this.modLoader.isReady()) {
      return null
    }

    const block = this.forgeResolver.resolveBlock(forgeId)
    if (block) {
      block.position = point
      return block
    }
    
    return null
  }

  /**
   * Find blocks matching Forge criteria
   */
  bot.findForgeBlocks = function (options = {}) {
    const results = []
    
    if (!this.modLoader || !this.modLoader.isReady()) {
      return results
    }

    const { modId, pattern, maxDistance = 64 } = options
    const center = this.entity.position
    
    // Iterate through loaded chunks to find matching blocks
    // This is a simplified implementation - a full implementation would
    // need to integrate with the world loading system
    
    const registryEntries = this.forgeResolver.getRegistryEntries('minecraft:block')
    for (const [forgeId, stringId] of registryEntries) {
      if (modId && !stringId.startsWith(modId + ':')) {
        continue
      }
      
      if (pattern && !pattern.test(stringId)) {
        continue
      }
      
      // In a real implementation, we'd search the loaded world for these blocks
      // For now, just return the registry information
      results.push({
        forgeId,
        stringId,
        block: this.forgeResolver.resolveBlock(forgeId)
      })
    }
    
    return results
  }

  bot._forgeBlocksExtended = true
}

/**
 * Enhance a block object with Forge information
 * @param {Object} block - Block object
 * @param {Object} modLoader - Mod loader instance
 */
function enhanceBlockWithForgeInfo (block, modLoader) {
  if (!block || !modLoader.isReady()) {
    return
  }

  // Try to find Forge ID for this block
  const stringId = getStringIdFromBlock(block)
  if (stringId) {
    const forgeId = modLoader.reverseResolveId('minecraft:block', stringId)
    if (forgeId !== null) {
      block.forgeId = forgeId
      block.isModded = !stringId.startsWith('minecraft:')
      block.modId = stringId.split(':')[0]
    }
  }
}

/**
 * Extract string identifier from block object
 * @param {Object} block - Block object
 * @returns {string|null} - String identifier
 */
function getStringIdFromBlock (block) {
  // Try different ways to get the string ID
  if (block.name) {
    return block.name
  }
  
  if (block.type && typeof block.type === 'number') {
    // Try to resolve from registry
    // This would need integration with prismarine-registry
    return null
  }
  
  return null
}

module.exports = {
  extendBlocksPlugin
}