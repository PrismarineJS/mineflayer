var vec3 = require('vec3')
  , Vec3 = vec3.Vec3
  , assert = require('assert')
  , zlib = require('zlib')
  , blocks = require('../enums/blocks')
  , biomes = require('../enums/biomes')
  , CHUNK_SIZE = new Vec3(16, 16, 16)
  , BLOCKS_PER_CHUNK = CHUNK_SIZE.volume()

module.exports = inject;

// TODO: if we get a respawn packet (and the dimension is changed?), unload all chunks from memory.

function inject(bot) {
  var columns = {};

  function addColumn(args) {
    var columnCorner = new Vec3(args.x * 16, 0, args.z * 16);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    if (! args.bitMap) {
      // stop storing the chunk column
      delete columns[key];
      return;
    }
    var column = columns[key];
    if (! column) columns[key] = column = new Column();
    var chunkIncluded = new Array(16);
    var addIncluded = new Array(16);
    var y;
    for (y = 0; y < 16; ++y) {
      chunkIncluded[y] = args.bitMap & (1 << y);
      addIncluded[y] = args.addBitMap & (1 << y);
    }

    var offset = 0;

    // block types
    var size = 4096;
    for (y = 0; y < 16; ++y) {
      column.blockType[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // block metadata
    size = 2048;
    for (y = 0; y < 16; ++y) {
      column.metadata[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // light
    for (y = 0; y < 16; ++y) {
      column.light[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // sky light
    if (args.skyLightSent) {
      for (y = 0; y < 16; ++y) {
        column.skyLight[y] = chunkIncluded[y] ?
          args.data.slice(offset, offset + size) : null;
        offset = chunkIncluded[y] ? offset + size : offset;
      }
    }
    // add
    for (y = 0; y < 16; ++y) {
      column.add[y] = addIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = addIncluded[y] ? offset + size : offset;
    }
    // biome
    if (args.groundUp) {
      size = 256;
      column.biome = args.data.slice(offset, offset + size);
      offset += size;
    }

    assert.strictEqual(offset, args.data.length);

    bot.emit("chunk", columnCorner);
  }

  function blockAt(absolutePoint) {
    var flooredPoint = vec3(absolutePoint).floor();
    var blockPoint = flooredPoint.modulus(CHUNK_SIZE);
    var columnCorner = flooredPoint.minus(blockPoint);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    var column = columns[key];
    // null column means chunk not loaded
    if (! column) return null;

    var chunkYIndex = Math.floor(absolutePoint.y / 16);

    var blockIndex =
      blockPoint.x +
      CHUNK_SIZE.x * blockPoint.z +
      CHUNK_SIZE.x * CHUNK_SIZE.z * blockPoint.y;
    var blockType = bite(column.blockType);

    var nibbleIndex = blockIndex * 0.5;
    var lowNibble = blockIndex % 2 === 1;

    var biomeBlockIndex = blockPoint.x + CHUNK_SIZE.x * blockPoint.z;
    var biomeId = column.biome.readUInt8(biomeBlockIndex);

    var block = new Block(blockType, biomeId);
    block.meta = nib(column.metadata);
    block.light = nib(column.light);
    block.skyLight = nib(column.skyLight);
    block.add = nib(column.add);

    return block;

    function bite(array) {
      var buf = array[chunkYIndex];
      return buf ? buf.readUInt8(blockIndex) : 0;
    }

    function nib(array) {
      var buf = array[chunkYIndex];
      return buf ? nibble(buf.readUInt8(nibbleIndex), lowNibble) : 0;
    }
  }

  bot.client.on(0x33, function(packet) {
    zlib.inflate(packet.compressedChunkData, function(err, inflated) {
      if (err) return bot.emit('error', err);

      addColumn({
        x: packet.x,
        z: packet.z,
        bitMap: packet.bitMap,
        addBitMap: packet.addBitMap,
        skyLightSent: true,
        groundUp: packet.groundUp,
        data: inflated,
      });
    });
  });


  bot.client.on(0x38, function(packet) {
    zlib.inflate(packet.data.compressedChunkData, function(err, inflated) {
      if(err) return bot.emit('error', err);

      var offset = 0;
      var meta, i, size;
      for (i = 0; i < packet.data.meta.length; ++i) {
        meta = packet.data.meta[i];
        size = (8192 + (packet.data.skyLightSent ? 2048 : 0)) *
          onesInShort(meta.bitMap) +
          2048 * onesInShort(meta.addBitMap) + 256;
        addColumn({
          x: meta.x,
          z: meta.z,
          bitMap: meta.bitMap,
          addBitMap: meta.addBitMap,
          skyLightSent: packet.data.skyLightSent,
          groundUp: true,
          data: inflated.slice(offset, offset + size),
        });
        offset += size;
      }

      assert.strictEqual(offset, inflated.length);
    });
  });

  bot.client.on(0x34, function(packet) {
    // multi block change
  });

  bot.client.on(0x35, function(packet) {
    // block change
  });

  bot.client.on(0x36, function(packet) {
    // block action
  });

  bot.client.on(0x37, function(packet) {
    // block break animation
  });

  bot.client.on(0x3c, function(packet) {
    // explosion
  });

  bot.blockAt = blockAt;
}

function columnKeyXZ(x, z) {
  return x + ',' + z;
}

function onesInShort(n) {
  n = n & 0xffff;
  var count = 0;
  for (var i = 0; i < 16; ++i) {
    count = ((1 << i) & n) ? count + 1 : count;
  }
  return count;
}

function Block(type, biomeId) {
  this.type = type;
  this.meta = 0;
  this.light = 0;
  this.skyLight = 0;
  this.add = 0;
  this.biome = new Biome(biomeId);

  var blockEnum = blocks[type];
  if (blockEnum) {
    this.name = blockEnum.name;
    this.hardness = blockEnum.hardness;
    this.displayName = blockEnum.displayName;
  } else {
    this.name = "";
    this.displayName = "";
    this.hardness = 0;
  }
}

function Biome(id) {
  this.id = id;
  var biomeEnum = biomes[id];
  if (biomeEnum) {
    this.color = biomeEnum.color;
    this.name = biomeEnum.name;
    this.height = biomeEnum.height;
    this.rainfall = biomeEnum.rainfall;
    this.temperature = biomeEnum.temperature;
  } else {
    this.color = 0;
    this.height = null;
    this.name = "";
    this.rainfall = 0;
    this.temperature = 0;
  }
}

function nibble(wholeByte, low) {
  return low ?
    wholeByte & 0x0f :
    wholeByte >> 4;
}

function Column() {
  this.blockType = new Array(16);
  this.metadata = new Array(16);
  this.light = new Array(16);
  this.skyLight = new Array(16);
  this.add = new Array(16);
  this.biome = null;
}

