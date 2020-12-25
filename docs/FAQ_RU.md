## FAQ

Это документ с часто задаваемыми вопросами, предназначен для помощи людям в самых распространенных вещах.

### Как скрыть ошибки?

Используйте `hideErrors: true` в параметрах createBot. Вы также можете добавить этих слушателей:
```js
client.on('error', () => {})
client.on('end', () => {})
```

### Я не получаю событие чата на сервере, как я могу его решить?

Серверы Spigot, в частности некоторые плагины, используют настраиваемые форматы чата, вам необходимо проанализировать его с помощью настраиваемого регулярного выражения/парсера.
Прочтите и измените [chatAddPattern.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chatAddPattern.js), чтобы это работало для вашего плагина чата.
также прочтите http://mineflayer.prismarine.js.org/#/tutorial?id=custom-chat

### Как я могу отправлять команды серверу?

Используя bot.chat

Пример:

`bot.chat('/give @p diamond')`

### Можно ли войти в несколько учетных записей с помощью bot = mineflayer.createbot, контролируя их все по отдельности?

Создавайте разные экземпляры ботов, вызывая createBot, затем выполняйте разные действия для каждого, смотрите Multiple.js

### Как заставить бота сбросить весь инвентарь?

bot.inventory.items() возвращает массив элементов бота. Вы можете использовать рекурсивную функцию, чтобы перебрать их и выбросить каждый элемент, используя bot.toss(). Нажмите [здесь](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9), чтобы посмотреть пример

### Как проверить отправленные/полученные пакеты?

Включите отладку https://github.com/PrismarineJS/mineflayer#debug

### Я хочу избежать отключения даже в случае задержки сервера, как мне этого добиться?

Один из способов - увеличить [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) параметр (установить в createBot) к более высокому значению (Например `300*1000` что составляет 5 минут вместо значения по умолчанию в 30сек). Если вы все еще отключаетесь, вы можете автоматически переподключиться, используя что-то вроде этого примера https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### Как получить описание/текст предмета?

Вы можете использовать свойство .nbt элемента. prismarine-nbt nbt.simplify() может быть полезен.

Пример:

```js
function getLore(item) {
  let message = ''
  if (item.nbt == null) return message

  const nbt = require('prismarine-nbt')
  const ChatMessage = require('prismarine-chat')(bot.version)

  const data = nbt.simplify(item.nbt)
  const display = data['display']
  if (display == null) return message

  const lore = display['Lore']
  if (lore == null) return message

  for (const line of lore) {
    for (const group of JSON.parse(line)) {
      message += new ChatMessage(group).toString()
      message += '\n'
      }
  }

  return message
}
```

### Как я могу отправить сообщение с консоли на сервер?

Вы можете использовать библиотеку, такую как `repl`, чтобы прочитать ввод консоли и использовать` bot.chat` для его отправки. Вы можете найти пример [здесь.](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### Как я могу указать другой плагин в качестве зависимости при создании плагина?

В функции `inject()` вашего плагина вы можете безопасно вызвать `bot.loadPlugin(другой плагин)`, чтобы убедиться, что плагин загружен. Если плагин уже был загружен ранее, ничего не произойдет.

Обратите внимание, что порядок, в котором загружаются плагины, является динамическим, поэтому вы никогда не должны вызывать другой плагин в своей функции `inject()`.
