# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Issue Hunt](https://github.com/BoostIO/issuehunt-materials/blob/master/v1/issuehunt-shield-v1.svg)](https://issuehunt.io/r/PrismarineJS/mineflayer)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| 🇺🇸 [English](README.md) | 🇷🇺 [Russian](ru/README_RU.md) | 🇪🇸 [Spanish](es/README_ES.md) | ᴛ🇷 [Türkçe](tr/README_TR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|

Yüksek seviye JavaScript ile güçlü, dengeli Minecraft robotları oluşturun [API](api.md).

Node.js ile ilk deneyimin mi ? İstersen [tutorial](tutorial.md) ile başlayabilirsin

## Özellikler

 * Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15 ve 1.16 sürümlerini destekler.
 * Canlı bilgisi ve takibi.
 * Blok bilgisi. Etrafındakileri araştırabilirsin. Bir bloğu bulmak bir milisaniye sürer.
 * Fizik ve hareket - Herşeyi kapsayabilir.
 * Canlılara saldırma ve binilebilirleri kullanma.
 * Envanter kabiliyeti.
 * Çalışma masaları, sandıklar, fırlatıcılar, büyü masaları.
 * Blok kazma ve koyma.
 * Kullanabileceğin şeyler mesela canın veya yağmur yağıyor durumları.
 * Eşya kullanma ve blokları etkinleştirme.
 * Sohbet.

### Yol Haritası

 Bu sayfayı ziyaret ederek [projelerin](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) durumlarını öğrenebilirsin. 
 
## Kurulum

İlk önce nodejs >= 14 sürümünü [nodejs.org](https://nodejs.org/) adresinden indirin ve:

`npm install mineflayer` komutunu kullanın.

## Belgeler / Wiki

| link | Açıklama |
|---|---|
| [Öğretici](tutorial.md) | Node.js ve mineflayer ile başlayın |
| [FAQ.md](FAQ.md) | Sorun mu var ? Buraya gel |
| [api.md](api.md) [unstable_api.md](unstable_api.md) | API hakkında herşey |
| [history.md](history.md) | Değişikliklerin listesi |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Tüm mineflayer örnekleri |


## Katkıda bulunmak

Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) ve [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute) adlı dosyaları okuyunuz

## Kullanım

**Videolar**

