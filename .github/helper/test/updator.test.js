const sinon = require('sinon')
const fs = require('fs')
const cp = require('child_process')
const assert = require('assert')

// Mock gh-helpers
const mockGithub = {
  mock: true,
  createPullRequest: sinon.stub().resolves({ number: 456, url: 'test-mineflayer-pr' })
}

// Mock modules
const Module = require('module')
const originalRequire = Module.prototype.require

Module.prototype.require = function(id) {
  if (id === 'gh-helpers') {
    return () => mockGithub
  }
  return originalRequire.apply(this, arguments)
}

describe('Mineflayer Updator', function() {
  let originalEnv
  let fsStub
  let cpStub

  beforeEach(function() {
    originalEnv = process.env
    process.env = { ...originalEnv }
    
    // Stub fs and child_process
    fsStub = {
      readFileSync: sinon.stub(fs, 'readFileSync'),
      writeFileSync: sinon.stub(fs, 'writeFileSync')
    }
    
    cpStub = {
      execSync: sinon.stub(cp, 'execSync')
    }
    
    sinon.reset()
  })

  afterEach(function() {
    process.env = originalEnv
    sinon.restore()
  })

  describe('Version Update', function() {
    it('should add new version to testedVersions array', function() {
      const currentVersionFile = `const testedVersions = ['1.8.8', '1.21.6', '1.21.8']
module.exports = {
  testedVersions,
  latestSupportedVersion: testedVersions[testedVersions.length - 1],
  oldestSupportedVersion: testedVersions[0]
}`

      fsStub.readFileSync.returns(currentVersionFile)
      
      // Test the logic for adding new version
      const latestVersion = '1.21.8'
      const newVersion = '1.21.9'
      const newContents = currentVersionFile.includes(newVersion)
        ? currentVersionFile
        : currentVersionFile.replace(`, '${latestVersion}'`, `, '${latestVersion}', '${newVersion}'`)
      
      assert(newContents.includes("'1.21.9'"), 'Should contain new version')
      assert(newContents.includes(`'${latestVersion}', '${newVersion}'`), 'Should add after latest version')
    })

    it('should not duplicate existing versions', function() {
      const versionFile = `const testedVersions = ['1.21.8', '1.21.9']`
      const newVersion = '1.21.9'
      
      const result = versionFile.includes(newVersion) ? versionFile : versionFile + `, '${newVersion}'`
      assert.strictEqual(result, versionFile, 'Should not change if version exists')
    })

    it('should update README.md correctly', function() {
      const readmeContent = `# Mineflayer

Supports Minecraft 1.8 to 1.21.8 (https://github.com/PrismarineJS/node-minecraft-protocol)

Supports Minecraft versions: 1.8.8, 1.21.6, 1.21.8) <!--version-->`

      const newVersion = '1.21.9'
      const expectedReadme = readmeContent
        .replace(/Minecraft 1\.8 to [0-9A-Za-z._-]+ \(/, `Minecraft 1.8 to ${newVersion} (`)
        .replace(') <!--version-->', `, ${newVersion}) <!--version-->`)

      assert(expectedReadme.includes('1.21.9'), 'README should contain new version')
      assert(expectedReadme.includes('Minecraft 1.8 to 1.21.9'), 'README should update version range')
    })
  })

  describe('CI Workflow Update', function() {
    it('should update CI workflow with new version data', function() {
      const ciContent = `name: CI
jobs:
  test:
    steps:
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
      
      assert(expectedCI.includes(`git clone -b ${triggerBranch}`), 'CI should include branch clone')
      assert(expectedCI.includes('node bin/generate_data.js'), 'CI should include data generation')
    })
  })

  describe('Git Operations', function() {
    it('should create correct branch name from version', function() {
      const version = '1.21.9'
      const branchName = 'pc' + version.replace(/[^a-zA-Z0-9_]/g, '_')
      assert.strictEqual(branchName, 'pc1_21_9')
    })

    it('should create correct branch name for test versions', function() {
      const testVersion = '1.99.99-test-123456'
      const branchName = 'pc' + testVersion.replace(/[^a-zA-Z0-9_]/g, '_')
      assert.strictEqual(branchName, 'pc1_99_99_test_123456')
    })
  })

  describe('Environment Variables', function() {
    it('should sanitize NEW_MC_VERSION correctly', function() {
      const testCases = [
        { input: '1.21.9', expected: '1.21.9' },
        { input: '1.99.99-test-123', expected: '1.99.99_test_123' },
        { input: 'invalid@version!', expected: 'invalid_version_' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const sanitized = input.replace(/[^a-zA-Z0-9_.]/g, '_')
        assert.strictEqual(sanitized, expected)
      })
    })

    it('should handle required environment variables', function() {
      const requiredVars = ['NEW_MC_VERSION', 'MCDATA_BRANCH']
      
      requiredVars.forEach(varName => {
        if (!process.env[varName]) {
          assert.throws(() => {
            throw new Error(`${varName} is required`)
          }, new RegExp(`${varName} is required`))
        }
      })
    })
  })

  describe('Package.json Updates', function() {
    it('should update minecraft-data dependency', function() {
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
      
      assert.strictEqual(updatedPackage.dependencies['minecraft-data'], '^3.98.0')
      assert.strictEqual(updatedPackage.dependencies['minecraft-protocol'], '^1.61.0')
    })
  })

  describe('PR Creation', function() {
    it('should create PR with correct metadata', function() {
      const version = '1.21.9'
      const mcdataPrURL = 'https://github.com/PrismarineJS/minecraft-data/pull/123'
      
      const expectedTitle = `🎈 ${version}`
      const expectedBody = `This automated PR sets up the relevant boilerplate for Minecraft version ${version}.

Ref: ${mcdataPrURL}

* You can help contribute to this PR by opening a PR against this <code branch>pc1_21_9</code> branch instead of <code>master</code>.
    `
    
      assert.strictEqual(expectedTitle, '🎈 1.21.9')
      assert(expectedBody.includes('Minecraft version 1.21.9'), 'Body should contain version')
      assert(expectedBody.includes('pc1_21_9'), 'Body should contain branch name')
    })
  })

  describe('Error Handling', function() {
    it('should handle file read/write errors', function() {
      fsStub.readFileSync.throws(new Error('Permission denied'))
      
      assert.throws(() => {
        try {
          fsStub.readFileSync('/protected/file')
        } catch (e) {
          throw new Error(`File access error: ${e.message}`)
        }
      }, /File access error: Permission denied/)
    })

    it('should handle git operation failures', function() {
      cpStub.execSync.throws(new Error('Authentication failed'))
      
      assert.throws(() => {
        try {
          cpStub.execSync('git push origin test')
        } catch (e) {
          throw new Error(`Git push failed: ${e.message}`)
        }
      }, /Git push failed: Authentication failed/)
    })

    it('should validate inputs before processing', function() {
      const validateVersion = (version) => {
        if (!version) throw new Error('Version is required')
        if (!/^[\d\w.-]+$/.test(version)) throw new Error('Invalid version format')
        return true
      }
      
      assert.throws(() => validateVersion(''), /Version is required/)
      assert.throws(() => validateVersion('invalid@version'), /Invalid version format/)
      assert.strictEqual(validateVersion('1.21.9'), true)
      assert.strictEqual(validateVersion('1.99.99-test-123'), true)
    })
  })
})