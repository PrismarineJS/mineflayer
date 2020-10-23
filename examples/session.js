import { createBot } from 'mineflayer'
import { resolve } from 'path'

if (process.argv.length !== 5) {
  console.log('Usage : node session.js <host> <port> <pathToLauncherProfiles>')
  process.exit(1)
}

const profile = require(resolve(process.argv[4], 'launcher_profiles.json'))
const auth = profile.authenticationDatabase[profile.selectedUser.account]
const profileID = profile.selectedUser.profile

const session = {
  accessToken: auth.accessToken,
  clientToken: profile.clientToken,
  selectedProfile: {
    id: profileID,
    name: auth.profiles[profileID].displayName
  }
}

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  session
})

bot.once('login', () => {
  console.log('logged in')
  bot.quit()
})
