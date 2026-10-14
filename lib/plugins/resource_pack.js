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

    bot.emit('resourcePack', data.url, data.uuid)
    // The server holds the configuration phase (e.g. a Velocity server transfer)
    // open until the pack is answered, so accept it there to let it complete
    if (bot._client.state === 'configuration') acceptResourcePack()
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
    if (bot.supportFeature('resourcePackUsesUUID')) {
      bot.emit('resourcePack', data.uuid, data.url)
      latestUUID = data.uuid
    } else {
      bot.emit('resourcePack', data.url, data.hash)
      latestHash = data.hash
    }
    // Accept during the configuration phase (e.g. a Velocity server transfer),
    // which the server holds open until the pack is answered
    if (bot._client.state === 'configuration') acceptResourcePack()
  })

  function acceptResourcePack () {
    if (bot.supportFeature('resourcePackUsesHash')) {
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.ACCEPTED,
        hash: latestHash
      })
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED,
        hash: latestHash
      })
    } else if (bot.supportFeature('resourcePackUsesUUID')) {
      bot._client.write('resource_pack_receive', {
        uuid: latestUUID,
        result: TEXTURE_PACK_RESULTS.ACCEPTED
      })
      bot._client.write('resource_pack_receive', {
        uuid: latestUUID,
        result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
      })
    } else {
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.ACCEPTED
      })
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
      })
    }
  }

  function denyResourcePack () {
    if (bot.supportFeature('resourcePackUsesUUID')) {
      bot._client.write('resource_pack_receive', {
        uuid: latestUUID,
        result: TEXTURE_PACK_RESULTS.DECLINED
      })
    }
    bot._client.write('resource_pack_receive', {
      result: TEXTURE_PACK_RESULTS.DECLINED
    })
  }

  bot.acceptResourcePack = acceptResourcePack
  bot.denyResourcePack = denyResourcePack
}
