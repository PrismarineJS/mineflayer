// Some enum fields are a string mapper in newer protocols and a plain id in older ones
// (entity_action.actionId from 1.21.6, client_command.actionId from 26.1). protodef only
// writes the form the loaded version declares.
module.exports = function enumValue (bot, packetName, fieldName, name, id) {
  const field = bot.registry.protocol.play.toServer.types[`packet_${packetName}`][1]
    .find(f => f.name === fieldName)
  return Array.isArray(field?.type) && field.type[0] === 'mapper' ? name : id
}
