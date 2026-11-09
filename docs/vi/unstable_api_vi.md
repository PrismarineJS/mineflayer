<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Mục lục**  *được tạo bằng [DocToc](https://github.com/thlorenz/doctoc)*

- [unstable API : bot._](#unstable-api--bot_)
  - [bot._client](#bot_client)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# unstable API : bot._

Các phương thức và lớp này hữu ích trong một số trường hợp đặc biệt nhưng không ổn định và có thể thay đổi bất cứ lúc nào.

## bot._client

`bot._client` được tạo bằng [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol).
Nó xử lý việc ghi và đọc gói tin.
Hành vi của nó có thể thay đổi (ví dụ với mỗi phiên bản minecraft mới), vì vậy tốt hơn hết là dùng các phương thức của mineflayer nếu có thể.
