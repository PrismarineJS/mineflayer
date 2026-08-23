// Writes one JSON stream for analysis with jq afterwards (path is printed when first opened;
// override it with TRACE=<file>):
//   {"ts":...,"type":"PACKET","dir":"S2C"|"C2S","name":<packet>,"data":{...}}   raw packets
//   {"ts":...,"type":"MODEL","name":"updateSlot","data":{...}}  inventory model writes
//   {"ts":...,"type":"LOG","msg":<message>,"args":{...}}        test boundaries & harness setup stages
const fs = require('fs')
const os = require('os')
const path = require('path')

// pid keeps concurrent mocha processes (one per version in CI) from sharing a file
const file = process.env.TRACE ?? path.join(os.tmpdir(), `mineflayer-trace-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.jsonl`)

let stream
const bigintSafe = (k, v) => typeof v === 'bigint' ? v.toString() : v

function emit (record) {
  if (!stream) {
    stream = fs.createWriteStream(file, { flags: 'w' })
    console.log(`trace: ${file}`)
  }
  stream.write(`${JSON.stringify({ ts: Date.now(), ...record }, bigintSafe)}\n`)
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
