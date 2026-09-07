// A protocol version can describe an enum field as a mapper, which protodef writes by name,
// or as the plain index. Take the index the protocol documents and return whichever form
// this version's schema asks for.
function enumField (registry, packetName, fieldName, index) {
  const field = registry.protocol.play?.toServer?.types?.['packet_' + packetName]?.[1]
    ?.find(entry => entry.name === fieldName)
  if (!Array.isArray(field?.type) || field.type[0] !== 'mapper') return index
  return field.type[1].mappings[index]
}

module.exports = { enumField }
