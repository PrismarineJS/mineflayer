const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = {
  chat: (bot, server, done) => {
    bot.once('chat', (username, message) => {
      assert.strictEqual(username, 'gary')
      assert.strictEqual(message, 'hello')
      bot.chat('hi')
    })
    server.on('playerJoin', (client) => {
      client.write('login', bot.test.generateLoginPacket())
      const message = bot.supportFeature('signedChat')
        ? JSON.stringify({ text: 'hello' })
        : JSON.stringify({
          translate: 'chat.type.text',
          with: [{
            text: 'gary'
          },
          'hello'
          ]
        })

      if (bot.supportFeature('signedChat')) {
        const uuid = 'd3527a0b-bc03-45d5-a878-2aafdd8c8a43' // random
        const networkName = bot.test.chatText('gary')

        if (bot.registry.supportFeature('incrementedChatType')) {
          client.write('player_chat', {
            plainMessage: 'hello',
            filterType: 0,
            type: { chatType: 0 },
            networkName,
            previousMessages: [],
            senderUuid: uuid,
            timestamp: Date.now(),
            index: 0,
            salt: 1n
          })
        } else if (bot.registry.supportFeature('useChatSessions')) {
          client.write('player_chat', {
            plainMessage: 'hello',
            filterType: 0,
            type: { chatType: 0 },
            networkName,
            previousMessages: [],
            senderUuid: uuid,
            timestamp: Date.now(),
            index: 0,
            salt: 2n
          })
        } else if (bot.registry.supportFeature('chainedChatWithHashing')) {
          client.write('player_chat', {
            plainMessage: 'hello',
            filterType: 0,
            type: 0,
            networkName,
            previousMessages: [],
            senderUuid: uuid,
            timestamp: Date.now(),
            salt: 3n,
            signature: Buffer.alloc(0)
          })
        } else {
          client.write('player_chat', {
            signedChatContent: '',
            unsignedChatContent: message,
            type: 0,
            senderUuid: uuid,
            senderName: JSON.stringify({ text: 'gary' }),
            senderTeam: undefined,
            timestamp: Date.now(),
            salt: 4n,
            signature: Buffer.alloc(0)
          })
        }
      } else {
        client.write('chat', { message, position: 0, sender: '0' })
      }
      function onChat (packet) {
        const msg = packet.message || packet.unsignedChatContent || packet.signedChatContent
        assert.strictEqual(msg, 'hi')
        done()
      }
      client.on('chat_message', onChat)
      client.on('chat', onChat)
    })
  },

  'chat before login throws a descriptive error': async (bot, server) => {
    await once(bot, 'inject_allowed')
    const early = /before the client entered the play state; wait for/
    assert.throws(() => bot.chat('hi'), early)
    assert.throws(() => bot.whisper('gary', 'hi'), early)
  },

  'chat after a kick during login throws a descriptive error': async (bot, server) => {
    // Replaces the server's login handler so the client is rejected while still in the login state.
    server.on('connection', (client) => {
      client.removeAllListeners('login_start')
      client.once('login_start', () => client.end('kicked'))
    })
    const [reason] = await once(bot, 'end')
    const kicked = new RegExp(`disconnected before entering the play state \\(${reason}\\)`)
    assert.throws(() => bot.chat('hi'), kicked)
    assert.throws(() => bot.whisper('gary', 'hi'), kicked)
  }
}
