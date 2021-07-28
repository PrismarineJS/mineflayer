let ChatMessage
let MessageBuilder

module.exports = loader

function loader (mcVersion) {
  ChatMessage = require('prismarine-chat')(mcVersion)
  MessageBuilder = ChatMessage.MessageBuilder
  return Team
}

function colorString (color) {
  const formatting = [
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
  if (color === undefined || color > 21) return 'reset'
  return formatting[color]
}

class Team {
  constructor (packet) {
    this.team = packet.team
    this.update(packet)
    this.membersMap = {}
  }

  parseMessage (value) {
    let result
    try {
      result = new ChatMessage(JSON.parse(value)) // version>1.13-pre7
    } catch {
      result = MessageBuilder.fromString(value, { colorSeparator: '§' })
      if (result === null) {
        return new ChatMessage('')
      }
      return new ChatMessage(result.toJSON())
    }
    return result
  }

  add (name) {
    this.membersMap[name] = ''
    return this.membersMap[name]
  }

  remove (name) {
    const removed = this.membersMap[name]
    delete this.membersMap[name]
    return removed
  }

  update (packet) {
    this.name = this.parseMessage(packet.name)
    this.friendlyFire = packet.friendlyFire
    this.nameTagVisibility = packet.nameTagVisibility
    this.collisionRule = packet.collisionRule
    this.color = colorString(packet.formatting)
    this.prefix = this.parseMessage(packet.prefix)
    this.suffix = this.parseMessage(packet.suffix)
  }

  // Return a chat component with prefix + color + name + suffix
  displayName (member) {
    const name = this.prefix.clone()
    name.append(new ChatMessage({ text: member, color: this.color }), this.suffix)
    return name
  }

  get members () {
    return Object.keys(this.membersMap)
  }
}
