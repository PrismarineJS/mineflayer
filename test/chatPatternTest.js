/* global describe, it */
const assert = require('assert')
const { EventEmitter } = require('events')
const registry = require('prismarine-registry')('1.20.4')
const injectChat = require('../lib/plugins/chat')

function createBot () {
  const bot = new EventEmitter()
  bot.registry = registry
  bot.supportFeature = () => false
  bot.blockAtCursor = () => null
  bot._client = new EventEmitter()
  bot._client.chat = () => {}
  bot._client.write = () => {}
  return bot
}

describe('chat patterns', function () {
  it('continues checking other patterns when a pattern set is incomplete', function () {
    const bot = createBot()
    injectChat(bot, { defaultChatPatterns: false })

    bot.addChatPatternSet('sequence', [/hello/, /world/], { repeat: false })
    bot.addChatPattern('single', /hello/, { repeat: false })

    let singleMatches = null
    bot.on('chat:single', matches => {
      singleMatches = matches
    })

    bot.emit('messagestr', 'hello', 'chat', {})

    assert.deepStrictEqual(singleMatches, ['hello'])
  })
})
