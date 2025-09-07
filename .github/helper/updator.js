#!/usr/bin/env node
/**
 * Updator script triggered from minecraft-data repository to auto generate PR
 */
const fs = require('fs')
const cp = require('child_process')
const assert = require('assert')
const github = require('gh-helpers')()
const { join } = require('path')
const exec = (cmd) => github.mock ? console.log('> ', cmd) : (console.log('> ', cmd), cp.execSync(cmd, { stdio: 'inherit' }))

console.log('Starting update process...')
// Sanitize and validate environment variables all non alpha numeric / underscore / dot
const newVersion = process.env.NEW_MC_VERSION?.replace(/[^a-zA-Z0-9_.]/g, '_')
const triggerBranch = process.env.MCDATA_BRANCH?.replace(/[^a-zA-Z0-9_.]/g, '_')
const mcdataPrURL = process.env.MCDATA_PR_URL
console.log({ newVersion, triggerBranch, mcdataPrURL })

assert(newVersion)
assert(triggerBranch)

async function main () {
  const currentSupportedPath = require.resolve('../../lib/version.js')
  const readmePath = join(__dirname, '../../docs/README.md')
  const ciPath = join(__dirname, '../../.github/workflows/ci.yml')

  // Update the version.js
  const currentSupportedVersion = require('../../lib/version.js')
  const currentContents = fs.readFileSync(currentSupportedPath, 'utf8')
  console.log('Current supported version:', currentContents)
  const latestV = currentSupportedVersion.testedVersions.at(-1)
  const newContents = currentContents.includes(newVersion)
    ? currentContents
    : currentContents
      .replace(`, '${latestV}'`, `, '${latestV}', '${newVersion}'`)

  // Update the README.md
  const currentContentsReadme = fs.readFileSync(readmePath, 'utf8')
  if (!currentContentsReadme.includes(newVersion)) {
    const newReadmeContents = currentContentsReadme
      .replace(/Minecraft 1\.8 to [0-9A-Za-z._-]+ \(/, `Minecraft 1.8 to ${newVersion} (`)
      .replace(') <!--version-->', `, ${newVersion}) <!--version-->`)
    fs.writeFileSync(readmePath, newReadmeContents)
    console.log('Updated README with new version:', newVersion)
  }
  fs.writeFileSync(currentSupportedPath, newContents)

  // Update the CI workflow
  const currentContentsCI = fs.readFileSync(ciPath, 'utf8')
  if (!currentContentsCI.includes(newVersion)) {
    const newCIContents = currentContentsCI.replace(
      'run: npm install', `run: npm install
      - run: cd node_modules && cd minecraft-data && mv minecraft-data minecraft-data-old && git clone -b ${triggerBranch} https://github.com/PrismarineJS/minecraft-data --depth 1 && node bin/generate_data.js
      - run: curl -o node_modules/protodef/src/serializer.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/serializer.js && curl -o node_modules/protodef/src/compiler.js https://raw.githubusercontent.com/extremeheat/node-protodef/refs/heads/dlog/src/compiler.js
`)
    fs.writeFileSync(ciPath, newCIContents)
    console.log('Updated CI workflow with new version:', newVersion)
  }

  const branchName = 'pc' + newVersion.replace(/[^a-zA-Z0-9_]/g, '_')
  exec(`git checkout -b ${branchName}`)
  exec('git config user.name "github-actions[bot]"')
  exec('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"')
  exec('git add --all')
  exec(`git commit -m "Update to version ${newVersion}"`)
  exec(`git push origin ${branchName} --force`)
  //     createPullRequest(title: string, body: string, fromBranch: string, intoBranch?: string): Promise<{ number: number, url: string }>;
  const pr = await github.createPullRequest(
    `🎈 ${newVersion}`,
    `This automated PR sets up the relevant boilerplate for Minecraft version ${newVersion}.

Ref: ${mcdataPrURL}

* You can help contribute to this PR by opening a PR against this <code branch>${branchName}</code> branch instead of <code>master</code>.
    `,
    branchName,
    'master'
  )
  console.log(`Pull request created`, pr)
}

main().catch(err => {
  console.error('Error during update process:', err)
  process.exit(1)
})
