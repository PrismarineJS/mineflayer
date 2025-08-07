/**
 * Performance benchmarking utilities for mod registry operations
 * Provides tools to measure and compare performance improvements
 */

const { ModRegistry } = require('./mod_registry')
const { OptimizedModRegistry } = require('./mod_registry_performance')

/**
 * Benchmark suite for mod registry performance
 */
class ModRegistryBenchmarks {
  constructor (options = {}) {
    this.options = {
      warmupRuns: options.warmupRuns || 10,
      testRuns: options.testRuns || 100,
      maxMods: options.maxMods || 1000,
      verbose: options.verbose || false,
      ...options
    }
  }

  /**
   * Run comprehensive performance benchmarks
   */
  async runBenchmarks () {
    console.log('🚀 Starting Mod Registry Performance Benchmarks')
    console.log('=' * 60)
    
    const results = {
      timestamp: Date.now(),
      options: this.options,
      benchmarks: {}
    }
    
    // Test data generation
    console.log('📦 Generating test data...')
    const testData = this.generateTestData(this.options.maxMods)
    
    // Benchmark standard registry
    console.log('\n📊 Benchmarking Standard ModRegistry...')
    results.benchmarks.standard = await this.benchmarkRegistry(
      () => new ModRegistry(),
      testData,
      'Standard'
    )
    
    // Benchmark optimized registry
    console.log('\n⚡ Benchmarking OptimizedModRegistry...')
    results.benchmarks.optimized = await this.benchmarkRegistry(
      () => new OptimizedModRegistry(),
      testData,
      'Optimized'
    )
    
    // Performance comparison
    console.log('\n📈 Performance Comparison:')
    this.compareResults(results.benchmarks.standard, results.benchmarks.optimized)
    
    // Memory usage comparison
    console.log('\n💾 Memory Usage Analysis:')
    await this.analyzeMemoryUsage(testData)
    
    return results
  }

  /**
   * Generate realistic test data
   */
  generateTestData (count) {
    console.log(`   Generating ${count} test mods...`)
    
    const mods = []
    const categories = ['technology', 'utility', 'world-gen', 'magic', 'adventure', 'decoration']
    const authors = ['TeamCoFH', 'mezz', 'AlgorithmX2', 'mDiyo', 'CrazyPants', 'Vazkii']
    const commonMods = ['minecraft', 'forge', 'jei', 'thermal_foundation', 'enderio']
    
    for (let i = 0; i < count; i++) {
      const isCommon = i < commonMods.length
      const modId = isCommon ? commonMods[i] : `test_mod_${i}`
      
      const mod = {
        modId,
        modInfo: {
          version: `1.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 10)}`,
          name: isCommon ? modId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Test Mod ${i}`,
          dependencies: this.generateDependencies(i, commonMods, Math.floor(Math.random() * 3)),
          conflicts: Math.random() > 0.9 ? [`conflict_mod_${Math.floor(Math.random() * count)}`] : [],
          category: categories[Math.floor(Math.random() * categories.length)],
          author: authors[Math.floor(Math.random() * authors.length)],
          tags: this.generateTags(),
          downloads: Math.floor(Math.random() * 1000000),
          metadata: {
            description: `This is test mod ${i}`,
            homepage: `https://example.com/mod${i}`,
            sources: `https://github.com/test/mod${i}`
          }
        }
      }
      
      mods.push(mod)
    }
    
