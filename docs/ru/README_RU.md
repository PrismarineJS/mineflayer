# Mineflayer

[![Версия NPM](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Последние изменения](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Попробуйте на gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Открыть в Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![Спонсоры GitHub](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Официальный дискорд](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) | <sub>BR</sub> [Portuguese](../br/README_BR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

Создавайте ботов Minecraft с помощью мощного, стабильного и высокоуровневого JavaScript [API](api_ru.md), также можете использовать Python.

Первый раз используете Node.js? Начните с [этого](tutorial_ru.md). Знаете Python? Посмотрите [примеры на Python](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python) и попробуйте [Mineflayer в Google Colab](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb).

## Возможности

 * Поддержка 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19 и 1.20.
 * Поддержка энтити и их отслеживание.
 * Вы можете полностью взаимодействовать с миром. Миллисекунды на поиск любого блока.
 * Физика и управление.
 * Атака энтити и использование транспортных средств.
 * Взаимодействие с инвентарем.
 * Взаимодействие с крафтом, сундуками, раздатчиками и чаровальными столами.
 * Вы можете копать и строить.
 * Мелкие функции, такие как отслеживание здоровья и погоды.
 * Активация блоков и использование предметов.
 * Взаимодействие с чатом.

### Наши цели

Узнайте про наши текущие [задачи](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Установка

Сначала установите Node.js >= 18 из [nodejs.org](https://nodejs.org/), затем выполните:

`npm install mineflayer`

Чтобы обновить пакет mineflayer (или любой Node.js) и его зависимости, используйте `npm update --depth 9999`

## Документация

| Ссылка                                                                     | Описание                              |
| -------------------------------------------------------------------------- | ------------------------------------- |
| [Обучение](tutorial_ru.md)                                                 | Знакомство с Node.js и Mineflayer     |
| [ЧАВО](FAQ_RU.md)                                                          | Появился вопрос? Найдите ответ здесь. |
| **[api_ru.md](api_ru.md)** <br/>[unstable_api.md](unstable_api_ru.md)      | Полное описание API                   |
| [Обновления](../history.md)                                                | Список изменений в обновлениях        |
| [Примеры](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Примеры использования Mineflayer      |


## Сделать вклад в развитие Mineflayer

Прочитайте [CONTRIBUTING_RU.md](CONTRIBUTING_RU.md) и [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Использование

**Видео**

Обучающее видео, объясняющее базовый процесс настройки бота, можно найти [здесь](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Если Вы хотите узнать больше, посмотрите другие видео [здесь](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV), а также посмотреть [исходный код ботов](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Перед запуском**

Если версия не указана, она будет выбрана автоматически, исходя из поддерживаемых сервером версии.
Без указания `auth` будет выбран вход через mojang.

### Простой пример
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // айпи майнкрафт сервера
  username: 'email@example.com', // ник бота
  auth: 'microsoft' // для пираток нужно заменить на 'offline'
  // port: 25565,                // прописывайте, если порт не 25565
  // version: false,             // прописывайте, если нужна конкретная версия или снапшот (например: "1.8.9" или "1.16.5"), иначе версия будет выбрана автоматически
  // password: '12345678'        // прописывайте, если хотите использовать аутентификацию через пароль (может быть ненадёжно)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Логирование ошибок и причин отключения от сервера:
bot.on('kicked', console.log)
bot.on('error', console.log)
```

### Смотрите, что делает бот

Спасибо репозиторию [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), с помощью которого можно через браузер увидеть, что делает бот.
Установите его через `npm install prismarine-viewer` и добавьте это в код:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port - это порт сервера майнкрафт, если значение firstPerson: false, вы получите вид с высоты птичьего полета
})
```
После запуска, вы в прямом эфире сможете наблюдать за происходящим:

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### Больше примеров

| Пример                                                                                                      | Описание                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer)                            | Отобразить через браузер вид от лица бота                                                 |
| [pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder)                    | Передвижение бота по координатам и не только                                              |
| [chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js)                           | Использование сундуков, печек, раздатчиков и чаровальных столов                           |
| [digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js)                         | Пример для создания бота-шахтёра                                                          |
| [discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js)                       | Создайте Discord бота                                                                     |
| [jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js)                         | Научите бота передвигатся, прыгать, использовать средства пережвижения, а также атаковать |
| [ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js)                             | Отобразите чат вашего бота со всеми цветами, отображаемыми в вашем терминале              |
| [guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js)                           | Заставьте бота охранять определенную область от мобов                                     |
| [multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Добавьте текстовый файл с аккаунтами для запуска нескольких ботов                         |

Множество других примеров в [данной папке](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Модули

Большая часть разработки происходит внутри небольших пакетов npm, которые используются mineflayer.

Модули, из которых состоит Mineflayer:

| Модуль                                                                        | Описание                                                                                |
| ----------------------------------------------------------------------------- |---------------------------------------------------------------------------------------- |
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Парсинг пакетов Minecraft, аутентификация и шифрование                                  |
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data)              | Независимый от языка модуль, предоставляющий данные Minecraft для клиента и сервера     |
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics)      | Взаимодействие с физикой                                                                |
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk)          | Хранение чанков Minecraft                                                               |
| [node-vec3](https://github.com/PrismarineJS/node-vec3)                        | Векторная обработка координат                                                           |
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block)          | Взаимодействие с блоками и их данными                                                   |
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat)            | Парсер чата Minecraft (вырезано из Mineflayer)                                          |
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

В Windows:
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Cторонние плагины:

Mineflayer поддерживает сторонние плагины. Любой желающий может создать плагин, который добавляет API ещё более высокого уровня поверх Mineflayer.

Наиболее обновлённые и полезные:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - Продвинутый A* поиск пути с множеством настраиваемых функций
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - Простой web клиент для просмотра чанков
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - Веб клиент для взаимодействия с инвентарём
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - API для более сложного поведения бота
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - Автоматическое взаимодействие с бронёй
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Панель управления для бота
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - Простой API для базовых PVP и PVE сражений
 * [Auto Eat](https://github.com/link-discord/mineflayer-auto-eat) - Автоматическое поедание пищи
 * [Auto Crystal](https://github.com/link-discord/mineflayer-autocrystal) - Автоматическое размещение и взрыв кристалов края
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - Утилита для автоматического выбора инструмента/оружия с высокоуровневым API
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - Утилита для использования автоматического прицеливания из луков
 * [GUI](https://github.com/firejoust/mineflayer-GUI) - Взаимодействие с окнами по типу инвентаря, используя async/await
 * [Projectile](https://github.com/firejoust/mineflayer-projectile) - Получение необходимого угола запуска снарядов
 * [Movement](https://github.com/firejoust/mineflayer-movement) - Плавные и реалистичные движения игрока, лучше всего подходящие для PvP
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - API для простого способа для подбора блоков


Вы также можете изучить:

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - Веб радар, созданный с помощью
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - Аутентификация на пиратских серверах
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - Отслеживание получаемого урона в пределах видимости
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - Получение TPS сервера
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - Создание панорамных снимков вашего мира
 * [player-death-event](https://github.com/tuanzisama/mineflayer-death-event) - Создание события смерти игрока в Mineflayer.

## Проекты, созданные с помощью Mineflayer

 * [Voyager](https://github.com/MineDojo/Voyager) - Открытый агент с большими языковыми моделями
 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - постройка спиральной лестницы](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - дублирование постройки](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - Визуализация от первого лица бота, созданная с помощью voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) - Логирование активности игрока в онлайн-API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (последняя версия с открытым исходным кодом, созданная AlexKvazos) - Веб чат майнкрафт сервера
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Плагин с чистым GUI. Создан с помощью Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Бот Minecraft, использующий генетические алгоритмы, посмотрите [эти видео](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) - Мост между Minecraft и Telegram, созданный при помощи Mineflayer & Telegraf
  * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - Строит схемы в режиме выживания, сохраняя направление
  * [и многие другие](https://github.com/PrismarineJS/mineflayer/network/dependents) - Все проекты, обнаруженные GitHub, в которых используется Mineflayer


## Тестирование

### Тестирование всего

Просто запустите:

```bash
npm test
```

### Тестирование определённой версии
Запустите

```bash
npm run mocha_test -- -g <version>
```

где `<version>` означает версию, таких как `1.12`, `1.15.2`...

### Тестирование определённой функции

Запустите

```bash
npm run mocha_test -- -g <test_name>
```

где `<test_name>` означает название проверки, таких как `bed`, `useChests`, `rayTrace`...

### Пример

```bash
npm run mocha_test -- -g "1.18.1.*BlockFinder"
```

запустит тест BlockFinder на версии 1.18.1

## Лицензия

[MIT](../../LICENSE)
