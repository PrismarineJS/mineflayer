# Hướng dẫn

**Mục lục**

- [Giới thiệu](#giới-thiệu)
- [Kiến thức cơ bản](#kiến-thức-cơ-bản)
  - [Cơ bản về Javascript](#cơ-bản-về-javascript)
    - [Cài đặt Node](#cài-đặt-node)
    - [Biến trong Javascript](#biến-trong-javascript)
    - [Hiển thị kết quả](#hiển-thị-kết-quả)
    - [Hàm trong Javascript](#hàm-trong-javascript)
    - [Kiểu dữ liệu trong Javascript](#kiểu-dữ-liệu-trong-javascript)
    - [Câu lệnh if](#câu-lệnh-if)
    - [Vòng lặp](#vòng-lặp)
    - [Trình quản lý gói Node](#trình-quản-lý-gói-node)
  - [Tạo bot](#tạo-bot)
    - [Đối tượng trong Javascript](#đối-tượng-trong-javascript)
    - [Đăng nhập](#đăng-nhập)
    - [Tham số dòng lệnh](#tham-số-dòng-lệnh)
  - [Truyền hàm làm tham số](#truyền-hàm-làm-tham-số)
  - [Lắng nghe sự kiện](#lắng-nghe-sự-kiện)
  - [Promise](#promise)
    - [Cách làm đúng và cách làm sai](#cách-làm-đúng-và-cách-làm-sai)
- [Nâng cao](#nâng-cao)
  - [Duyệt qua một đối tượng](#duyệt-qua-một-đối-tượng)
  - [Tạo sự kiện từ chat](#tạo-sự-kiện-từ-chat)
    - [Trả lời Hello Bot](#trả-lời-hello-bot)
    - [Chat tùy biến](#chat-tùy-biến)
- [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
  - [Cách chạy bot trên android](#cách-chạy-bot-trên-android)
    - [Cài đặt Termux](#cài-đặt-termux)
    - [Thiết lập](#thiết-lập)
    - [Khởi động bot](#khởi-động-bot)

## Giới thiệu

Hướng dẫn này sẽ giúp bạn bắt đầu với Mineflayer, kể cả khi bạn chưa biết gì về lập trình.  
Nếu bạn đã biết đôi chút về Node và NPM, bạn có thể chuyển thẳng đến phần [Tạo bot](#tạo-bot), nếu không hãy bắt đầu từ đây.

## Kiến thức cơ bản

Các phần sau đây nói về những khái niệm cơ bản bạn cần biết để bắt đầu sử dụng Mineflayer.

### Cơ bản về Javascript

#### Cài đặt Node

Trong phần này bạn sẽ học những điều cơ bản về Javascript, Node và NPM.

Javascript, thường viết tắt là JS, là một ngôn ngữ lập trình được thiết kế cho web. Nó là thứ tạo nên phần lớn tính tương tác trên web.  
Node.js, thường gọi tắt là Node, cho phép sử dụng Javascript bên ngoài trình duyệt web.

Vì vậy, việc đầu tiên bạn cần làm là cài đặt Node. Bạn có thể tải nó [tại đây](https://nodejs.org/en/download/).  
Sau khi cài xong, mở một cửa sổ dòng lệnh (command prompt, còn gọi là terminal) rồi gõ `node -v`  
Nếu bạn đã cài Node đúng cách, lệnh này sẽ trả về một số phiên bản. Nếu nó báo không tìm thấy lệnh, hãy thử cài lại.

Bây giờ bạn đã có Node và có thể bắt đầu viết code, nhưng chúng ta cần làm thêm 1 việc nữa.  
Javascript có thể được viết bằng bất kỳ trình soạn thảo văn bản cơ bản nào, nhưng sẽ dễ dàng hơn nhiều nếu bạn dùng thứ được gọi là [Môi trường phát triển tích hợp](https://vi.wikipedia.org/wiki/M%C3%B4i_tr%C6%B0%E1%BB%9Dng_ph%C3%A1t_tri%E1%BB%83n_t%C3%ADch_h%E1%BB%A3p)(IDE)  
IDE sẽ giúp bạn viết code vì nó có thể đưa ra gợi ý, hoặc cho bạn biết code có vấn đề tiềm ẩn hay không. Một IDE tốt để bắt đầu là [Visual Studio Code](https://code.visualstudio.com/)(VSCode)  
Sau khi đã cài đặt và thiết lập VSCode, hãy tạo một file mới rồi lưu nó ở đâu đó với tên kết thúc bằng `.js`, ví dụ `bot.js`  
Điều này giúp VSCode biết chúng ta đang làm việc với Javascript và đưa ra gợi ý phù hợp.

#### Biến trong Javascript

Hãy bắt đầu bằng cách gõ đoạn sau:

```js
const test = 5
```

Đoạn này sẽ tạo một biến mới tên là `test` và gán cho nó giá trị `5`  
Biến được dùng để lưu dữ liệu và sử dụng lại sau này trong code.

Giờ hãy lưu file để chúng ta có thể chạy code. Mở lại terminal (hoặc một terminal mới trong VSCode) và di chuyển đến thư mục chứa file. Việc này có thể làm bằng lệnh `cd`, ví dụ: `cd Documents\javascript`  
Khi terminal đã ở cùng thư mục với file Javascript, bạn có thể chạy `node tênfile.js`  
Nếu bạn làm đúng mọi thứ, bạn sẽ không thấy gì cả.  
Ở chương tiếp theo, chúng tôi sẽ chỉ cho bạn cách 'in' thông tin ra terminal.

Nhìn chung, khi khai báo biến, bạn nên dùng từ khóa `const` thay vì từ khóa `let`. Biến được khai báo bằng `const` không thể bị thay đổi sau này và vì vậy là một hằng số.  
Nhờ đó Javascript có thể chạy code của bạn hiệu quả hơn, vì nó biết không cần tính đến việc giá trị của biến đó thay đổi.  
Tất nhiên, nếu bạn muốn một biến có thể thay đổi được thì vẫn phải dùng `let`.

```js
const test = 5
// eslint-disable-next-line
test = 10 // Dòng này không hợp lệ.
```

Dòng thứ hai không hợp lệ vì bạn không thể gán lại giá trị cho biến `test`.

Nếu muốn giúp bản thân và người khác hiểu code tốt hơn, bạn có thể dùng chú thích (comment).  
Chú thích được tạo bằng `//` và mọi thứ sau đó sẽ hoàn toàn bị Javascript bỏ qua.

#### Hiển thị kết quả

Rất nhiều lúc bạn muốn xem giá trị hiện tại của một biến để chắc chắn chương trình đang chạy đúng.  
Bạn làm việc này bằng cách in biến ra terminal.  
Trong Javascript, ta có thể làm điều đó bằng hàm `console.log()`.  

```js
const test = 5

console.log(test)
```

Bây giờ khi lưu và chạy đoạn code này, cuối cùng bạn cũng sẽ thấy được gì đó:

```txt
5
```

#### Hàm trong Javascript

Tiếp theo bạn sẽ học về hàm. Hàm là một đoạn code có thể được dùng nhiều lần ở khắp nơi trong code của bạn.  
Hàm rất hữu ích vì bạn không phải gõ đi gõ lại cùng một thứ.

```js
const addition = (a, b) => {
  return a + b
}

const test1 = addition(5, 10)
const test2 = addition(1, 0)

console.log(test1)
console.log(test2)
```

Ký hiệu `=>` được dùng để định nghĩa một hàm, gọi là toán tử mũi tên (arrow operator).  
Phía trước toán tử mũi tên là danh sách tham số, mọi thứ nằm giữa cặp ngoặc tròn `()` là tham số, được ngăn cách bởi dấu phẩy.  
Tham số là các biến bạn có thể đưa cho hàm để hàm làm việc với chúng.  
Sau toán tử mũi tên là thân hàm, tức là mọi thứ nằm giữa cặp ngoặc nhọn `{}`  
Đây là nơi bạn đặt code của hàm.  
Khi hàm đã hoàn chỉnh, ta gán nó cho một biến để đặt tên cho nó, trong trường hợp này là `addition`  

Như bạn thấy, đoạn code này nhận các tham số `a` và `b` rồi cộng chúng lại với nhau.  
Sau đó hàm sẽ trả về kết quả.  
Khi một hàm được định nghĩa, code trong thân hàm chưa được thực thi. Để chạy hàm, bạn phải gọi nó.  
Bạn có thể gọi hàm bằng cách viết tên hàm, theo sau là cặp ngoặc tròn. Trong trường hợp này là `addition()`  
Tuy nhiên, hàm `addition` cần 2 tham số. Chúng có thể được truyền vào bằng cách đặt bên trong cặp ngoặc tròn, cách nhau bởi dấu phẩy: `addition(1, 2)`  
Khi hàm chạy xong, bạn có thể hình dung lời gọi hàm được thay thế bằng giá trị mà hàm đã trả về. Vậy trong trường hợp này `let test1 = addition(5, 10)` sẽ trở thành `let test1 = result` (Thực tế bạn sẽ không thấy điều này, nhưng nó giúp bạn hiểu khái niệm)

Đôi khi bạn sẽ gặp cách viết sau: `function addition() {}` Cách này có cùng ý nghĩa, dù `() => {}` được ưu tiên hơn. (Nếu thật sự muốn biết tại sao, hãy tìm 'javascript function vs arrow function')

Đoạn code trên sẽ in ra:

```txt
15
1
```

#### Kiểu dữ liệu trong Javascript

Đến giờ chúng ta mới chỉ làm việc với số, nhưng Javascript có thể làm việc với nhiều kiểu biến hơn:

- Chuỗi (string) là một đoạn văn bản có thể chứa nhiều ký tự. Chuỗi được định nghĩa bằng dấu nháy `''`

```js
const string = 'This is a string' // kiểu string
```

- Mảng (array) là một kiểu có thể chứa nhiều biến bên trong nó. Mảng được định nghĩa bằng cặp ngoặc vuông `[]`

```js
const array = [1, 2, 3] // kiểu array
```
- Đối tượng (object) về cơ bản là mảng nâng cao, bạn sẽ học thêm về nó ở phần sau của hướng dẫn này. Đối tượng được định nghĩa bằng cặp ngoặc nhọn `{}`

```js
const object = {} // kiểu object
```

- Hàm cũng là một kiểu riêng.

```js
const adder = (a, b) => { return a + b } // kiểu function
```

- Boolean là kiểu chỉ có thể là `true` hoặc `false`

```js
const boolean = true // kiểu boolean
```

- Khi một thứ chưa (hoặc không) được định nghĩa, kiểu của nó là `undefined`

```js
let nothing // kiểu undefined
const notDefined = undefined // kiểu undefined
```

#### Câu lệnh if

Đôi khi bạn muốn làm những việc khác nhau tùy theo một điều kiện nhất định.  
Điều này có thể thực hiện bằng câu lệnh if.

```js
const name = 'Bob'

if (name === 'Bob') {
  console.log('Your name is Bob')
} else if (name === 'Alice') {
  console.log('Your name is Alice')
} else {
  console.log('Your name is not Bob or Alice')
}
```

Câu lệnh if được tạo bằng từ khóa `if`. Sau đó là một điều kiện nằm giữa cặp ngoặc tròn `()`, theo sau là thân lệnh nằm giữa cặp ngoặc nhọn `{}`
Điều kiện phải là thứ có thể tính ra một giá trị boolean.  
Trong trường hợp này nó dùng toán tử so sánh bằng `===`, cho kết quả `true` nếu giá trị phía trước giống với giá trị phía sau. Ngược lại sẽ là `false`
Nếu điều kiện là `true`, code trong thân lệnh sẽ được thực thi.  
Bạn có thể nối tiếp câu lệnh if với câu lệnh else-if hoặc câu lệnh else.  
Bạn có thể có bao nhiêu câu lệnh else-if tùy thích, nhưng chỉ có 1 câu lệnh if và 1 câu lệnh else.  
Nếu có câu lệnh else, nó chỉ được chạy khi tất cả các câu lệnh nối trước nó đều là `false`

#### Vòng lặp

Vòng lặp được dùng để lặp lại một đoạn code cho đến khi một điều kiện nhất định được thỏa mãn.

```js
let countDown = 5

while (countDown > 0) {
  console.log(countDown)
  countDown = countDown - 1 // Giảm countDown đi 1
}

console.log('Finished!')
```

Đoạn code trên sẽ in ra

```txt
5
4
3
2
1
Finished!
```

Vòng lặp `while` có một điều kiện `()` và một thân `{}`  
Khi code chạy tới vòng lặp, nó sẽ kiểm tra điều kiện. Nếu điều kiện là `true`, code trong thân sẽ được thực thi.  
Khi chạy hết thân vòng lặp, điều kiện sẽ được kiểm tra lại, và nếu là `true` thì thân vòng lặp lại được thực thi.  
Điều này sẽ tiếp diễn chừng nào điều kiện vẫn còn `true`  
Mỗi vòng lặp, đoạn code này in ra giá trị `countDown` hiện tại, rồi giảm nó đi 1.  
Sau vòng lặp thứ 5, điều kiện `0 > 0` sẽ là `false`, và code sẽ chạy tiếp phần phía sau.

Vòng lặp `for` cũng thường được dùng, và hơi khác so với vòng lặp `while`.  

```js
for (let countDown = 5; countDown > 0; countDown = countDown - 1) {
  console.log(countDown)
}
```

Thay vì chỉ có một điều kiện, vòng lặp for có 3 phần khác nhau  
Các phần này được ngăn cách bởi dấu chấm phẩy.  
Phần đầu tiên `let countDown = 5` chỉ được thực thi một lần, khi bắt đầu vòng lặp.  
Phần thứ hai `countDown > 0` là điều kiện, giống như ở vòng lặp while.  
Phần thứ ba `countDown = countDown - 1` được thực thi sau mỗi vòng lặp.

Nếu bạn muốn làm gì đó với từng phần tử trong một mảng, vòng lặp `for of` có thể hữu ích.  

```js
const array = [1, 2, 3]

for (const item of array) {
  console.log(item)
}
```

Vòng lặp `for of` cần có một biến đứng trước `of`, đây là biến dùng để truy cập phần tử hiện tại.  
Biến đứng sau `of` phải là thứ chứa các biến khác. Phần lớn là mảng, nhưng cũng có thể là một số đối tượng.  
Vòng lặp sẽ thực thi thân cho từng phần tử trong `array`, và mỗi vòng lặp biến `item` sẽ là phần tử hiện tại của `array`

#### Trình quản lý gói Node

Điều cuối cùng bạn cần biết là cách dùng [Node Package Manager](https://www.npmjs.com/) (trình quản lý gói của Node).  
NPM được cài tự động khi bạn cài Node.  
NPM được dùng để tải các gói hữu ích do người khác tạo ra, có thể làm những việc có ích cho bạn.  
Bạn có thể tìm gói trên [trang web của họ](https://www.npmjs.com/), rồi cài đặt bằng lệnh `npm install` trong terminal.  
Ví dụ, để cài Mineflayer, chạy `npm install mineflayer`  

Sau đó, Node có thể truy cập các module đã cài bằng hàm `require()`.

```js
const mineflayer = require('mineflayer')
```

Sau bước này, biến `mineflayer` có thể được dùng để truy cập mọi tính năng của Mineflayer.

### Tạo bot

Giờ bạn đã biết những điều cơ bản về Javascript, Node và NPM, bạn đã sẵn sàng tạo con bot đầu tiên!  
Nếu bạn chưa hiểu thuật ngữ nào ở trên, hãy quay lại [phần trước](#cơ-bản-về-javascript)

Dưới đây là phần tối thiểu cần thiết để tạo một bot Mineflayer.

```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot()
```

Nếu chạy ví dụ này, bạn sẽ thấy chương trình không dừng lại. Nếu muốn dừng chương trình đang chạy, nhấn `Ctrl` + `c`  
Tuy nhiên, con bot này chưa hữu ích lắm, vì mặc định nó sẽ kết nối tới một server Minecraft đang chạy trên máy của bạn với cổng 25565.  
Nếu muốn chọn server mà bot sẽ kết nối tới, bạn phải truyền vào một vài tùy chọn.


```js
const mineflayer = require('mineflayer')

const options = {
  host: 'localhost', // Đổi thành ip bạn muốn.
  port: 25565 // Đổi thành port bạn muốn.
}

const bot = mineflayer.createBot(options)
```

#### Đối tượng trong Javascript

Cặp ngoặc nhọn `{}` được dùng để tạo một đối tượng.  
Đối tượng chứa thứ được gọi là cặp khóa-giá trị (key-value).  
Một cặp khóa-giá trị gồm một dấu hai chấm `:`, khóa đứng trước dấu hai chấm và giá trị của khóa đó đứng sau dấu hai chấm.  
Sau đó có thể dùng khóa để lấy ra giá trị của nó.  
Bạn có thể có nhiều cặp khóa-giá trị bằng cách ngăn cách chúng bằng dấu phẩy.

```js
const object = {
  number: 10,
  another: 5
}

console.log(object.number) // Dòng này sẽ in ra giá trị 10
```

Khái niệm này thường được dùng để tạo thứ gọi là 'tham số có tên' (named parameters)  
Ưu điểm của cách này là bạn không phải dùng tất cả các tùy chọn có sẵn, và thứ tự của chúng không quan trọng.  
Giá trị có thể là bất cứ thứ gì, kể cả một đối tượng khác. Nếu giá trị là một hàm, hàm đó thường được gọi là phương thức (method) của đối tượng.  
Bạn cũng có thể tạo đối tượng ngay trên một dòng.

```js
const bot = mineflayer.createBot({ host: 'localhost', port: 25565 })
```

#### Đăng nhập

Nếu không có tham số nào, bot sẽ có tên `Player` và chỉ có thể đăng nhập vào server offline. (Server crack và open-to-lan)  
Nếu bạn truyền tùy chọn `username` cho `createBot`, bot sẽ đăng nhập với username đó. (Vẫn chỉ với server offline)  
Để đăng nhập vào một tài khoản cụ thể, bạn phải cung cấp cả `username` và `password`

```js
const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Player',
  password: 'password'
})
```

#### Tham số dòng lệnh

Nếu ai đó thích bot của bạn và muốn dùng nó, nhưng lại dùng trên một server khác và với một tài khoản khác thì sao?  
Điều đó có nghĩa là ai cũng phải tự sửa địa chỉ server và thông tin đăng nhập theo ý mình. (Và tất nhiên chia sẻ mật khẩu của bạn cũng là một ý tưởng tồi)  
Để giải quyết việc này, nhiều người dùng tham số dòng lệnh.

```js
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4],
  password: process.argv[5]
})
```

Như bạn thấy, không còn dữ liệu nhạy cảm nào trong code nữa! Nhưng giờ thì chạy nó thế nào?  
Bây giờ, thay vì khởi động chương trình chỉ với `node tênfile.js`, bạn sẽ khởi động bằng `node tênfile.js host port username password`  
Node sẽ tự động tách toàn bộ dòng lệnh thành một mảng, ngăn cách bởi dấu cách.  
Mảng này là `process.argv`  
Dữ liệu trong mảng có thể được truy cập bằng chỉ số (index) của từng phần tử. Chỉ số luôn bắt đầu từ 0, vì vậy phần tử đầu tiên được truy cập bằng `[0]` và trong trường hợp này sẽ là `node`, v.v.

| | Phần tử thứ nhất | Phần tử thứ hai | Phần tử thứ ba | Phần tử thứ tư | Phần tử thứ năm | Phần tử thứ sáu |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| Giá trị | `node` | `filename.js` | `host` | `port` | `username` | `password` |
| Chỉ số | `[0]` | `[1]` | `[2]` | `[3]` | `[4]` | `[5]`

### Truyền hàm làm tham số

Không chỉ các biến cơ bản như số và chuỗi mới có thể được truyền làm đối số.  
Hàm cũng có thể được truyền đi như một biến.

```js
const welcome = () => {
  bot.chat('hi!')
}

bot.once('spawn', welcome)
```

Như bạn thấy, phương thức `bot.once()` nhận 2 tham số.  
Tham số thứ nhất là tên sự kiện, tham số thứ hai là hàm sẽ được gọi khi sự kiện đó xảy ra.  
Hãy nhớ, khi truyền một hàm, chỉ dùng tên hàm và không có cặp ngoặc tròn `()`

`bot.chat()` là phương thức để gửi tin nhắn vào chat.

Bạn cũng có thể rút gọn đoạn code này bằng một hàm ẩn danh (anonymous function).  
Hàm ẩn danh không có tên, và được tạo ngay tại vị trí lẽ ra đặt tên hàm.  
Chúng vẫn phải có danh sách tham số `()` và thân hàm `{}`, kể cả khi không dùng đến.

```js
bot.once('spawn', () => {
  bot.chat('hi!')
})
```

### Lắng nghe sự kiện

Đối tượng bot có rất nhiều [sự kiện](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=events) hữu ích.
Bạn có thể lắng nghe một sự kiện bằng phương thức `bot.on()` hoặc `bot.once()` của đối tượng bot, chúng nhận tên sự kiện và một hàm.
Để gỡ bỏ một listener cụ thể, bạn có thể dùng phương thức `bot.removeListener()`.

- `bot.on(eventName, listener)`
  Thực thi hàm `listener` mỗi lần sự kiện có tên `eventName` được kích hoạt.
- `bot.once(eventName, listener)`
  Thực thi hàm `listener` chỉ một lần, vào lần đầu tiên sự kiện có tên `eventName` được kích hoạt.
- `bot.removeListener(eventName, listener)`
  Gỡ bỏ `listener` đã chỉ định khỏi sự kiện có tên `eventName`. Để dùng được phương thức này, bạn cần định nghĩa hàm bằng `function myNamedFunc() {}` hoặc gán hàm vào một biến bằng `const myNamedFunc = () => {}`. Sau đó bạn có thể dùng `myNamedFunc` làm đối số listener.

Không chỉ đối tượng bot, mà các đối tượng [`Chest`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=mineflayerchest), [`Furnace`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=mineflayerfurnace), [`Dispenser`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=mineflayerdispenser), [`EnchantmentTable`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=mineflayerenchantmenttable), [`Villager`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=mineflayervillager) cũng có các sự kiện riêng của chúng!

### Promise

[Promise](https://nodejs.dev/learn/understanding-javascript-promises) là một hàm mà bạn có thể dùng từ khóa `await` để chờ cho đến khi công việc của nó hoàn tất. (bạn có thể bỏ await nếu không muốn chờ kết quả)

```js
async function consume (bot) {
  try {
    await bot.consume()
    console.log('Finished consuming')
  } catch (err) {
    console.log(error)
  }
}
```

Đoạn code trên sẽ thử ăn/uống thứ mà bot đang cầm.  
Khi việc ăn/uống kết thúc, dòng code tiếp theo sau `await` sẽ được chạy.  
Sau đó chúng ta có thể làm những việc khác muốn làm tiếp theo.  
Nếu có lỗi xảy ra, khối `catch` sẽ được chạy.

#### Cách làm đúng và cách làm sai

Dưới đây là ví dụ về một bot sẽ chế tạo gỗ sồi (oak log) thành ván gỗ sồi (oak planks) rồi thành que (stick).

Cách làm sai ❌:

```js
function craft (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id ?? mcData.itemsByName.planks.id)[0] // Lấy công thức đầu tiên cho ván gỗ sồi
  bot.craft(plankRecipe, 1) // ❌ bắt đầu chế tạo ván gỗ sồi.

  const stickRecipe = bot.recipesFor(mcData.itemsByName.sticks.id)[0] // Lấy công thức đầu tiên cho que
  bot.craft(stickRecipe, 1) // ❌ bắt đầu chế tạo que.
}
```

Cách làm đúng với promise ✔️:

```js
async function craft (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id ?? mcData.itemsByName.planks.id)[0]
  await bot.craft(plankRecipe, 1, null)
  const stickRecipe = bot.recipesFor(mcData.itemsByName.sticks.id)[0]
  await bot.craft(stickRecipe, 1, null)
  bot.chat('Crafting Sticks finished')
}
```

Cách làm sai là sai vì khi `bot.craft()` được gọi, code sẽ tiếp tục chạy xuống dưới trong khi bot đang chế tạo.  
Khi code chạy tới `bot.craft()` thứ hai, lần chế tạo đầu tiên có lẽ vẫn chưa xong, nghĩa là nguyên liệu cần thiết vẫn chưa có.  
Dùng promise có thể khắc phục điều này vì code phía sau chỉ được chạy sau khi `bot.craft()` đã hoàn tất.

Xem thêm về phương thức [bot.craft()](api_vi.md#botcraftrecipe-count-craftingtable).

## Nâng cao

Các khái niệm sau đây không bắt buộc để tạo một bot Mineflayer, nhưng chúng có thể hữu ích để hiểu và tạo ra những bot nâng cao hơn.  
Chúng tôi giả định bạn đã hiểu phần hướng dẫn [Kiến thức cơ bản](#kiến-thức-cơ-bản).

### Duyệt qua một đối tượng

Vòng lặp `for of` được mô tả trong chương [vòng lặp](#vòng-lặp) cũng có thể được dùng để duyệt qua một đối tượng.

Giả sử ta có đối tượng sau:

```js
const obj = {
  a: 1,
  b: 2,
  c: 3
}
```

Đoạn sau sẽ duyệt qua tất cả các giá trị của đối tượng.

```js
for (const value of Object.values(obj)) {
  console.log(value)
}
```

```txt
1
2
3
```

Đoạn này sẽ duyệt qua tất cả các khóa của đối tượng.

```js
for (const key of Object.keys(obj)) {
  console.log(key)
}
```

```txt
a
b
c
```

Bạn cũng có thể duyệt qua khóa và giá trị cùng lúc. Bạn sẽ phải phân rã (destructure) các biến trước, được giải thích [tại đây.](https://developer.mozilla.org/vi/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

```js
for (const [key, value] of Object.entries(obj)) {
  console.log(key + ', ' + value)
}
```

```txt
a, 1
b, 2
c, 3
```

Những vòng lặp này khả thi vì `Object.values(obj)` và `Object.keys(obj)` lần lượt trả về một mảng các giá trị và một mảng các khóa của đối tượng.  
`Object.entries(obj)` trả về một mảng mà mỗi phần tử là một mảng gồm 2 phần tử: một khóa và giá trị tương ứng của nó.  
Điều quan trọng cần biết là, không giống các hàm `Object.values()` và `Object.keys()`, hàm `Object.entries()` không đảm bảo thứ tự giống với thứ tự khi đối tượng được định nghĩa.

Ngoài ra còn có vòng lặp `for in`. Tuy nhiên, phần lớn thời gian bạn sẽ muốn dùng `for of` thay vì `for in` vì giữa chúng có những khác biệt quan trọng.  
Vòng lặp `for in` duyệt qua các khóa của đối tượng thay vì các giá trị. (Là chỉ số nếu đó là một mảng)
Tuy nhiên, nó không chỉ duyệt qua các khóa của riêng đối tượng, mà còn cả các khóa từ đối tượng khác mà nó 'kế thừa', điều này có thể gây nhầm lẫn hoặc không mong muốn. Xem thêm [tại đây.](https://developer.mozilla.org/vi/docs/Web/JavaScript/Reference/Statements/for...in)
Nhìn chung, bạn sẽ muốn dùng `for of` thay vì `for in`, vì vậy đừng nhầm lẫn giữa hai loại này.

### Tạo sự kiện từ chat

Bạn có thể tạo sự kiện riêng từ chat bằng phương thức [`bot.addChatPattern()`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=botaddchatpatternname-pattern-chatpatternoptions). Rất hữu ích cho các server Bukkit, nơi định dạng chat thay đổi rất nhiều.
Phương thức [`bot.addChatPattern()`](http://prismarinejs.github.io/mineflayer/#/vi/api_vi?id=botaddchatpatternname-pattern-chatpatternoptions) nhận ba đối số:

- `pattern` - biểu thức chính quy (regex) để khớp với chat
- `chatType` - sự kiện mà bot phát ra khi pattern khớp. vd. "chat" hoặc "whisper"
- `description` - Không bắt buộc, mô tả pattern dùng để làm gì

Bạn có thể thêm [Nhóm và Khoảng](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) (Groups and Ranges) vào `pattern`, khi đó listener sẽ lần lượt trải các nhóm bắt được (captured groups) thành các đối số cho callback của bạn.

Đọc thêm về [biểu thức chính quy](https://vi.wikipedia.org/wiki/Bi%E1%BB%83u_th%E1%BB%A9c_ch%C3%ADnh_quy).

Ví dụ:

#### Trả lời Hello Bot

Ở đây chúng ta tạo một bot trả lời khi người chơi khác nói 'hello'.

```js
bot.addChatPattern(
  'hello',
  /(helo|hello|Hello)/,
  'Someone says hello'
)

const hi = () => {
  bot.chat('Hi!')
}

bot.on('chat:hello', hi)
```

#### Chat tùy biến

Tạo một sự kiện dựa trên định dạng chat tùy biến.  
Ví dụ chat tùy biến:

```txt
[Player] Player1 > Hello
[Admin] Alex > Hi
[Player] Player2 > Help me, im stuck
[Mod] Jim > On my way
```

```js
bot.addChatPattern(
  /^\[(.+)\] (\S+) > (.+)$/,
  'my_chat_event',
  'Custom chat event'
)

const logger = (rank, username, message) => {
  console.log(`${username} said ${message}`)
}

bot.on('my_chat_event', logger)
```

Giải thích về regex `^\[(.+)\] (\S+) > (.+)$` có thể xem [tại đây](https://regex101.com/r/VDUrDC/2).

## Câu hỏi thường gặp

### Cách chạy bot trên android

Đây là hướng dẫn nhanh để chạy bot trên thiết bị android bằng [Termux](https://termux.com/).

#### Cài đặt Termux

Cài đặt [Termux](https://termux.com/) và mở nó lên.

#### Thiết lập

Cài đặt `Node.js`:

```bash
pkg update -y
pkg install nodejs -y
```

❗️ Cấp quyền Bộ nhớ (Storage) cho Termux trong phần cài đặt ứng dụng.
Tạo thư mục mới trong bộ nhớ trong:

```bash
cd /sdcard
mkdir my_scripts
cd my_scripts
```

Cài đặt `mineflayer`:

```bash
npm install mineflayer
```

Bây giờ bạn có thể sao chép / lưu tất cả script của mình vào thư mục `my_scripts` trong Bộ nhớ trong.

#### Khởi động bot

Để khởi động bot, chạy Node với tên script của bạn.

```bash
node script_name.js
```

❗️ Mỗi lần mở Termux, bạn phải chuyển thư mục làm việc (cwd) sang `/sdcard/my_scripts` trước khi khởi động bot:

```bash
cd /sdcard/my_scripts
```
