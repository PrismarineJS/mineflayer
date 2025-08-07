/**
 * Advanced mod detection and analysis example
 * Demonstrates comprehensive mod loader functionality
 */

const mineflayer = require('../../index.js')

if (process.argv.length < 4) {
  console.log('Usage: node advanced_mod_detection.js <host> <port> [<name>]')
  process.exit(1)
}

// Create bot with advanced mod loader configuration
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || 'ModAnalyzer',
  auth: 'offline',
  
  modLoader: {
    enabled: true,
    strict: false,
    handshakeTimeout: 45000,
    registryTimeout: 20000,
    enableCompatibilityChecks: true,
    debugMode: false,
    maxRetries: 2,
    retryDelay: 2000
  }
})

let analysisData = {
  serverInfo: {},
  modLoader: {},
  mods: {},
  registries: {},
  performance: {}
}

// Performance monitoring
const startTime = Date.now()

bot.on('connect', () => {
  console.log('🔌 Connected to server')
  analysisData.performance.connectTime = Date.now() - startTime
})

bot.on('login', () => {
  console.log('🔐 Login successful')
  analysisData.serverInfo = {
    brand: bot.game.serverBrand,
    version: bot.version,
    isModded: bot.game.isModded
  }
  
  console.log(`📋 Server: ${bot.game.serverBrand}`)
  console.log(`🎮 Minecraft: ${bot.version}`)
  console.log(`🔧 Modded: ${bot.game.isModded ? 'Yes' : 'No'}`)
})

bot.on('modLoaderDetected', (info) => {
  console.log('\n🚀 Mod Loader Detection')
  console.log(`   Type: ${info.type}`)
  console.log(`   Version: ${info.version || 'Unknown'}`)
  console.log(`   Handshake required: ${info.requiresHandshake}`)
  
  analysisData.modLoader = {
    type: info.type,
    version: info.version,
    requiresHandshake: info.requiresHandshake,
    detectionTime: Date.now() - startTime
  }
})

bot.on('modLoaderReady', (modLoader) => {
  const readyTime = Date.now() - startTime
  console.log(`\n✅ Mod Loader Ready (${readyTime}ms)`)
  
  analysisData.modLoader.readyTime = readyTime
  analysisData.modLoader.stats = modLoader.getStats ? modLoader.getStats() : {}
  
  // Perform comprehensive mod analysis
  performModAnalysis()
})

bot.on('modsReceived', (data) => {
  console.log(`\n📦 Mods Received: ${data.modCount || 0}`)
  
  if (data.forgeVersion) {
    console.log(`🔨 Forge Version: ${data.forgeVersion}`)
  }
  
  if (data.errors && data.errors.length > 0) {
    console.log(`⚠️  Parsing Errors: ${data.errors.length}`)
    data.errors.forEach(error => console.log(`   - ${error}`))
  }
  
  analysisData.mods = {
    count: data.modCount || 0,
    forgeVersion: data.forgeVersion,
    errors: data.errors || [],
    list: data.mods || []
  }
})

bot.on('registryMappingUpdated', (registryName, mapping) => {
  console.log(`📊 Registry Updated: ${registryName} (${mapping.size} entries)`)
  
  if (!analysisData.registries[registryName]) {
    analysisData.registries[registryName] = {}
  }
  analysisData.registries[registryName].size = mapping.size
  analysisData.registries[registryName].updateTime = Date.now() - startTime
})

bot.on('modCompatibilityIssues', (issues) => {
  console.log(`\n⚠️  Compatibility Issues: ${issues.length}`)
  issues.forEach(issue => {
    console.log(`   ${issue.type}: ${issue.message}`)
  })
  analysisData.compatibilityIssues = issues
})

// Fabric-specific events
bot.on('fabricVersionSync', (versionInfo) => {
  console.log('\n🧵 Fabric Version Sync')
  console.log(`   Loader: ${versionInfo.fabricLoader}`)
  console.log(`   API: ${versionInfo.fabricApi}`)
  analysisData.fabric = versionInfo
})

function performModAnalysis() {
  console.log('\n🔍 Performing Mod Analysis...')
  
  // Basic mod statistics
  const modCount = bot.getModCount()
  const allMods = bot.getAllMods()
  
  console.log(`📈 Analysis Results:`)
  console.log(`   Total Mods: ${modCount}`)
  
  if (modCount > 0) {
    // Categorize mods
    const modCategories = categorizeMods(allMods)
    console.log(`   Categories:`)
    for (const [category, mods] of Object.entries(modCategories)) {
      console.log(`     ${category}: ${mods.length}`)
    }
    
    // Find popular mods
    const popularMods = findPopularMods(allMods)
    if (popularMods.length > 0) {
      console.log(`   Popular Mods: ${popularMods.join(', ')}`)
    }
    
    // Dependency analysis
    const dependencyStats = analyzeDependencies(allMods)
    console.log(`   Dependencies: ${dependencyStats.totalDeps} total, ${dependencyStats.circular} circular`)
  }
  
  // Registry analysis
  const stats = bot.getModStats()
  if (stats.registries) {
    console.log(`   Registries: ${Object.keys(stats.registries).length}`)
    for (const [name, regStats] of Object.entries(stats.registries)) {
      console.log(`     ${name}: ${regStats.entries || 0} entries`)
    }
  }
  
  // Performance analysis
  analysisData.performance.analysisTime = Date.now() - startTime
  console.log(`   Analysis Time: ${analysisData.performance.analysisTime}ms`)
  
  // Test mod-aware functionality
  if (bot.game.isModded) {
    testModAwareFunctionality()
  }
}

