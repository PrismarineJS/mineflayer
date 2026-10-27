## คำถามที่พบบ่อย (FAQ)

เอกสารคำถามที่พบบ่อยนี้มีไว้เพื่อช่วยเหลือผู้คนในเรื่องที่พบบ่อยที่สุด

### ฉันเจอ error (เช่น protocol/data) ตอนที่บอท (bot) พยายามเชื่อมต่อกับเซิร์ฟเวอร์ minecraft

ตรวจสอบให้แน่ใจว่าเวอร์ชันของเซิร์ฟเวอร์ Minecraft รองรับ (ดูที่ readme หลัก) ไม่อย่างนั้นคุณควรลองใหม่โดยใช้หนึ่งใน[เวอร์ชันที่ผ่านการทดสอบของ mineflayer](../lib/version.js)

### ฉันเจอ error ตอนพยายามล็อกอินด้วยบัญชี microsoft

ตรวจสอบให้แน่ใจว่าอีเมลที่คุณกรอกในออปชัน username ของ createBot สามารถใช้ล็อกอินเข้า `minecraft.net` ได้ด้วยปุ่ม 'Login with Microsoft'
ตรวจสอบให้แน่ใจว่าคุณมีออปชัน `auth: 'microsoft'` อยู่ในออปชันของ createBot 

เมื่อคุณเจอ error ที่บอกอะไรเกี่ยวกับ invalid credentials หรือ 'Does this account own Minecraft?' ลองลบฟิลด์ password ในออปชันของ `createBot` ออกแล้วลองอีกครั้ง

### จะซ่อน error ได้อย่างไร ?

ใช้ `hideErrors: true` ในออปชันของ createBot
คุณอาจเลือกที่จะเพิ่ม listener เหล่านี้ด้วย :
```js
client.on('error', () => {})
client.on('end', () => {})
```

### ฉันไม่ได้รับอีเวนต์ (event) chat บนเซิร์ฟเวอร์ที่ปรับแต่งเอง จะแก้ไขได้อย่างไร ?

เซิร์ฟเวอร์ Spigot โดยเฉพาะปลั๊กอิน (plugin) บางตัว ใช้รูปแบบแชท (chat) ที่ปรับแต่งเอง คุณจำเป็นต้องแยกวิเคราะห์ (parse) มันด้วย regex / parser ที่ปรับแต่งเอง
อ่านและปรับ [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) เพื่อให้มันทำงานกับ
ปลั๊กอินแชทเฉพาะของคุณ และยังควรอ่าน http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat

### ฉันจะเก็บข้อมูลจากปลั๊กอินที่ปรับแต่งเองในแชทได้อย่างไร ?

เซิร์ฟเวอร์ minecraft ที่ปรับแต่งเองส่วนใหญ่รองรับปลั๊กอิน และปลั๊กอินจำนวนมากเหล่านี้จะพูดอะไรบางอย่างในแชทเมื่อมีบางสิ่งเกิดขึ้น ถ้าเป็นข้อความเดียว วิธีที่ดีที่สุดคือใช้วิธีแก้ที่กล่าวถึงในวิธีแก้ด้านบน แต่เมื่อข้อความเหล่านี้ถูกแบ่งเป็นข้อความเล็ก ๆ หลายข้อความ อีกทางเลือกหนึ่งคือใช้อีเวนต์ `"messagestr"` เพราะมันช่วยให้แยกวิเคราะห์ข้อความหลายบรรทัดได้อย่างง่ายดาย

**ตัวอย่าง:**

ข้อความในแชทมีลักษณะดังนี้:
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
### ฉันจะส่งคำสั่งได้อย่างไร ?

โดยการใช้ `bot.chat()`

**ตัวอย่าง:**
```js
bot.chat('/give @p diamond')
```

### เป็นไปได้ไหมที่จะล็อกอินหลายบัญชีโดยใช้ bot = mineflayer.createbot พร้อมควบคุมแต่ละบัญชีแยกกัน ?

สร้างบอทหลายอินสแตนซ์โดยเรียก createBot แล้วทำสิ่งต่าง ๆ สำหรับแต่ละบอท ดู multiple.js

### ฉันจะทำให้บอททิ้งของในช่องเก็บของ (inventory) ทั้งหมดได้อย่างไร ?

bot.inventory.items() คืนค่าเป็นอาเรย์ (array) ของไอเทมในบอท คุณสามารถใช้ฟังก์ชันแบบ recursive เพื่อวนซ้ำผ่านมันและทิ้งทุกไอเทมโดยใช้ bot.toss() คลิก[ที่นี่](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9)เพื่อดูตัวอย่าง

