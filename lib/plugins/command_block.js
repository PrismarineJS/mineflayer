const assert = require('assert')

const ProtoDef = require('protodef').ProtoDef

module.exports = inject

function inject (bot) {
  function setCommandBlock (pos, command, trackOutput, mode) {
    assert.notStrictEqual(pos, null)
    assert.notStrictEqual(command, null)
    trackOutput = trackOutput || 2
    if (bot.supportFeature('usesAdvCmd') || bot.supportFeature('usesAdvCdm')) {
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
    } else {
      bot._client.write('update_command_block', {
        location: pos,
        command,
        mode,
        flags: trackOutput
      })
    }
  }

  bot.setCommandBlock = setCommandBlock
}
