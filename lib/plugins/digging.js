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
      bot._client.write('arm_animation', {});
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

  function canHarvest(block,heldItemType)
  {
    if (block.harvestTools) {
      var penalty = heldItemType===null || !block.harvestTools[heldItemType];
      if (penalty) return false;
    }
    return true;
  }

  // http://minecraft.gamepedia.com/Breaking#Speed
  function staticDigTime(block,creative,heldItemType,inWater,onGround)
  {
    if (creative) return 0;
    var time = 1000 * block.hardness * 1.5;

    if(!canHarvest(block,heldItemType))
      return time * 10 / 3;

    // If the tool helps, then it increases digging speed by a constant multiplier
    var toolMultiplier = toolMultipliers[block.material];
    if (toolMultiplier && heldItemType) {
      var multiplier = toolMultiplier[heldItemType];
      if (multiplier) time /= multiplier;
    }
    if (!onGround) time *= 5;
    if (inWater) time *= 5;
    return time;
  }

  function digTime(block) {
    return staticDigTime(block,bot.game.gameMode === 'creative',bot.heldItem ? bot.heldItem.type : null,
      bot.blockAt(bot.entity.position).type===9,bot.entity.onGround); // only stationary water counts
  }

  bot.dig = dig;
  bot.stopDigging = noop;
  bot.canDigBlock = canDigBlock;
  bot.staticDigTime = staticDigTime;
  bot.digTime = digTime;
}

function noop(err) {
  if (err) throw err;
}
