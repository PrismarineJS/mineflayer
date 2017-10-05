const mojangson = require('mojangson')
const vsprintf = require('sprintf-js').vsprintf

module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  defaultLang = mcData.language
  return ChatMessage
}

var defaultLang

/**
 * ChatMessage Constructor
 * @param {String|Object} message content of ChatMessage
 */
class ChatMessage {
  constructor (message) {
    if (typeof message === 'string') {
      this.json = { text: message }
    } else if (typeof message === 'object' && !Array.isArray(message)) {
      this.json = message
    } else {
      throw new Error('Expected String or Object for Message argument')
    }
    this.parse()
  }

  /**
   * Parses the this.json property to decorate the properties of the ChatMessage.
   * Called by the Constructor
   * @return {void}
   */
  parse () {
    const json = this.json
    // Message scope for callback functions
    // There is EITHER, a text property or a translate property
    // If there is no translate property, there is no with property
    // HOWEVER! If there is a translate property, there may not be a with property
    if (typeof json.text === 'string') {
      this.text = json.text
    } else if (typeof json.translate === 'string') {
      this.translate = json.translate
      if (typeof json.with === 'object') {
        if (!Array.isArray(json.with)) {
          throw new Error('Expected with property to be an Array in ChatMessage')
        }
        this.with = json.with.map(entry => new ChatMessage(entry))
      }
    }
    // Parse extra property
    // Extras are appended to the initial text
    if (typeof json.extra === 'object') {
      if (!Array.isArray(json.extra)) {
        throw new Error('Expected extra property to be an Array in ChatMessage')
      }
      this.extra = json.extra.map(entry => new ChatMessage(entry))
    }
    // Text modifiers
    this.bold = json.bold
    this.italic = json.italic
    this.underlined = json.underlined
    this.strikethrough = json.strikethrough
    this.obfuscated = json.obfuscated

    // Supported constants @ 2014-04-21
    const supportedColors = [
      'black',
      'dark_blue',
      'dark_green',
      'dark_aqua',
      'dark_red',
      'dark_purple',
      'gold',
      'gray',
      'dark_gray',
      'blue',
      'green',
      'aqua',
      'red',
      'light_purple',
      'yellow',
      'white',
      'obfuscated',
      'bold',
      'strikethrough',
      'underlined',
      'italic',
      'reset'
    ]
    const supportedClick = [
      'open_url',
      'open_file',
      'run_command',
      'suggest_command'
    ]
    const supportedHover = [
      'show_text',
      'show_achievement',
      'show_item',
      'show_entity'
    ]

    // Parse color
    this.color = json.color
    switch (this.color) {
      case 'obfuscated':
        this.obfuscated = true
        this.color = null
        break
      case 'bold':
        this.bold = true
        this.color = null
        break
      case 'strikethrough':
        this.strikethrough = true
        this.color = null
        break
      case 'underlined':
        this.underlined = true
        this.color = null
        break
      case 'italic':
        this.italic = true
        this.color = null
        break
      case 'reset':
        this.reset = true
        this.color = null
        break
    }
    if (Array.prototype.indexOf && this.color &&
      supportedColors.indexOf(this.color) === -1) {
      console.warn('ChatMessage parsed with unsupported color', this.color)
    }

    // Parse click event
    if (typeof json.clickEvent === 'object') {
      this.clickEvent = json.clickEvent
      if (typeof this.clickEvent.action !== 'string') {
        throw new Error('ClickEvent action missing in ChatMessage')
      } else if (Array.prototype.indexOf && supportedClick.indexOf(this.clickEvent.action) === -1) {
        console.warn('ChatMessage parsed with unsupported clickEvent', this.clickEvent.action)
      }
    }

    // Parse hover event
    if (typeof json.hoverEvent === 'object') {
      this.hoverEvent = json.hoverEvent
      if (typeof this.hoverEvent.action !== 'string') {
        throw new Error('HoverEvent action missing in ChatMessage')
      } else if (Array.prototype.indexOf && supportedHover.indexOf(this.hoverEvent.action) === -1) {
        console.warn('ChatMessage parsed with unsupported hoverEvent', this.hoverEvent.action)
      }
      // Special case
      if (this.hoverEvent.action === 'show_item') {
        let content
        if (this.hoverEvent.value instanceof Array) {
          if (this.hoverEvent.value[0] instanceof Object) {
            content = this.hoverEvent.value[0].text
          } else {
            content = this.hoverEvent.value[0]
          }
        } else {
          if (this.hoverEvent.value instanceof Object) {
            content = this.hoverEvent.value.text
          } else {
            content = this.hoverEvent.value
          }
        }
        this.hoverEvent.value = mojangson.parse(content)
      }
    }
  }

