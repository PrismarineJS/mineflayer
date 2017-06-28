const CHAT_LENGTH_LIMIT = 100

module.exports = inject

function inject (bot) {
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
    // Function used to process "unidentified" messages, such as 1.6 chat and bukkit servers
    function parseOldMessage (stringMsg) {
      // iterate through each object in chat.patterns array and test if .pattern matches
      for (let i = 0; i < bot.chatPatterns.length; i++) {
        const match = stringMsg.match(bot.chatPatterns[i].pattern)
        if (match) {
          const username = match[1]
          const message = match[2]
          bot.emit(bot.chatPatterns[i].type, username, message, null, {
            text: stringMsg
          }, match)
        }
      }
    }

    /**
     * Parse 1.6.* version message
     * @param  {JSONObject} jsonMessage
     * @return {void}
     */
    function parseJsonMessage6 (jsonMessage) {
      let username
      let content
      if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
        username = jsonMsg.using[0]
        content = jsonMsg.using[1]
        bot.emit('chat', username, content, jsonMessage.translate, jsonMessage)
      } else if (jsonMsg.translate === 'commands.message.display.incoming') {
        username = jsonMsg.using[0]
        content = jsonMsg.using[1]
        bot.emit('whisper', username, content, jsonMsg.translate, jsonMsg)
      } else if (typeof jsonMsg.text === 'string') {
        // craftbukkit message format
        parseOldMessage(jsonMsg.text)
      }
      bot.emit('message', jsonMsg)
    }

    /**
     * Parse 1.7+ version message
     * @param  {JSONObject} jsonMessage
     * @return {void}
     */
    function parseJsonMessage7 (jsonMessage) {
      const chatMessage = new ChatMessage(jsonMessage)
      bot.emit('message', chatMessage)
      // Now parse the message type
      let username
      let extendedMessage
      switch (chatMessage.translate) {
        case undefined:
        {
          parseOldMessage(chatMessage.toString())
          break
        }
        case 'chat.type.text':
        {
          username = chatMessage.with[0].toString()
          extendedMessage = chatMessage.with[1].toString()
          bot.emit('chat', username, extendedMessage, chatMessage.translate, chatMessage)
          break
        }
        case 'commands.message.display.incoming':
        {
          username = chatMessage.with[0].toString()
          extendedMessage = chatMessage.with[1].toString()
          bot.emit('whisper', username, extendedMessage, chatMessage.translate, chatMessage)
          break
        }
      }
    }

    // used by minecraft >= 1.6.2
    function parseJsonMessage (jsonMessage) {
      if (jsonMessage.using) {
        parseJsonMessage6(jsonMessage)
      } else {
        parseJsonMessage7(jsonMessage)
      }
    }

    var jsonMsg
    // Honestly we should be checking against the server version
    try {
      jsonMsg = JSON.parse(packet.message)
    } catch (e) {
      // old message format
      bot.emit('message', packet.message)
      parseOldMessage(packet.message)
      return
    }

    // Position 2 is the action bar
    if (packet.position === 2) {
      bot.emit('actionBar', new ChatMessage(jsonMsg))
      return
    }

    parseJsonMessage(jsonMsg)
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
