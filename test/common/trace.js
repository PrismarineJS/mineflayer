// TRACE=<file> writes one JSON stream for analysis with jq afterwards:
//   {"ts":...,"type":"PACKET","dir":"S2C"|"C2S","name":<packet>,"data":{...}}   raw packets
//   {"ts":...,"type":"MODEL","name":"updateSlot","data":{...}}  inventory model writes
//   {"ts":...,"type":"LOG","msg":<message>,"args":{...}}        test boundaries & harness setup stages
const fs = require('fs')

let stream
const bigintSafe = (k, v) => typeof v === 'bigint' ? v.toString() : v

function emit (record) {
  if (!process.env.TRACE) return
  stream = stream ?? fs.createWriteStream(process.env.TRACE, { flags: 'w' })
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
