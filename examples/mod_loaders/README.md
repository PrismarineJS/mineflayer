# Mineflayer Mod Loader Examples

This directory contains examples demonstrating how to use Mineflayer with modded Minecraft servers.

## Overview

Mineflayer now supports connecting to modded Minecraft servers running:
- **Forge** - Full support with mod detection and registry synchronization
- **NeoForge** - Full support (extends Forge implementation)
- **Fabric** - Basic support (limited mod detection due to Fabric's architecture)

## Examples

### Basic Forge Connection (`basic_forge.js`)

Demonstrates connecting to a Forge server with full mod loader functionality:

```bash
node basic_forge.js localhost 25565 MyBot
```

Features demonstrated:
- Automatic Forge detection
- Mod list retrieval and parsing
- Registry synchronization
- Chat commands for mod information
- Block/item resolution with Forge IDs

### Fabric Server Connection (`fabric_example.js`)

Shows basic Fabric server support:

```bash
node fabric_example.js localhost 25565 FabricBot
```

Features:
- Fabric Loader and API version detection
- Configuration phase handling
- Basic registry sync support

## Configuration Options

All examples use the `modLoader` configuration object:

```javascript
const bot = mineflayer.createBot({
  // ... other options
  modLoader: {
    enabled: true,              // Enable mod loader support
    strict: false,              // Don't fail on handshake errors
    handshakeTimeout: 30000,    // Handshake timeout (30 seconds)
    enableCompatibilityChecks: true, // Check mod compatibility
    debugMode: true,            // Enable debug logging
    allowUnsupportedVersions: false // Allow unknown mod loader versions
  }
})
```

### Configuration Options Explained

- `enabled`: Enable/disable mod loader support entirely
- `strict`: If true, bot will disconnect if mod loader handshake fails
- `handshakeTimeout`: Maximum time to wait for mod loader handshake
- `registryTimeout`: Maximum time to wait for registry synchronization
- `enableCompatibilityChecks`: Validate mod dependencies and conflicts
- `debugMode`: Enable verbose logging for troubleshooting
- `allowUnsupportedVersions`: Allow connection to untested mod loader versions
- `maxRetries`: Number of times to retry failed handshakes
- `retryDelay`: Delay between handshake retries

## Bot API Extensions

When connected to a modded server, the bot gains additional methods:

### Mod Information
```javascript
// Get specific mod info
const mod = bot.getMod('thermal_foundation')

// Get all mods
const allMods = bot.getAllMods()

// Get mod count
const count = bot.getModCount()

// Search mods by pattern
const thermalMods = bot.findMods('thermal')

// Get mod statistics
const stats = bot.getModStats()
```

### Block/Item Resolution
```javascript
// Resolve blocks by name or ID (supports both vanilla and modded)
const block = bot.resolveBlock('thermal:copper_ore')
const item = bot.resolveItem('enderio:conduit_cable')

// Search for blocks/items
const copperBlocks = bot.findBlocks('copper', { includeMods: true })
const thermalItems = bot.findItems('thermal', { limit: 10 })

// Forge-specific ID resolution
const forgeId = bot.getForgeBlockId('minecraft:stone')
const block = bot.getBlockByForgeId(1)

// Check if block/item is modded
const isModded = bot.isModdedBlock('thermal:copper_ore') // true
```

### Utility Functions
```javascript
// Check mod loader status
console.log(bot.game.isModded)        // true/false
console.log(bot.game.modLoader)       // 'forge', 'neoforge', 'fabric', or null
console.log(bot.game.modLoaderVersion) // mod loader version

// Get mod ID from namespaced name
const modId = bot.getModIdFromString('thermal:copper_ore') // 'thermal'
```

## Events

The bot emits several mod loader-specific events:

```javascript
// Mod loader detected
bot.on('modLoaderDetected', (info) => {
  console.log(`${info.type} detected (v${info.version})`)
})

// Mod loader ready for use
bot.on('modLoaderReady', (modLoader) => {
  console.log(`${modLoader.getType()} is ready`)
})

// Mods received from server
bot.on('modsReceived', (data) => {
  console.log(`Received ${data.modCount} mods`)
})

// Registry updated
bot.on('registryMappingUpdated', (registryName, mapping) => {
  console.log(`${registryName}: ${mapping.size} entries`)
})

// Compatibility issues found
bot.on('modCompatibilityIssues', (issues) => {
  issues.forEach(issue => console.log(issue.message))
})

// Forge-specific events
bot.on('forgeVersionDetected', (version) => {
  console.log(`Forge version: ${version}`)
})

// Fabric-specific events
bot.on('fabricVersionSync', (versionInfo) => {
  console.log(`Fabric: ${versionInfo.fabricLoader}`)
})
```

## Troubleshooting

### Common Issues

1. **Connection Fails**: Ensure the server is actually running the detected mod loader
2. **Handshake Timeout**: Increase `handshakeTimeout` for slow servers
3. **Registry Errors**: Check that mod versions match between client and server
4. **Unknown Mod Loader**: Set `allowUnsupportedVersions: true` to bypass version checks

### Debug Mode

Enable debug mode for detailed logging:

```javascript
modLoader: {
  enabled: true,
  debugMode: true  // Enable verbose logging
}
```

### Strict Mode

For production bots, enable strict mode to fail fast on incompatibilities:

```javascript
modLoader: {
  enabled: true,
  strict: true  // Disconnect on mod loader errors
}
```

## Supported Versions

### Forge
- Minecraft 1.12.2+
- See `lib/version.js` for detailed version compatibility

### NeoForge  
- Minecraft 1.20.1+
- All versions currently supported

### Fabric
- Minecraft 1.19.2+
- Limited detection capabilities due to Fabric's design

## Advanced Usage

### Custom Mod Channels

For bots that need to communicate with specific mods:

```javascript
modLoader: {
  enabled: true,
  customChannels: [
    'mymod:custom_channel',
    'anothermods:data_sync'
  ]
}
```

### Mod Filtering

Connect only to servers with specific mods:

```javascript
bot.on('modsReceived', (data) => {
  const requiredMods = ['thermal_foundation', 'enderio']
  const serverMods = data.mods.map(mod => mod.id)
  
  const hasRequired = requiredMods.every(mod => serverMods.includes(mod))
  if (!hasRequired) {
    console.log('Server missing required mods')
    bot.end()
  }
})
```

### Registry Monitoring

Monitor specific registry changes:

```javascript
bot.on('registryMappingUpdated', (registryName, mapping) => {
  if (registryName === 'minecraft:block') {
    console.log(`Block registry updated: ${mapping.size} blocks`)
    
    // Check for specific blocks
    for (const [id, name] of mapping) {
      if (name.includes('thermal')) {
        console.log(`Thermal block found: ${name} (ID: ${id})`)
      }
    }
  }
})
```

## Notes

- **Fabric Limitations**: Fabric's client-server architecture provides limited mod information compared to Forge
- **Performance**: Mod detection adds minimal overhead to vanilla server connections
- **Version Updates**: Supported mod loader versions are updated regularly in `lib/version.js`
- **Compatibility**: All existing Mineflayer functionality works unchanged on modded servers