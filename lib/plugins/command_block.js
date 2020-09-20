const ProtoDef = require('protodef').ProtoDef

module.exports = inject

function inject (bot) {
  function setCommandBlock (pos, command, trackOutput) {
    const pluginChannelName = bot.supportFeature('usesAdvCdm') ? 'MC|AdvCdm' : 'MC|AdvCmd'

    const proto = new ProtoDef()

    proto.addType('string', [
      'pstring',
      {
        countType: 'varint'
      }])

    proto.addType(pluginChannelName, [
      'container',
      [
        {
          name: 'mode',
          type: 'i8'
        },
        {
          name: 'x',
          type: [
            'switch',
            {
              compareTo: 'mode',
              fields: {
                0: 'i32'
              },
              default: 'void'
            }
          ]
        },
        {
          name: 'y',
          type: [
            'switch',
            {
              compareTo: 'mode',
              fields: {
                0: 'i32'
              },
              default: 'void'
            }
          ]
        },
        {
          name: 'z',
          type: [
            'switch',
            {
              compareTo: 'mode',
              fields: {
                0: 'i32'
              },
              default: 'void'
            }
          ]
        },
        {
          name: 'eid',
          type: [
            'switch',
            {
              compareTo: 'mode',
              fields: {
                1: 'i32'
              },
              default: 'void'
            }
          ]
        },
        {
          name: 'command',
          type: 'string'
        },
        {
          name: 'trackOutput',
          type: 'bool'
        }
      ]
    ])

    const buffer = proto.createPacketBuffer(pluginChannelName, {
      mode: 0,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      command,
      trackOutput
    })
    bot._client.write('custom_payload', {
      channel: pluginChannelName,
      data: buffer
    })
  }

  bot.setCommandBlock = setCommandBlock
}
