# ร่วมพัฒนา

เดิมที Mineflayer ถูกสร้างขึ้นเป็นส่วนใหญ่โดย [andrewrk](http://github.com/andrewrk)
แต่หลังจากนั้นก็ได้รับการปรับปรุงและแก้ไขโดย[ผู้ร่วมพัฒนา](https://github.com/andrewrk/mineflayer/graphs/contributors)หลายคน
นั่นเป็นเหตุผลว่าทำไมจึงสำคัญที่จะต้องรู้วิธีที่ดีที่สุดในการร่วมพัฒนา mineflayer

## การจัดระเบียบ issue

เรามีป้ายกำกับระดับ (stage label) 3 ระดับเพื่อพยายามจัดระเบียบ issue:

* Stage 1: เพิ่งถูกสร้างขึ้นโดยคนที่เพิ่งเข้ามาในโปรเจกต์ เรายังไม่รู้ว่ามันสมควรได้รับการพัฒนา / การแก้ไขหรือไม่
* Stage 2: ไอเดียที่น่าสนใจ แต่ต้องคิดให้รอบคอบมากขึ้นก่อนนำไปพัฒนา
* Stage 3: ไอเดียถูกระบุอย่างชัดเจนแล้ว เหลือแค่การเขียนโค้ดเท่านั้น

ลิงก์อย่างเช่น https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 สามารถใช้กรอง stage 1 ออกได้ ถ้าคุณกำลังมองหาสิ่งที่พร้อมสำหรับการร่วมพัฒนา

## การสร้างเทสต์
Mineflayer มีเทสต์อยู่สองประเภท:

 * [internal tests](test/internalTest.js) : เทสต์ที่ทำกับเซิร์ฟเวอร์ (server) อย่างง่ายที่สร้างด้วย node-minecraft-protocol
 * [external tests](test/externalTests/) : เทสต์ที่ทำกับเซิร์ฟเวอร์แบบ vanilla
 
วัตถุประสงค์ของเทสต์เหล่านี้คือเพื่อให้รู้โดยอัตโนมัติว่าอะไรใช้งานได้และอะไรใช้งานไม่ได้ใน mineflayer เพื่อให้ง่ายขึ้นในการทำให้ mineflayer ทำงานได้


## การรันเทสต์
คุณสามารถรันเทสต์สำหรับ Minecraft เวอร์ชันต่าง ๆ ได้โดยใช้แฟล็ก `-g` กับ npm run mocha_test ตัวอย่างเช่น:

```bash
# รันเทสต์ทั้งหมดในทุกเวอร์ชันที่รองรับ
npm run test

# รันเทสต์ที่ระบุใน Minecraft 1.20.4
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*exampleBee"

# รันเทสต์ทั้งหมดในเวอร์ชัน 1.20.4 เท่านั้น
npm run mocha_test -- -g "mineflayer_external 1.20.4v"
```


### การสร้าง external test

ในการเพิ่ม external test ตอนนี้ คุณเพียงแค่ต้องสร้างไฟล์ใน [test/externalTests](test/externalTests)

ตัวอย่าง: [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

ไฟล์นั้นจำเป็นต้อง export ฟังก์ชันที่คืนค่าเป็นฟังก์ชันหรืออาเรย์ (array) ของฟังก์ชันที่รับพารามิเตอร์เป็นอ็อบเจกต์ (object) bot และ done callback
 มันควรมี assert เพื่อทดสอบว่าฟังก์ชันการทำงานที่ถูกทดสอบล้มเหลวหรือไม่


## การสร้างปลั๊กอินจากบุคคลที่สาม
Mineflayer สามารถเสริมด้วยปลั๊กอิน (plugin) ได้ ใคร ๆ ก็สามารถสร้างปลั๊กอินที่เพิ่ม API ระดับสูงขึ้นไปอีกบน Mineflayer ได้

ปลั๊กอินจากบุคคลที่สามดังกล่าวหลายตัวได้ถูก[สร้างขึ้น](https://github.com/andrewrk/mineflayer#third-party-plugins)แล้ว

ในการสร้างปลั๊กอินใหม่ คุณต้อง:

1. สร้าง repo ใหม่
2. ในไฟล์ index.js ของคุณ ให้ export ฟังก์ชัน init ที่รับ mineflayer เป็นอาร์กิวเมนต์ ([ตัวอย่าง](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. ฟังก์ชันนั้นคืนค่าเป็นฟังก์ชัน inject ที่รับอ็อบเจกต์ bot เป็นอาร์กิวเมนต์ ([ตัวอย่าง](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. ฟังก์ชัน inject นั้นเพิ่มฟังก์ชันการทำงานให้กับอ็อบเจกต์ bot ([ตัวอย่าง](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

เนื่องจากอ็อบเจกต์ mineflayer ถูกส่งเข้ามาเป็นพารามิเตอร์ แพ็กเกจใหม่นั้นจึงไม่จำเป็นต้องขึ้นอยู่กับ mineflayer (ไม่ต้องมี dependency ของ mineflayer ใน package.json)

ดู[ตัวอย่างฉบับเต็ม](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301)ได้ที่นี่

## การรายงานบั๊ก
Mineflayer ทำงานได้ดีกับการใช้งานส่วนใหญ่ แต่บางครั้งก็ยังมีบั๊กอยู่

เมื่อพบบั๊ก ทางที่ดีที่สุดคือการรายงาน issue พร้อมให้ข้อมูลเหล่านี้:

* สิ่งที่คุณต้องการจะทำ (วัตถุประสงค์เป็นภาษาอังกฤษ)
* สิ่งที่คุณลองทำ (โค้ด)
* สิ่งที่เกิดขึ้น
* สิ่งที่คุณคาดหวังว่าจะเกิดขึ้น

## โค้ดของ Mineflayer
สิ่งที่ควรคำนึงถึงเมื่อส่ง Pull Request หรือทำการ commit:

### การจัดการข้อผิดพลาด
ในกรณีส่วนใหญ่ mineflayer ไม่ควรทำให้บอท (bot) แครช แม้ว่าบางอย่างจะล้มเหลว บอทก็สามารถใช้เส้นทางอื่นเพื่อไปให้ถึงวัตถุประสงค์ได้

นั่นหมายความว่าเราไม่ควรใช้ `throw(new Error("error"))` แต่ควรใช้แบบแผนของ node.js คือการส่งข้อผิดพลาดเข้าไปใน callback แทน

ตัวอย่างเช่น: 

```js
function myfunction (param1, callback) {
  // ทำบางอย่าง
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // ทุกอย่างทำงานได้
    callback()
  } else {
    callback(new Error('something failed'))
  }
}
```

ดูตัวอย่างอื่นของสิ่งนี้ได้ใน[โค้ดของ mineflayer](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10)

### การอัปเดตเอกสาร
สารบัญของ docs/api.md ถูกสร้างด้วย doctoc หลังจากอัปเดตไฟล์นั้นแล้ว คุณควรรัน doctoc docs/api.md เพื่ออัปเดตสารบัญ
