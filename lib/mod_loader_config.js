/**
 * Mod loader configuration validation and defaults
 */

/**
 * Default mod loader configuration
 */
const DEFAULT_CONFIG = {
  enabled: true,
  strict: false,
  handshakeTimeout: 30000,
  registryTimeout: 15000,
  enableCompatibilityChecks: true,
  allowUnsupportedVersions: false,
  debugMode: false,
  maxRetries: 3,
  retryDelay: 1000
}

/**
 * Validate and normalize mod loader configuration
 * @param {Object} config - User provided configuration
 * @returns {Object} - Validated and normalized configuration
 */
function validateConfig (config = {}) {
  const validated = { ...DEFAULT_CONFIG }

  // Validate boolean options
  const booleanOptions = ['enabled', 'strict', 'enableCompatibilityChecks', 'allowUnsupportedVersions', 'debugMode']
  for (const option of booleanOptions) {
    if (config[option] !== undefined) {
      if (typeof config[option] !== 'boolean') {
        throw new Error(`modLoader.${option} must be a boolean`)
      }
      validated[option] = config[option]
    }
  }

  // Validate numeric options
  const numericOptions = [
    { name: 'handshakeTimeout', min: 5000, max: 120000 },
    { name: 'registryTimeout', min: 5000, max: 60000 },
    { name: 'maxRetries', min: 0, max: 10 },
    { name: 'retryDelay', min: 100, max: 10000 }
  ]

  for (const option of numericOptions) {
    if (config[option.name] !== undefined) {
      const value = config[option.name]
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`modLoader.${option.name} must be an integer`)
      }
      if (value < option.min || value > option.max) {
        throw new Error(`modLoader.${option.name} must be between ${option.min} and ${option.max}`)
      }
      validated[option.name] = value
    }
  }

  // Validate custom options
  if (config.customChannels !== undefined) {
    if (!Array.isArray(config.customChannels)) {
      throw new Error('modLoader.customChannels must be an array')
    }
    validated.customChannels = config.customChannels
  }

  if (config.supportedLoaders !== undefined) {
    if (!Array.isArray(config.supportedLoaders)) {
      throw new Error('modLoader.supportedLoaders must be an array')
    }
    validated.supportedLoaders = config.supportedLoaders
  }

  return validated
}

/**
 * Get configuration documentation
 * @returns {Object} - Configuration documentation
 */
function getConfigDocs () {
  return {
    enabled: {
      type: 'boolean',
      default: true,
      description: 'Enable mod loader support'
    },
    strict: {
      type: 'boolean',
      default: false,
      description: 'Fail connection if mod loader handshake fails'
    },
    handshakeTimeout: {
      type: 'number',
      default: 30000,
      min: 5000,
      max: 120000,
      description: 'Timeout for mod loader handshake in milliseconds'
    },
    registryTimeout: {
      type: 'number',
      default: 15000,
      min: 5000,
      max: 60000,
      description: 'Timeout for registry synchronization in milliseconds'
    },
    enableCompatibilityChecks: {
      type: 'boolean',
      default: true,
      description: 'Enable mod compatibility checking and warnings'
    },
    allowUnsupportedVersions: {
      type: 'boolean',
      default: false,
      description: 'Allow connection to unsupported mod loader versions'
    },
    debugMode: {
      type: 'boolean',
      default: false,
      description: 'Enable debug logging for mod loader operations'
    },
    maxRetries: {
      type: 'number',
      default: 3,
      min: 0,
      max: 10,
      description: 'Maximum number of handshake retries'
    },
    retryDelay: {
      type: 'number',
      default: 1000,
      min: 100,
      max: 10000,
      description: 'Delay between handshake retries in milliseconds'
    },
    customChannels: {
      type: 'array',
      description: 'Additional custom channels to register for mod communication'
    },
    supportedLoaders: {
      type: 'array',
      description: 'List of supported mod loader types (overrides default detection)'
    }
  }
}

/**
 * Check if configuration allows connecting to a specific mod loader
 * @param {Object} config - Validated configuration
 * @param {string} modLoaderType - Mod loader type
 * @param {string} modLoaderVersion - Mod loader version
 * @returns {Object} - Result with allowed flag and reason
 */
function checkCompatibility (config, modLoaderType, modLoaderVersion) {
  // Check if mod loader support is disabled
  if (!config.enabled) {
    return {
      allowed: false,
      reason: 'Mod loader support is disabled in configuration'
    }
  }

  // Check supported loaders if specified
  if (config.supportedLoaders && !config.supportedLoaders.includes(modLoaderType)) {
    return {
      allowed: false,
      reason: `Mod loader type '${modLoaderType}' not in supportedLoaders list`
    }
  }

  // Version compatibility checks would go here
  // For now, we'll allow all versions unless explicitly disallowed
  
  return {
    allowed: true,
    reason: 'Compatible configuration'
  }
}

module.exports = {
  DEFAULT_CONFIG,
  validateConfig,
  getConfigDocs,
  checkCompatibility
}