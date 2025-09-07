const sinon = require('sinon')
const fs = require('fs')
const assert = require('assert')
const path = require('path')

// Import the actual implementation
const updator = require('../updator')

describe('Mineflayer Updator', function() {
  let fsStub
  
  beforeEach(function() {
    fsStub = sinon.stub(fs, 'readFileSync')
  })

  afterEach(function() {
    sinon.restore()
  })

  describe('sanitizeVersion', function() {
    it('should sanitize version strings correctly', function() {
      const testCases = [
        { input: '1.21.9', expected: '1.21.9' },
        { input: '1.21.9-test', expected: '1.21.9_test' },
        { input: '24w01a', expected: '24w01a' },
        { input: 'invalid!@#$%^&*()', expected: 'invalid__________' },
        { input: undefined, expected: undefined }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = updator.sanitizeVersion(input)
        assert.strictEqual(result, expected, `sanitizeVersion('${input}') should return '${expected}'`)
      })
    })
  })

  describe('generateBranchName', function() {
    it('should create correct branch names', function() {
      const testCases = [
        { input: '1.21.9', expected: 'pc1_21_9' },
        { input: '1.21.9-test', expected: 'pc1_21_9_test' },
        { input: '24w01a', expected: 'pc24w01a' },
        { input: 'test!@#', expected: 'pctest___' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = updator.generateBranchName(input)
        assert.strictEqual(result, expected, `generateBranchName('${input}') should return '${expected}'`)
      })
    })
  })

  describe('updateVersionFile', function() {
    it('should add new version to testedVersions array', function() {
      const mockVersionFile = `const testedVersions = ['1.16.5', '1.18.2', '1.21.8']
module.exports = {
  version: '1.21.8',
  testedVersions
}`

      fsStub.returns(mockVersionFile)
      
      const result = updator.updateVersionFile('/fake/path', '1.21.9')
      
      assert(result.includes("'1.21.9'"), 'Should contain new version')
      assert(result.includes("'1.21.8', '1.21.9'"), 'Should add after last version')
    })

    it('should not duplicate existing versions', function() {
      const mockVersionFile = `const testedVersions = ['1.16.5', '1.18.2', '1.21.9']
module.exports = {
  testedVersions
}`

      fsStub.returns(mockVersionFile)
      
      const result = updator.updateVersionFile('/fake/path', '1.21.9')
      
      assert.strictEqual(result, mockVersionFile, 'Should return unchanged content for existing version')
    })

    it('should handle edge cases with no testedVersions array', function() {
      const mockVersionFile = `module.exports = {
  version: '1.21.8'
}`

      fsStub.returns(mockVersionFile)
      
      const result = updator.updateVersionFile('/fake/path', '1.21.9')
      
      assert.strictEqual(result, mockVersionFile, 'Should return unchanged if no testedVersions found')
    })
  })

  describe('updateReadmeFile', function() {
    it('should update README version range and add to version list', function() {
      const mockReadme = `# Mineflayer

Minecraft 1.8 to 1.21.8 (1.21.4, 1.21.8) <!--version-->

## Features
Some content here`

      fsStub.returns(mockReadme)
      
      const result = updator.updateReadmeFile('/fake/path', '1.21.9')
      
      assert(result.includes('Minecraft 1.8 to 1.21.9 ('), 'Should update version range')
      assert(result.includes(', 1.21.9) <!--version-->'), 'Should add to version list')
      assert(!result.includes('1.21.8 ('), 'Should not keep old range end')
    })

    it('should not modify README if version exists', function() {
      const mockReadme = 'Content with 1.21.9 already here'
      fsStub.returns(mockReadme)
      
      const result = updator.updateReadmeFile('/fake/path', '1.21.9')
      
      assert.strictEqual(result, mockReadme, 'Should return unchanged content')
    })
  })

  describe('updateCIFile', function() {
    it('should update CI workflow with minecraft-data clone steps', function() {
      const mockCI = `name: CI
jobs:
  test:
    steps:
      - run: npm install
      - run: npm test`

      fsStub.returns(mockCI)
      
      const result = updator.updateCIFile('/fake/path', '1.21.9', 'test-branch')
      
      assert(result.includes('git clone -b test-branch'), 'Should include branch-specific clone')
      assert(result.includes('node bin/generate_data.js'), 'Should include data generation')
      assert(result.includes('protodef'), 'Should include protodef patches')
      assert(result.includes('mv minecraft-data minecraft-data-old'), 'Should include backup step')
    })

    it('should not modify CI if version exists', function() {
      const mockCI = 'Content with 1.21.9 already configured'
      fsStub.returns(mockCI)
      
      const result = updator.updateCIFile('/fake/path', '1.21.9', 'branch')
      
      assert.strictEqual(result, mockCI, 'Should return unchanged content')
    })
  })

  describe('updatePackageJson', function() {
    it('should update package.json dependencies', function() {
      const mockPackage = `{
  "name": "mineflayer",
  "dependencies": {
    "minecraft-data": "^3.97.0",
    "minecraft-protocol": "^1.60.0"
  }
}`

      fsStub.returns(mockPackage)
      
      const result = updator.updatePackageJson('/fake/path', '1.21.9')
      const parsed = JSON.parse(result)
      
      assert.strictEqual(parsed.dependencies['minecraft-data'], '^3.98.0', 'Should update minecraft-data version')
      assert.strictEqual(parsed.dependencies['minecraft-protocol'], '^1.61.0', 'Should update minecraft-protocol version')
    })

    it('should handle package.json without target dependencies', function() {
      const mockPackage = `{
  "name": "test",
  "dependencies": {
    "other-package": "^1.0.0"
  }
}`

      fsStub.returns(mockPackage)
      
      const result = updator.updatePackageJson('/fake/path', '1.21.9')
      const parsed = JSON.parse(result)
      
      assert.strictEqual(parsed.dependencies['other-package'], '^1.0.0', 'Should preserve other dependencies')
      assert(!parsed.dependencies['minecraft-data'], 'Should not add minecraft-data if not present')
    })
  })

  describe('createPRBody', function() {
    it('should create correct PR body format', function() {
      const version = '1.21.9'
      const prUrl = 'https://github.com/test/pr/123'
      const branchName = 'pc1.21.9'
      
      const result = updator.createPRBody(version, prUrl, branchName)
      
      assert(result.includes(`Minecraft version ${version}`), 'Should contain version')
      assert(result.includes(`Ref: ${prUrl}`), 'Should contain reference URL')
      assert(result.includes(`${branchName}</code> branch`), 'Should contain branch name')
      assert(result.includes('master'), 'Should reference master branch')
    })
  })

  describe('Integration Tests', function() {
    beforeEach(function() {
      sinon.restore()
      // Stub all file operations
      sinon.stub(fs, 'readFileSync')
      sinon.stub(fs, 'writeFileSync')
    })

    it('should handle version sanitization in full process', function() {
      const result = updator.sanitizeVersion('1.21.9-test!@#')
      assert.strictEqual(result, '1.21.9_test___', 'sanitizeVersion preserves dots and underscores')
      
      const branchName = updator.generateBranchName('1.21.9-test!@#')
      assert.strictEqual(branchName, 'pc1_21_9_test___', 'generateBranchName replaces non-alphanumeric')
    })

    it('should create consistent branch names and PR bodies', function() {
      const version = '1.21.9'
      const branchName = updator.generateBranchName(version)
      const prBody = updator.createPRBody(version, 'test-url', branchName)
      
      assert(prBody.includes(branchName), 'PR body should reference the generated branch name')
      assert.strictEqual(branchName, 'pc1_21_9', 'Branch name should be consistent')
    })
  })

})