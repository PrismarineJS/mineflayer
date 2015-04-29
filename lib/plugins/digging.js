var assert = require('assert');
var toolMultipliers = require('minecraft-data').materials;

module.exports = inject;

function inject(bot) {
  var swingInterval = null;
  var waitTimeout = null;

  bot.targetDigBlock = null;
  bot.lastDigTime = null;

  function dig(block, cb) {
    if (bot.targetDigBlock) bot.stopDigging();
    cb = cb || noop;
    bot.lookAt(block.position);
    bot._client.write('block_dig', {
      status: 0, // start digging
      location: block.position,
      face: 1, // hard coded to always dig from the top
    });
    var waitTime = bot.digTime(block);
    waitTimeout = setTimeout(finishDigging, waitTime);
    bot.targetDigBlock = block;
    swingInterval = setInterval(function() {
      bot._client.write('arm_animation', {
        entityId: bot.entity.id,
        animation: 1,
      });
    }, 350);
    var eventName = "blockUpdate:" + block.position;
    bot.on(eventName, onBlockUpdate);

    bot.stopDigging = function() {
      bot.removeListener(eventName, onBlockUpdate);
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot._client.write('block_dig', {
        status: 1, // cancel digging
        location: bot.targetDigBlock.position,
        face: 1, // hard coded to always dig from the top
      });
      var block = bot.targetDigBlock;
      bot.targetDigBlock = null;
      bot.lastDigTime = new Date();
      bot.emit("diggingAborted", block);
      bot.stopDigging = noop;
    };

    function onBlockUpdate(oldBlock, newBlock) {
      bot.removeListener(eventName, onBlockUpdate);
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot.targetDigBlock = null;
      bot.lastDigTime = new Date();
      if (newBlock.type === 0) {
        bot.emit("diggingCompleted", newBlock);
        cb();
      } else {
        bot.emit("diggingAborted", newBlock);
        var err = new Error("digging interruption");
        err.code = "EDIGINTERRUPT";
        cb(err);
      }
    }

    function finishDigging() {
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot._client.write('block_dig', {
        status: 2, // finish digging
        location: bot.targetDigBlock.position,
        face: 1, // hard coded to always dig from the top
      });
      bot.targetDigBlock = null;
      bot.lastDigTime = new Date();
      bot._updateBlock(block.position, 0, 0);
    }
  }

  function canDigBlock(block) {
    return block && block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6;
  }

  function digTime(block) {
    if (bot.game.gameMode === 'creative') return 0;
    var time = 1000 * block.hardness * 1.5;
    if (block.harvestTools) {
      var penalty = !bot.heldItem || !block.harvestTools[bot.heldItem.type];
      if (penalty) return time * 10 / 3;
    }
    var toolMultiplier = toolMultipliers[block.material];
    if (toolMultiplier && bot.heldItem) {
      var multiplier = toolMultiplier[bot.heldItem.type];
      if (multiplier) time /= multiplier;
    }
    if (! bot.entity.onGround) time *= 5;
    var blockIn = bot.blockAt(bot.entity.position);
    var inWater = blockIn.type === 9; // only stationary water counts
    if (inWater) time *= 5;
    return time;
  }

  bot.dig = dig;
  bot.stopDigging = noop;
  bot.canDigBlock = canDigBlock;
  bot.digTime = digTime;
}

function noop(err) {
  if (err) throw err;
}
