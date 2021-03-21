const { once } = require('events')

module.exports = inject

function inject (bot, options) {
  const CHAT_LENGTH_LIMIT = options.chatLengthLimit ?? (bot.supportFeature('lessCharsInChat') ? 100 : 256)

  const ChatMessage = require('prismarine-chat')(bot.version)
  // chat.pattern.type will emit an event for bot.on() of the same type, eg chatType = whisper will trigger bot.on('whisper')
  const _chatRegex = []
  // deprecated
  bot.chatAddPattern = (patternValue, typeValue) => {
    bot.addPattern(typeValue, patternValue, { deprecated: true })
  }

  bot.addPatternSet = (name, patterns, { repeat, parse }) => {
    _chatRegex.push({
      name,
      patterns,
      position: 0,
      matches: [],
      messages: [],
      repeat: repeat ?? true,
      parse: parse ?? false
    })
  }

  bot.addPattern = (name, pattern, { repeat, parse, deprecated }) => {
    _chatRegex.push({
      name,
      patterns: [pattern],
      position: 0,
      matches: [],
      messages: [],
      deprecated: deprecated ?? false,
      repeat: repeat ?? true,
      parse: parse ?? false
    })
  }

  const getChatMap = () => _chatRegex.map(({ patterns, position: ix }) => patterns[ix])

  bot.on('messagestr', (msg, _, originalMsg) => {
    const patterns = getChatMap()
    if (!patterns.some(pattern => pattern.test(msg))) return

    const ix = patterns.findIndex(pattern => pattern.test(msg))
    _chatRegex[ix].matches.push(msg)
    _chatRegex[ix].messages.push(originalMsg)
    _chatRegex[ix].position++

    // we have all messages needed
    if (_chatRegex[ix].patterns.length === _chatRegex[ix].position) {
      if (!_chatRegex[ix].deprecated) {
        if (_chatRegex[ix].parse) {
          const matches = _chatRegex[ix].patterns.map((pattern, i) => _chatRegex[ix].matches[i].match(pattern))
          matches.forEach(o => o.splice(0, 1)) // delete full message match
          bot.emit(`chat:${_chatRegex[ix].name}`, matches)
        } else {
          bot.emit(`chat:${_chatRegex[ix].name}`, _chatRegex[ix].matches)
        }
      } else {
        const [matches] = _chatRegex[ix].patterns.map((pattern, i) => _chatRegex[ix].matches[i].match(pattern))
        matches.splice(0, 1)
        bot.emit(`${_chatRegex[ix].name}`, ...matches, undefined, ..._chatRegex[ix].messages)
      }

      // run again
      if (_chatRegex[ix].repeat) {
        _chatRegex[ix].position = 0
        _chatRegex[ix].matches = []
      } else {
        _chatRegex.splice(ix, 1)
      }
    }
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
    bot.addPattern('whisper', /^(.+) whispers? to (.+): (.+)/, { deprecated: true })
    bot.addPattern('whisper', /\[(.+) -> (.+)\] (.+)/, { deprecated: true })
    bot.addPattern('chat', /<(.+)> (.+)/, { deprecated: true })
  }
}

function callbackify (f) { // specifically for this function because cb isn't the last parameter
  return function (...args) {
    const cb = args[1]
    args.splice(1, 1)
    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
}
