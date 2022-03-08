# Mineflayer

[![Версия NPM](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Последние изменения](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Issue Hunt](https://github.com/BoostIO/issuehunt-materials/blob/master/v1/issuehunt-shield-v1.svg)](https://issuehunt.io/r/PrismarineJS/mineflayer)

[![Попробуйте на gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

Создавайте ботов Minecraft с помощью мощного, стабильного и высокоуровневого JavaScript [API](api.md).

Первый раз используете Node.js? Начните с [этого](tutorial.md).

## Возможности

 * Поддержка 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17 и 1.18
 * Поддержка энтити и их отслеживание
 * Вы можете полностью взаимодействовать с миром. Миллисекунды на поиск любого блока
 * Физика и управление
 * Атака энтити и использование транспортных средств
 * Взаимодействие с инвентарем 
 * Взаимодействие с крафтингом, сундуками, раздатчиками и чаровальными столами
 * Вы можете копать и строить
 * Мелкие функции, такие как отслеживание здоровья и прочие
 * Активация блоков и использование предметов
 * Взаимодействие с чатом

### Наши цели

Узнайте про наши текущие [задачи](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Установка

Сначало установите nodejs >= 14 из [nodejs.org](https://nodejs.org/) затем выполните:

`npm install mineflayer`

## Документация

| Ссылка                                                                     | Описание                              |
| -------------------------------------------------------------------------- | ------------------------------------- |
| [Обучение](tutorial.md)                                                    | Знакомство с Node.js и Mineflayer     |
| [FAQ](FAQ_RU.md)                                                           | Появился вопрос? Найдите ответ здесь. |
| [Нестабильное API](unstable_api_ru.md)                                     | Нестабильные методы API               |
| [Обновления](history.md)                                                   | Список изменений в обновлениях        |
| [Примеры](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Примеры использования Mineflayer      |


## Сделать вклад в развитие Mineflayer

Прочитайте [CONTRIBUTING.md](CONTRIBUTING.md) и [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Использование

**Видео**

Обучающее видео, объясняющее базовый процесс настройки бота, можно найти [здесь](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Если Вы хотите узнать больше, посмотрите другие видео [здесь](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV), а также посмотреть их [исходный код](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Перед запуском**

Если версия не указана она будет выбрана автоматически исходя из поддерживаемых сервером версиях.
Например: `version: "1.8"`.

### Простой пример
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // optional
  port: 25565, // optional
  username: 'email@example.com', // E-mail и пароль используются для
  password: '12345678', // лицензионных серверов
  version: false, // При установленном значении false версия будет выбрана автоматически, используйте пример выше чтобы выбрать нужную версию
  auth: 'mojang' // Необязательное поле. По умолчанию используется mojang, если используется учетная запись microsoft, установите значение «microsoft»
})

bot.on('chat', function (username, message) {
  if (username === bot.username) return
  bot.chat(message)
})

// Прослушивание ошибок и причин отключения от сервера:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### Смотрите, что делает бот

Спасибо репозиторию [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), с помощью которого можно увидеть от лица бота, что на данный момент происходит на сервере.
Установите [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) c помощью `npm install prismarine-viewer` и добавьте это в Ваш код:
```js
const mineflayerViewer = require('prismarine-viewer').mineflayer
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})
```
После запуска, вы в прямом эфире сможете наблюдать за происходящим:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### Больше примеров

| Пример                                                                                     | Описание |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer)           | Отобразить через браузер вид от лица бота                       |
| [pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Передвижение бота по координатам и не только                    |
| [chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js)          | Использование сундуков, печек, раздатчиков и чаровальных столов |
| [digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js)        | Пример для создания бота-шахтёра                                |
| [discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js)      | Создайте Discord бота                                           |
| [jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js)        | Научите бота передвигатся, прыгать, использовать средства пережвижения, а также атаковать |

И много других примеров в данной [папке](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Модули

Большая часть разработки происходит внутри небольших пакетов npm, которые используются mineflayer.

Модули, из которых состоит Mineflayer

| Модуль                                                                        | Описание                                                                                |
| ----------------------------------------------------------------------------- |---------------------------------------------------------------------------------------- |
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Парсинг пакетов Minecraft, аутентификация и шифрование                                  |
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data)              | Независимый от языка модуль, предоставляющий данные Minecraft для клиента и сервера     |
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics)      | Взаимодействие с физикой                                                                |
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk)          | Хранение чанков Minecraft                                                               |
| [node-vec3](https://github.com/PrismarineJS/node-vec3)                        | Векторная обработка координат                                                           |
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block)          | Взаимодействие с блоками и их данными                                                   |
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat)            | Парсер чата Minecraft (вырезана из Mineflayer)                                          |
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil)              | Библиотека для взаимодействия с системой аутентификации Mojang, известная как Yggdrasil |
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world)          | Реализация миров для prismarine                                                         |
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)      | Взаимодействие с GUI                                                                    |
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item)            | Взаимодействие с предметами и их данными                                                |
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt)              | Парсер NBT для node-minecraft-protocol                                                  |
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)        | Взаимодействие с рецептами крафта                                                       |
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)          | Взаимодействие с биомами                                                                |
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)        | Взаимодействие с сущностями                                                             |


### Дебаг

Вы можете отлавливать ошибки с помощью переменной окружения `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

На OC Windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Cторонние плагины:

Mineflayer поддерживает сторонние плагины. С помощью них Вы можете
добавить новые методы API:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - Поиск пути с помощью координат
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - Простой web клиент для отслеживания активного чанка
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - Веб клиент для взаимодействия с инвентарем
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - API с более сложной структурой для ботов
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - Автоматическое взаимодействие с экипировкой 
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - Простой способ для подбора блоков
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Панель управления для бота


 Также Вы можете изучить:

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - Управление, передвижение бота [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - Веб радар, созданный с помощью
   canvas и socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - Поиск блоков в мире
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - Добратся до цели минуя препятствия [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - Аутентификация на пиратских серверах
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - Отслеживание получаемого урона в пределах видимости
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - Получить TPS сервера

## Проекты, созданные с помощью Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - постройка спиральной лестницы](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - дублирование постройки](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - визуализация от первого лица бота,
 созданная с помощью voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  отслеживание действий с собственным API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (последняя версия с открытым исходным кодом, созданная с помощью AlexKvazos) -  Веб чат сервера Minecraft <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Плагин с чистым GUI. Создан с помощью Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Бот Minecraft, использующий генетические алгоритмы,
 посмотрите [эти видео](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Мост между Minecraft и Telegram, создан при помощи Mineflayer & Telegraf.
 * [и многие другие](https://github.com/PrismarineJS/mineflayer/network/dependents) - Все проекты, в которых используется Mineflayer


## Тестирование

Настройка перед запуском бота

### Установка

Чтобы все тесты прошли успешно, вы должны:

1. Создайть папку для хранения сервера
2. Установить переменную окружения `MC_SERVER_JAR_DIR` с путём на эту папку

Например:

1. `mkdir server_jars`
2. `export MC_SERVER_JAR_DIR=/полный/путь/до/сервера`

Где "/полный/путь/до/сервера" - это путь к папке, в которой расположен сервер

### Финальное тестирование

Запустите: `npm test`

### Тестирование с определенной версии:
Выполните: `npm test -- -g <version>`, где `<version>` это версия Minecraft `1.12`, `1.15.2`...

### Тестирование конкретного теста
Выполните: `npm test -- -g <test_name>`, где `<test_name>` любое название скрипта, по типу `bed`, `useChests`, `rayTrace`...

## Лицензия

[MIT](LICENCE)
