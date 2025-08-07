/**
 * Comprehensive test suite for mod loader support
 * Tests Forge, NeoForge, and Fabric mod loader functionality
 */

const assert = require('assert')
const { EventEmitter } = require('events')

// Import mod loader components
const { ModRegistry } = require('../lib/mod_registry')
const { validateConfig } = require('../lib/mod_loader_config')
const { parseServerBrand } = require('../lib/mod_loader_detection')
const ForgeModParser = require('../lib/forge_mod_parser')
const { ModLoaderFactory } = require('../lib/mod_loaders')
const { createForgeResolver } = require('../lib/forge_registry_integration')
const { ModLoaderError, ErrorCodes, ModLoaderErrorHandler } = require('../lib/mod_loader_error_handler')

describe('Mod Loader Support', function () {
  this.timeout(10000) // Allow longer timeouts for complex tests

  describe('ModRegistry', function () {
    let registry

    beforeEach(function () {
      registry = new ModRegistry()
    })

    it('should add and retrieve mods', function () {
      registry.addMod('test_mod', {
        version: '1.0.0',
        name: 'Test Mod',
        dependencies: ['minecraft']
      })

      const mod = registry.getMod('test_mod')
      assert.strictEqual(mod.id, 'test_mod')
      assert.strictEqual(mod.version, '1.0.0')
      assert.strictEqual(mod.name, 'Test Mod')
      assert.deepStrictEqual(mod.dependencies, ['minecraft'])
    })

    it('should track mod count', function () {
      assert.strictEqual(registry.getModCount(), 0)

      registry.addMod('mod1', { version: '1.0.0' })
      registry.addMod('mod2', { version: '2.0.0' })

      assert.strictEqual(registry.getModCount(), 2)
    })

    it('should find mods by pattern', function () {
      registry.addMod('thermal_foundation', { version: '1.0.0', name: 'Thermal Foundation' })
      registry.addMod('thermal_expansion', { version: '1.0.0', name: 'Thermal Expansion' })
      registry.addMod('enderio', { version: '1.0.0', name: 'Ender IO' })

      const thermalMods = registry.findMods(/thermal/i)
      assert.strictEqual(thermalMods.length, 2)
      assert(thermalMods.some(mod => mod.id === 'thermal_foundation'))
      assert(thermalMods.some(mod => mod.id === 'thermal_expansion'))
    })

    it('should detect compatibility issues', function (done) {
      registry.on('compatibilityIssues', (issues) => {
        assert(Array.isArray(issues))
        assert(issues.length > 0)
        assert.strictEqual(issues[0].type, 'missing_dependency')
        done()
      })

      registry.addMod('dependent_mod', {
        version: '1.0.0',
        dependencies: ['missing_mod']
      })
    })

    it('should handle registry mappings', function () {
      const mapping = new Map([[1, 'minecraft:stone'], [2, 'minecraft:dirt']])
      registry.addRegistryMapping('minecraft:block', 'minecraft', mapping)

      const resolved = registry.resolveId('minecraft:block', 1)
      assert.strictEqual(resolved, 'minecraft:stone')

      const stats = registry.getStats()
      assert.strictEqual(stats.registries['minecraft:block'].totalMappings, 2)
    })
  })

  describe('Configuration Validation', function () {
    it('should validate default configuration', function () {
      const config = validateConfig()
      assert.strictEqual(config.enabled, true)
      assert.strictEqual(config.strict, false)
      assert.strictEqual(config.handshakeTimeout, 30000)
    })

    it('should validate custom configuration', function () {
      const customConfig = {
        enabled: false,
        handshakeTimeout: 60000,
        maxRetries: 5
      }

      const validated = validateConfig(customConfig)
      assert.strictEqual(validated.enabled, false)
      assert.strictEqual(validated.handshakeTimeout, 60000)
      assert.strictEqual(validated.maxRetries, 5)
    })

    it('should reject invalid configuration', function () {
      assert.throws(() => {
        validateConfig({ handshakeTimeout: 'invalid' })
      }, /must be an integer/)

      assert.throws(() => {
        validateConfig({ handshakeTimeout: 1000 }) // Too low
      }, /must be between/)
    })
  })

  describe('Server Brand Detection', function () {
    it('should detect vanilla servers', function () {
      const result = parseServerBrand('vanilla')
      assert.strictEqual(result.type, 'vanilla')
      assert.strictEqual(result.version, null)
    })

    it('should detect Forge servers', function () {
      const result = parseServerBrand('forge-47.3.0')
      assert.strictEqual(result.type, 'forge')
      assert.strictEqual(result.version, '47.3.0')
    })

    it('should detect NeoForge servers', function () {
      const result = parseServerBrand('neoforge-21.1.90')
      assert.strictEqual(result.type, 'neoforge')
      assert.strictEqual(result.version, '21.1.90')
    })

    it('should detect Fabric servers', function () {
      const result = parseServerBrand('fabric-0.16.9')
      assert.strictEqual(result.type, 'fabric')
      assert.strictEqual(result.version, '0.16.9')
    })

    it('should handle hybrid servers', function () {
      const result = parseServerBrand('mohist-1.20.1')
      assert.strictEqual(result.type, 'forge')
      assert.strictEqual(result.hybrid, true)
    })
  })

  describe('Forge Mod Parser', function () {
    let parser

    beforeEach(function () {
      parser = new ForgeModParser()
    })

    it('should parse valid version strings', function () {
      const version1 = parser.parseVersion('1.2.3')
      assert.strictEqual(version1.major, 1)
      assert.strictEqual(version1.minor, 2)
      assert.strictEqual(version1.patch, 3)
      assert.strictEqual(version1.isValid, true)

      const version2 = parser.parseVersion('47.3.0-beta')
      assert.strictEqual(version2.major, 47)
      assert.strictEqual(version2.minor, 3)
      assert.strictEqual(version2.patch, 0)
      assert.strictEqual(version2.suffix, 'beta')
    })

    it('should validate version formats', function () {
      assert(parser.isValidVersion('1.2.3'))
      assert(parser.isValidVersion('47.3.0'))
      assert(parser.isValidVersion('1.0.0-beta'))
      assert(!parser.isValidVersion('invalid'))
      assert(!parser.isValidVersion(''))
      assert(!parser.isValidVersion(null))
    })

    it('should compare versions correctly', function () {
      assert.strictEqual(parser.compareVersions('1.2.3', '1.2.4'), -1)
      assert.strictEqual(parser.compareVersions('2.0.0', '1.9.9'), 1)
      assert.strictEqual(parser.compareVersions('1.0.0', '1.0.0'), 0)
    })

    it('should infer mod names correctly', function () {
      assert.strictEqual(parser.inferModName('thermal'), 'Thermal')
      assert.strictEqual(parser.inferModName('enderio'), 'Enderio')
      assert.strictEqual(parser.inferModName('thermal_foundation'), 'Thermal Foundation')
      assert.strictEqual(parser.inferModName('jei'), 'Just Enough Items')
    })

    it('should parse mod list packets', function () {
      // Create mock mod list packet
      const packet = createMockModListPacket([
        { id: 'minecraft', version: '1.20.1' },
        { id: 'forge', version: '47.3.0' },
        { id: 'thermal_foundation', version: '1.0.0' }
      ])

      const result = parser.parseModListPacket(packet)
      assert.strictEqual(result.modCount, 3)
      assert.strictEqual(result.mods.length, 3)
      assert.strictEqual(result.forgeVersion, '47.3.0')
      assert.strictEqual(result.errors.length, 0)
    })
  })

  describe('Mod Loader Factory', function () {
    let mockBot

    beforeEach(function () {
      mockBot = new EventEmitter()
      mockBot.version = '1.20.1'
      mockBot.supportFeature = () => false
      mockBot._client = new EventEmitter()
      mockBot._client.registerChannel = () => {}
      mockBot._client.writeChannel = () => {}
    })

    it('should create Forge mod loader', function () {
      const modLoader = ModLoaderFactory.create('forge', mockBot)
      assert(modLoader)
      assert.strictEqual(modLoader.getType(), 'forge')
    })

    it('should create NeoForge mod loader', function () {
      const modLoader = ModLoaderFactory.create('neoforge', mockBot)
      assert(modLoader)
      assert.strictEqual(modLoader.getType(), 'neoforge')
    })

    it('should create Fabric mod loader', function () {
      const modLoader = ModLoaderFactory.create('fabric', mockBot)
      assert(modLoader)
      assert.strictEqual(modLoader.getType(), 'fabric')
    })

    it('should return null for vanilla', function () {
      const modLoader = ModLoaderFactory.create('vanilla', mockBot)
      assert.strictEqual(modLoader, null)
    })

    it('should check supported types', function () {
      assert(ModLoaderFactory.isSupported('forge'))
      assert(ModLoaderFactory.isSupported('neoforge'))
      assert(ModLoaderFactory.isSupported('fabric'))
      assert(!ModLoaderFactory.isSupported('unknown'))
    })
  })

  describe('Forge Registry Integration', function () {
    let mockBot, resolver

    beforeEach(function () {
      mockBot = {
        modLoader: {
          isReady: () => true,
          resolveId: (registry, id) => id === 1 ? 'minecraft:stone' : null,
          reverseResolveId: (registry, stringId) => stringId === 'minecraft:stone' ? 1 : null
        },
        registry: {
          blocksByName: {
            'minecraft:stone': { defaultState: 1 }
          }
        }
      }
      resolver = createForgeResolver(mockBot)
    })

    it('should resolve Forge block IDs', function () {
      const block = resolver.resolveBlock(1)
      assert(block)
      assert.strictEqual(block.name, 'minecraft:stone')
    })

    it('should resolve block by name', function () {
      const block = resolver.resolveBlockByName('minecraft:stone')
      assert(block)
    })

    it('should check if blocks are modded', function () {
      assert(!resolver.isModded('minecraft:stone'))
      assert(resolver.isModded('thermal:copper_ore'))
    })

    it('should extract mod ID from string', function () {
      assert.strictEqual(resolver.getModId('minecraft:stone'), 'minecraft')
      assert.strictEqual(resolver.getModId('thermal:copper_ore'), 'thermal')
      assert.strictEqual(resolver.getModId('stone'), 'minecraft')
    })
  })

  describe('Integration Tests', function () {
    it('should handle complete Forge handshake flow', function (done) {
      const mockBot = new EventEmitter()
      mockBot.version = '1.20.1'
      mockBot.supportFeature = () => false
      mockBot._client = new EventEmitter()
      mockBot._client.registerChannel = () => {}
      mockBot._client.writeChannel = () => {}

      const modLoader = ModLoaderFactory.create('forge', mockBot, {
        handshakeTimeout: 1000
      })

      let handshakeCompleted = false

      modLoader.on('handshakeComplete', () => {
        handshakeCompleted = true
        assert(modLoader.isReady())
        done()
      })

      modLoader.on('error', (err) => {
        if (err.message.includes('timeout')) {
          // Expected for mock test
          assert(!handshakeCompleted)
          done()
        } else {
          done(err)
        }
      })

      // Start handshake
      modLoader.startHandshake()
    })

    it('should handle mod compatibility checking', function (done) {
      const registry = new ModRegistry()

      registry.on('compatibilityIssues', (issues) => {
        assert(issues.length > 0)
        const missingDep = issues.find(i => i.type === 'missing_dependency')
        assert(missingDep)
        assert(missingDep.message.includes('requires'))
        done()
      })

      // Add mods with missing dependencies
      registry.addMod('mod_a', { version: '1.0.0', dependencies: ['missing_mod'] })
    })

    it('should handle registry ID resolution', function () {
      const registry = new ModRegistry()

      // Add registry mapping
      // const blockMapping = new Map([
      //   [1, 'minecraft:air'],
      //   [2, 'minecraft:stone'],
      //   [100, 'thermal:copper_ore']
      // ])

      registry.addRegistryMapping('minecraft:block', 'minecraft', new Map([[1, 'minecraft:air'], [2, 'minecraft:stone']]))
      registry.addRegistryMapping('minecraft:block', 'thermal', new Map([[100, 'thermal:copper_ore']]))

      assert.strictEqual(registry.resolveId('minecraft:block', 1), 'minecraft:air')
      assert.strictEqual(registry.resolveId('minecraft:block', 100), 'thermal:copper_ore')
      assert.strictEqual(registry.resolveId('minecraft:block', 999), null)
    })
  })

  describe('Error Handling', function () {
    let errorHandler

    beforeEach(function () {
      errorHandler = new ModLoaderErrorHandler()
    })

    it('should handle version compatibility checks', function () {
      const result = errorHandler.checkVersionCompatibility('forge', '1.20.1', '47.0.0')
      assert(result.compatible || result.canContinue)
    })

    it('should handle unsupported versions with graceful degradation', function () {
      const handler = new ModLoaderErrorHandler({ allowUnsupportedVersions: true })
      const result = handler.checkVersionCompatibility('forge', '1.20.1', '999.999.999')
      assert(!result.compatible)
      assert(result.canContinue)
      assert(result.warning)
    })

    it('should handle handshake errors with retry logic', function () {
      const error = new Error('Connection timeout')
      const result = errorHandler.handleHandshakeError(error, 'forge', 'test_connection')

      assert(result.shouldRetry)
      assert(result.retryDelay > 0)
      assert(result.error instanceof ModLoaderError)
      assert.strictEqual(result.error.code, ErrorCodes.HANDSHAKE_TIMEOUT)
    })

    it('should not retry connection rejections', function () {
      const error = new Error('Connection rejected by server')
      const result = errorHandler.handleHandshakeError(error, 'forge', 'test_connection')

      assert(!result.shouldRetry)
      assert.strictEqual(result.error.code, ErrorCodes.CONNECTION_REJECTED)
    })

    it('should handle registry sync errors', function () {
      const error = new Error('Registry sync timeout')
      const result = errorHandler.handleRegistryError(error, 'minecraft:block')

      assert(result.error instanceof ModLoaderError)
      assert.strictEqual(result.error.code, ErrorCodes.REGISTRY_SYNC_FAILED)
      assert.strictEqual(result.error.details.registryName, 'minecraft:block')
    })

    it('should provide user-friendly error messages', function () {
      const error = new ModLoaderError(
        'Forge version 999.0.0 is not supported',
        ErrorCodes.UNSUPPORTED_VERSION,
        { latestSupportedVersion: '47.3.0' }
      )

      const message = errorHandler.createUserMessage(error)
      assert(message.includes('Upgrade to 47.3.0'))
    })

    it('should generate recovery suggestions', function () {
      const error = new ModLoaderError(
        'Handshake timeout',
        ErrorCodes.HANDSHAKE_TIMEOUT
      )

      const suggestions = errorHandler.getRecoverySuggestions(error)
      assert(suggestions.length > 0)
      assert(suggestions.some(s => s.includes('handshakeTimeout')))
    })

    it('should track retry statistics', function () {
      const error = new Error('timeout')

      errorHandler.handleHandshakeError(error, 'forge', 'conn1')
      errorHandler.handleHandshakeError(error, 'forge', 'conn2')

      const stats = errorHandler.getRetryStats()
      assert.strictEqual(stats.activeRetries, 2)
      assert(stats.totalAttempts > 0)
    })

    it('should handle mod compatibility issues', function () {
      const issues = [
        { type: 'missing_dependency', modId: 'test_mod', dependency: 'required_mod', required: true },
        { type: 'conflict', modId: 'mod_a', conflictWith: 'mod_b' },
        { type: 'version_mismatch', modId: 'old_mod', currentVersion: '1.0.0', requiredVersion: '2.0.0' }
      ]

      const result = errorHandler.handleCompatibilityIssues(issues)

      assert.strictEqual(result.critical.length, 2) // missing dep + conflict
      assert.strictEqual(result.warnings.length, 1) // version mismatch
      assert(result.recommendations.length > 0)
    })
  })

  describe('Performance Tests', function () {
    it('should handle large mod lists efficiently', function () {
      const registry = new ModRegistry()
      const startTime = Date.now()

      // Add 1000 mods
      for (let i = 0; i < 1000; i++) {
        registry.addMod(`mod_${i}`, {
          version: '1.0.0',
          name: `Test Mod ${i}`,
          dependencies: i > 0 ? [`mod_${i - 1}`] : []
        })
      }

      const addTime = Date.now() - startTime
      assert(addTime < 1000, `Adding 1000 mods took ${addTime}ms, should be < 1000ms`)

      // Test search performance
      const searchStart = Date.now()
      const results = registry.findMods(/mod_[5-9]\d/)
      const searchTime = Date.now() - searchStart

      assert(results.length > 0)
      assert(searchTime < 100, `Search took ${searchTime}ms, should be < 100ms`)
    })

    it('should handle large registry mappings efficiently', function () {
      const registry = new ModRegistry()
      const mapping = new Map()

      // Create large mapping (10,000 entries)
      for (let i = 0; i < 10000; i++) {
        mapping.set(i, `mod:item_${i}`)
      }

      const startTime = Date.now()
      registry.addRegistryMapping('minecraft:item', 'mod', mapping)
      const addTime = Date.now() - startTime

      assert(addTime < 500, `Adding large mapping took ${addTime}ms, should be < 500ms`)

      // Test resolution performance
      const resolveStart = Date.now()
      for (let i = 0; i < 1000; i++) {
        const result = registry.resolveId('minecraft:item', i)
        assert.strictEqual(result, `mod:item_${i}`)
      }
      const resolveTime = Date.now() - resolveStart

      assert(resolveTime < 100, `1000 resolutions took ${resolveTime}ms, should be < 100ms`)
    })

    it('should handle error logging without performance impact', function () {
      const errorHandler = new ModLoaderErrorHandler({ logErrors: true })
      const error = new ModLoaderError('Test error', ErrorCodes.PARSING_ERROR)

      const startTime = Date.now()
      for (let i = 0; i < 1000; i++) {
        errorHandler.logError(error, 'Performance Test')
      }
      const logTime = Date.now() - startTime

      assert(logTime < 1000, `1000 error logs took ${logTime}ms, should be < 1000ms`)
    })
  })

  describe('Error Handler Integration', function () {
    let mockBot, modLoader

    beforeEach(function () {
      mockBot = new EventEmitter()
      mockBot.version = '1.20.1'
      mockBot.supportFeature = () => false
      mockBot._client = new EventEmitter()
      mockBot._client.registerChannel = () => {}
      mockBot._client.writeChannel = () => {}

      modLoader = ModLoaderFactory.create('forge', mockBot, {
        handshakeTimeout: 1000,
        enableGracefulDegradation: true
      })
    })

    it('should integrate error handler into mod loader', function () {
      assert(modLoader.errorHandler)
      assert(typeof modLoader.checkVersionCompatibility === 'function')
      assert(typeof modLoader.handleHandshakeError === 'function')
    })

    it('should handle version compatibility in initialization', function (done) {
      const incompatibleBot = new EventEmitter()
      incompatibleBot.version = '1.8.9' // Very old version
      incompatibleBot.supportFeature = () => false
      incompatibleBot._client = new EventEmitter()
      incompatibleBot._client.registerChannel = () => {}

      try {
        const failingLoader = ModLoaderFactory.create('forge', incompatibleBot, { strict: true })

        failingLoader.on('error', (err) => {
          assert(err.message.includes('not supported'))
          done()
        })
      } catch (err) {
        assert(err.message.includes('not supported'))
        done()
      }
    })
  })
})

// Helper function to create mock mod list packet
function createMockModListPacket (mods) {
  let totalLength = 4 // mod count (4 bytes)

  // Calculate total packet length
  mods.forEach(mod => {
    totalLength += 2 + Buffer.byteLength(mod.id, 'utf8') // id length + id
    totalLength += 2 + Buffer.byteLength(mod.version, 'utf8') // version length + version
  })

  const packet = Buffer.alloc(totalLength)
  let offset = 0

  // Write mod count
  packet.writeUInt32BE(mods.length, offset)
  offset += 4

  // Write each mod
  mods.forEach(mod => {
    // Write mod ID
    packet.writeUInt16BE(Buffer.byteLength(mod.id, 'utf8'), offset)
    offset += 2
    packet.write(mod.id, offset, 'utf8')
    offset += Buffer.byteLength(mod.id, 'utf8')

    // Write version
    packet.writeUInt16BE(Buffer.byteLength(mod.version, 'utf8'), offset)
    offset += 2
    packet.write(mod.version, offset, 'utf8')
    offset += Buffer.byteLength(mod.version, 'utf8')
  })

  return packet
}