### ฉันจะตรวจสอบ packet ที่ถูกส่ง/รับได้อย่างไร ?

เปิดใช้งานโหมด debug https://github.com/PrismarineJS/mineflayer#debug

### ฉันต้องการหลีกเลี่ยงการถูกตัดการเชื่อมต่อแม้ในกรณีที่เซิร์ฟเวอร์แล็ก จะทำได้อย่างไร ?

วิธีหนึ่งคือเพิ่มค่าออปชัน [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) (ตั้งค่าใน createBot) ให้สูงขึ้น (ตัวอย่างเช่น `300*1000` ซึ่งคือ 5 นาที แทนค่าเริ่มต้น 30 วินาที) ถ้าคุณยังถูกตัดการเชื่อมต่ออยู่ คุณสามารถเชื่อมต่อใหม่อัตโนมัติได้โดยใช้ตัวอย่างแบบนี้ https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### จะดึง lore / ข้อความของไอเทมได้อย่างไร ?

คุณสามารถใช้พร็อพเพอร์ตี (property) `item.nbt` และแนะนำให้ใช้ไลบรารี `prismarine-nbt` ด้วย เมธอด (method) `nbt.simplify()` อาจมีประโยชน์

**ตัวอย่าง:**
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

### ฉันจะส่งข้อความจากคอนโซลไปยังเซิร์ฟเวอร์ได้อย่างไร ?

คุณสามารถใช้ไลบรารีอย่าง `repl` เพื่ออ่านอินพุตจากคอนโซลและใช้ `bot.chat()` เพื่อส่งมัน คุณสามารถดูตัวอย่างได้[ที่นี่](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### เมื่อสร้างปลั๊กอิน ฉันจะระบุปลั๊กอินอีกตัวเป็น dependency ได้อย่างไร ?

ในฟังก์ชัน `inject()` ของปลั๊กอินคุณ คุณสามารถเรียก `bot.loadPlugin(anotherPlugin)` ได้อย่างปลอดภัยเพื่อให้แน่ใจว่าปลั๊กอินนั้นถูกโหลด ถ้าปลั๊กอินถูกโหลดไปแล้วก่อนหน้านี้ จะไม่มีอะไรเกิดขึ้น

โปรดทราบว่าลำดับการโหลดปลั๊กอินนั้นเป็นแบบไดนามิก ดังนั้นคุณไม่ควรเรียกปลั๊กอินอีกตัวในฟังก์ชัน `inject()` ของคุณ

### ฉันจะใช้ socks5 proxy ได้อย่างไร ?

ในอ็อบเจกต์ (object) ออปชันสำหรับ `mineflayer.createBot(options)` ให้ลบออปชัน `host` ออกจากอ็อบเจกต์ออปชัน ประกาศตัวแปรต่อไปนี้ `PROXY_IP, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, MC_SERVER_ADDRESS, MC_SERVER_PORT` แล้วเพิ่มสิ่งนี้ลงในอ็อบเจกต์ออปชันของคุณ:
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
  `socks` ถูกประกาศด้วย `const socks = require('socks').SocksClient` และใช้แพ็กเกจ[นี้](https://www.npmjs.com/package/socks)
  เซิร์ฟเวอร์บางตัวอาจปฏิเสธการเชื่อมต่อ ถ้าเกิดเหตุการณ์นั้นขึ้น ลองเพิ่ม `fakeHost: MC_SERVER_ADDRESS` ลงในออปชันของ createBot
  
# Error ที่พบบ่อย

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

นี่คือสิ่งที่เกิดขึ้นเมื่อคุณให้เวอร์ชันเซิร์ฟเวอร์ที่ผิดแก่ mineflayer หรือ mineflayer ตรวจจับเวอร์ชันเซิร์ฟเวอร์ผิด

### `TypeError: Cannot read property '?' of undefined`

คุณอาจกำลังพยายามใช้บางอย่างบนอ็อบเจกต์ bot ที่ยังไม่มีอยู่ ลองเรียกคำสั่งนั้นหลังจากอีเวนต์ `spawn`

### `SyntaxError: Unexpected token '?'`

อัปเดตเวอร์ชัน node ของคุณ

### บอทไม่สามารถทำลาย/วางบล็อก (block) หรือเปิดหีบ (chest) ได้

ตรวจสอบว่า spawn protection ไม่ได้ขัดขวางบอทจากการกระทำของมัน
