# Mineflayer

[![Версия NPM](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Статус сборки](https://circleci.com/gh/PrismarineJS/mineflayer.svg?style=shield)](https://circleci.com/gh/PrismarineJS/mineflayer)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Попробуйте на gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| US [English](README.md) | RU [Russian](README_RU.md) | ES [Spanish](README_ES.md) |
|-------------------------|----------------------------|----------------------------|

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

### Цели

 Посмотрите на наши большие [проекты](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Установка

`npm install mineflayer`

## Документация

| Ссылка | Описание |
|---|---|
|[Туториал](tutorial.md) | Знакомство с node.js и mineflayer |
|[FAQ](FAQ.md) | Есть вопрос? Сначало посмотрите это |
|[API](api.md) [Нестабильный API](unstable_api.md) | API |
|[История](history.md) | История изменений mineflayer |
|[Примеры](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Посмотреть на все примеры |

## Сделать вклад в развитие Mineflayer

Пожалуйста, прочитайте https://github.com/PrismarineJS/prismarine-contribute

## Использование

Если не выбрать версию, то она будет выбрана автоматически. (Может привести к ошибкам)
Пример: `version:"1.8"`.

### Пример

```js
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: "localhost", 
  port: 25565,
  username: "email@example.com", // почта и пароль требуются только для
  password: "12345678",          // "взломанных" серверов
  version: false                 // если значение false, версия выбирается автоматически. (Не рекомендуется) Вы также можете установить нужную версию, например "1.8".
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
bot.on('error', err => console.log(err))
```

#### Больше примеров

| Пример | Описание |
|---|---|
|[Смотрящий](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | показывает мир сервера от лица бота |
|[Поиск пути](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Заставляет бота идти в нужную локацию |
|[Сундуки](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Использование сундуков, печей, раздатчиков и т.д. |
|[Шахтер](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Как заставить бота копать |
|[Дискорд](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Соединить дискорд бота с mineflayer ботом |
|[Прыгун](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Как заставить бота ходить, прыгать, атаковать ближайших сущностей, и много чего ещё. |

Больше примеров можно найти тут: [(GitHub)](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

#### Модули

Модули, которые использует MineFlayer:

| Модуль | Описание |
|---|---|
| [Minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Управление Майнкрафт пакетами
| [Minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Информация о майнкрафте для серверов, модулей, и так далее 
| [Prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Физика
| [Prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Чанки
| [Node-vec3](https://github.com/PrismarineJS/node-vec3) | Vec3
| [Prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Информация о майнкрафт блоках
| [Prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Получить сообщения из чата
| [Node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Библиотека для обращения к серверам аунтификации Mojang.
| [Prismarine-world](https://github.com/PrismarineJS/prismarine-world) | Майнкрафт миры
| [Prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Окна майнкрафта
| [Prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Информация о предметах в майнкрафте
| [Prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Получить NBT данные
| [Prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Рецепты крафта майнкрафт
| [Prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Информация о майнкрафт биомах
| [Prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Сущности майнкрафта

### Откладка

Вы можете включить откладку пакетоа, используя переменную `DEBUG`:
```bash
DEBUG="minecraft-protocol" node [...]
```

На ОС Windows:
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Сторонние плагины:

Mineflayer имеет возможность установки плагинов; каждый может создать плагин, который добавляет
более высокоуровневое API для Mineflayer.

Самые полезные а также часто обновляемые плагины:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - поиск пути
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - показывает мир сервера от лица бота
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - веб инвентарь бота
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - API для создание ИИ
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - автоматическое взаимодействие с броней
 
 Но посмотрите и эти плагины:
 
 * [Naviagte](https://github.com/andrewrk/mineflayer-navigate/) - навигация при помощи поиска пути [(Демонстрация)](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [Radar](https://github.com/andrewrk/mineflayer-radar/) - веб-радар, который использует canvas и socket.io. [(Демонстрация)](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [BlockFinder](https://github.com/Darthfett/mineflayer-blockFinder) - поиск блоков в мире
 * [Scaffold](https://github.com/andrewrk/mineflayer-scaffold) - добратся до заданной точке, даже
   если требуется ломать или разрушать блоки [(Демонстрация)](http://youtu.be/jkg6psMUSE0)
 * [Auto-Auth](https://github.com/G07cha/MineflayerAutoAuth) - аутентификация  бота, используя чат
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - отслеживание нанесенного урона существам
 * [TPS](https://github.com/SiebeDW/mineflayer-tps) - получить текущий TPS

## Проекты, которые используют Mineflayer

 * [RBot от Rom1504](https://github.com/rom1504/rbot)
   - [YouTube - строительство лестницы](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - создание постройки](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [HelperBot от Darthfett](https://github.com/Darthfett/Helperbot)
 * [Voxel от Vogonistic](https://github.com/vogonistic/mineflayer-voxel) - визуализация мира от лица бота
 * [Skynet от JonnyD](https://github.com/JonnyD/Skynet) -  логгирование активности игрока при помощи API
 * [MinecraftChat от AlexKvakoz](https://github.com/rom1504/MinecraftChat) - Веб чат-клиент
 * [CheeseBot от Ezcha](https://github.com/Minecheesecraft/Cheese-Bot) - Плагин на основе бота с удобным пользовательским интерфейсом. Сделано при помощи Node-Webkit.
 * [ChaosCraft от Schematical](https://github.com/schematical/chaoscraft) - Minecraft бот, использующий генетические алгоритмы, смотрите [его видео] (https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [MineTelegram от HexaTester](https://github.com/hexatester/minetelegram) -  Бот, управляемый через телеграм
 * [И еще много других](https://github.com/PrismarineJS/mineflayer/network/dependents) - All the projects that github detected are using mineflayer

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

### Протестировать все

Напишите `npm test`

### Тестирование определенной версии
Напишите `npm test -g <version>`, где `<version>` это версия майкрафта, типа `1.12`, `1.15.2`...

### Проверить определенный текст
Напишите `npm test -g <test_name>`, где `<test_name>` это названия тестов, типа `bed`, `useChests`, `rayTrace`...

## Лицензия

[MIT](LICENCE)
