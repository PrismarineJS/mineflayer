const mineflayer = require(`mineflayer`);
const projectile = require(`mineflayer-projectile`);
const bot = mineflayer.createBot(); // etc. (https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#mineflayercreatebotoptions)

bot.once(`login`, login);

// within 10 seconds of logging in, find a new target to shoot
function login() {
  bot.loadPlugin(projectile);
  setTimeout(scan, 10 * 1000);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// scan the area for enemies and shoot the closest player in sight
async function scan() {
  let target = bot.nearestEntity(entity => entity.name.toLowerCase() === `player`);
  if (target) {
    bot.chat("Sniping's a good job mate.");
    await shoot(target);
  }
  return !!target;
}

// charge and aim the trident
async function shoot(target) {
  bot.activateItem();
  
  // allow enough time to charge the trident (10 ticks)
  await delay(950);
  let angle = bot.projectile.getAngle(bot.projectile.types.trident, bot.entity.position, target.position);
  bot.look(angle.horizontal.x, angle.horizontal.y);
  
  // server needs some time to process head rotation (latency)
  await delay(50);
  bot.deactivateItem();
}
