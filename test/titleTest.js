/* eslint-env mocha */

const assert = require('assert')
const { EventEmitter } = require('events')
const injectTitle = require('../lib/plugins/title')

function makeBot (mode) {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot.supportFeature = name => {
    if (mode === 'legacy') return name === 'titleUsesLegacyPackets'
    return name === 'titleUsesNewPackets'
  }
  injectTitle(bot)
  return bot
}

describe('title plugin', () => {
  it('preserves an empty legacy title text component', (done) => {
    const bot = makeBot('legacy')
    bot.once('title', (text, type) => {
      try {
        assert.strictEqual(text, '')
        assert.strictEqual(type, 'title')
        done()
      } catch (err) {
        done(err)
      }
    })

    bot._client.emit('title', { action: 0, text: '{"text":""}' })
  })

  it('preserves an empty new-packet subtitle text component', (done) => {
    const bot = makeBot('new')
    bot.once('title', (text, type) => {
      try {
        assert.strictEqual(text, '')
        assert.strictEqual(type, 'subtitle')
        done()
      } catch (err) {
        done(err)
      }
    })

    bot._client.emit('set_title_subtitle', { text: '{"text":""}' })
  })
})