    console.log(`   ✅ Generated ${mods.length} mods with realistic dependencies`)
    return mods
  }
  
  generateDependencies (index, commonMods, count) {
    const deps = []
    for (let i = 0; i < count && i < index; i++) {
      if (Math.random() > 0.5) {
        const depIndex = Math.floor(Math.random() * Math.min(index, commonMods.length + 10))
        const depId = depIndex < commonMods.length ? commonMods[depIndex] : `test_mod_${depIndex}`
        if (!deps.includes(depId)) {
          deps.push(depId)
        }
      }
    }
    return deps
  }
  
  generateTags () {
    const allTags = ['tech', 'utility', 'decoration', 'performance', 'api', 'library', 'world', 'adventure']
    const count = Math.floor(Math.random() * 3) + 1
    const tags = []
    
    for (let i = 0; i < count; i++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)]
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    }
    
    return tags
  }

  /**
   * Benchmark a registry implementation
   */
  async benchmarkRegistry (createRegistry, testData, name) {
    const results = {
      name,
      operations: {},
      memoryBefore: process.memoryUsage(),
      memoryAfter: null
    }
    
    // Create fresh registry
    const registry = createRegistry()
    
    // Warmup
    if (this.options.verbose) console.log(`   🔥 Warming up ${name} registry...`)
    for (let i = 0; i < this.options.warmupRuns; i++) {
      const testReg = createRegistry()
      testData.slice(0, 100).forEach(({ modId, modInfo }) => {
        testReg.addMod(modId, modInfo)
      })
    }
    
    // Benchmark mod addition
    results.operations.addMod = await this.benchmarkOperation(
      `${name} - Add Mods`,
      () => {
        const testReg = createRegistry()
        return testReg
      },
      (testReg) => {
        testData.forEach(({ modId, modInfo }) => {
          testReg.addMod(modId, modInfo)
        })
      }
    )
    
    // Setup registry with all mods for other tests
    testData.forEach(({ modId, modInfo }) => {
      registry.addMod(modId, modInfo)
    })
    
    // Benchmark search operations
    const searchTerms = ['thermal', 'tech', 'util', 'test_mod_1', /^test_mod_\d{1,2}$/]
    results.operations.search = await this.benchmarkOperation(
      `${name} - Search Operations`,
      () => registry,
      (reg) => {
        searchTerms.forEach(term => {
          reg.findMods(term)
        })
      }
    )
    
    // Benchmark registry lookups (if supported)
    if (registry.resolveId) {
      results.operations.registryLookup = await this.benchmarkOperation(
        `${name} - Registry Lookups`,
        () => {
          // Add some test registry mappings
          const mapping = new Map()
          for (let i = 1; i <= 1000; i++) {
            mapping.set(i, `minecraft:item_${i}`)
          }
          registry.addRegistryMapping('minecraft:item', 'minecraft', mapping)
          return registry
        },
        (reg) => {
          for (let i = 1; i <= 100; i++) {
            reg.resolveId('minecraft:item', i)
          }
        }
      )
    }
    
    // Benchmark compatibility checking
    results.operations.compatibility = await this.benchmarkOperation(
      `${name} - Compatibility Check`,
      () => registry,
      (reg) => {
        reg.validateCompatibility()
      }
    )
    
    // Benchmark batch operations (if supported)
    if (registry.addModsBatch) {
      const batchData = testData.slice(0, 100)
      results.operations.batchAdd = await this.benchmarkOperation(
        `${name} - Batch Add`,
        () => createRegistry(),
        (reg) => {
          reg.addModsBatch(batchData)
        }
      )
    }
    
    results.memoryAfter = process.memoryUsage()
    
    return results
  }

  /**
   * Benchmark a specific operation
   */
  async benchmarkOperation (operationName, setup, operation) {
    const times = []
    
    for (let i = 0; i < this.options.testRuns; i++) {
      const testSubject = setup()
      
      const startTime = process.hrtime.bigint()
      await operation(testSubject)
      const endTime = process.hrtime.bigint()
      
      times.push(Number(endTime - startTime) / 1000000) // Convert to milliseconds
      
      // Cleanup if needed
      if (testSubject.destroy) testSubject.destroy()
    }
    
    const result = this.calculateStats(times)
    
    if (this.options.verbose) {
      console.log(`   📊 ${operationName}: ${result.mean.toFixed(2)}ms (avg)`)
    }
    
    return result
  }

  /**
   * Calculate statistical metrics
   */
  calculateStats (times) {
    times.sort((a, b) => a - b)
    
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length
    const median = times[Math.floor(times.length / 2)]
    const min = times[0]
    const max = times[times.length - 1]
    const p95 = times[Math.floor(times.length * 0.95)]
    const p99 = times[Math.floor(times.length * 0.99)]
    
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    
    return {
      mean,
      median,
      min,
      max,
      p95,
      p99,
      stdDev,
      samples: times.length
    }
  }

  /**
   * Compare benchmark results
   */
  compareResults (standard, optimized) {
    console.log('   Operation                | Standard (ms) | Optimized (ms) | Improvement')
    console.log('   ' + '-'.repeat(75))
    
    for (const op in standard.operations) {
      if (optimized.operations[op]) {
        const standardTime = standard.operations[op].mean
        const optimizedTime = optimized.operations[op].mean
        const improvement = ((standardTime - optimizedTime) / standardTime * 100)
        const improvementStr = improvement > 0 
          ? `+${improvement.toFixed(1)}%` 
          : `${improvement.toFixed(1)}%`
        
        console.log(`   ${op.padEnd(24)} | ${standardTime.toFixed(2).padStart(11)} | ${optimizedTime.toFixed(2).padStart(12)} | ${improvementStr.padStart(11)}`)
      }
    }
    
    // Memory comparison
    const standardMem = standard.memoryAfter.heapUsed - standard.memoryBefore.heapUsed
    const optimizedMem = optimized.memoryAfter.heapUsed - optimized.memoryBefore.heapUsed
    const memImprovement = ((standardMem - optimizedMem) / standardMem * 100)
    
    console.log('   ' + '-'.repeat(75))
    console.log(`   ${'Memory Usage'.padEnd(24)} | ${(standardMem/1024/1024).toFixed(1).padStart(9)}MB | ${(optimizedMem/1024/1024).toFixed(1).padStart(10)}MB | ${(memImprovement > 0 ? '+' : '') + memImprovement.toFixed(1)}%`)
  }

  /**
   * Analyze memory usage patterns
   */
  async analyzeMemoryUsage (testData) {
    console.log('   Creating registries with increasing mod counts...')
    
    const sizes = [100, 250, 500, 750, 1000]
    const results = {}
    
    for (const size of sizes) {
      if (size > testData.length) continue
      
      // Standard registry
      const standardReg = new ModRegistry()
      const beforeStandard = process.memoryUsage()
      
      testData.slice(0, size).forEach(({ modId, modInfo }) => {
        standardReg.addMod(modId, modInfo)
      })
      
      const afterStandard = process.memoryUsage()
      
      // Optimized registry
      const optimizedReg = new OptimizedModRegistry()
      const beforeOptimized = process.memoryUsage()
      
      testData.slice(0, size).forEach(({ modId, modInfo }) => {
        optimizedReg.addMod(modId, modInfo)
      })
      
      const afterOptimized = process.memoryUsage()
      
      results[size] = {
        standard: afterStandard.heapUsed - beforeStandard.heapUsed,
        optimized: afterOptimized.heapUsed - beforeOptimized.heapUsed
      }
      
      // Get performance metrics if available
      if (optimizedReg.getPerformanceMetrics) {
        results[size].metrics = optimizedReg.getPerformanceMetrics()
      }
      
      // Cleanup
      if (optimizedReg.destroy) optimizedReg.destroy()
    }
    
    // Display results
    console.log('   Mods | Standard (MB) | Optimized (MB) | Difference')
    console.log('   ' + '-'.repeat(50))
    
    for (const [size, data] of Object.entries(results)) {
      const standardMB = data.standard / 1024 / 1024
      const optimizedMB = data.optimized / 1024 / 1024
      const diff = standardMB - optimizedMB
      const diffStr = (diff > 0 ? '-' : '+') + Math.abs(diff).toFixed(1) + 'MB'
      
      console.log(`   ${size.padStart(4)} | ${standardMB.toFixed(1).padStart(11)} | ${optimizedMB.toFixed(1).padStart(12)} | ${diffStr.padStart(10)}`)
    }
  }

  /**
   * Generate performance report
   */
  generateReport (results) {
    const report = {
      summary: {
        testDate: new Date(results.timestamp).toISOString(),
        testConfiguration: results.options,
        recommendedRegistry: this.getRecommendation(results.benchmarks)
      },
      detailedResults: results.benchmarks,
      recommendations: this.getDetailedRecommendations(results.benchmarks)
    }
    
    return report
  }
  
  getRecommendation (benchmarks) {
    const standard = benchmarks.standard
    const optimized = benchmarks.optimized
    
    let optimizedWins = 0
    let totalComparisons = 0
    
    for (const op in standard.operations) {
      if (optimized.operations[op]) {
        totalComparisons++
        if (optimized.operations[op].mean < standard.operations[op].mean) {
          optimizedWins++
        }
      }
    }
    
    const winRate = optimizedWins / totalComparisons
    return winRate > 0.6 ? 'OptimizedModRegistry' : 'ModRegistry'
  }
  
  getDetailedRecommendations (benchmarks) {
    const recommendations = []
    
    const standard = benchmarks.standard
    const optimized = benchmarks.optimized
    
    // Check search performance
    if (optimized.operations.search && standard.operations.search) {
      const improvement = (standard.operations.search.mean - optimized.operations.search.mean) / standard.operations.search.mean
      if (improvement > 0.3) {
        recommendations.push({
          area: 'Search Performance',
          improvement: `${(improvement * 100).toFixed(1)}%`,
          recommendation: 'Use OptimizedModRegistry for mod packs with frequent search operations'
        })
      }
    }
    
    // Check memory usage
    const standardMem = standard.memoryAfter.heapUsed - standard.memoryBefore.heapUsed
    const optimizedMem = optimized.memoryAfter.heapUsed - optimized.memoryBefore.heapUsed
    const memImprovement = (standardMem - optimizedMem) / standardMem
    
    if (Math.abs(memImprovement) > 0.1) {
      recommendations.push({
        area: 'Memory Usage',
        improvement: `${(memImprovement * 100).toFixed(1)}%`,
        recommendation: memImprovement > 0 
          ? 'OptimizedModRegistry uses less memory for large mod packs'
          : 'Standard ModRegistry is more memory efficient for small mod packs'
      })
    }
    
    return recommendations
  }
}

/**
 * Quick performance test utility
 */
async function quickPerformanceTest (modCount = 100, operations = 50) {
  console.log(`🔥 Quick Performance Test: ${modCount} mods, ${operations} operations`)
  
  const benchmarks = new ModRegistryBenchmarks({
    maxMods: modCount,
    testRuns: operations,
    verbose: false
  })
  
  const results = await benchmarks.runBenchmarks()
  const report = benchmarks.generateReport(results)
  
  console.log(`\n📋 Recommendation: Use ${report.summary.recommendedRegistry}`)
  
  return report
}

module.exports = {
  ModRegistryBenchmarks,
  quickPerformanceTest
}