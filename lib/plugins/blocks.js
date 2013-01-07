var Vec3 = require('vec3').Vec3
  , assert = require('assert').Vec3
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
    var key = columnKeyXZ(args.x * 16, args.z * 16);
    var column = columns[key];
    if (! column) columns[key] = column = new Array(16);

    if (! args.chunks) {
      // stop storing the chunk column
      delete columns[key];
      return;
    }
    for (var y = 0; y < args.chunks.length; ++y) {
      var chunk = args.chunks[y];
      if (chunk) {
        // replace the chunk info with new data
        column[y] = {
          skyLightSent: args.skyLightSent,
          buffer: chunk,
          addBitMap: args.addBitMap,
        };
      } else {
        // stop storing information for the chunk
        column[y] = null;
      }
    }
    column.biome = args.biome;
  }

  function blockAt(absolutePoint) {
    var flooredPoint = absolutePoint.floored();
    var blockPoint = flooredPoint.modulus(CHUNK_SIZE);
    var columnPoint = flooredPoint.minus(blockPoint);
    var key = columnKeyXZ(columnPoint.x, columnPoint.z);
    var column = columns[key];
    // null column means chunk not loaded
    if (! column) return null;
    var chunkIndex = Math.floor(flooredPoint.y / 16)
    var chunk = column[chunkIndex];
    // null chunk means air
    if (! chunk) return new Block(0, 0);
    var offset, wholeByte;

    var blockIndex =
      blockPoint.x +
      CHUNK_SIZE.x * blockPoint.z +
      CHUNK_SIZE.x * CHUNK_SIZE.z * blockPoint.y;
    var blockType = chunk.buffer.readUInt8(blockIndex);

    var biomeBlockIndex = blockPoint.x + CHUNK_SIZE.x * blockPoint.z;
    var biomeId = column.biome.readUInt8(biomeBlockIndex);

    var block = new Block(blockType, biomeId);

    offset = BLOCKS_PER_CHUNK + blockIndex * 0.5;
    wholeByte = chunk.buffer.readUInt8(offset);
    block.meta = (blockIndex % 2 === 0 ? 0xf0 : 0x0f) & wholeByte;

    offset = BLOCKS_PER_CHUNK * 1.5 + blockIndex * 0.5;
    wholeByte = chunk.buffer.readUInt8(offset);
    block.light = (blockIndex % 2 === 0 ? 0xf0 : 0x0f) & wholeByte;

    var addArrayBegin;
    if (chunk.skyLightSent) {
      offset = BLOCKS_PER_CHUNK * 2 + blockIndex * 0.5;
      wholeByte = chunk.buffer.readUInt8(offset);
      block.skyLight = (blockIndex % 2 === 0 ? 0xf0 : 0x0f) & wholeByte;
      addArrayBegin = BLOCKS_PER_CHUNK * 2.5;
    } else {
      block.skyLight = 0;
      addArrayBegin = BLOCKS_PER_CHUNK * 2;
    }
    
    if (chunk.addBitMap & (1 << blockPoint.y)) {
      offset = addArrayBegin + blockIndex * 0.5;
      wholeByte = chunk.buffer.readUInt8(offset);
      block.add = (blockIndex % 2 === 0 ? 0xf0 : 0x0f) & wholeByte;
    }

    return block;
  }

  bot.client.on(0x33, function(packet) {
    zlib.inflate(packet.compressedChunkData, function(err, inflated) {
      if (err) return bot.emit('error', err);

      var args = {
        x: packet.x,
        z: packet.z,
        addBitMap: packet.addBitMap,
        skyLightSent: true,
        chunks: null,
      };
      var offset, y, size, add;
      if (packet.bitMap) {
        args.chunks = new Array(16);
        offset = 0;
        for (y = 0; y < 16; ++y) {
          if (packet.bitMap & (1 << y)) {
            add = args.addBitMap & (1 << y);
            size = chunkDataSize(args.skyLightSent, add);
            args.chunks[y] = inflated.slice(offset, offset + size);
            offset += size;
          }
        }
      }
      if (packet.groundUp) {
        size = 256;
        args.biome = inflated.slice(offset, offset + size);
        offset += size;
      }
      addColumn(args);
    });
  });


  bot.client.on(0x38, function(packet) {
    zlib.inflate(packet.data.compressedChunkData, function(err, inflated) {
      if(err) return bot.emit('error', err);

      var i, y, meta, size, args, add;
      var offset = 0;
      for (i = 0; i < packet.data.meta.length; ++i) {
        meta = packet.data.meta[i];
        args = {
          x: meta.x,
          z: meta.z,
          addBitMap: meta.addBitMap,
          skyLightSent: packet.data.skyLightSent,
          chunks: null,
        };
        if (meta.bitMap) {
          args.chunks = new Array(16);
          for(y = 0; y < 16; ++y) {
            if (meta.bitMap & (1 << y)) {
              add = args.addBitMap & (1 << y);
              size = chunkDataSize(args.skyLightSent, add);
              args.chunks[y] = inflated.slice(offset, offset + size);
              offset += size;
            }
          }
        }
        // biome array
        size = 256;
        args.biome = inflated.slice(offset, offset + size);
        offset += size;

        addColumn(args);
      }
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

function chunkDataSize(skyLightSent, add) {
  // 16 * 16 * 16 blocks times each of these arrays:
  // 1   byte per block - block type array
  // 0.5 byte per block - block metadata array
  // 0.5 byte per block - block light array
  var size = 8192;
  // 0.5 byte per block - add array
  size = add ? size + 2048 : size;
  // 0.5 byte per block - sky light array
  size = skyLightSent ? size + 2048 : size;
  return size;
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


