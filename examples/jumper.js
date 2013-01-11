var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "jumper",
});
bot.once('spawn', function() {
  // so creepy
  setInterval(watch, 50);
});
var target = null;
function watch() {
  if (! target) return;
  bot.lookAt(target.position.offset(0, target.height, 0));
}
bot.on("mount", function() {
  bot.chat("mounted " + bot.vehicle.objectType);
});
bot.on("dismount", function(vehicle) {
  bot.chat("dismounted " + vehicle.objectType);
});
bot.on('chat', function(username, message) {
  target = bot.players[username].entity;
  var entity;
  if (message === 'jump') {
    bot.setControlState('jump', true);
    bot.setControlState('jump', false);
  } else if (message === 'forward') {
    bot.setControlState('forward', true);
  } else if (message === 'back') {
    bot.setControlState('back', true);
  } else if (message === 'left') {
    bot.setControlState('left', true);
  } else if (message === 'right') {
    bot.setControlState('right', true);
  } else if (message === 'stop') {
    bot.clearControlStates();
  } else if (message === 'mount') {
    entity = nearestEntity("object");
    bot.mount(entity);
  } else if (message === 'dismount') {
    bot.dismount();
  } else if (message === 'attack') {
    entity = nearestEntity();
    bot.attack(entity);
  } else if (message === 'tp') {
    bot.entity.position.y += 10;
  }
});

function nearestEntity(type) {
  var id, entity, dist;
  var best = null;
  var bestDistance = null;
  for (id in bot.entities) {
    entity = bot.entities[id];
    if (type && entity.type !== type) continue;
    if (entity === bot.entity) continue;
    dist = bot.entity.position.distanceTo(entity.position);
    if (! best || dist < bestDistance) {
      best = entity;
      bestDistance = dist;
    }
  }
  return best;
}
