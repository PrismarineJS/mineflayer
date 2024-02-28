module.exports = inject

function inject (bot) {
  let latestHash
  const activeResourcePacks = new Set();
  const TEXTURE_PACK_RESULTS = {
    SUCCESSFULLY_LOADED: 0,
    DECLINED: 1,
    FAILED_DOWNLOAD: 2,
    ACCEPTED: 3
  }

  bot._client.on('add_resource_pack', (data) => { // Emits the same as resource_pack_send but also uuid because that's how active packs are tracked
    bot.emit('resourcePack', data.url, data.hash, data.uuid)
    // Adding the pack to a set by uuid
    acceptResourcePacks.add(data.uuid)
    latestHash = data.hash
  })

  bot._client.on('remove_resource_pack', (data) => { // Doesn't emit  anything because it is removing rather than adding
    // if uuid isn't provided remove all packs
    if (data.uuid === undefined) {
      acceptResourcePacks.clear();
    } else {
      // Try to remove uuid from set
      try {
        acceptResourcePacks.remove(data.uuid)
      } catch (error) {
         console.error("Tried to remove UUID but it was not in the active list.");
      }
    }
  })

  bot._client.on('resource_pack_send', (data) => {
    bot.emit('resourcePack', data.url, data.hash)
    latestHash = data.hash
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
    bot._client.write('resource_pack_receive', {
      result: TEXTURE_PACK_RESULTS.DECLINED
    })
  }

  bot.acceptResourcePack = acceptResourcePack
  bot.denyResourcePack = denyResourcePack
}
