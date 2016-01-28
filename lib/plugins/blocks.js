var vec3 = require('vec3');
var Vec3 = vec3.Vec3;
var assert = require('assert');
var version=require("../version");
var Block = require("prismarine-block")(version);
var Painting = require('../painting');
var Location = require('../location');
var ChatMessage = require('../chat_message');

module.exports = inject;

var paintingFaceToVec = [
  new Vec3(0, 0, -1),
  new Vec3(-1, 0, 0),
  new Vec3(0, 0, 1),
  new Vec3(1, 0, 0),
];

function inject(bot) {
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
    if(!column) columns[key] = column = new Column();
    var chunkIncluded = new Array(16);
    var y;
    for(y = 0; y < 16; ++y) {
      chunkIncluded[y] = args.bitMap & (1 << y);
    }

    var offset = 0;

    // block types
    var size = 16 * 16 * 16 * 2;
    for(y = 0; y < 16; ++y) {
      var blockId = args.data.slice(offset, offset + size);

      // Column.metadata doesn't exist anymore.
      column.blockType[y] = chunkIncluded[y] ? blockId : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    size = 16 * 16 * 16 / 2;
    // light
    for(y = 0; y < 16; ++y) {
      column.light[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // sky light
    if(args.skyLightSent) {
      for(y = 0; y < 16; ++y) {
        column.skyLight[y] = chunkIncluded[y] ?
          args.data.slice(offset, offset + size) : null;
        offset = chunkIncluded[y] ? offset + size : offset;
      }
    }
    // biome
    if(args.groundUp) {
      size = 256;
      column.biome = args.data.slice(offset, offset + size);
      offset += size;
    }

    assert.strictEqual(offset, args.data.length);
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

  function blockAt(absolutePoint) {
    var loc = new Location(absolutePoint);
    var key = columnKeyXZ(loc.chunkCorner.x, loc.chunkCorner.z);
    var column = columns[key];
    // null column means chunk not loaded
    if(!column) return null;
    var blockType = double_bite(column.blockType);
    var nibbleIndex = loc.blockIndex >> 1;
    var lowNibble = loc.blockIndex % 2 === 1;

    var biomeId = column.biome.readUInt8(loc.biomeBlockIndex);

    var block = new Block(blockType >> 4, biomeId, blockType & 0x0f);
    block.light = nib(column.light);
    block.skyLight = nib(column.skyLight);
    block.position = loc.floored;
    block.signText = signs[loc.floored];
    block.painting = paintingsByPos[loc.floored];

    return block;

    function double_bite(array) {
      var buf = array[loc.chunkYIndex];
      return buf ? buf.readUInt16LE(loc.blockIndex * 2) : 0;
    }

    function nib(array) {
      var buf = array[loc.chunkYIndex];
      return buf ? nibble(buf.readUInt8(nibbleIndex), lowNibble) : 0;
    }
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
    var blockTypeBuffer = column.blockType[loc.chunkYIndex];
    // if it's null, it was all air, but now we're inserting a block.
    if(!blockTypeBuffer) {
      blockTypeBuffer = new Buffer(16 * 16 * 16 * 2);
      blockTypeBuffer.fill(0);
      column.blockType[loc.chunkYIndex] = blockTypeBuffer;
    }
    blockTypeBuffer.writeUInt16LE((type << 4) | metadata, loc.blockIndex * 2);

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

