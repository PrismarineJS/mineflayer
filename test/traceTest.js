/* eslint-env mocha */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

describe('packet trace', () => {
  const RECORDS = 40
  const CHUNK_BYTES = 800000

  // Records posted before an immediate process.exit must still reach disk.
  const child = `
    const trace = require(${JSON.stringify(path.resolve(__dirname, 'common/trace.js'))})
    const data = Buffer.alloc(${CHUNK_BYTES}, 1)
    const start = process.hrtime.bigint()
    for (let i = 0; i < ${RECORDS}; i++) trace.packet('S2C', 'map_chunk_bulk', { i, data })
    trace.log('done', { n: BigInt(${RECORDS}) })
    process.stdout.write(String(Number(process.hrtime.bigint() - start) / 1e6))
    process.exit(0)
  `

  it('does not block the caller and loses nothing on exit', function () {
    this.timeout(60000)
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'trace-')), 'trace.jsonl')
    const elapsedMs = Number(execFileSync(process.execPath, ['-e', child], { env: { ...process.env, TRACE: file } }))

    assert.ok(elapsedMs < 500, `emitting ${RECORDS} records blocked the caller for ${elapsedMs}ms`)

    const lines = fs.readFileSync(file, 'utf8').trimEnd().split('\n')
    assert.strictEqual(lines.length, RECORDS + 1)

    const record = JSON.parse(lines[0])
    assert.strictEqual(typeof record.ts, 'number')
    delete record.ts
    const expected = { type: 'PACKET', dir: 'S2C', name: 'map_chunk_bulk', data: { i: 0, data: Buffer.alloc(CHUNK_BYTES, 1) } }
    assert.strictEqual(JSON.stringify(record), JSON.stringify(expected))

    assert.strictEqual(lines[RECORDS].slice(lines[RECORDS].indexOf('"type"')), `"type":"LOG","msg":"done","args":{"n":"${RECORDS}"}}`)
  })
})
