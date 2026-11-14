#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')

const identifier = /^[A-Za-z][A-Za-z0-9_]*$/
const directoryName = /^[A-Za-z][A-Za-z0-9_-]*$/
const configName = /^[A-Za-z][A-Za-z0-9_-]*\.cfg$/
const completeMarker = 'Model checking completed. No error has been found.'

function readJson (file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`Cannot read ${file}: ${error.message}`)
  }
}

function loadModels (modelsRoot, selected = []) {
  const directories = fs.readdirSync(modelsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name)
  const names = selected.length ? selected : directories.sort()
  if (!names.length) throw new Error('No TLA+ models selected')
  if (new Set(names).size !== names.length) throw new Error('Duplicate model selection')

  return names.map(name => {
    if (!directoryName.test(name) || !directories.includes(name)) {
      throw new Error(`Unknown or invalid model: ${name}`)
    }
    const directory = path.join(modelsRoot, name)
    const manifest = readJson(path.join(directory, 'model.json'))
    if (!manifest || typeof manifest.module !== 'string' || !identifier.test(manifest.module) ||
        !Array.isArray(manifest.checks) || !manifest.checks.length) {
      throw new Error(`Invalid model manifest: ${name}`)
    }
    if (Object.keys(manifest).some(key => !['module', 'checks'].includes(key))) {
      throw new Error(`Unknown model manifest field: ${name}`)
    }
    const files = fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile()).map(entry => entry.name)
    if (!files.includes(`${manifest.module}.tla`)) throw new Error(`Missing module: ${name}/${manifest.module}.tla`)
    const seen = new Set()
    for (const check of manifest.checks) {
      if (!check || !configName.test(check.config) || !files.includes(check.config) || seen.has(check.config)) {
        throw new Error(`Missing, invalid or duplicate config in ${name}`)
      }
      if (Object.keys(check).some(key => !['config', 'expectViolation'].includes(key)) ||
          (Object.hasOwn(check, 'expectViolation') &&
            (typeof check.expectViolation !== 'string' || !identifier.test(check.expectViolation)))) {
        throw new Error(`Invalid check in ${name}/${check.config}`)
      }
      seen.add(check.config)
    }
    return { name, directory, module: manifest.module, checks: manifest.checks }
  })
}

function validateToolchain (toolchain) {
  if (!toolchain || typeof toolchain.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(toolchain.version) ||
      typeof toolchain.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(toolchain.sha256) ||
      toolchain.url !== `https://github.com/tlaplus/tlaplus/releases/download/v${toolchain.version}/tla2tools.jar` ||
      Object.keys(toolchain).some(key => !['version', 'url', 'sha256'].includes(key))) {
    throw new Error('Invalid TLA+ toolchain: require a pinned official release URL and SHA-256')
  }
}

function verifyHash (contents, toolchain) {
  const actual = crypto.createHash('sha256').update(contents).digest('hex')
  if (actual !== toolchain.sha256) {
    throw new Error(`TLC SHA-256 mismatch: expected ${toolchain.sha256}, got ${actual}`)
  }
}

