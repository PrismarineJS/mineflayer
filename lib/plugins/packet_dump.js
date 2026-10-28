const path = require('path')

let fs, os
try {
  fs = require('fs')
  os = require('os')
} catch (e) {}

const MAX_DUMPS_PER_BOT = 10
const ISSUES_URL = 'https://github.com/PrismarineJS/mineflayer/issues'

module.exports = inject

// When a clientbound packet cannot be parsed, write it (raw bytes + parser trace) to a local
// file so it can be attached to a bug report. Nothing is ever sent anywhere.
function inject (bot, options) {
  if (options.dumpBadPackets === false) return
  if (!fs || typeof fs.writeFileSync !== 'function' || !os || typeof os.homedir !== 'function') return // e.g. browser

  const dumpDir = options.badPacketsDir ?? path.join(os.homedir(), '.mineflayer', 'bad-packets')
  const seen = new Set()
  let dumpCount = 0

  const client = bot._client
  // Emitted by minecraft-protocol for packets it could not (fully) parse
  client.on('packetParseFailure', onBadPacket)

  function onBadPacket (failure) {
    try {
      const { type, state, packetId, error: err } = failure
      const packetName = failure.packetName ?? null
      const packetParsingTrace = err ? parsingTrace(err) : []
      const key = [state, packetName ?? packetId, type, packetParsingTrace.join(',')].join('|')
      if (seen.has(key) || dumpCount >= MAX_DUMPS_PER_BOT) return
      seen.add(key)
      dumpCount++

      const buffer = Buffer.isBuffer(failure.buffer) ? failure.buffer : null
      const dump = {
        mcVersion: client.version,
        protocolVersion: bot.protocolVersion ?? null,
        mineflayerVersion: require('../../package.json').version,
        minecraftProtocolVersion: safePackageVersion('minecraft-protocol'),
        state,
        direction: failure.direction,
        packetId,
        packetName,
        type,
        error: err ? { message: err.message, field: err.field ?? null, stack: err.stack } : null,
        bytesRead: failure.bytesRead,
        packetLength: buffer ? buffer.length : null,
        packetParsingTrace,
        partialData: failure.partialData ? safeJson(failure.partialData) : null,
        buffer: buffer ? buffer.toString('hex') : null,
        date: new Date().toISOString()
      }

      fs.mkdirSync(dumpDir, { recursive: true })
      const fileName = `${client.version}_${state}_${packetName ?? 'id' + packetId}_${Date.now()}_${dumpCount}.json`
      const filePath = path.join(dumpDir, fileName.replace(/[^\w.-]/g, '_'))
      fs.writeFileSync(filePath, JSON.stringify(dump, null, 2))

      bot._warn(`Failed to parse packet ${state}.${packetName ?? packetId} (${type}) on ${client.version}. ` +
        `The packet was saved to ${filePath}. It contains the raw packet bytes, which may include chat or other ` +
        `data from the server: review it, then you may share it on a GitHub issue (${ISSUES_URL}) to help fix this. ` +
        'Disable with the dumpBadPackets: false option.')
      bot.emit('badPacket', { ...dump, path: filePath })
    } catch (e) {
      // Dumping is best effort and must never break the connection
    }
  }
}

// Turns the deserializer stack into the list of protocol types being read, innermost first,
// e.g. ['readVarInt', 'SlotComponent', 'Slot', 'packet_set_slot']
function parsingTrace (err) {
  const trace = []
  for (const line of String(err.stack ?? '').split('\n')) {
    const match = line.match(/^\s*at (?:Object\.)?([\w$.]+)(?: \[as [\w$]+\])? \(/)
    if (!match) continue
    const name = match[1]
    if (name === 'eval' || name.startsWith('new ') || name === 'ExtendableError') continue
    if (/^(Object|Transform|FullPacketParser|Parser|ProtoDefCompiler|CompiledProtodef|Readable|Writable)\b/.test(name)) continue
    if (name.includes('.')) {
      const last = name.split('.').pop()
      if (last === 'parsePacketBuffer' || last === 'read' || last === '_transform') break
      continue
    }
    trace.push(name)
  }
  return trace
}

function safePackageVersion (name) {
  try {
    return require(`${name}/package.json`).version
  } catch (e) {
    return null
  }
}

function safeJson (data) {
  try {
    return JSON.parse(JSON.stringify(data, (k, v) => typeof v === 'bigint' ? v.toString() : v))
  } catch (e) {
    return null
  }
}
