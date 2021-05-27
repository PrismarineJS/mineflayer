module.exports = inject

function inject (bot) {
  let latestHash
  const TEXTURE_PACK_RESULTS = {
    SUCCESSFULLY_LOADED: 0,
    DECLINED: 1,
    FAILED_DOWNLOAD: 2,
    ACCEPTED: 3
  }

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
