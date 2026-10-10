module.exports = inject

function inject (bot) {
  let latestHash
  let latestUUID
  let activeResourcePacks = {}
  const TEXTURE_PACK_RESULTS = {
    SUCCESSFULLY_LOADED: 0,
    DECLINED: 1,
    FAILED_DOWNLOAD: 2,
    ACCEPTED: 3
  }

  bot._client.on('add_resource_pack', (data) => { // Emits the same as resource_pack_send but sends uuid rather than hash because that's how active packs are tracked
    // latestUUID must stay the wire UUID string: a uuid-1345 object serializes to 16 zero bytes.
    latestUUID = data.uuid
    activeResourcePacks[data.uuid] = data.url

    autoAcceptResourcePack(bot.emit('resourcePack', data.url, data.uuid))
  })

  bot._client.on('remove_resource_pack', (data) => { // Doesn't emit  anything because it is removing rather than adding
    // if uuid isn't provided remove all packs
    if (data.uuid === undefined) {
      activeResourcePacks = {}
    } else {
      // Try to remove uuid from set
      try {
        delete activeResourcePacks[data.uuid]
      } catch (error) {
        console.error('Tried to remove UUID but it was not in the active list.')
      }
    }
  })

  bot._client.on('resource_pack_send', (data) => {
    // The pack must be recorded before the event: a listener that answers the pack
    // synchronously would otherwise send an empty hash/uuid.
    let hadListener
    if (bot.supportFeature('resourcePackUsesUUID')) {
      latestUUID = data.uuid
      hadListener = bot.emit('resourcePack', data.uuid, data.url)
    } else {
      latestHash = data.hash
      hadListener = bot.emit('resourcePack', data.url, data.hash)
    }
    autoAcceptResourcePack(hadListener)
  })

  // A pack must be answered: the server holds the configuration phase (e.g. a Velocity
  // transfer) open until it is, and proxies that move players through a play-phase pack
  // drop an unanswered connection. Play-phase packs are left to a resourcePack listener
  // when one exists so it can still deny. hadListener is emit's return value: a once()
  // listener is already removed by the time emit returns, so listenerCount would miss it.
  function autoAcceptResourcePack (hadListener) {
    if (bot._client.state === 'configuration' || !hadListener) {
      acceptResourcePack()
    }
  }

  function answerResourcePack (result) {
    if (bot.supportFeature('resourcePackUsesHash')) {
      bot._client.write('resource_pack_receive', { result, hash: latestHash })
    } else if (bot.supportFeature('resourcePackUsesUUID')) {
      bot._client.write('resource_pack_receive', { uuid: latestUUID, result })
    } else {
      bot._client.write('resource_pack_receive', { result })
    }
  }

  function acceptResourcePack () {
    answerResourcePack(TEXTURE_PACK_RESULTS.ACCEPTED)
    answerResourcePack(TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED)
  }

  function denyResourcePack () {
    answerResourcePack(TEXTURE_PACK_RESULTS.DECLINED)
  }

  bot.acceptResourcePack = acceptResourcePack
  bot.denyResourcePack = denyResourcePack
}
