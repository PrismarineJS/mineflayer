const mineflayer = require('mineflayer')
const minecraftHawkEye = require('minecrafthawkeye')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})
bot.loadPlugin(minecraftHawkEye)

bot.on('spawn', function () {
  bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:100}]} 1`)
  bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:quick_charge,lvl:3},{id:unbreaking,lvl:100}]} 1`)
  bot.chat(`/give ${bot.username} minecraft:arrow 300`)
  bot.chat('/time set day')
  bot.chat('/kill @e[type=minecraft:arrow]')

  bot.chat('Ready!')

  // Get target for block position, use whatever you need
  const target = bot.hawkEye.getPlayer()

  if (!target) {
    return false
  }

  // const validWeapons = ['bow', 'crossbow', 'snowball', 'ender_pearl', 'egg', 'splash_potion']
  const weapon = 'crossbow'

  // Auto attack every 1,2 secs with bow
  // With crossbow attack when crossbow is charget (enchant 3 = 0.5s)
  // ['snowball', 'ender_pearl', 'egg', 'splash_potion'] auto attack every 0,1 sec, no recomended use autoAttack for these items, instead use "bot.hawkEye.oneShot(target, weapon)"

  bot.hawkEye.autoAttack(target, weapon)
  // If you force stop attack use:
  // hawkEye.stop();

  // Use one shot time with calc:
  // bot.hawkEye.oneShot(target, weapon);

  // If you want to shot in XYZ position:
  /*
            const blockPosition = {
                    position: {
                        x: 244.5,
                        y: 75.5,
                        z: -220
                    },
                    isValid: true // Fake to is "alive"
                }
            // bot.hawkEye.oneShot(blockPosition, weapon);
            // bot.hawkEye.autoAttack(blockPosition);
  */
})

bot.on('die', () => {
  bot.hawkEye.stop()
})
