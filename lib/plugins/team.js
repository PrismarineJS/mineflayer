const Team = require('../team')

module.exports = inject

function inject(bot) {
  const ChatMessage = require('prismarine-chat')(bot.version)
  const teams = {}

  bot._client.on('teams', (packet) => {
    const {team: teamName, mode} = packet
    let team = teams[teamName]
    if (mode === 0) {
      team = new Team(packet, ChatMessage)
      teams[teamName] = team
      bot.emit('teamCreated', teams[teamName])
    }
    if (team !== undefined) {
      if (mode === 1) {
        bot.emit('teamRemoved', teams[teamName])
        delete teams[teamName]
      }
      if (mode === 2) {
        // TODO
        bot.emit('teamUpdated', teams[teamName])
      }
      if (mode === 3) {
        packet.members.forEach((member) => {
          team.add(member)
        })
        bot.emit('teamMemberAdded', teams[teamName])
      }
      if (mode === 4) {
        packet.members.forEach((member) => {
          team.remove(member)
        })
        bot.emit('teamMemberRemoved', teams[teamName])
      }
    }
  })

  bot.teams = teams
}