async function ensureJar (cacheDirectory, toolchain, override) {
  validateToolchain(toolchain)
  const jar = override === undefined ? path.join(cacheDirectory, 'tla2tools.jar') : path.resolve(override)
  if (override === '') throw new Error('TLA_JAR must name a file')
  if (fs.existsSync(jar)) {
    verifyHash(fs.readFileSync(jar), toolchain)
    return jar
  }
  if (override !== undefined) throw new Error(`TLA_JAR does not exist: ${jar}`)

  console.log(`Downloading pinned TLC ${toolchain.version}`)
  const response = await fetch(toolchain.url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`TLC download failed: HTTP ${response.status}`)
  const chunks = []
  let length = 0
  for await (const chunk of response.body) {
    length += chunk.length
    if (length > 32 * 1024 * 1024) throw new Error('TLC download exceeded 32 MiB')
    chunks.push(chunk)
  }
  const contents = Buffer.concat(chunks)
  verifyHash(contents, toolchain)
  fs.mkdirSync(cacheDirectory, { recursive: true })
  const temporary = fs.mkdtempSync(path.join(cacheDirectory, 'download-'))
  try {
    const temporaryJar = path.join(temporary, 'tla2tools.jar')
    fs.writeFileSync(temporaryJar, contents, { flag: 'wx' })
    fs.renameSync(temporaryJar, jar)
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
  return jar
}

function classifyResult (result, expectViolation) {
  if (result.error) return { ok: false, reason: `TLC process failed: ${result.error.message}` }
  if (result.signal) return { ok: false, reason: `TLC terminated by ${result.signal}` }
  const output = `${result.stdout || ''}\n${result.stderr || ''}`
  const lines = output.split(/\r?\n/)
  const errors = lines.filter(line => line.startsWith('Error:'))
  if (expectViolation !== undefined) {
    const expected = `Error: Invariant ${expectViolation} is violated.`
    if (result.status !== 12 || !lines.includes(expected) || lines.includes(completeMarker) ||
        errors.some(line => line !== expected && line !== 'Error: The behavior up to this point is:')) {
      return { ok: false, reason: `Expected invariant ${expectViolation} with exit 12; got exit ${result.status}` }
    }
    return { ok: true, reason: `Expected invariant ${expectViolation} violated` }
  }
  if (result.status !== 0 || !lines.includes(completeMarker) || errors.length) {
    return { ok: false, reason: `Expected complete successful model check; got exit ${result.status}` }
  }
  return { ok: true, reason: 'Model check completed' }
}

function runCheck (model, check, jar, cacheDirectory) {
  const resultDirectory = path.join(cacheDirectory, 'results', model.name, path.basename(check.config, '.cfg'))
  fs.rmSync(resultDirectory, { recursive: true, force: true })
  fs.mkdirSync(resultDirectory, { recursive: true })
  // Run from a copy so TLC's generated trace specifications stay in the results
  // directory, including when it chooses filenames next to the main module.
  for (const entry of fs.readdirSync(model.directory, { withFileTypes: true })) {
    if (entry.isFile() && /\.(tla|cfg)$/.test(entry.name)) {
      fs.copyFileSync(path.join(model.directory, entry.name), path.join(resultDirectory, entry.name))
    }
  }
  const metadir = fs.mkdtempSync(path.join(cacheDirectory, 'states-'))
  const args = ['-Xmx512m', '-XX:+UseParallelGC', '-jar', jar, '-workers', '1', '-seed', '1', '-fp', '0',
    '-metadir', metadir, '-config', check.config, `${model.module}.tla`]
  try {
    const result = spawnSync('java', args, {
      cwd: resultDirectory,
      encoding: 'utf8',
      timeout: 120000,
      killSignal: 'SIGKILL',
      maxBuffer: 16 * 1024 * 1024
    })
    const verdict = classifyResult(result, check.expectViolation)
    fs.writeFileSync(path.join(resultDirectory, 'tlc.log'), [
      `java ${args.join(' ')}`,
      result.stdout || '',
      result.stderr || '',
      `Exit: ${result.status}; signal: ${result.signal || 'none'}`,
      verdict.reason,
      ''
    ].join('\n'))
    console.log(`${verdict.ok ? 'PASS' : 'FAIL'} ${model.name}/${check.config}: ${verdict.reason}`)
    if (!verdict.ok) console.error(`  See ${path.join(resultDirectory, 'tlc.log')}`)
    return verdict.ok
  } finally {
    fs.rmSync(metadir, { recursive: true, force: true })
  }
}

async function main () {
  const root = path.resolve(__dirname, '..')
  const modelsRoot = path.join(root, 'models', 'tla')
  const models = loadModels(modelsRoot, process.argv.slice(2))
  const toolchain = readJson(path.join(modelsRoot, 'toolchain.json'))
  const cacheDirectory = path.join(root, '.cache', 'tla')
  fs.mkdirSync(cacheDirectory, { recursive: true })
  const jar = await ensureJar(cacheDirectory, toolchain, process.env.TLA_JAR)
  let failed = false
  for (const model of models) {
    for (const check of model.checks) {
      if (!runCheck(model, check, jar, cacheDirectory)) failed = true
    }
  }
  if (failed) process.exitCode = 1
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = { classifyResult, loadModels, validateToolchain, ensureJar }
