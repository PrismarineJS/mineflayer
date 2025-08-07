/**
 * Mod compatibility checking example
 * Demonstrates comprehensive mod compatibility analysis
 */

const mineflayer = require('../../index.js')

if (process.argv.length < 4) {
  console.log('Usage: node compatibility_checking.js <host> <port> [<name>]')
  process.exit(1)
}

// Create bot with mod loader and compatibility checking enabled
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || 'CompatibilityChecker',
  auth: 'offline',
  
  modLoader: {
    enabled: true,
    strict: false,
    handshakeTimeout: 30000,
    enableCompatibilityChecks: true,
    checkVersionCompatibility: true,
    allowOptionalDependencies: true,
    warnAboutDeprecated: true,
    debugMode: true
  }
})

bot.on('connect', () => {
  console.log('🔌 Connected to server')
})

bot.on('login', () => {
  console.log('🔐 Login successful')
  console.log(`📋 Server: ${bot.game.serverBrand}`)
  console.log(`🎮 Minecraft: ${bot.version}`)
  console.log(`🔧 Modded: ${bot.game.isModded ? 'Yes' : 'No'}`)
})

bot.on('modLoaderDetected', (info) => {
  console.log(`\n🚀 Mod Loader Detected: ${info.type} ${info.version || 'unknown'}`)
  
  // Set up some known incompatibilities for demonstration
  if (info.type === 'forge') {
    console.log('📝 Configuring known mod incompatibilities...')
    
    // Add some common Forge incompatibilities
    bot.addModIncompatibility('optifine', ['sodium', 'phosphor', 'lithium'], 'rendering_conflict')
    bot.addModIncompatibility('thermal_foundation', ['immersive_engineering'], 'version_specific')
    bot.addModIncompatibility('buildcraft', ['industrialcraft'], 'energy_system_conflict')
    
    // Mark some deprecated mods
    bot.markModAsDeprecated('endercore', ['enderio_core'])
    bot.markModAsDeprecated('codechickencore', ['codechicken_lib'])
    bot.markModAsDeprecated('natura', ['biomes_o_plenty'])
  }
})

bot.on('modLoaderReady', (modLoader) => {
  console.log('\n✅ Mod Loader Ready - Starting compatibility analysis...')
  
  // Perform initial compatibility check
  setTimeout(() => {
    performCompatibilityAnalysis()
  }, 1000)
})

bot.on('modsReceived', (data) => {
  console.log(`\n📦 Received ${data.modCount || 0} mods from server`)
  
  if (data.errors && data.errors.length > 0) {
    console.warn(`⚠️  ${data.errors.length} parsing errors occurred`)
  }
  
  // Compatibility check will be triggered automatically when mods are added
})

bot.on('modCompatibilityReport', (report) => {
  console.log('\n📊 Compatibility Report Generated:')
  console.log(`   Status: ${bot.getCompatibilityStatus().message}`)
  console.log(`   Critical: ${report.summary.critical}`)
  console.log(`   Errors: ${report.summary.errors}`)
  console.log(`   Warnings: ${report.summary.warnings}`)
  console.log(`   Info: ${report.summary.info}`)
})

function performCompatibilityAnalysis() {
  console.log('\n🔍 Performing Comprehensive Compatibility Analysis...')
  console.log('=' * 50)
  
  // Get mod statistics
  const stats = bot.getModStats()
  console.log(`📈 Mod Statistics:`)
  console.log(`   Total Mods: ${stats.totalMods || 0}`)
  console.log(`   Dependencies Tracked: ${stats.totalDependencies || 0}`)
  console.log(`   Conflicts Tracked: ${stats.totalConflicts || 0}`)
  
  if (stats.compatibility) {
    console.log(`   Compatibility Status: ${stats.compatibility.status}`)
    console.log(`   Last Check: ${stats.compatibility.lastCheck}`)
  }
  
  if (bot.getModCount() > 0) {
    // Perform detailed compatibility check
    const report = bot.checkModCompatibility()
    
    if (report) {
      console.log('\n📋 Detailed Compatibility Analysis:')
      displayCompatibilityReport(report)
      
      // Test specific compatibility queries
      testSpecificCompatibility()
    }
  } else {
    console.log('\n🤷 No mods detected - compatibility analysis not applicable')
    demonstrateFeatures()
  }
}