function categorizeMods(mods) {
  const categories = {
    'Core/Library': [],
    'Technology': [],
    'Magic': [],
    'Adventure': [],
    'Utility': [],
    'Decoration': [],
    'Unknown': []
  }
  
  const categoryPatterns = {
    'Core/Library': ['forge', 'fml', 'fabric', 'core', 'api', 'lib', 'base'],
    'Technology': ['thermal', 'enderio', 'industrial', 'tech', 'mekanism', 'applied'],
    'Magic': ['thaumcraft', 'botania', 'blood', 'astral', 'wizard'],
    'Adventure': ['twilight', 'dimension', 'dungeon', 'biome', 'structure'],
    'Utility': ['jei', 'waila', 'journey', 'inventory', 'storage', 'nei'],
    'Decoration': ['chisel', 'carpenter', 'decoration', 'furniture']
  }
  
  for (const [modId, modInfo] of mods) {
    const modName = (modInfo.name || modId).toLowerCase()
    let categorized = false
    
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => modName.includes(pattern))) {
        categories[category].push(modInfo.name || modId)
        categorized = true
        break
      }
    }
    
    if (!categorized) {
      categories.Unknown.push(modInfo.name || modId)
    }
  }
  
  return categories
}

function findPopularMods(mods) {
  const popular = [
    'Just Enough Items', 'JEI', 'Thermal Foundation', 'Thermal Expansion',
    'Ender IO', 'Applied Energistics 2', 'Tinkers\' Construct', 'Botania',
    'Thaumcraft', 'JourneyMap', 'WAILA', 'Forge Mod Loader'
  ]
  
  const found = []
  for (const [modId, modInfo] of mods) {
    const modName = modInfo.name || modId
    if (popular.some(pop => modName.includes(pop) || pop.includes(modName))) {
      found.push(modName)
    }
  }
  
  return found
}

function analyzeDependencies(mods) {
  let totalDeps = 0
  let circular = 0
  
  for (const [modId, modInfo] of mods) {
    if (modInfo.dependencies && Array.isArray(modInfo.dependencies)) {
      totalDeps += modInfo.dependencies.length
      
      // Check for circular dependencies (simplified)
      for (const dep of modInfo.dependencies) {
        const depId = dep.id || dep
        const depMod = mods.get(depId)
        if (depMod && depMod.dependencies) {
          const depDeps = depMod.dependencies.map(d => d.id || d)
          if (depDeps.includes(modId)) {
            circular++
          }
        }
      }
    }
  }
  
  return { totalDeps, circular }
}

function testModAwareFunctionality() {
  console.log('\n🧪 Testing Mod-Aware Functionality...')
  
  // Test block resolution
  const testBlocks = ['minecraft:stone', 'thermal:copper_ore', 'enderio:fused_quartz']
  testBlocks.forEach(blockName => {
    const block = bot.resolveBlock(blockName)
    if (block) {
      console.log(`   ✅ Resolved ${blockName}: ${block.name}`)
    } else {
      console.log(`   ❌ Failed to resolve ${blockName}`)
    }
  })
  
  // Test search functionality
  const copperBlocks = bot.findBlocks('copper', { limit: 3 })
  console.log(`   🔍 Found ${copperBlocks.length} copper blocks`)
  
  // Test Forge ID resolution
  if (bot.game.modLoader === 'forge' || bot.game.modLoader === 'neoforge') {
    const stoneId = bot.getForgeBlockId('minecraft:stone')
    if (stoneId !== null) {
      console.log(`   🔧 Stone Forge ID: ${stoneId}`)
      const resolved = bot.getBlockByForgeId(stoneId)
      console.log(`   ↩️  Resolved back: ${resolved ? resolved.name : 'failed'}`)
    }
  }
}

bot.once('spawn', () => {
  console.log('\n🌍 Bot spawned in world')
  
  // Final analysis
  setTimeout(() => {
    console.log('\n📋 Final Analysis Report')
    console.log('=' * 50)
    
    // Save analysis to file
    const fs = require('fs')
    const filename = `mod_analysis_${Date.now()}.json`
    
    analysisData.performance.totalTime = Date.now() - startTime
    analysisData.timestamp = new Date().toISOString()
    analysisData.serverInfo.host = process.argv[2]
    analysisData.serverInfo.port = process.argv[3]
    
    fs.writeFileSync(filename, JSON.stringify(analysisData, null, 2))
    console.log(`💾 Analysis saved to ${filename}`)
    
    // Print summary
    printSummary()
    
    // Auto-disconnect after analysis
    setTimeout(() => {
      console.log('\n👋 Analysis complete, disconnecting...')
      bot.end()
    }, 2000)
  }, 5000)
})

function printSummary() {
  console.log('\n📊 Summary:')
  console.log(`   Server: ${analysisData.serverInfo.brand}`)
  console.log(`   Mod Loader: ${analysisData.modLoader.type || 'None'}`)
  console.log(`   Mods: ${analysisData.mods.count || 0}`)
  console.log(`   Registries: ${Object.keys(analysisData.registries).length}`)
  console.log(`   Total Time: ${analysisData.performance.totalTime || 0}ms`)
  
  if (analysisData.compatibilityIssues) {
    console.log(`   Issues: ${analysisData.compatibilityIssues.length}`)
  }
}

// Error handling
bot.on('error', (err) => {
  console.error('❌ Bot Error:', err.message)
  analysisData.error = err.message
})

bot.on('kicked', (reason) => {
  console.log(`🥾 Kicked: ${reason}`)
  analysisData.kicked = reason
})

bot.on('end', (reason) => {
  console.log(`🔌 Disconnected: ${reason || 'Unknown'}`)
  process.exit(0)
})

console.log('🔍 Starting advanced mod detection analysis...')
console.log(`📡 Connecting to ${process.argv[2]}:${process.argv[3]}`)
console.log('⏱️  This may take up to 60 seconds for complex mod packs...')