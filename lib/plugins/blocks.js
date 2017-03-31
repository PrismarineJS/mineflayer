var vec3 = require('vec3');
var Vec3 = vec3.Vec3;
var assert = require('assert');
var Painting = require('../painting');
var Location = require('../location');
var ChatMessage = require('../chat_message');

module.exports = inject;

var paintingFaceToVec = [
  new Vec3(0, 0, -1),
  new Vec3(-1, 0, 0),
  new Vec3(0, 0, 1),
  new Vec3(1, 0, 0)
];

function inject(bot,{version}) {
  var Chunk = require('prismarine-chunk')(version);
  var columns = {};
  var signs = {};
  var paintingsByPos = {};
  var paintingsById = {};

  function addPainting(painting) {
    paintingsById[painting.id] = painting;
    paintingsByPos[painting.position] = painting;
  }

  function deletePainting(painting) {
    delete paintingsById[painting.id];
    delete paintingsByPos[painting.position];
  }

  function addColumn(args) {
    var columnCorner = new Vec3(args.x * 16, 0, args.z * 16);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    if(!args.bitMap) {
      // stop storing the chunk column
      delete columns[key];
      bot.emit("chunkColumnUnload", columnCorner);
      return;
    }
    var column = columns[key];
    if(!column) columns[key] = column = new Chunk();

    column.load(args.data, args.bitMap, args.skyLightSent);

    bot.emit("chunkColumnLoad", columnCorner);
  }

  function findBlock(options) {
    var check;
    if(typeof(options.matching) !== 'function') {
      if(!Array.isArray(options.matching)) {
        options.matching = [options.matching];
      }
      check=isMatchingType;
    }
    else check=options.matching;
    options.point = options.point || bot.entity.position;
    options.maxDistance = options.maxDistance || 16;
    var cursor = vec3();
    var point = options.point;
    var max = options.maxDistance;
    var found;
    for(cursor.x = point.x - max; cursor.x < point.x + max; cursor.x++) {
      for(cursor.y = point.y - max; cursor.y < point.y + max; cursor.y++) {
        for(cursor.z = point.z - max; cursor.z < point.z + max; cursor.z++) {
          found = bot.blockAt(cursor);
          if (check(found)) return found;
        }
      }
    }

    function isMatchingType(block) {
      return options.matching.indexOf(block.type) >= 0;
    }
  }

  function posInChunk(pos)
  {
    return pos.floored().modulus(new Vec3(16,256,16));
  }

  function blockAt(absolutePoint) {
    var loc = new Location(absolutePoint);
    var key = columnKeyXZ(loc.chunkCorner.x, loc.chunkCorner.z);

    var column = columns[key];
    // null column means chunk not loaded
    if(!column) return null;

    block=column.getBlock(posInChunk(absolutePoint));
    block.position = loc.floored;
    block.signText = signs[loc.floored];
    block.painting = paintingsByPos[loc.floored];

    return block;
  }

  function blockIsNotEmpty(pos) {
    var block = bot.blockAt(pos);
    return block!==null && block.boundingBox!=="empty";
  }

  // maybe this should be moved to math.js instead?
  function visiblePosition(a,b) {
    var v=b.minus(a);
    var t=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
    v=v.scaled(1/t);
    v=v.scaled(1/5);
    var u=t*5;
    var na;
    for(var i=1;i<u;i++) {
      na=a.plus(v);
      // check that blocks don't inhabit the same position
      if(!na.floored().equals(a.floored())) {
        // check block is not transparent
        if(blockIsNotEmpty(na)) return false;
      }
      a=na;
    }
    return true;
  }

  // if passed in block is within line of sight to the bot, returns true
  // also works on anything with a position value
  function canSeeBlock(block) {
    // this emits a ray from the center of the bots body to the block
    if(visiblePosition(bot.entity.position.offset(0,bot.entity.height*0.5,0),block.position) ) {
      return true;
    }
    return false;
  }

  function chunkColumn(x, z) {
    var key = columnKeyXZ(x, z);
    return columns[key];
  }

  function emitBlockUpdate(oldBlock, newBlock) {
    bot.emit("blockUpdate", oldBlock, newBlock);
    var position = oldBlock ? oldBlock.position :
      (newBlock ? newBlock.position : null);
    if(position) bot.emit("blockUpdate:" + newBlock.position, oldBlock, newBlock);
  }

  function updateBlock(point, type, metadata) {
    var oldBlock = blockAt(point);
    var loc = new Location(point);
    var key = columnKeyXZ(loc.chunkCorner.x, loc.chunkCorner.z);
    var column = columns[key];
    // sometimes minecraft server sends us block updates before it sends
    // us the column that the block is in. ignore this.
    if(!column) return;
    column.setBlockType(posInChunk(point),type);
    column.setBlockData(posInChunk(point),metadata);

    delete signs[loc.floored];

    var painting = paintingsByPos[loc.floored];
    if(painting) deletePainting(painting);

    emitBlockUpdate(oldBlock, blockAt(point));
  }

  bot._client.on('map_chunk', function(packet) {
    addColumn({
      x: packet.x,
      z: packet.z,
      bitMap: packet.bitMap,
      skyLightSent: bot.game.dimension!=="nether",
      groundUp: packet.groundUp,
      data: packet.chunkData,
    });
  });


  bot._client.on('map_chunk_bulk', function(packet) {
    var offset = 0;
    var meta, i, size;
    for(i = 0; i < packet.meta.length; ++i) {
      meta = packet.meta[i];
      size = (8192 + (packet.skyLightSent ? 2048 : 0)) *
        onesInShort(meta.bitMap) + // block ids
        2048 * onesInShort(meta.bitMap) + // (two bytes per block id)
        256; // biomes
      addColumn({
        x: meta.x,
        z: meta.z,
        bitMap: meta.bitMap,
        skyLightSent: packet.skyLightSent,
        groundUp: true,
        data: packet.data.slice(offset, offset + size),
      });
      offset += size;
    }

    assert.strictEqual(offset, packet.data.length);
  });

  bot._client.on('multi_block_change', function(packet) {
    // multi block change
    var i, record, metadata, type, blockX, blockZ, y, pt;
    for(i = 0; i < packet.records.length; ++i) {
      record = packet.records[i];

      metadata = (record.blockId & 0x0f);
      type = (record.blockId) >> 4;
      y = record.y;
      blockZ = (record.horizontalPos & 0x0f);
      blockX = (record.horizontalPos >> 4) & 0x0f;

      pt = new Vec3(packet.chunkX * 16 + blockX, y, packet.chunkZ * 16 + blockZ);
      updateBlock(pt, type, metadata);
    }
  });

  bot._client.on('block_change', function(packet) {
    // block change
    var pt = new Vec3(packet.location.x, packet.location.y, packet.location.z);
    updateBlock(pt, packet.type >> 4, packet.type & 0x0f);
  });

  bot._client.on('explosion', function(packet) {
    // explosion
    packet.affectedBlockOffsets.forEach(function(offset) {
      var pt = vec3(offset).offset(packet.x, packet.y, packet.z);
      updateBlock(pt.floor(), 0, 0);
    });
  });

  bot._client.on('spawn_entity_painting', function(packet) {
    var pos = new Vec3(packet.location.x, packet.location.y, packet.location.z);
    var painting = new Painting(packet.entityId,
      pos, packet.title, paintingFaceToVec[packet.direction]);
    addPainting(painting);
  });

  bot._client.on('entity_destroy', function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var painting = paintingsById[id];
      if(painting) deletePainting(painting);
    });
  });

  bot._client.on('update_sign', function(packet) {
    // update sign
    var pos = new Vec3(packet.location.x, packet.location.y, packet.location.z);
    var oldBlock = blockAt(pos);

    // Some servers send blank lines in signs wrong, causing the chat handler to crash.
    if(packet.text1 == 'null' || packet.text1 == '') {
      packet.text1 = '""'
    }
    if(packet.text2 == 'null' || packet.text2 == '') {
      packet.text2 = '""'
    }
    if(packet.text3 == 'null' || packet.text3 == '') {
      packet.text3 = '""'
    }
    if(packet.text4 == 'null' || packet.text4 == '') {
      packet.text4 = '""'
    }

    signs[pos] = new ChatMessage(JSON.parse(packet.text1)) + "\n" + new ChatMessage(JSON.parse(packet.text2)) +
      "\n" + new ChatMessage(JSON.parse(packet.text3)) + "\n" + new ChatMessage(JSON.parse(packet.text4));
    emitBlockUpdate(oldBlock, blockAt(pos));
  });
  bot.updateSign = function(block, text) {
    var lines = text.split("\n");
    if(lines.length > 4) {
      bot.emit("error", new Error("too many lines for sign text"));
      return;
    }
    for(var i = 0; i < lines.length; ++i) {
      if(lines[i].length > 15) {
        bot.emit("error", new Error("signs have max line length 15"));
        return;
      }
    }
    bot._client.write('update_sign', {
      location: block.position,
      text1: JSON.stringify(lines[0]),
      text2: JSON.stringify(lines[1]),
      text3: JSON.stringify(lines[2]),
      text4: JSON.stringify(lines[3])
    });
  };

  // if we get a respawn packet and the dimension is changed,
  // unload all chunks from memory.
  var dimension;
  bot._client.on('login', function(packet) {
    dimension = packet.dimension
  });
  bot._client.on('respawn', function(packet) {
    if(dimension === packet.dimension) return;
    dimension = packet.dimension;
    columns = {};
  });

  bot.findBlock = findBlock;
  bot.canSeeBlock = canSeeBlock;
  bot.blockAt = blockAt;
  bot._chunkColumn = chunkColumn;
  bot._updateBlock = updateBlock;
}

function columnKeyXZ(x, z) {
  return x + ',' + z;
}

function onesInShort(n) {
  n = n & 0xffff;
  var count = 0;
  for(var i = 0; i < 16; ++i) {
    count = ((1 << i) & n) ? count + 1 : count;
  }
  return count;
}

function nibble(wholeByte, low) {
  return low ?
  wholeByte & 0x0f :
  wholeByte >> 4;
}

function Column() {
  this.blockType = new Array(16);
  this.light = new Array(16);
  this.skyLight = new Array(16);
  this.biome = null;
}
