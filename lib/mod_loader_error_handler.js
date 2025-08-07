/**
 * Error handling system for mod loader operations
 * Provides graceful degradation and informative error messages
 */

const { isModLoaderVersionSupported, getLatestModLoaderVersion } = require('./version')

/**
 * Enhanced error class for mod loader issues
 */
class ModLoaderError extends Error {
  constructor (message, code, details = {}) {
    super(message)
    this.name = 'ModLoaderError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

/**
 * Error codes for different mod loader issues
 */
const ErrorCodes = {
  UNSUPPORTED_VERSION: 'UNSUPPORTED_VERSION',
  HANDSHAKE_FAILED: 'HANDSHAKE_FAILED',
  HANDSHAKE_TIMEOUT: 'HANDSHAKE_TIMEOUT',
  REGISTRY_SYNC_FAILED: 'REGISTRY_SYNC_FAILED',
  INCOMPATIBLE_MODS: 'INCOMPATIBLE_MODS',
  CHANNEL_REGISTRATION_FAILED: 'CHANNEL_REGISTRATION_FAILED',
  PARSING_ERROR: 'PARSING_ERROR',
  CONNECTION_REJECTED: 'CONNECTION_REJECTED',
  UNKNOWN_MOD_LOADER: 'UNKNOWN_MOD_LOADER'
}

/**
 * Error handler for mod loader operations
 */
class ModLoaderErrorHandler {
  constructor (options = {}) {
    this.options = {
      enableGracefulDegradation: options.enableGracefulDegradation !== false,
      logErrors: options.logErrors !== false,
      strictMode: options.strictMode || false,
      allowUnsupportedVersions: options.allowUnsupportedVersions || false,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000
    }
    this.retryAttempts = new Map()
  }

  /**
   * Handle mod loader version compatibility check
   * @param {string} modLoaderType - Type of mod loader
   * @param {string} minecraftVersion - Minecraft version
   * @param {string} modLoaderVersion - Mod loader version
   * @returns {Object} - Compatibility result
   */
  checkVersionCompatibility (modLoaderType, minecraftVersion, modLoaderVersion) {
    const result = {
      compatible: false,
      error: null,
      warning: null,
      suggestion: null,
      canContinue: false
    }

    try {
      // Check if version is supported
      const isSupported = isModLoaderVersionSupported(modLoaderType, minecraftVersion, modLoaderVersion)

      if (isSupported) {
        result.compatible = true
        result.canContinue = true
        return result
      }

      // Version not supported
      const latestVersion = getLatestModLoaderVersion(modLoaderType, minecraftVersion)
      const errorMessage = `${modLoaderType} version ${modLoaderVersion} is not supported for Minecraft ${minecraftVersion}`

      if (this.options.allowUnsupportedVersions) {
        result.warning = errorMessage
        result.suggestion = latestVersion
          ? `Consider upgrading to ${latestVersion}`
          : 'Check mod loader documentation for compatible versions'
        result.canContinue = true
      } else {
        result.error = new ModLoaderError(errorMessage, ErrorCodes.UNSUPPORTED_VERSION, {
          modLoaderType,
          minecraftVersion,
          modLoaderVersion,
          latestSupportedVersion: latestVersion
        })
        result.canContinue = !this.options.strictMode
      }

      return result
    } catch (err) {
      result.error = new ModLoaderError(
        `Failed to check version compatibility: ${err.message}`,
        ErrorCodes.UNKNOWN_MOD_LOADER,
        { originalError: err.message }
      )
      result.canContinue = this.options.enableGracefulDegradation
      return result
    }
  }

  /**
   * Handle handshake errors with retry logic
   * @param {Error} error - Original error
   * @param {string} modLoaderType - Mod loader type
   * @param {string} connectionId - Unique connection identifier
   * @returns {Object} - Error handling result
   */
  handleHandshakeError (error, modLoaderType, connectionId = 'default') {
    const result = {
      shouldRetry: false,
      retryDelay: 0,
      fallbackTreatment: null,
      error: null
    }

    const attemptKey = `${connectionId}:${modLoaderType}`
    const attempts = this.retryAttempts.get(attemptKey) || 0

    // Determine error type and handling
    if (error.message.includes('timeout')) {
      result.error = new ModLoaderError(
        `${modLoaderType} handshake timed out`,
        ErrorCodes.HANDSHAKE_TIMEOUT,
        { attempts, originalError: error.message }
      )
    } else if (error.message.includes('rejected') || error.message.includes('kicked')) {
      result.error = new ModLoaderError(
        `Connection rejected by ${modLoaderType} server`,
        ErrorCodes.CONNECTION_REJECTED,
        { reason: error.message }
      )
    } else {
      result.error = new ModLoaderError(
        `${modLoaderType} handshake failed: ${error.message}`,
        ErrorCodes.HANDSHAKE_FAILED,
        { attempts, originalError: error.message }
      )
    }

    // Retry logic
    if (attempts < this.options.maxRetries &&
        !error.message.includes('rejected') &&
        !error.message.includes('kicked')) {
      result.shouldRetry = true
      result.retryDelay = this.options.retryDelay * (attempts + 1) // Exponential backoff
      this.retryAttempts.set(attemptKey, attempts + 1)
    } else {
      this.retryAttempts.delete(attemptKey)

      // Determine fallback treatment
      if (this.options.enableGracefulDegradation) {
        result.fallbackTreatment = 'vanilla'
      }
    }

    return result
  }

  /**
   * Handle registry synchronization errors
   * @param {Error} error - Registry sync error
   * @param {string} registryName - Name of the registry
   * @returns {Object} - Error handling result
   */
  handleRegistryError (error, registryName) {
    const result = {
      canContinue: false,
      fallbackAction: null,
      error: null
    }

    if (error.message.includes('timeout')) {
      result.error = new ModLoaderError(
        `Registry synchronization timed out for ${registryName}`,
        ErrorCodes.REGISTRY_SYNC_FAILED,
        { registryName, reason: 'timeout' }
      )

      if (this.options.enableGracefulDegradation) {
        result.canContinue = true
        result.fallbackAction = 'use_vanilla_registry'
      }
    } else if (error.message.includes('parse') || error.message.includes('invalid')) {
      result.error = new ModLoaderError(
        `Failed to parse registry data for ${registryName}`,
        ErrorCodes.PARSING_ERROR,
        { registryName, originalError: error.message }
      )

      result.canContinue = this.options.enableGracefulDegradation
      result.fallbackAction = 'skip_registry'
    } else {
      result.error = new ModLoaderError(
        `Registry synchronization failed for ${registryName}: ${error.message}`,
        ErrorCodes.REGISTRY_SYNC_FAILED,
        { registryName, originalError: error.message }
      )

      result.canContinue = !this.options.strictMode
    }

    return result
  }

  /**
   * Handle channel registration errors
   * @param {Error} error - Channel registration error
   * @param {string} channelName - Name of the channel
   * @param {string} modLoaderType - Type of mod loader
   * @returns {Object} - Error handling result
   */
  handleChannelRegistrationError (error, channelName, modLoaderType) {
    const result = {
      canContinue: false,
      error: null
    }

    result.error = new ModLoaderError(
      `Failed to register channel ${channelName} for ${modLoaderType}: ${error.message}`,
      ErrorCodes.CHANNEL_REGISTRATION_FAILED,
      { channelName, modLoaderType, originalError: error.message }
    )

    // Channel registration failures are usually non-critical
    result.canContinue = this.options.enableGracefulDegradation

    return result
  }

  /**
   * Handle mod compatibility issues
   * @param {Array} issues - Array of compatibility issues
   * @returns {Object} - Handling result
   */
  handleCompatibilityIssues (issues) {
    const result = {
      critical: [],
      warnings: [],
      canContinue: true,
      recommendations: []
    }

    issues.forEach(issue => {
      if (issue.type === 'missing_dependency') {
        if (issue.required) {
          result.critical.push(issue)
          if (this.options.strictMode) {
            result.canContinue = false
          }
        } else {
          result.warnings.push(issue)
        }
      } else if (issue.type === 'conflict') {
        result.critical.push(issue)
        result.recommendations.push(`Remove one of the conflicting mods: ${issue.modId}, ${issue.conflictWith}`)
      } else if (issue.type === 'version_mismatch') {
        result.warnings.push(issue)
        result.recommendations.push(`Update ${issue.modId} to version ${issue.requiredVersion}`)
      } else {
        result.warnings.push(issue)
      }
    })

    return result
  }

  /**
   * Create user-friendly error message
   * @param {ModLoaderError} error - Mod loader error
   * @returns {string} - User-friendly message
   */
  createUserMessage (error) {
    const baseMessage = `Mod Loader Error (${error.code}): ${error.message}`

    switch (error.code) {
      case ErrorCodes.UNSUPPORTED_VERSION:
        return `${baseMessage}\n` +
               `Solution: ${error.details.latestSupportedVersion
                 ? `Upgrade to ${error.details.latestSupportedVersion}`
                 : 'Check compatibility documentation'}`

      case ErrorCodes.HANDSHAKE_TIMEOUT:
        return `${baseMessage}\n` +
               'Solution: Check server connectivity or increase handshakeTimeout in configuration'

      case ErrorCodes.CONNECTION_REJECTED:
        return `${baseMessage}\n` +
               'Solution: Ensure you have the correct mods installed or check server requirements'

      case ErrorCodes.REGISTRY_SYNC_FAILED:
        return `${baseMessage}\n` +
               'Solution: Verify mod versions match the server or enable graceful degradation'

      case ErrorCodes.INCOMPATIBLE_MODS:
        return `${baseMessage}\n` +
               'Solution: Remove conflicting mods or install missing dependencies'

      case ErrorCodes.CHANNEL_REGISTRATION_FAILED:
        return `${baseMessage}\n` +
               'Solution: This channel may not be required for basic functionality'

      default:
        return baseMessage + '\nSolution: Check server logs and mod loader documentation'
    }
  }

  /**
   * Log error with appropriate level
   * @param {ModLoaderError} error - Error to log
   * @param {string} context - Additional context
   */
  logError (error, context = '') {
    if (!this.options.logErrors) return

    const timestamp = new Date().toISOString()
    const contextStr = context ? ` [${context}]` : ''

    if (error.code === ErrorCodes.UNSUPPORTED_VERSION && this.options.allowUnsupportedVersions) {
      console.warn(`${timestamp} MOD_LOADER_WARNING${contextStr}: ${error.message}`)
    } else {
      console.error(`${timestamp} MOD_LOADER_ERROR${contextStr}: ${error.message}`)
      if (error.details && Object.keys(error.details).length > 0) {
        console.error(`${timestamp} Details:`, error.details)
      }
    }
  }

  /**
   * Create recovery suggestions based on error
   * @param {ModLoaderError} error - The error
   * @returns {Array<string>} - Recovery suggestions
   */
  getRecoverySuggestions (error) {
    const suggestions = []

    switch (error.code) {
      case ErrorCodes.UNSUPPORTED_VERSION:
        suggestions.push('Update your mod loader to a supported version')
        suggestions.push('Enable allowUnsupportedVersions in configuration to bypass this check')
        if (error.details.latestSupportedVersion) {
          suggestions.push(`Recommended version: ${error.details.latestSupportedVersion}`)
        }
        break

      case ErrorCodes.HANDSHAKE_TIMEOUT:
        suggestions.push('Increase handshakeTimeout in mod loader configuration')
        suggestions.push('Check network connectivity to the server')
        suggestions.push('Verify the server is actually running the detected mod loader')
        break

      case ErrorCodes.CONNECTION_REJECTED:
        suggestions.push('Check that you have all required mods installed')
        suggestions.push('Verify mod versions match the server requirements')
        suggestions.push('Check server whitelist and mod requirements')
        break

      case ErrorCodes.REGISTRY_SYNC_FAILED:
        suggestions.push('Enable graceful degradation in configuration')
        suggestions.push('Check that mod versions match between client and server')
        suggestions.push('Increase registryTimeout if synchronization is slow')
        break

      default:
        suggestions.push('Check server logs for more details')
        suggestions.push('Enable debug mode in mod loader configuration')
        suggestions.push('Try connecting with vanilla client to test server')
    }

    return suggestions
  }

  /**
   * Reset retry attempts for a connection
   * @param {string} connectionId - Connection identifier
   */
  resetRetries (connectionId) {
    for (const key of this.retryAttempts.keys()) {
      if (key.startsWith(connectionId)) {
        this.retryAttempts.delete(key)
      }
    }
  }

  /**
   * Get current retry statistics
   * @returns {Object} - Retry statistics
   */
  getRetryStats () {
    const stats = {
      activeRetries: this.retryAttempts.size,
      totalAttempts: 0,
      byConnection: {}
    }

    for (const [key, attempts] of this.retryAttempts) {
      stats.totalAttempts += attempts
      stats.byConnection[key] = attempts
    }

    return stats
  }
}

module.exports = {
  ModLoaderError,
  ErrorCodes,
  ModLoaderErrorHandler
}
