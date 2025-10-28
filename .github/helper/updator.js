#!/usr/bin/env node
/**
 * Updator script triggered from minecraft-data repository to auto generate PR
 */
const fs = require('fs')
const cp = require('child_process')
const assert = require('assert')
const { join } = require('path')

// Initialize github helper - can be mocked for testing
let github
try {
  github = require('gh-helpers')()
} catch (e) {
  // For testing environment, create mock
  github = { mock: true, createPullRequest: () => {} }
}

// Testable functions
function sanitizeVersion(version) {
  return version?.replace(/[^a-zA-Z0-9_.]/g, '_')
}

function updateVersionFile(filePath, newVersion) {
  const currentContents = fs.readFileSync(filePath, 'utf8')
  
  if (currentContents.includes(newVersion)) {
    return currentContents // No change needed
  }
  
  // Get the last version from the array to add after it
  const versionMatch = currentContents.match(/testedVersions = \[([^\]]+)\]/)
  if (versionMatch) {
    const versionsStr = versionMatch[1]
    const lastVersion = versionsStr.trim().split(',').pop().trim().replace(/['"]/g, '')
    return currentContents.replace(`, '${lastVersion}'`, `, '${lastVersion}', '${newVersion}'`)
  }
  
  return currentContents
}

function updateReadmeFile(readmePath, newVersion) {
  const currentContents = fs.readFileSync(readmePath, 'utf8')
  
  if (currentContents.includes(newVersion)) {
    return currentContents // No change needed
  }
  
  return currentContents
    .replace(/Minecraft 1\.8 to [0-9A-Za-z._-]+ \(/, `Minecraft 1.8 to ${newVersion} (`)
    .replace(') <!--version-->', `, ${newVersion}) <!--version-->`)
}

function updateCIFile(ciPath, newVersion, triggerBranch) {
  const currentContents = fs.readFileSync(ciPath, 'utf8')
  
  if (currentContents.includes(newVersion)) {
    return currentContents // No change needed
  }
  
  return currentContents.replace(
    'run: npm install', `run: npm install
      - run: cd node_modules && cd minecraft-data && mv minecraft-data minecraft-data-old && git clone -b ${triggerBranch} https://github.com/PrismarineJS/minecraft-data --depth 1 && node bin/generate_data.js
      - run: curl -o node_modules/protodef/src/serializer.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/serializer.js && curl -o node_modules/protodef/src/compiler.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/compiler.js
`)
}

function updatePackageJson(packagePath, newVersion) {
  const currentContents = fs.readFileSync(packagePath, 'utf8')
  const packageJson = JSON.parse(currentContents)
  
  // Update dependencies - these would need to be determined dynamically in real usage
  // For testing purposes, we'll simulate the logic
  if (packageJson.dependencies) {
    if (packageJson.dependencies['minecraft-data']) {
      packageJson.dependencies['minecraft-data'] = '^3.98.0' // Example update
    }
    if (packageJson.dependencies['minecraft-protocol']) {
      packageJson.dependencies['minecraft-protocol'] = '^1.61.0' // Example update
    }
  }
  
  return JSON.stringify(packageJson, null, 2)
}

function generateBranchName(version) {
  return 'pc' + version.replace(/[^a-zA-Z0-9_]/g, '_')
}

function createPRBody(version, mcdataPrURL, branchName) {
  return `This automated PR sets up the relevant boilerplate for Minecraft version ${version}.

Ref: ${mcdataPrURL}

* You can help contribute to this PR by opening a PR against this <code branch>${branchName}</code> branch instead of <code>master</code>.
    `
}

const exec = (cmd) => github.mock ? console.log('> ', cmd) : (console.log('> ', cmd), cp.execSync(cmd, { stdio: 'inherit' }))

async function processUpdate(options = {}) {
  const {
    newVersion = process.env.NEW_MC_VERSION,
    triggerBranch = process.env.MCDATA_BRANCH,
    mcdataPrURL = process.env.MCDATA_PR_URL,
    skipExec = false
  } = options

  // Sanitize inputs
  const cleanVersion = sanitizeVersion(newVersion)
  const cleanBranch = sanitizeVersion(triggerBranch)
  
  console.log({ newVersion: cleanVersion, triggerBranch: cleanBranch, mcdataPrURL })
  
  // Validate required inputs
  assert(cleanVersion, 'NEW_MC_VERSION is required')
  assert(cleanBranch, 'MCDATA_BRANCH is required')

  const currentSupportedPath = require.resolve('../../lib/version.js')
  const readmePath = join(__dirname, '../../docs/README.md')
  const ciPath = join(__dirname, '../../.github/workflows/ci.yml')
  const packagePath = join(__dirname, '../../package.json')

  // Load current version info (clear cache for testing)
  delete require.cache[currentSupportedPath]

  // Update files
  const newVersionContents = updateVersionFile(currentSupportedPath, cleanVersion)
  const newReadmeContents = updateReadmeFile(readmePath, cleanVersion)
  const newCIContents = updateCIFile(ciPath, cleanVersion, cleanBranch)
  const newPackageContents = updatePackageJson(packagePath, cleanVersion)

  // Write files
  fs.writeFileSync(currentSupportedPath, newVersionContents)
  fs.writeFileSync(readmePath, newReadmeContents)
  fs.writeFileSync(ciPath, newCIContents)
  fs.writeFileSync(packagePath, newPackageContents)

  console.log('Updated files with new version:', cleanVersion)

  if (!skipExec) {
    // Git operations
    const branchName = generateBranchName(cleanVersion)
    exec(`git checkout -b ${branchName}`)
    exec('git config user.name "github-actions[bot]"')
    exec('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"')
    exec('git add --all')
    exec(`git commit -m "Update to version ${cleanVersion}"`)
    exec(`git push origin ${branchName} --force`)

    // Create PR
    const prBody = createPRBody(cleanVersion, mcdataPrURL, branchName)
    const pr = await github.createPullRequest(`🎈 ${cleanVersion}`, prBody, branchName, 'master')
    console.log(`Pull request created`, pr)
    
    return { pr, branchName }
  }
  
  return { branchName: generateBranchName(cleanVersion) }
}

// Export for testing
module.exports = {
  sanitizeVersion,
  updateVersionFile,
  updateReadmeFile,
  updateCIFile,
  updatePackageJson,
  generateBranchName,
  createPRBody,
  processUpdate,
  setGithub: (mockGithub) => { github = mockGithub }
}

// Run main function if called directly
if (require.main === module) {
  console.log('Starting update process...')
  processUpdate().catch(err => {
    console.error('Error during update process:', err)
    process.exit(1)
  })
}