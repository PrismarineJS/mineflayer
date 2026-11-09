# Đóng góp

Ban đầu, Mineflayer chủ yếu do [andrewrk](http://github.com/andrewrk) viết,
nhưng từ đó đến nay đã được rất nhiều [người đóng góp](https://github.com/andrewrk/mineflayer/graphs/contributors) cải thiện và sửa lỗi.
Vì vậy, việc nắm được những cách tốt nhất để đóng góp cho mineflayer là rất quan trọng.

## Tổ chức issue

Chúng tôi có 3 nhãn giai đoạn (stage) để sắp xếp các issue:

* Stage 1: vừa được tạo bởi một người mới tham gia dự án, chúng tôi chưa biết nó có đáng được cài đặt / sửa hay không
* Stage 2: ý tưởng triển vọng, nhưng cần suy nghĩ thêm trước khi cài đặt
* Stage 3: ý tưởng đã được đặc tả chính xác, chỉ còn việc viết code

Các liên kết như https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 có thể dùng để lọc bỏ các issue stage 1 nếu bạn đang tìm những việc đã sẵn sàng để đóng góp

## Viết test
Mineflayer có hai loại test:

 * [test nội bộ](../../test/internalTest.js): các test chạy trên một server đơn giản được tạo bằng node-minecraft-protocol
 * [test bên ngoài](../../test/externalTests/): các test chạy trên server vanilla

Mục tiêu của các test này là tự động biết được cái gì hoạt động và cái gì không trong mineflayer, giúp việc làm cho mineflayer hoạt động trở nên dễ dàng hơn.


## Chạy test
Bạn có thể chạy test cho các phiên bản Minecraft khác nhau bằng cờ `-g` với npm run mocha_test. Ví dụ:

```bash
# Chạy tất cả test trên tất cả phiên bản được hỗ trợ
npm run test

# Chạy một test cụ thể trên Minecraft 1.20.4
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*exampleBee"

# Chạy tất cả test chỉ trên phiên bản 1.20.4
npm run mocha_test -- -g "mineflayer_external 1.20.4v"
```


### Viết một test bên ngoài

Để thêm một test bên ngoài, giờ bạn chỉ cần tạo một file trong [test/externalTests](../../test/externalTests)

Ví dụ: [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

File đó cần export một hàm trả về một hàm hoặc một mảng các hàm, nhận tham số là đối tượng bot và một callback done,
 và nên chứa các assert để kiểm tra xem chức năng được test có bị lỗi hay không.


## Tạo plugin bên thứ ba
Mineflayer có thể mở rộng bằng plugin; bất kỳ ai cũng có thể tạo plugin để bổ sung API ở mức cao hơn nữa trên nền Mineflayer.

Nhiều plugin bên thứ ba như vậy đã được [tạo ra](https://github.com/andrewrk/mineflayer#third-party-plugins)

Để tạo một plugin mới, bạn cần:

1. tạo một repo mới
2. trong file index.js, export một hàm init nhận tham số là mineflayer ([ví dụ](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. hàm đó trả về một hàm inject nhận tham số là đối tượng bot ([ví dụ](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. hàm inject đó thêm chức năng vào đối tượng bot ([ví dụ](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

Vì đối tượng mineflayer được truyền vào làm tham số, gói mới không cần phụ thuộc vào mineflayer (không có mineflayer trong phần dependency của package.json)

Xem một [ví dụ đầy đủ](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) tại đây.

## Báo lỗi
Mineflayer hoạt động tốt trong hầu hết các trường hợp, nhưng đôi khi vẫn có lỗi.

Khi phát hiện lỗi, tốt nhất là tạo một issue kèm các thông tin sau:

* bạn muốn làm gì (mục tiêu, viết bằng tiếng Anh)
* bạn đã thử gì (đoạn code)
* điều gì đã xảy ra
* bạn mong đợi điều gì xảy ra

## Code của Mineflayer
Một vài điều cần lưu ý khi gửi Pull Request hoặc tạo commit:

### Xử lý lỗi
Trong hầu hết trường hợp, mineflayer không nên làm bot bị crash. Kể cả khi có gì đó thất bại, bot vẫn có thể đi đường khác để đạt mục tiêu.

Điều đó có nghĩa là chúng ta không nên dùng `throw(new Error("error"))` mà nên dùng quy ước của node.js là truyền lỗi vào callback.

Ví dụ:

```js
function myfunction (param1, callback) {
  // làm gì đó
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // mọi thứ đều chạy tốt
    callback()
  } else {
    callback(new Error('something failed'))
  }
}
```

Xem thêm một ví dụ khác trong [code của mineflayer](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10)

### Cập nhật tài liệu
Mục lục của docs/api.md được tạo bằng doctoc. Sau khi cập nhật file đó, bạn nên chạy doctoc docs/api.md để cập nhật mục lục.

Bản dịch tiếng Việt nằm trong thư mục docs/vi. Khi tài liệu tiếng Anh thay đổi, hãy cập nhật file tương ứng trong docs/vi (với api_vi.md, chạy doctoc docs/vi/api_vi.md sau khi sửa).
