const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const { classifyResult, loadModels, validateToolchain, ensureJar } = require('./check-models')

const complete = 'Model checking completed. No error has been found.'
const violation = 'Error: Invariant ReplyOrder is violated.\nError: The behavior up to this point is:'
const result = (status, stdout, rest = {}) => ({ status, stdout, stderr: '', signal: null, ...rest })

// These cases are deliberately independent of TLC, Java and network availability:
// a broken invocation must never make a negative control look successful.
describe('TLC result classification', () => {
  it('requires both exit 0 and the complete model-check marker', () => {
    assert.equal(classifyResult(result(0, complete)).ok, true)
    assert.equal(classifyResult(result(0, 'Starting model checking')).ok, false)
    assert.equal(classifyResult(result(1, complete)).ok, false)
    assert.equal(classifyResult(result(0, complete + '\nError: Unexpected exception')).ok, false)
  })

  it('accepts only the declared invariant violation and exit 12', () => {
    assert.equal(classifyResult(result(12, violation), 'ReplyOrder').ok, true)
    assert.equal(classifyResult(result(12, violation.replaceAll('ReplyOrder', 'TypeOK')), 'ReplyOrder').ok, false)
    assert.equal(classifyResult(result(12, 'Error: Invariant ReplyOrderExtra is violated.'), 'ReplyOrder').ok, false)
    assert.equal(classifyResult(result(1, violation), 'ReplyOrder').ok, false)
    assert.equal(classifyResult(result(0, complete), 'ReplyOrder').ok, false)
  })

  it('rejects parse/runtime/liveness failures, including contradictory output', () => {
    for (const error of [
      'Error: Parsing or semantic analysis failed.',
      'Error: TLC threw an unexpected exception.',
      'Error: Temporal properties were violated.',
      'Error: Invariant TypeOK is violated.'
    ]) {
      assert.equal(classifyResult(result(12, error), 'ReplyOrder').ok, false)
      assert.equal(classifyResult(result(12, violation + '\n' + error), 'ReplyOrder').ok, false)
    }
    assert.equal(classifyResult(result(12, violation + '\n' + complete), 'ReplyOrder').ok, false)
  })

  it('never accepts timeout, signal, spawn failure or output overflow', () => {
    for (const code of ['ETIMEDOUT', 'ENOENT', 'ENOBUFS']) {
      const error = Object.assign(new Error(code), { code })
      assert.equal(classifyResult(result(12, violation, { error }), 'ReplyOrder').ok, false)
      assert.equal(classifyResult(result(0, complete, { error })).ok, false)
    }
    assert.equal(classifyResult(result(null, violation, { signal: 'SIGKILL' }), 'ReplyOrder').ok, false)
    assert.equal(classifyResult(result(0, complete, { signal: 'SIGTERM' })).ok, false)
    assert.equal(classifyResult(result(null, complete)).ok, false)
  })
})

describe('TLC model selection and tool pin', () => {
  let directory
  beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mineflayer-tlc-test-')) })
  afterEach(() => { fs.rmSync(directory, { recursive: true, force: true }) })

  function addModel (name, changes = {}) {
    const target = path.join(directory, name)
    fs.mkdirSync(target, { recursive: true })
    fs.writeFileSync(path.join(target, 'Example.tla'), '---- MODULE Example ----\n====\n')
    fs.writeFileSync(path.join(target, 'small.cfg'), 'INIT Init\nNEXT Next\n')
    fs.writeFileSync(path.join(target, 'model.json'), JSON.stringify({ module: 'Example', checks: [{ config: 'small.cfg' }], ...changes }))
  }

  it('selects all models deterministically, or only named models', () => {
    addModel('second')
    addModel('first')
    fs.writeFileSync(path.join(directory, 'toolchain.json'), '{}')
    assert.deepEqual(loadModels(directory).map(model => model.name), ['first', 'second'])
    assert.deepEqual(loadModels(directory, ['second']).map(model => model.name), ['second'])
  })

  it('rejects empty, unknown, traversal and duplicate selections', () => {
    assert.throws(() => loadModels(directory), /No TLA\+ models selected/)
    addModel('example')
    for (const selection of [[''], ['missing'], ['../example'], ['example', 'example']]) {
      assert.throws(() => loadModels(directory, selection))
    }
    assert.throws(() => loadModels(path.join(directory, 'missing')))
  })

  it('rejects missing modules and unsafe, empty, missing or ambiguous checks', () => {
    for (const changes of [
      { module: '../Example' },
      { module: null },
      { module: 'Missing' },
      { checks: [] },
      { checks: [{ config: '../small.cfg' }] },
      { checks: [{ config: 'missing.cfg' }] },
      { checks: [{ config: 'small.cfg' }, { config: 'small.cfg' }] },
      { checks: [{ config: 'small.cfg', expectViolation: '' }] },
      { checks: [{ config: 'small.cfg', expectViolation: null }] },
      { checks: [{ config: 'small.cfg', expectViolation: 'Bad Name' }] },
      { checks: [{ config: 'small.cfg', typo: true }] }
    ]) {
      addModel('example', changes)
      assert.throws(() => loadModels(directory), JSON.stringify(changes))
    }
  })

  it('does not treat a symlink to an external model as a local model', () => {
    addModel('example')
    fs.symlinkSync(path.join(directory, 'example'), path.join(directory, 'linked'), process.platform === 'win32' ? 'junction' : 'dir')
    assert.deepEqual(loadModels(directory).map(model => model.name), ['example'])
    assert.throws(() => loadModels(directory, ['linked']))
  })

  it('requires the official versioned URL and a SHA-256 pin', () => {
    const pin = { version: '1.7.4', url: 'https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar', sha256: 'a'.repeat(64) }
    assert.doesNotThrow(() => validateToolchain(pin))
    for (const changes of [{ url: 'https://example.org/tool.jar' }, { version: 'latest' }, { sha256: '' }, { url: pin.url.replace('v1.7.4', 'v1.7.3') }]) {
      assert.throws(() => validateToolchain({ ...pin, ...changes }))
    }
  })

  it('checks the hash for cached jars and TLA_JAR overrides without downloading', async () => {
    const contents = Buffer.from('test-only jar contents')
    const pin = { version: '1.7.4', url: 'https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar', sha256: crypto.createHash('sha256').update(contents).digest('hex') }
    const jar = path.join(directory, 'tla2tools.jar')
    fs.writeFileSync(jar, contents)
    assert.equal(await ensureJar(directory, pin), jar)
    assert.equal(await ensureJar(directory, pin, jar), jar)
    await assert.rejects(ensureJar(directory, pin, path.join(directory, 'missing.jar')), /does not exist/)
    await assert.rejects(ensureJar(directory, pin, ''), /must name a file/)
    fs.writeFileSync(jar, 'corrupted')
    await assert.rejects(ensureJar(directory, pin), /SHA-256 mismatch/)
    await assert.rejects(ensureJar(directory, pin, jar), /SHA-256 mismatch/)
  })
})
