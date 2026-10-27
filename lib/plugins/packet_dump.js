const path = require('path')

let fs, os
try {
  fs = require('fs')
  os = require('os')
} catch (e) {}

const MAX_DUMPS_PER_BOT = 10
const ISSUES_URL = 'https://github.com/PrismarineJS/mineflayer/issues'

module.exports = inject

// When node-minecraft-protocol reports a clientbound packet it could not parse (its
// `packetParseFailure` event), write the raw bytes and the error to a local file so it can be
// attached to a bug report. Nothing is ever sent anywhere.
function inject (bot, options) {
  if (options.dumpBadPackets === false) return
  if (!fs || typeof fs.writeFileSync !== 'function' || !os || typeof os.homedir !== 'function') return // e.g. browser

  const dumpDir = options.badPacketsDir ?? path.join(os.homedir(), '.mineflayer', 'bad-packets')
  const seen = new Set()
  let dumpCount = 0

  const client = bot._client
  client.on('packetParseFailure', onBadPacket)

  function onBadPacket (failure) {
    try {
      const { type, state, direction, buffer, packetId, packetName, error, bytesRead, partialData } = failure
      const key = [state, packetName ?? packetId, type, error?.field ?? ''].join('|')
      if (seen.has(key) || dumpCount >= MAX_DUMPS_PER_BOT) return
      seen.add(key)
      dumpCount++

      const dump = {
        mcVersion: client.version,
        protocolVersion: bot.protocolVersion ?? null,
        mineflayerVersion: require('../../package.json').version,
        minecraftProtocolVersion: safePackageVersion('minecraft-protocol'),
        state,
        direction,
        packetId,
        packetName,
        type,
        error: error ? { message: error.message, field: error.field ?? null, stack: error.stack } : null,
        bytesRead,
        packetLength: buffer.length,
        partialData: partialData === null ? null : safeJson(partialData),
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
