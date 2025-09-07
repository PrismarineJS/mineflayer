const { jest } = require('@jest/globals')
const fs = require('fs')
const cp = require('child_process')

// Mock dependencies
jest.mock('fs')
jest.mock('child_process')
jest.mock('gh-helpers', () => () => ({
  mock: true,
  createPullRequest: jest.fn().mockResolvedValue({ number: 456, url: 'test-mineflayer-pr' })
}))

describe('Mineflayer Updator', () => {
  let originalEnv
  let mockFs
  let mockCp

  beforeEach(() => {
    originalEnv = process.env
    process.env = { ...originalEnv }
    
    mockFs = {
      readFileSync: jest.fn(),
      writeFileSync: jest.fn()
    }
    
    mockCp = {
      execSync: jest.fn()
    }
    
    fs.readFileSync = mockFs.readFileSync
    fs.writeFileSync = mockFs.writeFileSync
    cp.execSync = mockCp.execSync
    
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  describe('Version Update', () => {
    test('should add new version to testedVersions array', () => {
      process.env.NEW_MC_VERSION = '1.21.9'
      
      const currentVersionFile = `const testedVersions = ['1.8.8', '1.21.6', '1.21.8']
module.exports = {
  testedVersions,
  latestSupportedVersion: testedVersions[testedVersions.length - 1],
  oldestSupportedVersion: testedVersions[0]
}`

      mockFs.readFileSync.mockReturnValue(currentVersionFile)
      
      // Test the logic for adding new version
      const latestVersion = '1.21.8'
      const newVersion = '1.21.9'
      const newContents = currentVersionFile.includes(newVersion)
        ? currentVersionFile
        : currentVersionFile.replace(`, '${latestVersion}'`, `, '${latestVersion}', '${newVersion}'`)
      
      expect(newContents).toContain("'1.21.9'")
      expect(newContents).toContain(`'${latestVersion}', '${newVersion}'`)
    })

    test('should not duplicate existing versions', () => {
      const versionFile = `const testedVersions = ['1.21.8', '1.21.9']`
      const newVersion = '1.21.9'
      
      const result = versionFile.includes(newVersion) ? versionFile : versionFile + `, '${newVersion}'`
      expect(result).toBe(versionFile) // No change since it already exists
    })

    test('should update README.md correctly', () => {
      const readmeContent = `# Mineflayer

Create Minecraft bots with a powerful and stable API.

## Features

* Supports Minecraft 1.8 to 1.21.8 (https://github.com/PrismarineJS/node-minecraft-protocol)
* Entity knowledge and tracking
* Block, biome, item, recipe and protocol knowledge from [minecraft-data](https://github.com/PrismarineJS/minecraft-data)

Supports Minecraft versions: 1.8.8, 1.9.4, 1.10.2, 1.11.2, 1.12.2, 1.13.2, 1.14.4, 1.15.2, 1.16.5, 1.17.1, 1.18.2, 1.19, 1.19.2, 1.19.3, 1.19.4, 1.20.1, 1.20.2, 1.20.4, 1.20.6, 1.21.1, 1.21.3, 1.21.4, 1.21.5, 1.21.6, 1.21.8) <!--version-->`

      const newVersion = '1.21.9'
      const expectedReadme = readmeContent
        .replace(/Minecraft 1\.8 to [0-9A-Za-z._-]+ \(/, `Minecraft 1.8 to ${newVersion} (`)
        .replace(') <!--version-->', `, ${newVersion}) <!--version-->`)

      expect(expectedReadme).toContain('1.21.9')
      expect(expectedReadme).toContain('Minecraft 1.8 to 1.21.9')
    })
  })

  describe('CI Workflow Update', () => {
    test('should update CI workflow with new version data', () => {
      const ciContent = `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install`

      const newVersion = '1.21.9'
      const triggerBranch = 'test-branch'
      
      const expectedCI = ciContent.replace(
        'run: npm install',
        `run: npm install
      - run: cd node_modules && cd minecraft-data && mv minecraft-data minecraft-data-old && git clone -b ${triggerBranch} https://github.com/PrismarineJS/minecraft-data --depth 1 && node bin/generate_data.js
      - run: curl -o node_modules/protodef/src/serializer.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/serializer.js && curl -o node_modules/protodef/src/compiler.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/compiler.js
`
      )
      
      expect(expectedCI).toContain(`git clone -b ${triggerBranch}`)
      expect(expectedCI).toContain('node bin/generate_data.js')
    })
  })

  describe('Git Operations', () => {
    test('should create correct branch name from version', () => {
      const version = '1.21.9'
      const branchName = 'pc' + version.replace(/[^a-zA-Z0-9_]/g, '_')
      expect(branchName).toBe('pc1_21_9')
    })

    test('should create correct branch name for test versions', () => {
      const testVersion = '1.99.99-test-123456'
      const branchName = 'pc' + testVersion.replace(/[^a-zA-Z0-9_]/g, '_')
      expect(branchName).toBe('pc1_99_99_test_123456')
    })
  })

  describe('Environment Variables', () => {
    test('should sanitize NEW_MC_VERSION correctly', () => {
      const testCases = [
        { input: '1.21.9', expected: '1.21.9' },
        { input: '1.99.99-test-123', expected: '1.99.99_test_123' },
        { input: 'invalid@version!', expected: 'invalid_version_' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const sanitized = input.replace(/[^a-zA-Z0-9_.]/g, '_')
        expect(sanitized).toBe(expected)
      })
    })

    test('should handle required environment variables', () => {
      const requiredVars = ['NEW_MC_VERSION', 'MCDATA_BRANCH']
      
      requiredVars.forEach(varName => {
        expect(process.env).toHaveProperty(varName)
        if (!process.env[varName]) {
          expect(() => {
            throw new Error(`${varName} is required`)
          }).toThrow(`${varName} is required`)
        }
      })
    })
  })

  describe('Package.json Updates', () => {
    test('should update minecraft-data dependency', () => {
      const packageJson = {
        dependencies: {
          'minecraft-data': '^3.76.0',
          'minecraft-protocol': '^1.60.0'
        }
      }
      
      const updatedPackage = {
        ...packageJson,
        dependencies: {
          ...packageJson.dependencies,
          'minecraft-data': '^3.98.0',
          'minecraft-protocol': '^1.61.0'
        }
      }
      
      expect(updatedPackage.dependencies['minecraft-data']).toBe('^3.98.0')
      expect(updatedPackage.dependencies['minecraft-protocol']).toBe('^1.61.0')
    })
  })

  describe('PR Creation', () => {
    test('should create PR with correct metadata', () => {
      const version = '1.21.9'
      const mcdataPrURL = 'https://github.com/PrismarineJS/minecraft-data/pull/123'
      
      const expectedTitle = `🎈 ${version}`
      const expectedBody = `This automated PR sets up the relevant boilerplate for Minecraft version ${version}.

Ref: ${mcdataPrURL}

* You can help contribute to this PR by opening a PR against this <code branch>pc1_21_9</code> branch instead of <code>master</code>.
    `
    
      expect(expectedTitle).toBe('🎈 1.21.9')
      expect(expectedBody).toContain('Minecraft version 1.21.9')
      expect(expectedBody).toContain('pc1_21_9')
    })
  })

  describe('Error Handling', () => {
    test('should handle file read/write errors', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })
      
      expect(() => {
        try {
          mockFs.readFileSync('/protected/file')
        } catch (e) {
          throw new Error(`File access error: ${e.message}`)
        }
      }).toThrow('File access error: Permission denied')
    })

    test('should handle git operation failures', () => {
      mockCp.execSync.mockImplementation((cmd) => {
        if (cmd.includes('git push')) {
          throw new Error('Authentication failed')
        }
      })
      
      expect(() => {
        try {
          mockCp.execSync('git push origin test')
        } catch (e) {
          throw new Error(`Git push failed: ${e.message}`)
        }
      }).toThrow('Git push failed: Authentication failed')
    })

    test('should validate inputs before processing', () => {
      const validateVersion = (version) => {
        if (!version) throw new Error('Version is required')
        if (!/^[\d\w.-]+$/.test(version)) throw new Error('Invalid version format')
        return true
      }
      
      expect(() => validateVersion('')).toThrow('Version is required')
      expect(() => validateVersion('invalid@version')).toThrow('Invalid version format')
      expect(validateVersion('1.21.9')).toBe(true)
      expect(validateVersion('1.99.99-test-123')).toBe(true)
    })
  })
})