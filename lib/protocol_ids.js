/**
 * Some serverbound action ids are described as a protodef `mapper` on newer protocols, where the
 * field takes the name rather than the number: 26.1 does it for `client_command.actionId` and
 * `use_entity.hand`. Writing the number there throws in the serializer and the packet is dropped, so
 * every writer has to ask the schema which shape this version wants.
 */
function mapsIdsToNames (registry, packet, field) {
  const type = registry.protocol?.play?.toServer?.types?.[packet]?.[1]?.find(f => f.name === field)?.type
  return Array.isArray(type) && type[0] === 'mapper'
}

module.exports = { mapsIdsToNames }
