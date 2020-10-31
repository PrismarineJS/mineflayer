const PROTO_VER_1_10 = require('minecraft-data')('1.10.2').version.version

module.exports = inject

function inject (bot, options) {
  const CHAT_LENGTH_LIMIT = options.chatLengthLimit || ((bot.protocolVersion > PROTO_VER_1_10) ? 256 : 100)
  const USERNAME_REGEX = '(?:\\(.+\\)|\\[.+\\]|.)*?(\\w+)'

  const ChatMessage = require('prismarine-chat')(bot.version)
  // add an array, containing objects such as {pattern:/regex pattern/, chatType:"string", description:"string"}
  // chat.pattern.type will emit an event for bot.on() of the same type, eg chatType = whisper will trigger bot.on('whisper')
  bot.chatPatterns = [
    {
      pattern: new RegExp(`^${USERNAME_REGEX} whispers(?: to you)?:? (.*)$`),
      type: 'whisper',
      description: 'Vanilla whisper'
    },
    {
      pattern: new RegExp(`^\\[${USERNAME_REGEX} -> \\w+\\s?\\] (.*)$`),
      type: 'whisper',
      description: 'Essentials whisper'
    },
    {
      pattern: new RegExp(`^${USERNAME_REGEX}\\s?[>:\\-»\\]\\)~]+\\s(.*)$`),
      type: 'chat',
      description: 'Universal chat'
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
      let matchAny = false
      // iterate through each object in chat.patterns array and test if .pattern matches
      for (const { pattern, type } of bot.chatPatterns) {
        // Chat pattern matches server messages so drop them
        if (stringMsg.startsWith('[Server:')) break

        const match = stringMsg.match(pattern)
        if (match) {
          matchAny = true
          bot.emit(type, ...match.slice(1), msg.translate, msg)
        }
      }

      if (matchAny === false) {
        bot.emit('unmachedMessage', stringMsg, msg)
      }
    }

    let msg
    try {
      msg = new ChatMessage(JSON.parse(packet.message))
    } catch (e) {
      msg = new ChatMessage(packet.message)
    }

    const ChatPositions = {
      0: 'chat',
      1: 'system',
      2: 'game_info'
    }

    const chatPosition = ChatPositions[packet.position]

    bot.emit('message', msg, chatPosition)
    checkForChatPatterns(msg)

    // Position 2 is the action bar
    if (packet.position === 2) bot.emit('actionBar', msg)
  })

  function chatWithHeader (header, message) {
    if (typeof message !== 'string') {
      throw new Error('Incorrect type! Should be a string.')
    }

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

  function tabComplete (text, cb, assumeCommand = false, sendBlockInSight = true) {
    let position

    if (sendBlockInSight) {
      const block = bot.blockInSight()

      if (block) {
        position = block.position
      }
    }

    bot._client.once('tab_complete', (packet) => {
      cb(undefined, packet.matches)
    })

    bot._client.write('tab_complete', {
      text,
      assumeCommand,
      lookedAtBlock: position
    })
  }

  bot.whisper = (username, message) => {
    chatWithHeader(`/tell ${username} `, message)
  }
  bot.chat = (message) => {
    chatWithHeader('', message)
  }

  bot.tabComplete = tabComplete
}
