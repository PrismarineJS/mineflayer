# Mineflayer

[![NPM version](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Try it on gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Open In Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) | <sub>BR</sub> [Portuguese](../br/README_BR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

使用强大、稳定、高级的 JavaScript [API](../api.md) 来开发 Minecraft 机器人，同时支持 Python。

第一次使用 node.js ？你可以先来看看 [使用教程](../tutorial.md) 。了解过 Python？可以看看这些 [Python 实例](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python)，同时你也可以[在谷歌 Colab 中运行 Mineflayer](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb) 来体验一下。

## 特点

 * 目前支持 Minecraft 1.8 至 26.1 版本(1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21, 1.21.9, 1.21.11, 26.1) <!--version-->
 * 实体感知与追踪
 * 方块感知，你可以在几毫秒内查找到机器人周围的任何方块
 * 物理和运动引擎 - 支持所有的碰撞箱
 * 攻击实体，使用交通工具
 * 背包管理
 * 使用工作台、箱子、发射器、附魔台
 * 挖掘和建造
 * 多种信息接口，比如查看自身血量或当前是否下雨
 * 激活方块或使用物品
 * 进行聊天

### 路线图

 [点这里](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) 看看目前我们有哪些实用的项目

## 安装

首先，从 [nodejs.org](https://nodejs.org/) 安装 nodejs（版本要求 >= 22），

然后在你创建的机器人项目目录中，使用命令行运行：

```bash
npm install mineflayer
```

要更新 mineflayer（或任何 Node.js）套件及其相依项目，请使用： 
```bash
npm update
```

## 文档

| 链接 | 描述 |
|---|---|
| [使用教程](../tutorial.md) | node.js 和 mineflayer 入门 |
| [FAQ](../FAQ.md) | 在使用过程中遇到了问题？先看看这个文档 |
| **[api](../api.md)** <br/>[不稳定的api](../unstable_api.md) | 完整的接口参考文档 |
| [更新日志](../history.md) | mineflayer 的更新日志 |
| [示例/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | 我们为你准备的 mineflayer 使用实例 |

## 参与贡献

请参阅 [为本项目贡献](../CONTRIBUTING.md)，以及[为 Prismarine 贡献](https://github.com/PrismarineJS/prismarine-contribute)

## 如何使用

**视频**（Youtube）

[这里](https://www.youtube.com/watch?v=ltWosy4Z0Kw) 是一个解释bot基本设置过程的教程视频。

如果你想了解更多，更多的视频教程可以在 [这里](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) 找到，视频的相应的源码在 [这里](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials) 。

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**开始使用**

如果没有指定特定版本，将自动判断服务器使用的版本并使用。  
如果没有指定登录类型，默认使用 mojang 账户认证的方式登录。

### 回显示例

```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft 服务器的 IP 地址
  username: 'Bot', // 当 auth 为 'offline' 时的加入用户名；否则为该账户的唯一标识符。想更换账户时修改此处
  auth: 'microsoft' // 对于离线模式（正版验证关闭）的服务器，你可以将其设置为 'offline'
  // port: 25565,              // 默认使用 25565，如果你的服务器端口不是这个，请取消注释并使用服务器开放的端口。
  // version: false,           // 如果需要使用指定版本或快照，请取消注释并手动填写（如："1.8.9" 或 "1.16.5"），否则会自动设置。
  // password: '12345678'      // 如果想使用基于密码的身份验证则设置（可能不可靠），请取消注释并手动填写。如果指定了此项，username 必须是邮箱。
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// 记录错误和被踢出服务器的原因：
bot.on('kicked', console.log)
bot.on('error', console.log)
```  

如果 `auth` 设置为 `microsoft`，你会在浏览器中看到一个提示，要求登录 microsoft.com 并输入一个验证码。在浏览器中登录后，机器人将自动获取并缓存身份验证令牌（以你指定的用户名为准），因此你无需再次登录。

要更换账户，请更新填入的 `username`。默认情况下，缓存的令牌会存储在用户目录下的 .minecraft 文件夹中；如果指定了 `profilesFolder`，则会改为存储在那里。
有关机器人选项的更多信息，请参阅 node-minecraft-protocol 的 [API 文档](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions)。

#### 连接到 Realm

当你的 Minecraft 账户收到某个 Realm 的邀请后，若要加入该 Realm，可以像下面这样传入一个带有 selector 函数的 realms 对象。

```js
const client = mineflayer.createBot({
  username: 'email@example.com', // Minecraft 账号用户名
  realms: {
    // 此函数在调用时会传入一个包含账号可加入的 Realms 数组，它应该返回想要加入的那一个。
    pickRealm: (realms) => realms[0]
  },
  auth: 'microsoft'
})
```

### 看看你的机器人在做什么

感谢 [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer)项目，它可以在浏览器窗口显示你的机器人正在做什么。  
只需要运行 `npm install prismarine-viewer` 并将其添加到你的机器人代码中。

```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port 是 minecraft 服务器端口，如果 firstPerson 为 false，你将得到鸟瞰视角
})
```

然后你会得到一个看起来像这样的*实时视图*：

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### 更多示例

| 例子 | 描述 |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | 在浏览器中显示你的机器人世界视图 |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | 让你的机器人自动前往任意位置 |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | 使用箱子、熔炉、发射器、附魔台 |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | 学习如何创建一个能够挖掘方块的简单机器人 |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | 将 Discord 机器人与 mineflayer 机器人连接，消息互通 |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | 学习如何移动、跳跃、骑乘载具、攻击附近的实体 |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | 在终端中显示机器人聊天，并带有聊天颜色 |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | 让机器人在指定区域内守卫，抵御靠近的生物 |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | 添加一个包含多个账号的文本文件，让它们全部登录 |

 [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) 文件夹中还有更多示例

### 模块

mineflayer 的许多活跃开发，其实都发生在它依赖的那些小型 npm 包里

#### Node 之道

> “当应用程序做得足够好时，它们就只剩下那些真正针对特定应用、难以轻易抽象掉的、带点咸味的残余物。所有漂亮的、可复用的组件都升华到 GitHub 和 npm 上，让每个人都能协作，推动公共资源进步。” — 出自 substack 的 [《how I write modules》](https://web.archive.org/web/20220301041352/https://gist.github.com/substack/5075355) (2013)

#### 子模块

这些是构成 mineflayer 的主要模块：

| 模块 | 描述 |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | 解析和序列化 minecraft 数据包，以及身份验证和加密。
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | 为 minecraft 客户端、服务器和库提供 minecraft 数据的语言独立模块。
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | 为 minecraft 实体提供物理引擎
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | 一个为 Minecraft 保存区块数据的类
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | 具有强大单元测试的 3d 矢量数学
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | 用相关数据表示一个 minecraft 方块
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | minecraft 聊天消息解析器（从 mineflayer 中提取）
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | 与 Mojang 身份验证系统（即 Yggdrasil）交互的 Node.js 库
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | prismarine 世界的核心实现
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | 表示 minecraft 窗口
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | 用相关数据表示一个 minecraft 物品
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | node-minecraft-protocol 的 NBT 解析器
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | 表示 minecraft 合成配方
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | 用相关数据表示 minecraft 生物群落
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | 表示一个 minecraft 实体

### 调试

您可以使用 `DEBUG` 环境变量启用某些协议调试输出：

```bash
DEBUG="minecraft-protocol" node [...]
```

在 Windows 上：

```powershell
set DEBUG=minecraft-protocol
node your_script.js
```

## 第三方插件

mineflayer 支持插件；任何人都可以创建一个插件，在 mineflayer 之上添加更高级别的 API。

其中更新最及时、最实用的有：

 * [minecraft-mcp-server](https://github.com/yuniko-software/minecraft-mcp-server) 一个用于 mineflayer 的 MCP 服务器，让 LLM 也能使用 mineflayer
 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - 具有大量可配置功能的高级 A* 寻路
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - 简单的网页版区块查看器
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - 网页版背包查看器
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - 用于更复杂机器人行为的状态机 API
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - 自动护甲管理
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - mineflayer 机器人的前端仪表板
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - 用于基础 PVP 和 PVE 的简易 API
 * [Auto Eat](https://github.com/link-discord/mineflayer-auto-eat) - 自动进食。
 * [Auto Crystal](https://github.com/link-discord/mineflayer-autocrystal) - 自动放置和破坏末影水晶。
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - 具有高级 API 的工具/武器自动选择工具。
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - 使用弓箭自动瞄准的工具。
 * [GUI](https://github.com/firejoust/mineflayer-GUI) - 使用 async/await 操作嵌套的 GUI 窗口
 * [Projectile](https://github.com/firejoust/mineflayer-projectile) - 计算抛射物所需的发射角度
 * [Movement](https://github.com/firejoust/mineflayer-movement) - 平滑而真实的玩家移动，最适合 PvP
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - 快速简单的方块采集 API。

 也可以看看这些：

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - 使用 canvas 和 socket.io 的网页版雷达界面 [YouTube 演示](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - 基于聊天的机器人身份验证
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - 判断谁以及什么对另一个实体造成了伤害
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - 获取当前 tps（已处理的 tps）
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - 拍摄你的世界的全景图像
 * [player-death-event](https://github.com/tuanzisama/mineflayer-death-event) - 在 Mineflayer 中发出玩家死亡事件。

## 正在使用 mineflayer 的项目

* [Voyager](https://github.com/MineDojo/Voyager) - 基于大语言模型的开放式具身智能体
* [mindcraft](https://github.com/kolbytn/mindcraft) - 让 LLM 使用 mineflayer 的库
* [rom1504/rbot](https://github.com/rom1504/rbot)
  * [YouTube - 建造旋转楼梯](https://www.youtube.com/watch?v=UM1ZV5200S0)
  * [YouTube - 复制一个建筑](https://www.youtube.com/watch?v=0cQxg9uDnzA)
* [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
* [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - 使用 voxel.js 可视化机器人正在做什么
* [JonnyD/Skynet](https://github.com/JonnyD/Skynet) - 将玩家活动记录到在线 API
* [MinecraftChat](https://github.com/rom1504/MinecraftChat)（最后一个开源版本，由 AlexKvazos 构建）- 基于网页的 Minecraft 聊天客户端
* [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - 基于插件的机器人，拥有简洁的图形界面。使用 Node-Webkit 开发。
* [Chaoscraft](https://github.com/schematical/chaoscraft) - 使用遗传算法的 Minecraft 机器人，详见[其 YouTube 视频](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
* [hexatester/minetelegram](https://github.com/hexatester/minetelegram) - Minecraft 与 Telegram 的桥接工具，基于 mineflayer 和 telegraf 构建。
* [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - 在生存模式下打印 Minecraft 结构（schematics），并保持方向一致
* [SilkePilon/OpenDeliveryBot](https://github.com/SilkePilon/OpenDeliveryBot) - 用 Python 编写的 Minecraft 机器人，用于在不同地点之间运送物品。
* [以及数百个](https://github.com/PrismarineJS/mineflayer/network/dependents) - GitHub 检测到的所有使用 mineflayer 的项目

## 测试

### 完整测试

运行
```bash
npm test
```

### 测试指定版本

运行 

```bash
npm run mocha_test -- -g <version>
```

其中 `<version>` 表示 minecraft 版本号 如 `1.12`, `1.15.2`...

### 测试指定测试脚本

运行 

```bash
npm run mocha_test -- -g <test_name>
```

其中 `<test_name>` 是测试名称，例如 `bed`, `useChests`, `rayTrace`...

### 示例

```bash
npm run mocha_test -- -g "1.18.1.*BlockFinder"
```

运行 1.18.1 的 block finder 测试

## 许可证

[MIT](../../LICENSE)
