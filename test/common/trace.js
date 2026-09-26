// Writes one JSON stream for analysis with jq afterwards (path is printed when first opened;
// override it with TRACE=<file>):
//   {"ts":...,"type":"PACKET","dir":"S2C"|"C2S","name":<packet>,"data":{...}}   raw packets
//   {"ts":...,"type":"MODEL","name":"updateSlot","data":{...}}  inventory model writes
//   {"ts":...,"type":"LOG","msg":<message>,"args":{...}}        test boundaries & harness setup stages
//
// Serialization must never run on the bot's thread: a burst of chunk packets
// would stall its event loop. `pending` is the number of records posted but not
// yet on disk and must reach zero before the process exits.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

// pid keeps concurrent mocha processes (one per version in CI) from sharing a file
const file = process.env.TRACE ?? path.join(os.tmpdir(), `mineflayer-trace-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.jsonl`)

if (!isMainThread) {
  const { file, pending } = workerData
  const stream = fs.createWriteStream(file, { flags: 'w' })
  const bigintSafe = (k, v) => typeof v === 'bigint' ? v.toString() : v
  // Buffers arrive as plain Uint8Arrays and must still serialize in Buffer's {type,data} form.
  const rewrap = (o) => {
    if (o instanceof Uint8Array) return Buffer.from(o.buffer, o.byteOffset, o.byteLength)
    if (o && typeof o === 'object') for (const k in o) o[k] = rewrap(o[k])
    return o
  }
  parentPort.on('message', (record) => {
    stream.write(`${JSON.stringify(rewrap(record), bigintSafe)}\n`, () => {
      Atomics.sub(pending, 0, 1)
      Atomics.notify(pending, 0)
    })
  })
} else {
  let worker
  let pending
  const getWorker = () => {
    if (worker) return worker
    pending = new Int32Array(new SharedArrayBuffer(4))
    worker = new Worker(__filename, { workerData: { file, pending } })
    worker.unref()
    console.log(`trace: ${file}`)
    process.on('exit', () => {
      let n
      while ((n = Atomics.load(pending, 0)) > 0) Atomics.wait(pending, 0, n, 10000)
    })
    return worker
  }

  function emit (record) {
    const w = getWorker()
    Atomics.add(pending, 0, 1)
    w.postMessage({ ts: Date.now(), ...record })
  }

  function write (type, name, data = null) {
    emit({ type, name, data })
  }

  function packet (dir, name, data) {
    emit({ type: 'PACKET', dir, name, data })
  }

  function log (msg, args) {
    emit({ type: 'LOG', msg, args })
  }

  module.exports = { write, packet, log }
}
