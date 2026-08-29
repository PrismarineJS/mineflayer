# Mineflayer

[![NPM version](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Try it on gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Open In Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) | <sub>BR</sub> [Português](../br/README_BR.md) | <sub>TH</sub> [ไทย](README_TH.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

สร้างบอท (bot) Minecraft ด้วย JavaScript [API](api_th.md) ระดับสูงที่ทรงพลังและเสถียร อีกทั้งยังใช้งานได้จาก Python อีกด้วย

ใช้งาน Node.js เป็นครั้งแรกใช่ไหม? คุณอาจอยากเริ่มต้นจาก[บทเรียน (tutorial)](tutorial_th.md) ถ้าคุณรู้จัก Python ลองดู[ตัวอย่าง Python](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python) แล้วลองเล่น [Mineflayer บน Google Colab](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)

## คุณสมบัติ

 * รองรับ Minecraft 1.8 ถึง 1.21.11 (1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21, 1.21.9, 1.21.11) <!--version-->
 * รับรู้และติดตามเอนทิตี (entity)
 * รับรู้ข้อมูลบล็อก คุณสามารถสืบค้นโลก (world) รอบตัวคุณได้ ใช้เวลาเพียงไม่กี่มิลลิวินาทีในการค้นหาบล็อกใด ๆ
 * ฟิสิกส์และการเคลื่อนที่ - จัดการ bounding box ทั้งหมด
 * โจมตีเอนทิตีและใช้ยานพาหนะ
 * จัดการช่องเก็บของ (inventory)
 * คราฟต์ (crafting), หีบ (chest), dispenser, โต๊ะร่ายมนตร์ (enchantment table)
 * ขุดและสร้าง
 * เรื่องเบ็ดเตล็ดอื่น ๆ เช่น รู้พลังชีวิต (health) ของตัวเอง และรู้ว่าฝนกำลังตกหรือไม่
 * เปิดใช้งานบล็อกและใช้ไอเทม
 * แชท (chat)

### Roadmap

 ลองดู[หน้านี้](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) เพื่อดูว่าโปรเจกต์ปัจจุบันของเรามีอะไรบ้าง

## การติดตั้ง

ก่อนอื่นติดตั้ง Node.js >= 18 จาก [nodejs.org](https://nodejs.org/) จากนั้น:

```bash
npm install mineflayer
```

หากต้องการอัปเดต mineflayer (หรือแพ็กเกจ Node.js ใด ๆ) และ dependency ของมัน ใช้คำสั่ง 
```bash
npm update
```

## เอกสาร

| ลิงก์ | คำอธิบาย |
|---|---|
|[บทเรียน](tutorial_th.md) | เริ่มต้นกับ Node.js และ mineflayer |
| [FAQ.md](FAQ_TH.md) | มีคำถามใช่ไหม? ไปที่นี่ก่อนเลย |
| **[api.md](api_th.md)** <br/>[unstable_api.md](unstable_api_th.md) | เอกสารอ้างอิง API ฉบับเต็ม |
| [history.md](../history.md) | บันทึกการเปลี่ยนแปลงของ mineflayer |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | ลองดูตัวอย่าง mineflayer ทั้งหมด |


## ร่วมพัฒนา

โปรดอ่าน [CONTRIBUTING.md](CONTRIBUTING_TH.md) และ [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## การใช้งาน

**วิดีโอ**

วิดีโอบทเรียนที่อธิบายขั้นตอนการตั้งค่าพื้นฐานสำหรับบอทสามารถดูได้[ที่นี่](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

หากคุณต้องการเรียนรู้เพิ่มเติม มีวิดีโอบทเรียนเพิ่มเติม[ที่นี่](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) และซอร์สโค้ดที่เกี่ยวข้องของบอทเหล่านั้นอยู่[ที่นี่](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="บทเรียน 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="บทเรียน 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="บทเรียน 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="บทเรียน 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**เริ่มต้นใช้งาน**

หากไม่ได้ระบุเวอร์ชัน เวอร์ชันของเซิร์ฟเวอร์ (server) จะถูกเดาให้โดยอัตโนมัติ
หากไม่ได้ระบุ auth จะมีการเดารูปแบบ mojang auth ให้

### ตัวอย่าง Echo
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // ไอพีของเซิร์ฟเวอร์ minecraft
  username: 'Bot', // ชื่อผู้ใช้ที่จะเข้าร่วมหาก auth เป็น `offline` มิฉะนั้นจะเป็นตัวระบุเฉพาะของบัญชีนี้ เปลี่ยนได้หากต้องการสลับบัญชี
  auth: 'microsoft' // สำหรับเซิร์ฟเวอร์โหมดออฟไลน์ คุณสามารถตั้งค่านี้เป็น 'offline' ได้
  // port: 25565,              // ตั้งค่าหากคุณต้องการพอร์ตที่ไม่ใช่ 25565
  // version: false,           // ตั้งค่าเฉพาะเมื่อคุณต้องการเวอร์ชันหรือ snapshot เฉพาะ (เช่น "1.8.9" หรือ "1.16.5") มิฉะนั้นจะถูกตั้งค่าให้อัตโนมัติ
  // password: '12345678'      // ตั้งค่าหากคุณต้องการใช้ auth แบบรหัสผ่าน (อาจไม่น่าเชื่อถือ) หากระบุ `username` ต้องเป็นอีเมล
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// บันทึกข้อผิดพลาดและเหตุผลที่ถูกเตะออก:
bot.on('kicked', console.log)
bot.on('error', console.log)
```

หาก `auth` ถูกตั้งค่าเป็น `microsoft` คุณจะถูกขอให้ล็อกอินเข้า microsoft.com ด้วยรหัสในเบราว์เซอร์ของคุณ หลังจากลงชื่อเข้าใช้บนเบราว์เซอร์แล้ว 
บอทจะรับและแคชโทเค็นการยืนยันตัวตน (authentication) โดยอัตโนมัติ (ภายใต้ชื่อผู้ใช้ที่คุณระบุ) เพื่อที่คุณจะได้ไม่ต้องลงชื่อเข้าใช้อีก 

หากต้องการสลับบัญชี ให้อัปเดต `username` ที่ใส่ไว้ โดยค่าเริ่มต้น โทเค็นที่แคชไว้จะถูกเก็บไว้ในโฟลเดอร์ .minecraft ของผู้ใช้ของคุณ หรือหากระบุ `profilesFolder` ไว้ ก็จะถูกเก็บไว้ที่นั่นแทน
สำหรับข้อมูลเพิ่มเติมเกี่ยวกับตัวเลือกของบอท ดูที่ [เอกสาร API](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) ของ node-minecraft-protocol

#### การเชื่อมต่อกับ Realm

หากต้องการเข้าร่วม Realm ที่บัญชี Minecraft ของคุณได้รับเชิญ คุณสามารถส่งอ็อบเจกต์ (object) `realms` พร้อมฟังก์ชัน selector ดังตัวอย่างด้านล่าง

```js
const client = mineflayer.createBot({
  username: 'email@example.com', // ชื่อผู้ใช้ minecraft
  realms: {
    // ฟังก์ชันนี้จะถูกเรียกพร้อมกับอาเรย์ของ Realm ที่บัญชีสามารถเข้าร่วมได้ ควรคืนค่า Realm ที่ต้องการเข้าร่วม
    pickRealm: (realms) => realms[0]
  },
  auth: 'microsoft'
})
```

### ดูว่าบอทของคุณกำลังทำอะไรอยู่

ต้องขอบคุณโปรเจกต์ [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) ทำให้สามารถแสดงผลในหน้าต่างเบราว์เซอร์ว่าบอทของคุณกำลังทำอะไรอยู่
เพียงรัน `npm install prismarine-viewer` แล้วเพิ่มสิ่งนี้ลงในบอทของคุณ:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port คือพอร์ตของเซิร์ฟเวอร์ minecraft หาก first person เป็น false คุณจะได้มุมมองจากด้านบน
})
```
แล้วคุณจะได้มุมมอง *สด* ที่หน้าตาแบบนี้:

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### ตัวอย่างเพิ่มเติม

| ตัวอย่าง | คำอธิบาย |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | แสดงมุมมองโลกของบอทคุณในเบราว์เซอร์ |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | ทำให้บอทของคุณเดินไปยังตำแหน่งใด ๆ โดยอัตโนมัติ |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | ใช้หีบ, เตาหลอม (furnace), dispenser, โต๊ะร่ายมนตร์ |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | เรียนรู้วิธีสร้างบอทอย่างง่ายที่สามารถขุดบล็อกได้ |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | เชื่อมต่อบอท discord กับบอท mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | เรียนรู้วิธีเคลื่อนที่ กระโดด ขี่ยานพาหนะ และโจมตีเอนทิตีที่อยู่ใกล้เคียง |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | แสดงแชทของบอทคุณพร้อมสีแชททั้งหมดในเทอร์มินัลของคุณ |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | ทำให้บอทเฝ้าพื้นที่ที่กำหนดจากม็อบ (mob) ที่อยู่ใกล้เคียง |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | เพิ่มไฟล์ข้อความที่มีบัญชีต่าง ๆ แล้วให้พวกมันล็อกอินทั้งหมด |

และอีกมากมายในโฟลเดอร์ [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### โมดูล

การพัฒนาที่ดำเนินอยู่จำนวนมากเกิดขึ้นภายในแพ็กเกจ npm ขนาดเล็กที่ถูกใช้โดย mineflayer

#### The Node Way&trade;

> "เมื่อแอปพลิเคชันถูกทำได้ดี มันก็จะเหลือเพียงส่วนกากเฉพาะของแอปพลิเคชันนั้น ๆ ที่ไม่สามารถถูกแยกออกมาเป็นนามธรรมได้ง่าย ๆ ส่วนประกอบที่สวยงามและนำกลับมาใช้ใหม่ได้ทั้งหมดจะระเหยขึ้นไปยัง github และ npm ที่ซึ่งทุกคนสามารถร่วมมือกันพัฒนาสมบัติส่วนรวม" — substack จาก ["how I write modules"](https://gist.github.com/substack/5075355)

#### โมดูล

นี่คือโมดูลหลักที่ประกอบกันเป็น mineflayer:

| โมดูล | คำอธิบาย |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | แยกวิเคราะห์และทำ serialize แพ็กเก็ต minecraft รวมถึงการยืนยันตัวตนและการเข้ารหัส
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | โมดูลที่ไม่ขึ้นกับภาษา ที่ให้ข้อมูล minecraft สำหรับไคลเอนต์ (client), เซิร์ฟเวอร์ และไลบรารีของ minecraft
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | ให้เอนจินฟิสิกส์สำหรับเอนทิตี minecraft
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | คลาสสำหรับเก็บข้อมูลชังก์ (chunk) ของ Minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | คณิตศาสตร์เวกเตอร์ 3 มิติพร้อม unit test ที่แข็งแกร่ง
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | แทนบล็อก minecraft พร้อมข้อมูลที่เกี่ยวข้อง
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | ตัวแยกวิเคราะห์ข้อความแชท minecraft (สกัดมาจาก mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | ไลบรารี Node.js สำหรับโต้ตอบกับระบบการยืนยันตัวตนของ Mojang ที่รู้จักกันในชื่อ Yggdrasil
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | การพัฒนาแกนหลักของโลกสำหรับ prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | แทนหน้าต่าง (window) ของ minecraft
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | แทนไอเทม minecraft พร้อมข้อมูลที่เกี่ยวข้อง
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | ตัวแยกวิเคราะห์ NBT สำหรับ node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | แทนสูตรคราฟต์ (recipe) ของ minecraft
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | แทนไบโอม (biome) minecraft พร้อมข้อมูลที่เกี่ยวข้อง
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | แทนเอนทิตี minecraft


### Debug

คุณสามารถเปิดใช้งานเอาต์พุตการ debug โปรโตคอลบางส่วนได้โดยใช้ตัวแปรสภาพแวดล้อม `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

บน windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## ปลั๊กอินจากบุคคลที่สาม

Mineflayer สามารถต่อปลั๊กอิน (plugin) ได้ ใคร ๆ ก็สามารถสร้างปลั๊กอินที่เพิ่ม
API ระดับสูงยิ่งขึ้นไปอีกบน Mineflayer ได้

ที่อัปเดตล่าสุดและมีประโยชน์ที่สุดได้แก่ :

 * [minecraft-mcp-server](https://github.com/yuniko-software/minecraft-mcp-server) เซิร์ฟเวอร์ MCP สำหรับ mineflayer ที่ให้ใช้ mineflayer จาก LLM ได้
 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - การหาเส้นทาง (pathfinding) แบบ A* ขั้นสูงพร้อมคุณสมบัติที่ปรับแต่งได้มากมาย
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - ตัวแสดงชังก์บนเว็บอย่างง่าย
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - ตัวแสดงช่องเก็บของผ่านเว็บ
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - API แบบ state machine สำหรับพฤติกรรมบอทที่ซับซ้อนมากขึ้น
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - การจัดการเกราะอัตโนมัติ
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - แดชบอร์ดส่วนหน้าสำหรับบอท mineflayer
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - API ใช้งานง่ายสำหรับ PVP และ PVE พื้นฐาน
 * [Auto Eat](https://github.com/link-discord/mineflayer-auto-eat) - กินอาหารโดยอัตโนมัติ
 * [Auto Crystal](https://github.com/link-discord/mineflayer-autocrystal) - วางและทำลาย end crystal โดยอัตโนมัติ
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - เครื่องมือสำหรับการเลือกเครื่องมือ/อาวุธโดยอัตโนมัติพร้อม API ระดับสูง
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - เครื่องมือสำหรับใช้การเล็งอัตโนมัติด้วยธนู
 * [GUI](https://github.com/firejoust/mineflayer-GUI) - โต้ตอบกับหน้าต่าง GUI ที่ซ้อนกันโดยใช้ async/await
 * [Projectile](https://github.com/firejoust/mineflayer-projectile) - หามุมยิงที่ต้องใช้สำหรับวัตถุที่ยิงออกไป
 * [Movement](https://github.com/firejoust/mineflayer-movement) - การเคลื่อนที่ของผู้เล่นที่ลื่นไหลและสมจริง เหมาะที่สุดสำหรับ PvP
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - API เก็บบล็อกที่รวดเร็วและเรียบง่าย

 แต่ก็อย่าลืมดูสิ่งเหล่านี้ด้วย :

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - อินเทอร์เฟซเรดาร์บนเว็บ
   ที่ใช้ canvas และ socket.io [เดโม YouTube](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - การยืนยันตัวตนบอทผ่านแชท
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - ระบุว่าใครและอะไรที่เป็นต้นเหตุของความเสียหายต่อเอนทิตีอื่น
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - รับค่า tps ปัจจุบัน (processed tps)
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - ถ่ายภาพ Panorama ของโลกของคุณ
 * [player-death-event](https://github.com/tuanzisama/mineflayer-death-event) - ส่งอีเวนต์ (event) การตายของผู้เล่นใน Mineflayer

## โปรเจกต์ที่ใช้ Mineflayer

 * [Voyager](https://github.com/MineDojo/Voyager) เอเจนต์เชิงกายภาพแบบปลายเปิดที่ใช้ Large Language Model
 * [mindcraft](https://github.com/kolbytn/mindcraft) ไลบรารีสำหรับใช้ mineflayer กับ LLM
 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - สร้างบันไดวน](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - จำลองสิ่งก่อสร้าง](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - แสดงภาพว่า
   บอทกำลังทำอะไรอยู่โดยใช้ voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  บันทึกกิจกรรมของผู้เล่นลงใน API ออนไลน์
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (เวอร์ชันโอเพนซอร์สล่าสุด สร้างโดย AlexKvazos) -  ไคลเอนต์แชท Minecraft บนเว็บ
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - บอทแบบใช้ปลั๊กอินพร้อม GUI ที่สะอาดตา สร้างด้วย Node-Webkit
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - บอท Minecraft ที่ใช้อัลกอริทึมพันธุกรรม ดู[วิดีโอ youtube ของมัน](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  สะพานเชื่อม Minecraft - Telegram สร้างขึ้นบน mineflayer และ telegraf
 * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - พิมพ์ schematic ของ minecraft ในโหมดเอาชีวิตรอด โดยรักษาทิศทางไว้
 * [SilkePilon/OpenDeliveryBot](https://github.com/SilkePilon/OpenDeliveryBot) - บอท Minecraft ในภาษา python เพื่อส่งไอเทมจากที่หนึ่งไปยังอีกที่หนึ่ง
 * [และอีกหลายร้อยโปรเจกต์](https://github.com/PrismarineJS/mineflayer/network/dependents) - โปรเจกต์ทั้งหมดที่ github ตรวจพบว่าใช้ mineflayer

## การทดสอบ

### ทดสอบทุกอย่าง

เพียงแค่รัน: 

```bash
npm test
```

### ทดสอบเวอร์ชันที่ระบุ
รัน 

```bash
npm run mocha_test -- -g <version>
```

โดยที่ `<version>` คือเวอร์ชัน minecraft เช่น `1.12`, `1.15.2`...

### ทดสอบการทดสอบที่ระบุ
รัน 

```bash
npm run mocha_test -- -g <test_name>
```

โดยที่ `<test_name>` คือชื่อของการทดสอบ เช่น `bed`, `useChests`, `rayTrace`...

### ตัวอย่าง

```bash
npm run mocha_test -- -g "1.18.1.*BlockFinder"
```
เพื่อรันการทดสอบ block finder สำหรับ 1.18.1

## สัญญาอนุญาต

[MIT](/LICENSE)