  /**
   * Returns the count of text extras and child ChatMessages
   * Does not count recursively in to the children
   * @return {Number}
   */
  length () {
    let count = 0
    if (this.text) count++
    else if (this.with) count += this.with.length

    if (this.extra) count += this.extra.length
    return count
  }

  /**
   * Returns a text part from the message
   * @param  {Number} idx Index of the part
   * @return {String}
   */
  getText (idx, lang = defaultLang) {
    // If the index is not defined is is invalid, return toString
    if (typeof idx !== 'number') return this.toString(lang)
    // If we are not a translating message, return the text
    if (this.text && idx === 0) return this.text.replace(/§[0-9a-flnmokr]/g, '')
    // Else return the with child if it's in range
    else if (this.with.length > idx) return this.with[idx].toString(lang)
    // Else return the extra if it's in range
    if (this.extra && this.extra.length + (this.text ? 1 : this.with.length) > idx) {
      return this.extra[idx - (this.text ? 1 : this.with.length)].toString(lang)
    }
    // Not sure how you want to default this
    // Undefined, an error ?
    return ''
  }

  /**
   * Flattens the message in to plain-text
   * @return {String}
   */
  toString (lang = defaultLang) {
    let message = ''
    if (typeof this.text === 'string') message += this.text
    else if (this.with) {
      const args = this.with.map(entry => entry.toString(lang))
      const format = lang[this.translate]
      if (!format) message += args.join('')
      else message += vsprintf(format, args)
    }
    if (this.extra) {
      message += this.extra.map((entry) => entry.toString(lang)).join('')
    }
    return message.replace(/§[0-9a-flnmokr]/g, '')
  }

  toMotd (lang = defaultLang) {
    const codes = {
      color: {
        black: '§0',
        dark_blue: '§1',
        dark_green: '§2',
        dark_aqua: '§3',
        dark_red: '§4',
        dark_purple: '§5',
        gold: '§6',
        gray: '§7',
        dark_gray: '§8',
        blue: '§9',
        green: '§a',
        aqua: '§b',
        red: '§c',
        light_purple: '§d',
        yellow: '§e',
        white: '§f'
      },
      bold: '§l',
      italic: '§o',
      underlined: '§n',
      strikethrough: '§m',
      obfuscated: '§k'
    }

    let message = Object.keys(codes).map((code) => {
      if (!this[code] || this[code] === 'false') return null
      if (code === 'color') return codes.color[this.color]
      return codes[code]
    }).join('')

    if (typeof this.text === 'string') message += `${this.text}§r`
    else if (this.with) {
      const args = this.with.map(entry => entry.toMotd(lang))
      const format = lang[this.translate]
      if (!format) message += args.join('')
      else message += vsprintf(format, args)
    }
    if (this.extra) {
      message += this.extra.map((entry) => entry.toMotd(lang)).join('')
    }
    return message
  }

  toAnsi (lang) {
    const codes = {
      '§0': '\u001b[30m',
      '§1': '\u001b[34m',
      '§2': '\u001b[32m',
      '§3': '\u001b[36m',
      '§4': '\u001b[31m',
      '§5': '\u001b[35m',
      '§6': '\u001b[33m',
      '§7': '\u001b[37m',
      '§8': '\u001b[90m',
      '§9': '\u001b[94m',
      '§a': '\u001b[92m',
      '§b': '\u001b[96m',
      '§c': '\u001b[91m',
      '§d': '\u001b[95m',
      '§e': '\u001b[93m',
      '§f': '\u001b[97m',
      '§l': '\u001b[1m',
      '§o': '\u001b[3m',
      '§n': '\u001b[4m',
      '§m': '\u001b[9m',
      '§k': '\u001b[6m',
      '§r': '\u001b[0m'
    }

    let message = this.toMotd(lang)
    for (let k in codes) {
      message = message.replace(new RegExp(k, 'g'), codes[k])
    }
    return message
  }
}
