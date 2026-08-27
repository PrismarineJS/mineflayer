// TRACE=<file> writes one JSON stream for analysis with jq afterwards:
//   {"ts":...,"type":"PACKET","dir":"S2C"|"C2S","name":<packet>,"data":{...}}   raw packets
//   {"ts":...,"type":"MODEL","name":"updateSlot","data":{...}}  inventory model writes
//   {"ts":...,"type":"LOG","msg":<message>,"args":{...}}        test boundaries & harness setup stages
//
// Serialization runs on a worker thread: stringifying a chunk packet's Buffer
// takes ~100ms+, and doing that inline for a burst of chunk packets starves the
// bot's physics timers. `pending` counts records posted but not yet on disk so
// process exit can wait for the worker to drain.
const fs = require('fs')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

if (!isMainThread) {
  const { file, pending } = workerData
  const stream = fs.createWriteStream(file, { flags: 'w' })
  const bigintSafe = (k, v) => typeof v === 'bigint' ? v.toString() : v
  // Structured clone turns Buffers into plain Uint8Arrays, which JSON.stringify
  // would print as {"0":..}; rewrap (zero-copy) to keep Buffer's {type,data} form.
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
    worker = new Worker(__filename, { workerData: { file: process.env.TRACE, pending } })
    worker.unref()
    process.on('exit', () => {
      let n
      while ((n = Atomics.load(pending, 0)) > 0) Atomics.wait(pending, 0, n, 10000)
    })
    return worker
  }

  function emit (record) {
    if (!process.env.TRACE) return
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