Bir öğretici video [burada.](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Daha fazlasını öğrenmek istersen [buraya](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) buraya tıklayarak bakabilirsin ve kaynak kodlarını [burada](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials) bulabilirsin.

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Başlangıç**

Sürüm belirtmez isen sistem otomatik sürüm tahmin eder.
Üyelik sistemi belirtmez isen Mojang üyelik sistemi kullanılacak.

### Eko Örneği
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost',             // minecraft sunucu ip
  username: 'email@example.com', // minecraft kullanıcı adı
  password: '12345678',          // minecraft şifresi, crackli swler için buraya birşey yazmana gerek yok
  // port: 25565,                // sadece port 25565 olmadığında kullan
  // version: false,             // sürüm kullanacağın zaman burayı değiştirebilirsin
  // auth: 'mojang'              // microsoft kullanıyorsan microsoft olarak değiştirebilirsin
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Hataları ve kicklemeleri konsola yansıt:
bot.on('kicked', console.log)
bot.on('error', console.log)
```

### Botunun ne yaptığını gör

[prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) projesini inceleyebilirsin, browser sekmende botunu izleyebilirsin.
Sadece `npm install prismarine-viewer` komutunu çalştır ve bu kodu botuna ekle:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // yayın yapılacak port, false yaparsan kuş bakışı görüntü elde edersin.
})
```
Ve *canlı* görüntü şuna benzeyecektir:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### Daha fazla örnek

| Örnek | Açıklama |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Display your bot world view in the browser |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | Make your bot go to any location automatically |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Use chests, furnaces, dispensers, enchantment tables |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Learn how to create a simple bot that is capable of digging the block |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Connect a discord bot with a mineflayer bot |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Learn how to move, jump, ride vehicles, attack nearby entities |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Display your bot's chat with all of the chat colors shown in your terminal |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Make a bot guard a defined area from nearby mobs |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Add a text file with accounts and have them all login |

Ve daha fazlası [burada](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Modüller

Mineflayer tarafından kullanılan küçük npm paketlerinin içinde pek çok aktif geliştirme yapılıyor.

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Modüller

Mineflayerin bazı yapı taşları olarak kullanılan modüller:

| Modül | Açıklama |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Parse and serialize minecraft packets, plus authentication and encryption.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Language independent module providing minecraft data for minecraft clients, servers and libraries.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Provide the physics engine for minecraft entities
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | A class to hold chunk data for Minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | 3d vector math with robust unit tests
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Represent a minecraft block with its associated data
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | A parser for a minecraft chat message (extracted from mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Node.js library to interact with Mojang's authentication system, known as Yggdrasil
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | The core implementation of worlds for prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Represent minecraft windows
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Represent a minecraft item with its associated data
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | An NBT parser for node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Represent minecraft recipes
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Represent a minecraft biome with its associated data
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Represent a minecraft entity


### Hata ayıklama

Bazı hata ayıklama çıktısı almak için `DEBUG` değişkenini kullanabilirsin:

```bash
DEBUG="minecraft-protocol" node [...]
```

Windows`ta :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## 3. Parti Eklentiler

Mineflayer eklenti desteği sağlar; isteyen kişi eklenti yazabilir
Mineflayerin olduğundan daha üstü destek için.

Genellikle güncellenen ve kullanışlı olan bazıları :

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - advanced A* pathfinding with a lot of configurable features
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - simple web chunk viewer
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - web based inventory viewer
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - A state machine API for more complex bot behavors
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - automatic armor managment
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - Quick and simple block collection API.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Frontend dashboard for mineflayer bot
 * [PVP](https://github.com/TheDudeFromCI/mineflayer-pvp) - Easy API for basic PVP and PVE.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - Automatic eating of food.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - A utility for automatic tool/weapon selection with a high level API.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - A utility for using auto-aim with bows.


 Bunlarıda deneyebilirsin :

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - find blocks in the 3D world
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - get to
   a target destination even if you have to build or break blocks to do so.
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - chat-based bot authentication
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determine who and what is responsible for damage to another entity
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - get the current tps (processed tps)
 + [panorama](https://github.com/IceTank/mineflayer-panorama) - take Panorama Images of your world

## Mineflayer Kullanan Projeler

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualize what
   the bot is up to using voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  log player activity onto an online API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (last open source version, built by AlexKvazos) -  Minecraft web based chat client <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Plugin based bot with a clean GUI. Made with Node-Webkit.
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Minecraft bot using genetic algorithms, see [its youtube videos](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - Telegram bridge, build on top of mineflayer & telegraf.
 * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - Prints minecraft schematics in survival, keeping orientation
 * [ve daha niceleri](https://github.com/PrismarineJS/mineflayer/network/dependents) - All the projects that github detected are using mineflayer


## Test etme

### Herşeyi test etme

Basitçe `npm test` komutunu çalıştırın

### Özel bir sürümü test etme
`npm test -- -g <sürüm>` komutunu çalıştırın, `<version>` kısmının olduğu bölüm bir minecraft sürümü olmalı mesela `1.12`, `1.15.2`...

### Özel birşeyi test etme
`npm test -- -g <test_adı>` komutunu çalıştırın, `<test_name>` kısmının olduğu bölüm bir test olmalı mesela `bed`, `useChests`, `rayTrace`...

## Lisans
TR Çeviri KaffinPX tarafından yapılmıştır. | TR translation made by KaffinPX : Discord KaffinPX#1744
[MIT](LICENSE)
