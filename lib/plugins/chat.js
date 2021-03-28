const { once } = require('events')

module.exports = inject

function inject (bot, options) {
  const CHAT_LENGTH_LIMIT = options.chatLengthLimit ?? (bot.supportFeature('lessCharsInChat') ? 100 : 256)

  const ChatMessage = require('prismarine-chat')(bot.version)
  // chat.pattern.type will emit an event for bot.on() of the same type, eg chatType = whisper will trigger bot.on('whisper')
  const _chatRegex = []
  // deprecated
  bot.chatAddPattern = (patternValue, typeValue) => {
    bot.addChatPattern(typeValue, patternValue, { deprecated: true })
  }

  bot.addChatPatternSet = (name, patterns, opts = {}) => {
    const { repeat = true, parse = false } = opts
    _chatRegex.push({
      name,
      patterns,
      position: 0,
      matches: [],
      messages: [],
      repeat,
      parse
    })
  }

  bot.addChatPattern = (name, pattern, opts = {}) => {
    const { repeat = true, deprecated = false, parse = false } = opts
    _chatRegex.push({
      name,
      patterns: [pattern],
      position: 0,
      matches: [],
      messages: [],
      deprecated,
      repeat,
      parse
    })
  }

  function findMatchingPatterns (msg) {
    const found = []
    for (const [ix, { patterns, position }] of _chatRegex.entries()) {
      if (patterns[position].test(msg)) {
        found.push(ix)
      }
    }
    return found
  }

  bot.on('messagestr', (msg, _, originalMsg) => {
    const foundPatterns = findMatchingPatterns(msg)
    if (foundPatterns.length === 0) return

    for (const ix of foundPatterns) {
      _chatRegex[ix].matches.push(msg)
      _chatRegex[ix].messages.push(originalMsg)
      _chatRegex[ix].position++
    }

    _chatRegex.forEach((o, ix) => {
      // we have all messages needed
      if (o.patterns.length !== o.position) return

      if (o.deprecated) { // compatability layer for bot.chataddpattern
        const matches = o.matches[0].match(o.patterns[0])
        matches.splice(0, 1)
        bot.emit(`${o.name}`, ...matches, o.messages[0].translate, ...o.messages)
      } else { // regular parsing
        if (o.parse) {
          const matches = o.patterns.map((pattern, i) => _chatRegex[ix].matches[i].match(pattern))
          matches.forEach(o => o.splice(0, 1)) // delete full message match
          bot.emit(`chat:${o.name}`, matches)
        } else {
          bot.emit(`chat:${o.name}`, o.matches)
        }
      }

      // run again
      if (o.repeat) {
        _chatRegex[ix].position = 0
        _chatRegex[ix].matches = []
      } else {
        _chatRegex.splice(ix, 1)
      }
    })
  })

  addDefaultPatterns()

  bot._client.on('chat', (packet) => {
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
    bot.emit('messagestr', msg.toString(), chatPosition, msg)

    // Position 2 is the action bar
    if (packet.position === 2) bot.emit('actionBar', msg)
  })

  function chatWithHeader (header, message) {
    if (typeof message === 'number') message = message.toString()
    if (typeof message !== 'string') {
      throw new Error('Incorrect type! Should be a string or number.')
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

  async function tabComplete (text, assumeCommand = false, sendBlockInSight = true) {
    let position

    if (sendBlockInSight) {
      const block = bot.blockAtCursor()

      if (block) {
        position = block.position
      }
    }

    bot._client.write('tab_complete', {
      text,
      assumeCommand,
      lookedAtBlock: position
    })

    const [packet] = await once(bot._client, 'tab_complete')
    return packet.matches
  }

  bot.whisper = (username, message) => {
    chatWithHeader(`/tell ${username} `, message)
  }
  bot.chat = (message) => {
    chatWithHeader('', message)
  }

  bot.tabComplete = callbackify(tabComplete)

  function addDefaultPatterns () {
    bot.addChatPattern('whisper', /^(.+) whispers? to (.+): (.+)/, { deprecated: true })
    bot.addChatPattern('whisper', /\[(.+) -> (.+)\] (.+)/, { deprecated: true })
    bot.addChatPattern('chat', /<(.+)> (.+)/, { deprecated: true })
  }
}

function callbackify (f) { // specifically for this function because cb isn't the last parameter
  return function (...args) {
    const cb = args[1]
    args.splice(1, 1)
    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
}
