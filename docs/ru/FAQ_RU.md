## FAQ

Это документ с часто задаваемыми вопросами, предназначен для помощи людям в самых распространенных вещах.

### Выдаёт ошибку при попытке войти в систему через аккаунт Microsoft.

Убедитесь, что адрес электронной почты, который вы ввели в поле username в createBot, можно использовать для входа на `minecraft.net` используя кнопку «Войти с помощью Microsoft».
Убедитесь, что у вас прописана опция `auth: 'microsoft'` в настройках вашего createBot.

Когда вы получите сообщение об ошибке, в котором говорится что-то о недопустимых учетных данных или «Владеет ли эта учетная запись Minecraft?», попробуйте удалить поле пароля в параметрах `createBot` и повторите попытку.

### Как скрыть ошибки?

Используйте `hideErrors: true` в параметрах createBot. 
Вы также можете добавить эти слушатели:
```js
client.on('error', () => {})
client.on('end', () => {})
```

### Я не получаю событие чата на сервере, как я могу это решить?

Сервера Spigot, в частности некоторые плагины, используют разные форматы чата, вам необходимо проанализировать его с помощью регулярного выражения/парсера.
Посмотрите и измените скрипт [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js), чтобы он работал для вашего плагина на чат, также прочтите http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat

### Как я могу собрать информацию из плагина в чате?

Большинство майнкрафт серверов поддерживают плагины, и многие из этих плагинов выводят что-то в чат, когда что-то происходит. Если это всего лишь одно сообщение, лучше использовать решение, описанное выше, но когда эти сообщения разбиты на множество небольших сообщений, другим вариантом является использование события `"messagestr"`, поскольку оно позволяет легко анализировать многострочные сообщения.

**Пример:**

Сообщение в чате выглядит следующим образом:
```
(!) U9G выйграл в /jackpot и получил
$26,418,402,450! Он купил 2,350,000 (76.32%) билета(ов) из
3,079,185 проданных билета(ов)!
```
```js
const regex = {
  first: /\(!\) (.+) выйграл в \/jackpot и получил +/,
  second: /\$(.+)! Он купил (.+) \((.+)%\) билета\(ов\) из /,
  third: /(.+) проданных билета\(ов\)!/
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
### Как я могу отправлять команды?

Используйте `bot.chat()`.

Пример:

```js
bot.chat('/give @p diamond')
```

### Можно ли войти в несколько учетных записей с помощью bot = mineflayer.createbot, контролируя их все по отдельности?

Создавайте разные экземпляры ботов, вызывая createBot, затем выполняйте разные действия для каждого. [Пример](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple.js).

### Как заставить бота выбросить все вещи их инвентаря?

`bot.inventory.items()` возвращает массив предметов в инвентаре бота. Вы можете использовать рекурсивную функцию, чтобы перебрать их и выбросить каждый элемент используя `bot.toss()`. Нажмите [здесь](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9), чтобы посмотреть пример

### Как проверить отправленные/полученные пакеты?

Включите отладку https://github.com/PrismarineJS/mineflayer#debug

### Я хочу избежать отключения бота от сервера даже в случае задержки сервера, как мне этого добиться?

Один из способов - увеличить параметр [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) (передаваемый в createBot) к более высокому значению (Например `300*1000`, что составляет 5 минут вместо обычных 30 сек.). Если вы всё ещё сталкиваетесь с данной проблемой, вы можете автоматически переподключиться, используя что-то вроде этого примера https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### Как получить описание/текст предмета?

Вы можете использовать свойство `item.nbt`. Также рекомендуем использовать библиотеку `prismarine-nbt`. Метод `nbt.simplify()` может быть полезен.

**Пример:**
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

### Как я могу отправить сообщение из консоли на сервер?

Вы можете использовать библиотеку, такую как `repl`, чтобы прочитать ввод консоли и использовать `bot.chat()` для его отправки. Вы можете найти пример [здесь](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js).

### Как я могу использовать другой плагин в качестве зависимости при создании своего плагина?

В функции `inject()` вашего плагина вы можете безопасно вызвать `bot.loadPlugin(anotherPlugin)`, чтобы убедиться, что плагин загружен. Если плагин уже был загружен ранее, ничего не произойдет.

Обратите внимание, что порядок в котором загружаются плагины является динамическим, поэтому вы никогда не должны вызывать другой плагин в своей функции `inject()`.

### Как я могу использовать прокси socks5?

В объекте с настройками для `mineflayer.createBot(options)` удалите опцию `host`, объявите переменные `PROXY_IP, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, MC_SERVER_ADDRESS, MC_SERVER_PORT`, затем добавьте это в свой объект с настройками:
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
        host: MC_SERVER_ADDRESS,
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
  `socks` объявляется с помощью `const socks = require('socks').SocksClient` и использует [эту](https://www.npmjs.com/package/socks) библиотеку.
  Некоторые серверы могут отклонить соединение. Если это произойдет, попробуйте добавить `fakeHost: MC_SERVER_ADDRESS` в настройки.
  
# Частые ошибки

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

Эта ошибка означает, что вы ввели неправильную версию сервера, либо mineflayer обнаруживает её неправильно.

### `TypeError: Cannot read property '?' of undefined`

Возможно, вы пытаетесь использовать что-то в объекте бота, чего еще нет, попробуйте вызвать инструкцию после события `spawn`

### `SyntaxError: Unexpected token '?'`

Обновите node.js

### Бот не может ломать/ставить блоки или открывать сундуки

Убедитесь, что защита спавна не мешает боту

