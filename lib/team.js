function colorToChat(color) {
  // TODO
}

class Team {
  constructor (packet, ChatMessage) {
    this.team = packet.team
    this.update(packet, ChatMessage)
    this.membersMap = {}
  }

  parseMessage (value, ChatMessage) {
    let result;
    try {
      result = new ChatMessage(JSON.parse(value)) // version>1.13-pre7
    } catch {
      result = value
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

  update (packet, ChatMessage) {
    this.name = this.parseMessage(packet.name, ChatMessage)
    this.friendlyFire = packet.friendlyFire
    this.nameTagVisibility = packet.nameTagVisibility
    this.collisionRule = packet.collisionRule
    this.color = packet.formatting // TODO - pain
    this.prefix = this.parseMessage(packet.prefix, ChatMessage)
    this.suffix = this.parseMessage(packet.suffix, ChatMessage)
  }

  // Return a chat component with prefix + color + name + suffix
  displayName (member) {
    // TODO
  }

  get members() {
    return Object.keys(this.membersMap)
  }
}

module.exports = Team
