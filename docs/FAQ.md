## FAQ

This Frequently Asked Question document is meant to help people for the most common things.

### How to hide errors ?

Use `hideErrors: true` in createBot options
You may also choose to add these listeners :
```js
client.on('error', () => {})
client.on('end', () => {})
```

### I'm not getting chat event on a custom server, how can I solve it ?

Spigot servers, in particular some plugins, use custom chat formats, you need to parse it with a custom regex / parser.
Read and adapt [chatAddPattern.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chatAddPattern.js) to make it work for your particular
chat plugin. Also read http://mineflayer.prismarine.js.org/#/tutorial?id=custom-chat

### How can I send a command ?

By using `bot.chat()`.

**Example:**
```js
bot.chat('/give @p diamond')
```

### Is it possible to login multiple accounts using bot = mineflayer.createbot while controlling them all separately ?

Create different bot instances by calling createBot then do different things for each, see multiple.js

### How would I make the bot drop it's entire inventory?

bot.inventory.items() returns an array of the bot's items. You can use a recursive function to loop through them and drop every item using bot.toss(). Click [here](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) to see an example

### How do I check packets that are sent/received ?

Enabled debug mode https://github.com/PrismarineJS/mineflayer#debug

### I want to avoid disconnection even in case of server lag, how can I achieve this ?

One way is to increase the [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) option (to set in createBot) to an higher value (for example `300*1000` which is 5min instead of the default 30s). If you still get disconnected, you can auto reconnect using something like this example https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### How to get the lore / text of an item ?

You can use the `item.nbt` property. It is also recommended to use the `prismarine-nbt` library. The `nbt.simplify()` method may be useful.

**Example:**
```js
function getLore (item) {
  let message = ''
  if (item.nbt == null) return message

  const nbt = require('prismarine-nbt')
  const ChatMessage = require('prismarine-chat')(bot.version)

  const data = nbt.simplify(item.nbt)
  const display = data.display
  if (display == null) return message

  const lore = display.Lore
  if (lore == null) return message
  for (const line of lore) {
    message += new ChatMessage(line).toString()
    message += '\n'
  }

  return message
}
```

### How can I send message from the console to the server?

You can use a library like `repl` to read the console input and use `bot.chat()` to send it. You can find an example [here.](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### When creating a plugin, how can I specify another plugin as a dependency?

In the `inject()` function for your plugin, you can safely call `bot.loadPlugin(anotherPlugin)` to make sure that plugin is loaded. If the plugin was already loaded before, nothing happens.

Note that the order in which plugins are loaded is dynamic, so you should never call another plugin in your `inject()` function.
