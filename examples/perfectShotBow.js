const mineflayer = require('mineflayer');
const { hawkEye, getPlayer } = require('minecrafthawkeye');

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'Archer',
    password: process.argv[5]
})

hawkEye.load(bot);

bot.on('spawn', function() {
    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 300');
    bot.chat('/time set day');
    bot.chat('/kill @e[type=minecraft:arrow]');

    bot.chat('Ready!');

    let target = getPlayer(bot);
    if (!target)
        return false;

    // Auto attack every 1,2 secs until target is dead or is to far away
    hawkEye.attack(target);

    // If you force stop attack use:
    // hawkEye.stop();
});
