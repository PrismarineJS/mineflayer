function colorToChat(color) {
  // TODO
}

class Team {
  constructor (packet, ChatMessage) {
    this.team = packet.team
    this.setName(packet.name, ChatMessage)
    this.friendlyFire = packet.friendlyFire
    this.nameTagVisibility = packet.nameTagVisibility
    this.collisionRule = packet.collisionRule
    this.color = packet.formatting // TODO - pain
    this.prefix = packet.prefix
    this.suffix = packet.suffix
    this.membersMap = {}
  }

  setName (name, ChatMessage) {
    try {
      this.name = new ChatMessage(JSON.parse(name)) // version>1.13-pre7
    } catch {
      this.name = name
    }
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

  // Return a chat component with prefix + color + name + suffix
  displayName (member) {
    // TODO
  }
}

module.exports = Team
