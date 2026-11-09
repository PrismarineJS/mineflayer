# Mineflayer

[![NPM version](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Try it on gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Open In Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) | <sub>BR</sub> [Português](../br/README_BR.md) | <sub>VI</sub> [Tiếng Việt](README_VI.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|-------------------------|--------------------|--------------------|

Tạo bot Minecraft bằng một [API](api_vi.md) JavaScript mạnh mẽ, ổn định và ở mức cao, cũng có thể dùng từ Python.

Lần đầu dùng Node.js? Bạn nên bắt đầu với [hướng dẫn](tutorial_vi.md). Biết Python? Hãy xem một vài [ví dụ Python](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python) và dùng thử [Mineflayer trên Google Colab](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb).

## Tính năng

 * Hỗ trợ Minecraft từ 1.8 đến 26.1 (1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21, 1.21.9, 1.21.11, 26.1)
 * Nhận biết và theo dõi thực thể (entity).
 * Nhận biết khối (block). Bạn có thể truy vấn thế giới xung quanh. Chỉ mất vài mili giây để tìm bất kỳ khối nào.
 * Vật lý và di chuyển - xử lý mọi hộp va chạm (bounding box).
 * Tấn công thực thể và sử dụng phương tiện.
 * Quản lý túi đồ (inventory).
 * Chế tạo, rương, máy phân phát (dispenser), bàn phù phép.
 * Đào và xây dựng.
 * Nhiều thứ khác như biết lượng máu của bot và trời có đang mưa hay không.
 * Kích hoạt khối và sử dụng vật phẩm.
 * Chat.

### Lộ trình phát triển

 Xem [trang này](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) để biết các dự án chúng tôi đang thực hiện.

## Cài đặt

Đầu tiên hãy cài Node.js >= 18 từ [nodejs.org](https://nodejs.org/), sau đó chạy:

```bash
npm install mineflayer
```

Để cập nhật mineflayer (hoặc bất kỳ gói Node.js nào) cùng các phụ thuộc của nó, dùng
```bash
npm update
```

## Tài liệu

| liên kết | mô tả |
|---|---|
|[hướng dẫn](tutorial_vi.md) | Bắt đầu với Node.js và mineflayer |
| [FAQ_VI.md](FAQ_VI.md) | Có câu hỏi? Hãy xem ở đây trước |
| **[api_vi.md](api_vi.md)** <br/>[unstable_api_vi.md](unstable_api_vi.md) | Tài liệu tham khảo API đầy đủ |
| [history.md](../history.md) | Nhật ký thay đổi của mineflayer (tiếng Anh) |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Xem tất cả các ví dụ của mineflayer |


## Đóng góp

Vui lòng đọc [CONTRIBUTING_VI.md](CONTRIBUTING_VI.md) và [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Cách sử dụng

**Video**

Bạn có thể xem video hướng dẫn quá trình thiết lập cơ bản cho một bot [tại đây.](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Nếu muốn tìm hiểu thêm, có thêm nhiều video hướng dẫn [ở đây,](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) và mã nguồn tương ứng của các bot đó [ở đây.](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Bắt đầu**

Nếu không chỉ định phiên bản, phiên bản của server sẽ được tự động đoán.
Nếu không chỉ định kiểu xác thực (auth), kiểu xác thực mojang sẽ được đoán.

### Ví dụ Echo (lặp lại tin nhắn)
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // ip của server minecraft
  username: 'Bot', // tên người dùng khi auth là `offline`, nếu không thì là định danh duy nhất của tài khoản. Đổi giá trị này nếu muốn đổi tài khoản
  auth: 'microsoft' // với server ở chế độ offline, bạn có thể đặt giá trị này là 'offline'
  // port: 25565,              // đặt nếu cần port khác 25565
  // version: false,           // chỉ đặt nếu cần một phiên bản hoặc snapshot cụ thể (vd: "1.8.9" hoặc "1.16.5"), nếu không sẽ được đặt tự động
  // password: '12345678'      // đặt nếu muốn dùng xác thực bằng mật khẩu (có thể không ổn định). Khi đặt, `username` phải là email
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Ghi log lỗi và lý do bị kick:
bot.on('kicked', console.log)
bot.on('error', console.log)
```

Nếu `auth` được đặt là `microsoft`, bạn sẽ được yêu cầu đăng nhập vào microsoft.com bằng một mã trên trình duyệt. Sau khi đăng nhập trên trình duyệt,
bot sẽ tự động lấy và lưu đệm (cache) token xác thực (theo username bạn đã chỉ định) để bạn không phải đăng nhập lại.

Để đổi tài khoản, hãy thay đổi `username` được truyền vào. Mặc định, token được lưu trong thư mục .minecraft của người dùng, hoặc nếu có chỉ định `profilesFolder` thì sẽ được lưu ở đó.
Để biết thêm về các tùy chọn của bot, xem [tài liệu API](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) của node-minecraft-protocol.

#### Kết nối tới Realm

Để vào một Realm mà tài khoản Minecraft của bạn đã được mời, bạn có thể truyền vào đối tượng `realms` với một hàm chọn như bên dưới.

```js
const client = mineflayer.createBot({
  username: 'email@example.com', // tên người dùng minecraft
  realms: {
    // Hàm này được gọi với một mảng các Realm mà tài khoản có thể vào. Nó cần trả về Realm muốn vào.
    pickRealm: (realms) => realms[0]
  },
  auth: 'microsoft'
})
```

### Xem bot của bạn đang làm gì

Nhờ dự án [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), bạn có thể xem bot đang làm gì trong một cửa sổ trình duyệt.
Chỉ cần chạy `npm install prismarine-viewer` và thêm đoạn sau vào bot:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port là cổng của trình xem; nếu firstPerson là false, bạn sẽ có góc nhìn từ trên cao
})
```
Và bạn sẽ có một góc nhìn *trực tiếp* trông như thế này:

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### Thêm ví dụ

| ví dụ | mô tả |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Hiển thị thế giới bot nhìn thấy trong trình duyệt |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | Cho bot tự động đi tới bất kỳ vị trí nào |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Sử dụng rương, lò nung, máy phân phát, bàn phù phép |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Học cách tạo một bot đơn giản có thể đào khối |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Kết nối bot discord với bot mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Học cách di chuyển, nhảy, cưỡi phương tiện, tấn công thực thể ở gần |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Hiển thị chat của bot với đầy đủ màu sắc ngay trong terminal |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Cho bot canh giữ một khu vực xác định khỏi các mob ở gần |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Thêm một file văn bản chứa danh sách tài khoản và cho tất cả cùng đăng nhập |

Và còn nhiều ví dụ khác trong thư mục [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples).

### Các module

Phần lớn công việc phát triển đang diễn ra trong các gói npm nhỏ mà mineflayer sử dụng.

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack, trích từ ["how I write modules"](https://web.archive.org/web/20220301041352/https://gist.github.com/substack/5075355) (2013)

(Tạm dịch: Khi một ứng dụng được làm tốt, nó chỉ còn là phần cặn đặc thù của riêng ứng dụng, thứ không dễ trừu tượng hóa. Mọi thành phần tốt và tái sử dụng được đều "bay" lên github và npm, nơi mọi người có thể cùng nhau đóng góp cho lợi ích chung.)

#### Các module

Đây là các module chính tạo nên mineflayer:

| module | mô tả |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Phân tích và tuần tự hóa các gói tin minecraft, cùng với xác thực và mã hóa.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Module độc lập với ngôn ngữ, cung cấp dữ liệu minecraft cho client, server và thư viện minecraft.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Cung cấp engine vật lý cho các thực thể minecraft
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Một lớp lưu dữ liệu chunk cho Minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | Toán vector 3 chiều với bộ unit test chặt chẽ
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Biểu diễn một khối minecraft cùng dữ liệu liên quan
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Bộ phân tích tin nhắn chat minecraft (tách ra từ mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Thư viện Node.js để làm việc với hệ thống xác thực của Mojang, gọi là Yggdrasil
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | Phần cài đặt lõi của thế giới cho prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Biểu diễn các cửa sổ (window) của minecraft
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Biểu diễn một vật phẩm minecraft cùng dữ liệu liên quan
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Bộ phân tích NBT cho node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Biểu diễn công thức chế tạo của minecraft
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Biểu diễn một quần xã sinh vật (biome) minecraft cùng dữ liệu liên quan
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Biểu diễn một thực thể minecraft


### Gỡ lỗi (debug)

Bạn có thể bật một số thông tin gỡ lỗi giao thức bằng biến môi trường `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

Trên windows:
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Plugin bên thứ ba

Mineflayer có thể mở rộng bằng plugin; bất kỳ ai cũng có thể tạo plugin để bổ sung
API ở mức cao hơn nữa trên nền Mineflayer.

Những plugin được cập nhật thường xuyên và hữu ích nhất:

 * [minecraft-mcp-server](https://github.com/yuniko-software/minecraft-mcp-server) Một MCP server cho mineflayer, cho phép dùng mineflayer từ một LLM
 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - tìm đường A* nâng cao với rất nhiều tính năng có thể cấu hình
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - trình xem chunk đơn giản trên web
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - trình xem túi đồ trên web
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - API máy trạng thái cho các hành vi bot phức tạp hơn
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - tự động quản lý giáp
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Bảng điều khiển giao diện cho bot mineflayer
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - API dễ dùng cho PVP và PVE cơ bản.
 * [Auto Eat](https://github.com/link-discord/mineflayer-auto-eat) - Tự động ăn.
 * [Auto Crystal](https://github.com/link-discord/mineflayer-autocrystal) - Tự động đặt và phá end crystal.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - Tiện ích tự động chọn công cụ/vũ khí với API mức cao.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - Tiện ích tự ngắm khi bắn cung.
 * [GUI](https://github.com/firejoust/mineflayer-GUI) - Tương tác với các cửa sổ GUI lồng nhau bằng async/await
 * [Projectile](https://github.com/firejoust/mineflayer-projectile) - Tính góc bắn cần thiết cho vật phóng
 * [Movement](https://github.com/firejoust/mineflayer-movement) - Di chuyển mượt mà và chân thực như người chơi, phù hợp nhất cho PvP
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - API thu thập khối nhanh và đơn giản.

 Ngoài ra hãy xem thêm:

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - giao diện radar trên web
   dùng canvas và socket.io. [Video demo trên YouTube](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - xác thực bot qua chat
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - xác định ai và cái gì gây sát thương cho một thực thể khác
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - lấy tps hiện tại (tps đã xử lý)
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - chụp ảnh toàn cảnh (Panorama) thế giới của bạn
 * [player-death-event](https://github.com/tuanzisama/mineflayer-death-event) - phát sự kiện người chơi chết trong Mineflayer.

## Các dự án dùng Mineflayer

 * [Voyager](https://github.com/MineDojo/Voyager) Một agent hiện thân (embodied) mở dùng mô hình ngôn ngữ lớn
 * [mindcraft](https://github.com/kolbytn/mindcraft) Thư viện để dùng mineflayer với LLM
 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - xây cầu thang xoắn ốc](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - sao chép một công trình](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - trực quan hóa những gì
   bot đang làm bằng voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) - ghi lại hoạt động của người chơi lên một API trực tuyến
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (phiên bản mã nguồn mở cuối cùng, do AlexKvazos xây dựng) - Client chat Minecraft trên web
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Bot dựa trên plugin với GUI gọn gàng. Làm bằng Node-Webkit.
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Bot Minecraft dùng thuật toán di truyền, xem [các video youtube của nó](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) - Cầu nối Minecraft - Telegram, xây dựng trên mineflayer và telegraf.
 * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - Xây các schematic minecraft trong chế độ sinh tồn, giữ nguyên hướng
 * [SilkePilon/OpenDeliveryBot](https://github.com/SilkePilon/OpenDeliveryBot) - Bot Minecraft viết bằng python để giao vật phẩm từ nơi này đến nơi khác.
 * [và hàng trăm dự án khác](https://github.com/PrismarineJS/mineflayer/network/dependents) - Tất cả các dự án mà github phát hiện đang dùng mineflayer


## Kiểm thử

### Kiểm thử toàn bộ

Chỉ cần chạy:

```bash
npm test
```

### Kiểm thử một phiên bản cụ thể
Chạy

```bash
npm run mocha_test -- -g <version>
```

trong đó `<version>` là một phiên bản minecraft như `1.12`, `1.15.2`...

### Kiểm thử một bài test cụ thể
Chạy

```bash
npm run mocha_test -- -g <test_name>
```

trong đó `<test_name>` là tên của bài test như `bed`, `useChests`, `rayTrace`...

### Ví dụ

```bash
npm run mocha_test -- -g "1.18.1.*BlockFinder"
```
để chạy bài test block finder cho phiên bản 1.18.1

## Giấy phép

[MIT](/LICENSE)
