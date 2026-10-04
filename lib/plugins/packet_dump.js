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
  wrapDeserializer(client.deserializer)
  client.on('state', () => wrapDeserializer(client.deserializer))

  function wrapDeserializer (deserializer) {
    if (!deserializer || deserializer._mineflayerDumpWrapped) return
    deserializer._mineflayerDumpWrapped = true
    const parsePacketBuffer = deserializer.parsePacketBuffer.bind(deserializer)
    deserializer.parsePacketBuffer = (buffer) => {
      let packet
      try {
        packet = parsePacketBuffer(buffer)
      } catch (err) {
        onBadPacket(buffer, err, null)
        throw err
      }
      if (packet.metadata.size !== buffer.length) {
        onBadPacket(buffer, null, packet)
      }
      return packet
    }
  }

  function onBadPacket (buffer, err, packet) {
    try {
      const state = client.state
      const packetId = readPacketId(buffer)
      const packetName = packet?.data?.name ?? packetNameFromId(bot.registry ?? null, client.version, state, packetId)
      const type = err ? (err.partialReadError ? 'PartialReadError' : 'ReadError') : 'SizeMismatch'
      const packetParsingTrace = err ? parsingTrace(err) : []
      const key = [state, packetName ?? packetId, type, packetParsingTrace.join(',')].join('|')
      if (seen.has(key) || dumpCount >= MAX_DUMPS_PER_BOT) return
      seen.add(key)
      dumpCount++

      const dump = {
        mcVersion: client.version,
        protocolVersion: bot.protocolVersion ?? null,
        mineflayerVersion: require('../../package.json').version,
        minecraftProtocolVersion: safePackageVersion('minecraft-protocol'),
        state,
        direction: 'toClient',
        packetId,
        packetName: packetName ?? null,
        type,
        error: err ? { message: err.message, field: err.field ?? null, stack: err.stack } : null,
        bytesRead: packet ? packet.metadata.size : null,
        packetLength: buffer.length,
        packetParsingTrace,
        partialData: packet ? safeJson(packet.data) : null,
        buffer: buffer.toString('hex'),
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

function readPacketId (buffer) {
  let value = 0
  for (let i = 0; i < 5 && i < buffer.length; i++) {
    const byte = buffer[i]
    value |= (byte & 0x7f) << (7 * i)
    if ((byte & 0x80) === 0) return value
  }
  return null
}

function packetNameFromId (registry, version, state, packetId) {
  if (packetId === null) return undefined
  try {
    const protocol = registry?.protocol ?? require('minecraft-data')(version).protocol
    const mappings = protocol[state].toClient.types.packet[1][0].type[1].mappings
    const hexId = '0x' + packetId.toString(16).padStart(2, '0')
    return mappings[hexId]
  } catch (e) {
    return undefined
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
