const { Vec3 } = require('vec3')

const { spawn } = require('child_process')
const { once } = require('../../../lib/promise_utils')
const process = require('process')
const assert = require('assert')
const { sleep, onceWithCleanup } = require('../../../lib/promise_utils')
const trace = require('../../common/trace')

const timeout = 5000
module.exports = inject

function inject (bot, wrap) {
  console.log(bot.version)

  bot.test = {}
  bot._client.on('packet', (data, meta) => trace.packet('S2C', meta.name, data))
  const oldWrite = bot._client.write
  bot._client.write = function (name, data) {
    trace.packet('C2S', name, data)
    oldWrite.apply(this, arguments)
  }
  bot.test.dumpMarker = msg => trace.log(msg)
  bot.once('spawn', () => {
    const orig = bot.inventory.updateSlot.bind(bot.inventory)
    bot.inventory.updateSlot = (slot, item) => {
      trace.write('MODEL', 'updateSlot', { slot, item: item ? { name: item.name, count: item.count } : null })
      return orig(slot, item)
    }
  })
  bot.test.groundY = bot.supportFeature('tallWorld') ? -60 : 4
  bot.test.sayEverywhere = sayEverywhere
  bot.test.clearInventory = clearInventory
  bot.test.becomeSurvival = becomeSurvival
  bot.test.becomeCreative = becomeCreative
  bot.test.fly = fly
  bot.test.teleport = teleport
  bot.test.resetState = resetState
  bot.test.setInventorySlot = setInventorySlot
  bot.test.placeBlock = placeBlock
  bot.test.runExample = runExample
  bot.test.tellAndListen = tellAndListen
  bot.test.selfKill = selfKill
  bot.test.killEntity = killEntity
  bot.test.wait = function (ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms) })
  }

  bot.test.awaitItemReceived = async (command) => {
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(command)
    await p // await getting the item
  }
  // setting relative to true makes x, y, & z relative using ~
  bot.test.setBlock = async ({ x = 0, y = 0, z = 0, relative, blockName }) => {
    const { x: _x, y: _y, z: _z } = relative ? bot.entity.position.floored().offset(x, y, z) : { x, y, z }
    const block = bot.blockAt(new Vec3(_x, _y, _z))
    if (block.name === blockName) {
      return
    }
    const p = once(bot.world, `blockUpdate:(${_x}, ${_y}, ${_z})`)
    const prefix = relative ? '~' : ''
    bot.chat(`/setblock ${prefix}${x} ${prefix}${y} ${prefix}${z} ${blockName}`)
    await p
  }

  let grassName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    grassName = 'grass_block'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    grassName = 'grass'
  }

  const layerNames = [
    'bedrock',
    'dirt',
    'dirt',
    grassName,
    'air',
    'air',
    'air',
    'air',
    'air'
  ]

  async function resetBlocksToSuperflat () {
    const groundY = 4
    for (let y = groundY + 4; y >= groundY - 1; y--) {
      const realY = y + bot.test.groundY - 4
      bot.chat(`/fill ~-5 ${realY} ~-5 ~5 ${realY} ~5 ` + layerNames[y])
    }
    // The fills are fire-and-forget; a marker chat message on the same
    // ordered connection confirms they have executed and their block updates
    // have already arrived, without assuming how long a server tick takes.
    const marker = 'superflat-reset-done'
    const echo = onceWithCleanup(bot, 'messagestr', {
      timeout: 5000,
      checkCondition: (message) => message.includes(marker)
    })
    bot.chat(marker)
    await echo
  }

  async function placeBlock (slot, position) {
    bot.setQuickBarSlot(slot - 36)
    // always place the block on the top of the block below it, i guess.
    const referenceBlock = bot.blockAt(position.plus(new Vec3(0, -1, 0)))
    return bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
  }

  // Any block change since the last superflat repair marks the world dirty;
  // resetState uses it to skip the /fill roundtrips after read-only tests.
  // Fills themselves fire blockUpdate, so the flag is cleared after they
  // settle; a late-arriving update just makes the next reset conservative.
  let worldDirty = true
  bot.on('blockUpdate', () => { worldDirty = true })

  // always leaves you in creative mode
  async function resetState () {
    await becomeCreative()
    bot.creative.startFlying()
    // Tests build in the columns around the origin: the bot must be on the
    // origin block's centre, not merely within a block of it.
    const origin = new Vec3(0.5, bot.test.groundY, 0.5)
    if (bot.entity.position.distanceTo(origin) >= 0.1) {
      await teleport(origin)
      await bot.waitForChunksToLoad()
    }
    if (worldDirty) {
      await resetBlocksToSuperflat()
      worldDirty = false
    }
    // Clear after the fills: they destroy the previous test's containers,
    // and those deferred closes return items into the inventory — the clear's
    // give-retry converges over those late returns.
    if (bot.inventory.slots.some((slot) => slot != null) || bot.inventory.selectedItem) {
      await clearInventory()
    }
  }

  async function becomeCreative () {
    // console.log('become creative')
    return setCreativeMode(true)
  }

  async function becomeSurvival () {
    return setCreativeMode(false)
  }

  async function setCreativeMode (value) {
    const mode = value ? 'creative' : 'survival'
    const modeId = value ? 1 : 0
    if (bot.game.gameMode === mode) return
    // Use server console for instant, reliable gamemode change.
    // The old approach (triple chat command + message parsing) was fragile
    // and the most common source of flaky test timeouts.
    const gameModePromise = onceWithCleanup(bot._client, 'game_state_change', {
      timeout,
      checkCondition: (packet) => {
        // reason is 3 (number) on old versions, 'change_game_mode' (string) on new
        const isGameModeChange = packet.reason === 3 || packet.reason === 'change_game_mode'
        return isGameModeChange && Math.floor(packet.gameMode) === modeId
      }
    })
    wrap.writeServer(`gamemode ${mode} flatbot\n`)
    await gameModePromise
  }

  const clearSuccess = () => onceWithCleanup(bot, 'message', {
    timeout: 10000,
    // A failed clear ("No items were found", when the inventory is already
    // empty) still confirms the server processed our packets in order.
    // The failure message arrives with the key nested in extra, not top-level.
    checkCondition: msg => [
      'commands.clear.success', // <= 1.12.2
      'commands.clear.success.single', // 1.13.2+
      'commands.clear.failure', // <= 1.12.2, empty inventory
      'clear.failed.single', // 1.13.2+, empty inventory
      'clear.failed.multiple' // 1.13.2+, empty inventory, multiple targets
    ].includes(msg.translate ?? msg.json?.extra?.[0]?.translate)
  })

  async function clearInventory () {
    // Clear first and await the server's confirmation. This guarantees all
    // previously sent packets (e.g. a close_window from the last test) have
    // been applied server-side — otherwise /give can land in a container
    // that the client already closed and the update gets silently dropped.
    const initialClear = clearSuccess()
    bot.chat('/clear')
    await initialClear
    // The server also defers some window closes to a later tick (a killed
    // villager, a crafting table destroyed by our /fill). A /give issued
    // before that tick runs lands in the still-open window and mineflayer
    // drops the update — retry, the close is done by the next attempt.
    // (bot.chat is required: server console /give doesn't send inventory
    // update packets on 1.21.9+.)
    for (let attempt = 0; attempt < 3; attempt++) {
      bot.chat('/give @a stone 1')
      const got = await onceWithCleanup(bot.inventory, 'updateSlot', {
        timeout: 3000,
        checkCondition: (slot, oldItem, newItem) => newItem?.name === 'stone'
      }).then(() => true, () => false)
      if (got) break
      if (attempt === 2) throw new Error('stone never reached the inventory after 3 /give attempts')
    }
    const finalClear = clearSuccess()
    bot.chat('/clear')
    await finalClear
  }

  // you need to be in creative mode for this to work
  async function setInventorySlot (targetSlot, item) {
    assert(item === null || item.name !== 'unknown', `item should not be unknown ${JSON.stringify(item)}`)
    return bot.creative.setInventorySlot(targetSlot, item)
  }

  async function teleport (position) {
    // Integer x/z land on the block centre. 'move' also fires for periodic
    // position packets with no movement, so the wait must match the landing
    // point exactly rather than a radius the bot may already be inside.
    const centre = (v) => Number.isInteger(v) ? v + 0.5 : v
    const landing = new Vec3(centre(position.x), position.y, centre(position.z))
    // Use server console for teleport — works even if bot is in a bad state
    if (bot.supportFeature('hasExecuteCommand')) {
      wrap.writeServer(`execute in overworld run teleport ${bot.username} ${landing.x} ${landing.y} ${landing.z}\n`)
    } else {
      wrap.writeServer(`tp ${bot.username} ${landing.x} ${landing.y} ${landing.z}\n`)
    }
    return onceWithCleanup(bot, 'move', {
      timeout,
      checkCondition: () => bot.entity.position.distanceTo(landing) < 0.1
    })
  }

  function sayEverywhere (message) {
    if (bot.test.dumpMarker) bot.test.dumpMarker(message)
    bot.chat(message)
    console.log(message)
  }

  async function fly (delta) {
    return bot.creative.flyTo(bot.entity.position.plus(delta))
  }

  async function tellAndListen (to, what, listen) {
    const chatMessagePromise = onceWithCleanup(bot, 'chat', {
      timeout,
      checkCondition: (username, message) => username === to && listen(message)
    })

    bot.chat(what)

    return chatMessagePromise
  }

  // The example currently running, if any. Aborting it drops every listener the
  // attempt armed on the shared bot.
  let runningExample = null
  bot.test.abortRunningExample = () => {
    runningExample?.abort(new Error('a previous attempt of this example is still running'))
    runningExample = null
  }

  async function runExample (file, run) {
    let childBotName
    const abort = new AbortController()
    runningExample = abort

    const detectChildJoin = async () => {
      const [message] = await onceWithCleanup(bot, 'message', {
        signal: abort.signal,
        checkCondition: message => message.json.translate === 'multiplayer.player.joined'
      })
      childBotName = message.json.with[0].insertion
      bot.chat(`/tp ${childBotName} 50 ${bot.test.groundY} 0`)
      // Wait for the child entity to arrive at the teleport target,
      // confirming the server has processed the TP
      const targetPos = new Vec3(50, bot.test.groundY, 0)
      while (!bot.players[childBotName]?.entity ||
             bot.players[childBotName].entity.position.distanceTo(targetPos) > 5) {
        await sleep(100)
      }
      bot.chat('loaded')
    }

    const runExampleOnReady = async () => {
      await onceWithCleanup(bot, 'chat', {
        signal: abort.signal,
        checkCondition: (username, message) => message === 'Ready!'
      })
      return run(childBotName)
    }

    const child = spawn('node', [file, '127.0.0.1', `${bot.test.port}`])

    // Useful to debug child processes:
    child.stdout.on('data', (data) => { console.log(`${data}`) })
    child.stderr.on('data', (data) => { console.error(`${data}`) })

    // Neither wait above settles if the example process dies (an uncaught
    // chunk-load timeout, say), so without this the attempt just hangs until
    // mocha's timeout.
    const childDied = onceWithCleanup(child, 'close', { signal: abort.signal })
      .then(([code, signal]) => {
        throw new Error(`${file} exited before the test finished (code ${code}, signal ${signal})`)
      })

    const closeExample = async (err) => {
      // Drop this attempt's listeners first, so a retry never inherits them.
      abort.abort(err ?? new Error(`${file} finished`))
      if (runningExample === abort) runningExample = null

      if (child.exitCode !== null || child.signalCode !== null) {
        console.log(`process ${child.pid} already exited (code ${child.exitCode}, signal ${child.signalCode})`)
      } else {
        console.log('kill process ' + child.pid)
        try {
          process.kill(child.pid, 'SIGTERM')
          const [code] = await onceWithCleanup(child, 'close', { timeout: 5000 })
          console.log('close requested', code)
        } catch (e) {
          console.log(e)
          console.log('process termination failed, process may already be closed')
        }
      }

      if (err) {
        throw err
      }
    }

    // Let mocha's test-level timeout (90s) be the backstop instead of
    // an inner withTimeout, which was causing premature failures on
    // slow CI runners.
    try {
      await Promise.race([Promise.all([detectChildJoin(), runExampleOnReady()]), childDied])
    } catch (err) {
      console.log(err)
      return closeExample(err)
    }
    return closeExample()
  }

  function selfKill () {
    bot.chat('/kill @p')
  }

  // /kill only starts the death animation; until the server removes the
  // entity about a second later it still blocks placing blocks where it stands
  async function killEntity (entity) {
    const gone = onceWithCleanup(bot, 'entityGone', { timeout: 5000, checkCondition: (e) => e.id === entity.id })
    bot.chat(`/kill @e[type=${entity.name}]`)
    await gone
  }

  // Debug packet IO when tests are re-run with "Enable debug logging" - https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
  if (process.env.RUNNER_DEBUG) {
    bot._client.on('packet', function (data, meta) {
      if (['chunk', 'time', 'light', 'alive'].some(e => meta.name.includes(e))) return
      console.log('->', meta.name, JSON.stringify(data)?.slice(0, 250))
    })
    const oldWrite = bot._client.write
    bot._client.write = function (name, data) {
      if (['alive', 'pong', 'ping'].some(e => name.includes(e))) return
      console.log('<-', name, JSON.stringify(data)?.slice(0, 250))
      oldWrite.apply(bot._client, arguments)
    }
      BigInt.prototype.toJSON ??= function () { // eslint-disable-line
      return this.toString()
    }
  }
}