function displayCompatibilityReport(report) {
  console.log(`\n🔍 Analysis completed at ${new Date(report.timestamp).toLocaleString()}`)
  
  // Show critical issues first
  if (report.issues.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES (${report.issues.length}):`)
    report.issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`)
      if (issue.suggestions && issue.suggestions.length > 0) {
        issue.suggestions.forEach(suggestion => {
          console.log(`   💡 ${suggestion}`)
        })
      }
    })
  }
  
  // Show warnings
  if (report.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${report.warnings.length}):`)
    report.warnings.slice(0, 5).forEach((warning, i) => {
      console.log(`${i + 1}. [${warning.severity.toUpperCase()}] ${warning.message}`)
      if (warning.suggestions && warning.suggestions.length > 0) {
        warning.suggestions.slice(0, 2).forEach(suggestion => {
          console.log(`   💡 ${suggestion}`)
        })
      }
    })
    
    if (report.warnings.length > 5) {
      console.log(`   ... and ${report.warnings.length - 5} more warnings`)
    }
  }
  
  // Show recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n🎯 RECOMMENDATIONS (${report.recommendations.length}):`)
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.message}`)
      if (rec.suggestions) {
        rec.suggestions.forEach(suggestion => {
          console.log(`   → ${suggestion}`)
        })
      }
    })
  }
  
  // Overall status
  const status = bot.getCompatibilityStatus()
  console.log(`\n🎯 Overall Status: ${status.status.toUpperCase()}`)
  console.log(`   ${status.message}`)
}

function testSpecificCompatibility() {
  console.log('\n🧪 Testing Specific Compatibility Scenarios...')
  
  // Test finding specific mod types
  const thermalMods = bot.findMods('thermal')
  if (thermalMods.length > 0) {
    console.log(`   Found ${thermalMods.length} Thermal mods: ${thermalMods.map(m => m.name).join(', ')}`)
  }
  
  const utilityMods = bot.findMods(/(jei|nei|waila|journeymap)/i)
  if (utilityMods.length > 0) {
    console.log(`   Found ${utilityMods.length} utility mods: ${utilityMods.map(m => m.name).join(', ')}`)
  }
  
  // Test compatibility status
  const compatibility = bot.getCompatibilityStatus()
  console.log(`   Current compatibility: ${compatibility.status}`)
  
  // Show formatted report snippet
  const formattedReport = bot.formatCompatibilityReport()
  if (formattedReport && formattedReport.length > 100) {
    console.log('\\n📄 Report Preview:')
    console.log(formattedReport.substring(0, 500) + '...')
  }
}

function demonstrateFeatures() {
  console.log('\\n🎭 Demonstrating Compatibility Checking Features:')
  console.log('   (Server appears to be vanilla - showing feature demo)')
  
  // Demonstrate API even without mods loaded
  console.log('\\n📚 Available Methods:')
  console.log('   • bot.checkModCompatibility() - Run full compatibility check')
  console.log('   • bot.getCompatibilityStatus() - Get current compatibility status')
  console.log('   • bot.formatCompatibilityReport() - Get human-readable report')
  console.log('   • bot.addModIncompatibility() - Register known incompatibilities')
  console.log('   • bot.markModAsDeprecated() - Mark mods as deprecated')
  
  console.log('\\n🔧 Configuration Options:')
  console.log('   • checkVersionCompatibility - Enable version checking')
  console.log('   • allowOptionalDependencies - Handle optional deps gracefully')
  console.log('   • warnAboutDeprecated - Show deprecation warnings')
  console.log('   • strictMode - Strict compatibility enforcement')
  
  // Show current status even for vanilla
  const status = bot.getCompatibilityStatus()
  console.log(`\\n📊 Current Status: ${status.message}`)
}

// Chat commands for interactive testing
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const args = message.split(' ')
  const command = args[0].toLowerCase()
  
  switch (command) {
    case '!compat':
      const status = bot.getCompatibilityStatus()
      bot.chat(`Compatibility: ${status.status} - ${status.message}`)
      break
      
    case '!check':
      bot.chat('Running compatibility check...')
      const report = bot.checkModCompatibility()
      if (report) {
        bot.chat(`Found ${report.summary.critical} critical, ${report.summary.errors} errors, ${report.summary.warnings} warnings`)
      } else {
        bot.chat('No compatibility report available')
      }
      break
      
    case '!mods':
      const modCount = bot.getModCount()
      bot.chat(`${modCount} mods loaded`)
      if (modCount > 0) {
        const stats = bot.getModStats()
        bot.chat(`Dependencies: ${stats.totalDependencies}, Conflicts: ${stats.totalConflicts}`)
      }
      break
      
    case '!report':
      bot.chat('Generating compatibility report...')
      setTimeout(() => {
        const formatted = bot.formatCompatibilityReport()
        console.log('\\n📄 Full Compatibility Report:')
        console.log(formatted)
        bot.chat('Report generated in console')
      }, 100)
      break
  }
})

bot.once('spawn', () => {
  console.log('\\n🌍 Bot spawned in world')
  
  console.log('\\n🎮 Interactive Commands:')
  console.log('   !compat - Check compatibility status')
  console.log('   !check - Run compatibility analysis')
  console.log('   !mods - Show mod statistics')
  console.log('   !report - Generate full report')
  
  // Final analysis after spawn
  setTimeout(() => {
    console.log('\\n📋 Final Compatibility Summary')
    console.log('=' * 40)
    
    const finalStats = bot.getModStats()
    const finalStatus = bot.getCompatibilityStatus()
    
    console.log(`Mods: ${finalStats.totalMods || 0}`)
    console.log(`Status: ${finalStatus.status}`)
    console.log(`Message: ${finalStatus.message}`)
    
    if (finalStats.compatibility) {
      console.log(`Critical Issues: ${finalStats.compatibility.critical}`)
      console.log(`Total Errors: ${finalStats.compatibility.errors}`)
      console.log(`Total Warnings: ${finalStats.compatibility.warnings}`)
    }
    
    console.log('\\n✅ Compatibility checking system ready!')
  }, 2000)
})

// Error handling
bot.on('error', (err) => {
  console.error('❌ Bot Error:', err.message)
})

bot.on('end', (reason) => {
  console.log(`🔌 Disconnected: ${reason || 'Unknown'}`)
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down compatibility checker...')
  bot.end()
  process.exit(0)
})

console.log('🔍 Starting mod compatibility analysis...')
console.log(`📡 Connecting to ${process.argv[2]}:${process.argv[3]}`)
console.log('🔧 Compatibility checking system will analyze mod relationships...')