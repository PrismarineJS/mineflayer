## Câu hỏi thường gặp (FAQ)

Tài liệu Câu hỏi thường gặp này nhằm giúp mọi người giải quyết những vấn đề phổ biến nhất.

### Tôi gặp lỗi (vd. protocol/data) khi bot cố kết nối tới server minecraft

Hãy chắc chắn phiên bản server Minecraft được hỗ trợ (xem readme gốc), nếu không bạn nên thử lại với một trong các [phiên bản đã được mineflayer kiểm thử](../../lib/version.js).

### Tôi gặp lỗi khi cố đăng nhập bằng tài khoản microsoft.

Hãy chắc chắn email bạn nhập vào tùy chọn username trong createBot có thể dùng để đăng nhập vào `minecraft.net` bằng nút 'Login with Microsoft'.
Hãy chắc chắn bạn có tùy chọn `auth: 'microsoft'` trong các tùy chọn của createBot.

Khi gặp lỗi liên quan đến thông tin đăng nhập không hợp lệ hoặc 'Does this account own Minecraft?', hãy thử bỏ trường password trong các tùy chọn của `createBot` rồi thử lại.

### Làm sao để ẩn lỗi?

Dùng `hideErrors: true` trong các tùy chọn của createBot
Bạn cũng có thể thêm các listener sau:
```js
client.on('error', () => {})
client.on('end', () => {})
```

### Tôi không nhận được sự kiện chat trên một server tùy biến, giải quyết thế nào?

Các server Spigot, đặc biệt là một số plugin, dùng định dạng chat tùy biến, bạn cần phân tích nó bằng regex / bộ phân tích tùy biến.
Hãy đọc và chỉnh sửa [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) để nó hoạt động với
plugin chat cụ thể của bạn. Đọc thêm http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat

### Làm sao để thu thập thông tin mà một plugin tùy biến gửi trong chat?

Hầu hết các server minecraft tùy biến đều hỗ trợ plugin, và nhiều plugin sẽ gửi thông báo vào chat khi có chuyện gì đó xảy ra. Nếu chỉ là một tin nhắn, tốt nhất là dùng cách được nêu ở câu hỏi trên, nhưng khi thông báo bị chia thành nhiều tin nhắn nhỏ, một lựa chọn khác là dùng sự kiện `"messagestr"` vì nó cho phép phân tích tin nhắn nhiều dòng một cách dễ dàng.

**Ví dụ:**

tin nhắn trong chat trông như sau:
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
### Làm sao để gửi một lệnh?

Bằng cách dùng `bot.chat()`.

**Ví dụ:**
```js
bot.chat('/give @p diamond')
```

### Có thể đăng nhập nhiều tài khoản bằng bot = mineflayer.createbot và điều khiển từng tài khoản riêng biệt không?

Tạo nhiều instance bot khác nhau bằng cách gọi createBot, rồi cho mỗi bot làm việc riêng, xem multiple.js

### Làm sao để bot vứt toàn bộ túi đồ?

bot.inventory.items() trả về một mảng các vật phẩm của bot. Bạn có thể dùng một hàm đệ quy để duyệt qua chúng và vứt từng vật phẩm bằng bot.toss(). Bấm [vào đây](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) để xem ví dụ

### Làm sao để kiểm tra các gói tin được gửi/nhận?

Bật chế độ gỡ lỗi https://github.com/PrismarineJS/mineflayer#debug

### Tôi muốn tránh bị ngắt kết nối kể cả khi server bị lag, làm thế nào?

Một cách là tăng tùy chọn [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) (đặt trong createBot) lên giá trị cao hơn (ví dụ `300*1000`, tức 5 phút thay vì mặc định 30 giây). Nếu vẫn bị ngắt kết nối, bạn có thể tự động kết nối lại theo kiểu như ví dụ này https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### Làm sao để lấy lore / dòng mô tả của một vật phẩm?

Bạn có thể dùng thuộc tính `item.nbt`. Bạn cũng nên dùng thư viện `prismarine-nbt`. Phương thức `nbt.simplify()` có thể hữu ích.

**Ví dụ:**
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

### Làm sao để gửi tin nhắn từ console tới server?

Bạn có thể dùng một thư viện như `repl` để đọc dữ liệu nhập từ console và dùng `bot.chat()` để gửi đi. Bạn có thể xem ví dụ [tại đây.](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### Khi viết plugin, làm sao để khai báo một plugin khác là phụ thuộc?

Trong hàm `inject()` của plugin, bạn có thể yên tâm gọi `bot.loadPlugin(anotherPlugin)` để đảm bảo plugin đó đã được nạp. Nếu plugin đã được nạp từ trước thì sẽ không có gì xảy ra.

Lưu ý rằng thứ tự nạp plugin là động, vì vậy bạn không bao giờ nên gọi một plugin khác ngay trong hàm `inject()`.

### Làm sao để dùng proxy socks5?

Trong đối tượng tùy chọn của `mineflayer.createBot(options)`, bỏ tùy chọn `host`, khai báo các biến `PROXY_IP, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, MC_SERVER_ADDRESS, MC_SERVER_PORT` và thêm đoạn sau vào đối tượng tùy chọn:
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
  `socks` được khai báo bằng `const socks = require('socks').SocksClient` và dùng gói [này](https://www.npmjs.com/package/socks).
  Một số server có thể từ chối kết nối. Nếu vậy, hãy thử thêm `fakeHost: MC_SERVER_ADDRESS` vào các tùy chọn của createBot.

### Bot bị kick với lỗi "An internal error occurred during your connection" khi được chuyển giữa các server qua proxy Velocity/BungeeCord

Lỗi này ảnh hưởng tới Minecraft 1.20.2+ và đã được sửa trong mineflayer hiện tại: bot không còn gửi gói tin di chuyển trong lúc proxy đưa nó qua giai đoạn cấu hình (configuration phase) của server đích, và resource pack được tự động chấp nhận trong giai đoạn đó. Hãy cập nhật mineflayer lên phiên bản mới nhất.

# Các lỗi thường gặp

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

Lỗi này xảy ra khi bạn truyền sai phiên bản server cho mineflayer, hoặc mineflayer nhận diện sai phiên bản server

### `TypeError: Cannot read property '?' of undefined`

Có thể bạn đang dùng một thứ trên đối tượng bot khi nó chưa tồn tại, hãy thử gọi câu lệnh đó sau sự kiện `spawn`

### `SyntaxError: Unexpected token '?'`

Hãy cập nhật phiên bản node của bạn.

### Bot không thể phá/đặt khối hoặc mở rương

Hãy kiểm tra xem vùng bảo vệ điểm hồi sinh (spawn protection) có đang ngăn bot thực hiện hành động hay không
