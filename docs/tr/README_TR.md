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

Node.js ile ilk deneyimin mi ? İstersen [öğretici](tutorial.md) ile başlayabilirsin

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
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Botunu tarayıcında izle |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | Botunun belirli bir yere gitmesini sağla |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Sandıkları, fırınları, fırlatıcıları ve büyü masalarını kullan |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Basit bir kazıcı botun nasıl yapılacağını öğren |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Discord ile bir mineflayer botunu bağla |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Nasıl hareket ettiğini, zıplamayı, binek sürmeyi, canlılara saldıracağını öğren |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Botun sohbetini renkli bir şekilde izle |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Gardiyan bir bot yap bir alanı korusun |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Bir dosyadan çoklu giriş sağla |

Ve daha fazlası [burada](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Modüller

Mineflayer tarafından kullanılan küçük npm paketlerinin içinde pek çok aktif geliştirme yapılıyor.

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Modüller

Mineflayerin bazı yapı taşları olarak kullanılan modüller:

| Modül | Açıklama |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Minecraft paketlerini kullanmayı sağlar.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Minecraft hakkında bir veritabanı.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Minecraft canlılarının fizik motoru
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Chunk bilgisini tutan bir modül
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | 3B Vektör matematiği burada
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Minecraft bloğunu verisi ile tanımlamaya yarayan modül
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Minecraft sohbetini düzenleyici (mineflayerdan çıkartıldı)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Mojangın üyelik sistemiyle etkileşime geçebilmek için node.js kütüphanesi
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | Prismarine dünyaların ana kütüphanesi
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Minecraft sekmeleri için bir yönetim kütüphanesi
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Bir Minecraft eşyasını verileri ile tanımlamaya yarayan modül
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Minecraft-protocol için nbt kütüphanesi
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Minecraft tarif kütüphanesi
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Bir Minecraft biyomunu verileri ile tanımlamaya yarayan modül
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Bir minecraft canlısını tanımlar


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

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - Yön bulma ve birsürü konfigürasyon ayarları.
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - Basit tarayıcı chunk gösterici.
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - Tarayıcı bazlı envanter gösterici.
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - Daha kompleks bot eventleri için bir API.
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - Otomatik zırh düzenleyici.
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - Basit ve hızlı blok toplama APIsi.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Mineflayer botu için kontrol panel.
 * [PVP](https://github.com/TheDudeFromCI/mineflayer-pvp) - PVP ve PVE için basit API.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - Otomatik yemek yeme.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - Otomatik eşya seçimi için yüksek API.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - Yaylarla auto-aim için API.


 Bunlarıda deneyebilirsin :

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - tarayıcı bazlı radar
   arayüzü canvas and socket.io kullanılarak. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - 3 boyutlu dünyada blok bulun
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - bir hedefe blok koyarak
 veya kırarak ulaş [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - sohbet-bazlı bot giriş sistemi
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - pvp hakkında bilgi APIsi
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - şuanki tpsi elde et (işlenmiş tps)
 + [panorama](https://github.com/IceTank/mineflayer-panorama) - dünyanın panorama resimlerini çek

## Mineflayer Kullanan Projeler

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - spiral bir merdiven inşaa etme](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - bir yapıyı taklit etme](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - Voxel.js ile 
 botun ne kullandğını gör
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) - Bot aktivitesini bir APIye gönder
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (son açık kaynak sürümü, AlexKvazos tarafından yapıldı) - Minecraft internet tabanlı sohbet <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - GUIli bir bot.
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Genetik algoritmalar ile minecraft botu, şu [videoyu izle](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - Telegram köprüsü, mineflayer & telegram üzerinde inşaa edildi
 * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - Minecraft şemalarını survivalde inşaa eder
 * [ve daha niceleri](https://github.com/PrismarineJS/mineflayer/network/dependents) - Mineflayer kullanan github tarafından tespit edilen tüm projeler


## Test etme

### Herşeyi test etme

Basitçe `npm test` komutunu çalıştırın

### Özel bir sürümü test etme
`npm test -- -g <sürüm>` komutunu çalıştırın, `<version>` kısmının olduğu bölüm bir minecraft sürümü olmalı mesela `1.12`, `1.15.2`...

### Özel birşeyi test etme
`npm test -- -g <test_adı>` komutunu çalıştırın, `<test_name>` kısmının olduğu bölüm bir test olmalı mesela `bed`, `useChests`, `rayTrace`...

## Lisans
####TR Çeviri KaffinPX tarafından yapılmıştır. | TR translation made by KaffinPX : Discord KaffinPX#1744
[MIT](LICENSE)
