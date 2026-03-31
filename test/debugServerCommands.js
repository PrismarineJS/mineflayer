// Debug script: log all packets received after each server console command
// Usage: node test/debugServerCommands.js <version>

const mineflayer = require('..')
const mc = require('minecraft-protocol')
const { getPort } = require('./common/util')
const Wrap = require('minecraft-wrap').Wrap
const download = require('minecraft-wrap').download
const path = require('path')

const version = process.argv[2] || '1.21.9'
const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || `${process.cwd()}/server_jars`

async function main () {
  const PORT = await getPort()
  const registry = require('prismarine-registry')(version)
  const mcVersion = registry.version.minecraftVersion
  const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${mcVersion}.jar`
  const MC_SERVER_PATH = path.join(__dirname, `server_debug_${version}`)
  const wrap = new Wrap(MC_SERVER_JAR, MC_SERVER_PATH)

  wrap.on('line', () => {}) // suppress server output

  console.log(`Downloading MC ${mcVersion}...`)
  await new Promise((resolve, reject) => {
    download(mcVersion, MC_SERVER_JAR, (err) => err ? reject(err) : resolve())
  })

  console.log('Starting server...')
  await new Promise((resolve, reject) => {
    wrap.startServer({
      'level-type': 'FLAT',
      'online-mode': 'false',
      gamemode: '1',
      'server-port': PORT,
      'spawn-monsters': 'false',
      'use-native-transport': 'false'
    }, (err) => err ? reject(err) : resolve())
  })

  console.log('Connecting bot...')
  const bot = mineflayer.createBot({
    username: 'flatbot',
    viewDistance: 'tiny',
    port: PORT,
    host: '127.0.0.1',
    version
  })

  await new Promise(resolve => bot.once('spawn', resolve))
  wrap.writeServer('op flatbot\n')
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('Bot connected and opped.\n')

  // Track all packets
  const commands = [
    ['give flatbot stone 1', 'Give stone via console'],
    ['clear flatbot', 'Clear via console'],
    ['tp flatbot 100 64 100', 'Teleport via console'],
    ['effect give flatbot speed 10 1', 'Give effect via console'],
    ['effect clear flatbot', 'Clear effects via console'],
    ['xp add flatbot 100', 'Give XP via console'],
    ['kill flatbot', 'Kill via console']
  ]

  for (const [cmd, desc] of commands) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Command: ${cmd} (${desc})`)
    console.log('='.repeat(60))

    const packets = []
    const listener = (data, meta) => {
      // Skip noisy packets
      if (['keep_alive', 'update_time', 'update_light', 'map_chunk',
        'chunk_batch_start', 'chunk_batch_finished', 'entity_head_rotation',
        'entity_velocity', 'entity_move_look', 'rel_entity_move',
        'entity_look', 'player_info', 'ping', 'bundle_delimiter',
        'chunk_batch_received'].includes(meta.name)) return
      packets.push({ name: meta.name, data: JSON.stringify(data).slice(0, 200) })
    }

    bot._client.on('packet', listener)

    // Wait a tick for any pending packets to flush
    await new Promise(resolve => setTimeout(resolve, 500))
    packets.length = 0 // clear any stale packets

    wrap.writeServer(cmd + '\n')
    await new Promise(resolve => setTimeout(resolve, 2000))

    bot._client.removeListener('packet', listener)

    if (packets.length === 0) {
      console.log('  (no packets received)')
    } else {
      for (const p of packets) {
        console.log(`  -> ${p.name}: ${p.data}`)
      }
    }

    // Wait for kill respawn
    if (cmd.includes('kill')) {
      await new Promise(resolve => {
        bot.once('spawn', resolve)
        setTimeout(resolve, 5000) // fallback
      })
    }
  }

  // Now do the same commands via bot.chat
  console.log('\n\n' + '#'.repeat(60))
  console.log('Now testing via bot.chat:')
  console.log('#'.repeat(60))

  for (const [cmd, desc] of commands.slice(0, 3)) { // just give, clear, tp
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Command: /${cmd} via bot.chat (${desc})`)
    console.log('='.repeat(60))

    const packets = []
    const listener = (data, meta) => {
      if (['keep_alive', 'update_time', 'update_light', 'map_chunk',
        'chunk_batch_start', 'chunk_batch_finished', 'entity_head_rotation',
        'entity_velocity', 'entity_move_look', 'rel_entity_move',
        'entity_look', 'player_info', 'ping', 'bundle_delimiter',
        'chunk_batch_received'].includes(meta.name)) return
      packets.push({ name: meta.name, data: JSON.stringify(data).slice(0, 200) })
    }

    bot._client.on('packet', listener)
    await new Promise(resolve => setTimeout(resolve, 500))
    packets.length = 0

    bot.chat(`/${cmd}`)
    await new Promise(resolve => setTimeout(resolve, 2000))

    bot._client.removeListener('packet', listener)

    if (packets.length === 0) {
      console.log('  (no packets received)')
    } else {
      for (const p of packets) {
        console.log(`  -> ${p.name}: ${p.data}`)
      }
    }
  }

  console.log('\nDone.')
  bot.quit()
  wrap.stopServer(() => {
    wrap.deleteServerData(() => process.exit(0))
  })
}

main().catch(e => { console.error(e); process.exit(1) })
