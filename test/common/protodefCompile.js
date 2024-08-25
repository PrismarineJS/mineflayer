/**
 * Pre-compiles JS code from the schema for easier development.
 * You can run this with `npm run build`
 * https://github.com/PrismarineJS/bedrock-protocol/blob/master/tools/compileProtocol.js
 */

const Serializer = require('protodef').Serializer
const Parser = require('protodef').FullPacketParser
const { ProtoDefCompiler, CompiledProtodef } = require('protodef').Compiler

Object.assign(
  require('minecraft-protocol/src/transforms/serializer'),
  {
    createSerializer ({ state, isServer = false, version, customPackets, compiled = true } = {}) {
      const proto = getProtocol(version, state, 'toServer')
      return new Serializer(proto, 'packet')
    },
    createDeserializer ({ state, isServer = false, version, customPackets, compiled = true, noErrorLogging = false } = {}) {
      const proto = getProtocol(version, state, 'toClient')
      return new Parser(proto, 'packet')
    }
  }
)

const fs = require('fs')
const { all, convert } = require('minecraft-data/minecraft-data/tools/js/compileProtocol')
const mcData = require('minecraft-data')
const { join } = require('path')
const nbt = require('prismarine-nbt')

// Filter versions we support
const versions = mcData.versions.pc.filter(e => e.releaseType === 'release').map(e => e.minecraftVersion)
console.log(versions)

// Compile the ProtoDef JSON into JS
function createProtocol (data, state, direction, version, customPackets) {
  const compiler = new ProtoDefCompiler()
  const protocol = data.protocol[state][direction].types

  compiler.addTypesToCompile(data.protocol.types)
  compiler.addTypes(require('minecraft-protocol/src/datatypes/compiler-minecraft'))
  compiler.addTypesToCompile(protocol)
  nbt.addTypesToCompiler('big', compiler)

  fs.writeFileSync(`./read_${state}_${direction}.js`, 'module.exports = ' + compiler.readCompiler.generate().replace('() =>', 'native =>'))
  fs.writeFileSync(`./write_${state}_${direction}.js`, 'module.exports = ' + compiler.writeCompiler.generate().replace('() =>', 'native =>'))
  fs.writeFileSync(`./size_${state}_${direction}.js`, 'module.exports = ' + compiler.sizeOfCompiler.generate().replace('() =>', 'native =>'))

  const compiledProto = compiler.compileProtoDefSync()
  return compiledProto
}

function getProtocol (version, state, direction) {
  const compiler = new ProtoDefCompiler()
  compiler.addTypes(require('minecraft-protocol/src/datatypes/compiler-minecraft'))
  nbt.addTypesToCompiler('big', compiler)

  global.PartialReadError = require('protodef/src/utils').PartialReadError
  const compile = (compiler, file) => require(file)(compiler.native)

  return new CompiledProtodef(
    compile(compiler.sizeOfCompiler, join(__dirname, `../../data/${version}/size_${state}_${direction}.js`)),
    compile(compiler.writeCompiler, join(__dirname, `../../data/${version}/write_${state}_${direction}.js`)),
    compile(compiler.readCompiler, join(__dirname, `../../data/${version}/read_${state}_${direction}.js`))
  )
}

function main (ver = 'latest') {
  // Put the .js files into the data/ dir, we also use the data dir when dumping packets for tests
  const dir = join(__dirname, '/../../data/', ver)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  process.chdir(dir)
  console.log('Generating JS...', ver)
  const data = mcData(ver)
  for (const state of ['play', 'login', 'status', 'handshaking', 'configuration']) {
    for (const direction in data.protocol[state]) {
      createProtocol(data, state, direction, ver)
    }
  }
}

require('minecraft-data/bin/generate_data')

// If no argument, build everything
if (!module.parent) {
  if (!process.argv[2]) {
    all(convert)
    for (const version of versions) {
      main(version)
    }
  } else { // build the specified version
    all(convert)
    main(process.argv[2])
  }
}
