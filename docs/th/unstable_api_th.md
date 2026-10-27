<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [unstable API : bot._](#unstable-api--bot_)
  - [bot._client](#bot_client)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# unstable API : bot._

เมธอดและคลาสเหล่านี้มีประโยชน์ในบางกรณีพิเศษ แต่ยังไม่เสถียรและสามารถเปลี่ยนแปลงได้ทุกเมื่อ

## bot._client

`bot._client` ถูกสร้างขึ้นโดยใช้ [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol)
มันทำหน้าที่เขียนและอ่านแพ็กเก็ต (packet)
พฤติกรรมของมันสามารถเปลี่ยนแปลงได้ (ตัวอย่างเช่นในแต่ละเวอร์ชันใหม่ของ minecraft) ดังนั้นจึงควรใช้เมธอดของ mineflayer หากเป็นไปได้
