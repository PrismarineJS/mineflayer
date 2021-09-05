const assert = require('assert')
const { ProtoDef } = require('protodef')

module.exports = inject

function inject (bot) {
  function setCommandBlock (pos, command, options = {}) {
    assert.strictEqual(bot.player.gamemode, 1, new Error('The bot has to be in creative mode to open the command block window'))
    assert.notStrictEqual(pos, null)
    assert.notStrictEqual(command, null)
    assert.strictEqual(bot.blockAt(pos).name, 'command_block', new Error("The block isn't a command block"))

    // Default values when a command block is placed in vanilla minecraft
    options.trackOutput = options.trackOutput ?? false
    options.conditional = options.conditional ?? false
    options.alwaysActive = options.alwaysActive ?? false
    options.mode = options.mode ?? 2 // Possible values: 0: SEQUENCE, 1: AUTO and 2: REDSTONE

    let flags = 0
    flags |= +options.trackOutput << 0 // 0x01
    flags |= +options.conditional << 1 // 0x02
    flags |= +options.alwaysActive << 2 // 0x04

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
        trackOutput: options.trackOutput
      })
      bot._client.write('custom_payload', {
        channel: pluginChannelName,
        data: buffer
      })
    } else {
      bot._client.write('update_command_block', {
        location: pos,
        command,
        mode: options.mode,
        flags
      })
    }
  }

  bot.setCommandBlock = setCommandBlock
}
