const PROTO_VER_1_10 = require('minecraft-data')('1.10.2').version.version

module.exports = inject

function inject (bot, options) {
  const CHAT_LENGTH_LIMIT = options.chatLengthLimit || ((bot.protocolVersion > PROTO_VER_1_10) ? 256 : 100)

  const ChatMessage = require('../chat_message')(bot.version)
  // add an array, containing objects such as {pattern:/regex pattern/, chatType:"string", description:"string"}
  // chat.pattern.type will emit an event for bot.on() of the same type, eg chatType = whisper will trigger bot.on('whisper')
  // Default patterns for matching vanilla chat.
  bot.chatPatterns = [
    {
      pattern: /^<(?:.+? )?(.+?)> (.*)$/,
      type: 'chat',
      description: 'Vanilla chat'
    },
    {
      pattern: /^(?:.+? )?(.+?) (?:whispers to you:|whispers) (.*)$/,
      type: 'whisper',
      description: 'Vanilla whisper'
    }
  ]

  bot.chatAddPattern = (patternValue, typeValue, descriptionValue) => {
    // description is not required but recommended
    if (typeof descriptionValue === 'undefined') {
      descriptionValue = 'None'
    }
    bot.chatPatterns.push({
      pattern: patternValue,
      type: typeValue,
      description: descriptionValue
    })
  }

  bot._client.on('chat', (packet) => {
    function checkForChatPatterns (msg) {
      const stringMsg = msg.toString()
      // iterate through each object in chat.patterns array and test if .pattern matches
      for (let i = 0; i < bot.chatPatterns.length; i++) {
        const match = stringMsg.match(bot.chatPatterns[i].pattern)
        if (match) {
          bot.emit(bot.chatPatterns[i].type, ...match.slice(1), msg.translate, msg)
        }
      }
    }

    var msg
    try {
      msg = new ChatMessage(JSON.parse(packet.message))
    } catch (e) {
      msg = new ChatMessage(packet.message)
    }
    bot.emit('message', msg)
    checkForChatPatterns(msg)

    // Position 2 is the action bar
    if (packet.position === 2) bot.emit('actionBar', msg)
  })

  function chatWithHeader (header, message) {
    const lengthLimit = CHAT_LENGTH_LIMIT - header.length
    message.split('\n').forEach((subMessage) => {
      if (!subMessage) return
      let i
      let smallMsg
      for (i = 0; i < subMessage.length; i += lengthLimit) {
        smallMsg = header + subMessage.substring(i, i + lengthLimit)
        bot._client.write('chat', { message: smallMsg })
      }
    })
  }

  bot.whisper = (username, message) => {
    chatWithHeader(`/tell ${username} `, message)
  }
  bot.chat = (message) => {
    chatWithHeader('', message)
  }
}
