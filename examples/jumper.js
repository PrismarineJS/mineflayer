/*
 * Jumping is fun. Riding pigs is even funnier!
 *
 * Learn how to make your bot interactive with this example.
 *
 * This bot can move, jump, ride vehicles, attack nearby entities and much more.
 */
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node jumper.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "jumper",
  password: process.argv[5],
  verbose: true,
});

var target = null;

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  target = bot.players[username].entity;
  var entity;
  switch(message) {
    case 'forward':
      bot.setControlState('forward', true);
      break;
    case 'back':
      bot.setControlState('back', true);
      break;
    case 'left':
      bot.setControlState('left', true);
      break;
    case 'right':
      bot.setControlState('right', true);
      break;
    case 'sprint':
      bot.setControlState('sprint', true);
      break;
    case 'stop':
      bot.clearControlStates();
      break;
    case 'jump':
      bot.setControlState('jump', true);
      bot.setControlState('jump', false);
      break;
    case 'jump a lot':
      bot.setControlState('jump', true);
      break;
    case 'stop jumping':
      bot.setControlState('jump', false);
      break;
    case 'attack':
      entity = nearestEntity();
      if(entity) {
        bot.attack(entity, true);
      } else {
        bot.chat('no nearby entities');
      }
      break;
    case 'mount':
      entity = nearestEntity("object");
      if(entity) {
        bot.mount(entity);
      } else {
        bot.chat('no nearby objects');
      }
      break;
    case 'dismount':
      bot.dismount();
      break;
    case 'move vehicle forward':
      bot.moveVehicle(0.0, 1.0);
      break;
    case 'move vehicle backward':
      bot.moveVehicle(0.0, -1.0);
      break;
    case 'move vehicle left':
      bot.moveVehicle(1.0, 0.0);
      break;
    case 'move vehicle right':
      bot.moveVehicle(-1.0, 0.0);
      break;
    case 'tp':
      bot.entity.position.y += 10;
      break;
    case 'spawn':
      bot.spawn();
      break;
    case 'pos':
      bot.chat(bot.entity.position.toString());
      break;
    case 'yp':
      bot.chat("Yaw " + bot.entity.yaw + ", pitch: " + bot.entity.pitch);
      break;
  }
})

bot.once('spawn', function() {
  // keep your eyes on the target, so creepy!
  setInterval(watchTarget, 50);

  function watchTarget() {
    if(!target) return;
    bot.lookAt(target.position.offset(0, target.height, 0));
  }
});

bot.on('mount', function() {
  bot.chat("mounted " + bot.vehicle.objectType);
});

bot.on('dismount', function(vehicle) {
  bot.chat("dismounted " + vehicle.objectType);
});

function nearestEntity(type) {
  var id, entity, dist;
  var best = null;
  var bestDistance = null;
  for(id in bot.entities) {
    entity = bot.entities[id];
    if(type && entity.type !== type) continue;
    if(entity === bot.entity) continue;
    dist = bot.entity.position.distanceTo(entity.position);
    if(!best || dist < bestDistance) {
      best = entity;
      bestDistance = dist;
    }
  }
  return best;
}
