## FAQ

本文档旨在帮助人们解决常见问题

### 如何隐藏报错 ?

在createBot选项中使用`hideErrors:true`
您也可以选择添加这些监听事件:

```js
client.on('error', () => {})
client.on('end', () => {})
```

### 我无法在自定义服务器上获取聊天事件，如何解决?

Spigot 服务器, 特别是一些插件, 使用的是自定义聊天格式,您需要使用自定义正则表达式/解析器对其进行解析。
阅读并改编[chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js)使其适用于您的特定聊天插件. 或者阅读 http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat

### 如何用自定义插件在聊天中收集信息 ?

大多数定制的Minecraft服务器都有插件支持，很多插件会在聊天中说一些事情. 如果只是一条信息, 最好使用上述解决方案中讨论的解决方案, 但是当这些消息被分成许多小消息时, 另一个选择是使用 `"messagestr"` 事件 因为它允许轻松解析多行消息.

**例子:**

聊天栏中的信息看起来像:
```
(!) U9G has won the /jackpot and received
$26,418,402,450! They purchased 2,350,000 (76.32%) ticket(s) out of the
3,079,185 ticket(s) sold!
```
```js
const regex = {
  first: /\(!\) (.+) has won the \/jackpot and received +/,
  second: /\$(.+)! They purchased (.+) \((.+)%\) ticket\(s\) out of the /,
  third: /(.+) ticket\(s\) sold!/
}

let jackpot = {}
bot.on('messagestr', msg => {
  if (regex.first.test(msg)) {
    const username = msg.match(regex.first)[1]
    jackpot.username = username
  } else if (regex.second.test(msg)) {
    const [, moneyWon, boughtTickets, winPercent] = msg.match(regex.second)
    jackpot.moneyWon = parseInt(moneyWon.replace(/,/g, ''))
    jackpot.boughtTickets = parseInt(boughtTickets.replace(/,/g, ''))
    jackpot.winPercent = parseFloat(winPercent)
  } else if (regex.third.test(msg)) {
    const totalTickets = msg.match(regex.third)[1]
    jackpot.totalTickets = parseInt(totalTickets.replace(/,/g, ''))
    onDone(jackpot)
    jackpot = {}
  }
})
```
### 如何发送命令 ?

使用  `bot.chat()`.

**例子:**

```js
bot.chat('/give @p minecraft:diamond_sword')
```

### 是否可以使用bot = mineflayer.createbot登录多个帐户  同时分别控制它们 ?

通过调用createBot创建不同的bot实例，然后为每个实例执行不同的操作，请参考 multiple.js

### 如何让机器人丢出它的全部背包物品?

bot.inventory.items() 返回机器人的物品数组. 您可以使用递归函数循环遍历它们，并使用 `bot.toss()`.  [点这里](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) 查看例子

### 如何检查发送/接收的数据包 ?

启用调试模式 https://github.com/PrismarineJS/mineflayer#debug

### 我希望即使在服务器有延迟的情况下也能避免断开连接，如何实现这一点 ?

一种方法是增加 [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) 选项的值(在createBot中设置)  (例如 `300*1000` 这是5分钟，而不是默认的30秒). 如果仍然断开连接，可以使用类似于此示例的方法自动重新连接 https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### 如何获取物品的 lore / text?

你可以使用 `item.nbt` 属性. 此外建议使用 `prismarine-nbt` 库.   `nbt.simplify()` 方法可能有用

**例子:**

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

### 如何从控制台发送消息到服务器?

您可以使用类似`repl`的库来读取控制台输入的内容并用`bot.chat()`发送它。 你可以在这查看例子 [点这里](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### 创建插件时，如何将另一个插件指定为依赖项？

在插件的`inject()`函数中，您可以安全地调用`bot.loadPlugin(anotherPlugin)`确保已加载该插件。如果插件之前已经加载，则不会发生任何事情。

请注意，加载插件的顺序是动态的, 因此，永远不要在`inject()`函数中调用其他插件.

### 如何使用socks5代理？

在对象的选项中 `mineflayer.createBot(options)`,从选项对象中删除你的 `host` 选项,声明以下变量 `PROXY_IP, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, MC_SERVER_IP, MC_SERVER_PORT` 并将其添加到选项对象中:
```js
connect: (client) => {
  socks.createConnection({
    proxy: {
      host: PROXY_IP,
      port: PROXY_PORT,
      type: 5,
      userId: PROXY_USERNAME,
      password: PROXY_PASSWORD
    },
    command: 'connect',
    destination: {
      host: MC_SERVER_IP,
      port: MC_SERVER_PORT
    }
  }, (err, info) => {
    if (err) {
      console.log(err)
      return
    }
    client.setSocket(info.socket)
    client.emit('connect')
  })
}
```
  `socks` 用 `const socks = require('socks').SocksClient` 声明 使用的是[这个](https://www.npmjs.com/package/socks) 包.

# 常见错误

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

当你给 mineflayer 设定了错误的服务器版本，或者 mineflayer 检测到错误的服务器版本时会发生这种情况

### `TypeError: Cannot read property '?' of undefined`

您可能正在尝试在 bot 对象上使用尚不存在的内容，请尝试在 `spawn` 事件之后调用该语句

### `SyntaxError: Unexpected token '?'`

更新node版本

### The bot can't break/place blocks or open chests

检查出生点保护是否阻止了机器人的操作

