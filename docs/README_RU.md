# Mineflayer

[![Версия NPM](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Статус сборки](https://circleci.com/gh/PrismarineJS/mineflayer.svg?style=shield)](https://circleci.com/gh/PrismarineJS/mineflayer)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Попробуйте на gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| US [English](README.md) | RU [Russian](README_RU.md) |
|-------------------------|----------------------------|

Создавайте ботов Minecraft с помощью мощного, стабильного и высокоуровневого JavaScript API.

## Особенности:

 * Поддержка версий 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14 и 1.15.
 * Поддержка сущностей и их отслеживание.
 * Поддержка блоков. Вы можете запросить все, что находится вокруг Вас.
 * Базовая физика и движение - на данный момент блок может быть полным, или пустым.
 * Атака существ и использование транспортных средств.
 * Взаимодействие с инвентарем.
 * Использование крафта, сундуков, раздатчиков и т.д.
 * Копание и строительство.
 * Дополнительные возможности, такие как просмотр вашего здоровья, проверка на погоду.
 * Активация блоков и использование предметов.
 * Чат.

### Планируется:

 * Взаимодействия со стойками для брони, наковальнями.
 * Улучшенная физика (поддержка дверей, лестниц, воды и т.д).
 * Хочешь внести свой вклад в развитие PrismarineJS? Прочитай https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects

## Как использовать:

Если версия не указана, она будет выбрана автоматически. Вы также можете установить свою версию,
например `version:"1.8"`.

### Пример
```js
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: "localhost", // optional
  port: 25565,       // optional
  username: "email@example.com", // почта и пароль требуются только для
  password: "12345678",          // online-mode=true серверов
  version: false                 // если значение false, версия выбирается автоматически. Вы также можете установить нужную версию, например `version:"1.8"`.
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
bot.on('error', err => console.log(err))
```

### Откладка

Вы можете включить откладку, используя `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

На ОС Windows:
```
set DEBUG=minecraft-protocol
node your_script.js
```

#### Больше примеров:

 * В папке [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples).
 * [vogonistic's REPL bot](https://gist.github.com/vogonistic/4631678)

## Сторонние плагины:

Mineflayer имеет возможность установки плагинов; каждый может создать плагин, который добавляет
более высокоуровневое API для Mineflayer.

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - навигация при помощи поиска пути [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - веб-радар, который использует canvas и socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - поиск блоков в мире
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - добратся до заданной точке, даже
 если требуется ломать или разрушать блоки [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - аутентификация  бота, используя чат
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - автоматическое взаимодействие с броней
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - отслеживание нанесенного урона существам
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - получить текущий TPS

## Проекты, которые используют Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - визуализация, по которой
 определяется, что видит бот
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  логгирование активности игрока при помощи API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (последняя версия с открытым исходным кодом, сделанная AlexKvazos) -  Веб чат-клиент <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Плагин на основе бота с удобным GUI. Сделано при помощи Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Minecraft бот, использующий генетические алгоритмы, смотрите [its youtube videos](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)

## Установка

`npm install mineflayer`

## Документация

 * Смотрите [docs/api.md](api_ru.md).
 * Смотрите [docs/history.md](history.md).
 * Смотрите [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples).
 * Смотрите [docs/unstable_api.md](unstable_api.md).
 * Смотрите [docs/contribute.md](contribute.md).

## Сделать вклад в развитие Mineflayer

Пожалуйста, прочитайте https://github.com/PrismarineJS/prismarine-contribute

## Тесты

После клонирования проекта требуется дополнительная настройка, но после этого его запуск не создаст проблем

### Установка

Для успешного запуска вы должны:

1. Создать новую директорию, в которой будет находится jar-файл Minecraft сервера
2. Установите путь MC_SERVER_JAR_DIR к этой папке

Пример:

1. `mkdir server_jars`
2. `export MC_SERVER_JAR_DIR=/full/path/to/server_jars`

Где "/full/path/to/" - это полное название пути

### В конце

Запустите: `npm test`

## Обновление протокола до новой версии

1. Ждите обновлений
   [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol),
   которые будут поддерживать новые версии 
2. `npm install --save minecraft-protocol@latest`
3. Реализовать [изменение протокола](http://wiki.vg/Protocol_History), где это необходимо
4. Запустите, используя примеры выше

## Лицензия

[MIT](LICENCE)
