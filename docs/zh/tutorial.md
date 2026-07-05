# 使用教程

> 本页教程比较旧，实用API以 `zh/api.md` 记载为准。未来英文教程有更新再添加。

**目录**

- [基础](#基础)
  - [Javascript 基础](#javascript-基础知识)
    - [安装 Node](#安装-node)
    - [Javascript 变量](#javascript-变量)
    - [显示输出](#显示输出)
    - [Javascript 函数](#javascript-函数)
    - [Javascript 数据类型](#javascript-数据类型)
    - [If语句](#if语句)
    - [循环](#循环)
    - [Node 包管理器](#node-包管理器)
  - [创建一只bot](#创建一只机器人)
    - [Javascript 对象](#javascript对象)
    - [登录](#登录)
    - [命令行参数](#命令行参数)
  - [传递函数](#传递函数)
  - [监听事件](#监听事件)
  - [回调函数](#回调函数)
    - [正确与不正确的方法](#正确与不正确的方法)
- [高级](#高级)
  - [异步Asynchronousy](#asynchronousy)
  - [在对象上循环](#在对象上循环)
  - [从聊天中创建事件](#从聊天中创建事件)
    - [回答你好 机器人](#回答你好-机器人)
    - [自定义聊天](#自定义聊天)
- [FAQ](#faq)
  - [如何在Android上运行机器人](#如何在android上运行机器人)
    - [安装Termux](#安装termux)
    - [启动你的机器人](#启动你的机器人)

## 介绍

本教程将帮助您从零开始使用Mineflayer，即使您对编程一无所知。  
如果你已经对 Node 和 NPM 有所了解，你可以转到 [创建一只bot](#creating-a-bot) 章节，否则从此处开始。

## 基础

以下几节是关于开始使用Mineflayer需要知道的基本概念。

### Javascript 基础知识

#### 安装 Node

本节你将快速学习 Javascript 、 Node 和 NPM 的基础知识

Javascript，通常缩写为JS，是一种为web设计的编程语言。它使网络上的大多数交互性成为可能。
Node.js（通常只写Node）使得在web浏览器之外使用Javascript成为可能。

因此，您要开始做的第一件事是安装Node。你可以在[这里](https://nodejs.org/zh-cn/download)得到它。  
安装完成后，打开命令提示符（也称为终端），然后输入 `node -v`  
如果正确安装了Node，它应该返回一个版本号。如果它说它找不到命令，尝试重新安装，或者参考如何添加环境变量的路径，请根据你的操作系统搜索相关报错信息。

现在你有了 Node，你可以开始编程了，但是还有一件事！  
Javascript 可以用任何基本的文本编辑器书写，但是，如果您使用[集成开发环境](https://en.wikipedia.org/wiki/Integrated_development_environment)(IDE)会容易得多。  
IDE将帮助您编写代码，因为它可以给您建议，或者告诉您代码是否存在潜在问题。您不必拘泥于任何一款IDE，但是对新手来说 [Visual Studio Code](https://code.visualstudio.com/)(VSCode)是一款很好的IDE。它的安装和设置已经有相当多中文教程了。  
一旦你安装和设置了VSCode，创建一个新文件，然后把它保存在某个地方并以 `.js` 作文件的结尾。例如 `bot.js`  
这将让VSCode知道我们正在使用Javascript，并给你正确的建议。

#### Javascript 变量

首先输入以下内容：

```js
const test = 5
```
这将创建一个名为 `test` 的新变量，并为其赋值为 `5`。
变量用于保存数据，以便在代码的后续部分中使用。

现在保存文件，以便我们可以运行代码。再次打开终端（或在 VSCode 中打开一个新终端），并导航到文件所在的同一文件夹。这可以通过 `cd` 命令完成，例如：`cd Documents\javascript`  
一旦你的终端位于与 JavaScript 文件相同的文件夹中，你就可以运行 `node filename.js`  
如果你所有操作都正确，你应该不会看到任何输出。  
在下一章中，我们将向你展示如何向终端“打印”内容。

通常来说，在定义变量时，使用 `const` 关键字而不是 `let` 关键字是一种良好的编程实践。用 `const` 定义的变量不能在后续被修改，因此它是一个常量。  
JavaScript 因此能够更高效地运行你的代码，因为它知道无需考虑该变量的值变化。  
当然，如果你需要一个可修改变量，仍然必须使用 `let`。

```js
const test = 5
// eslint-disable-next-line
test = 10 // 这一行是无效的。
```

第二行是无效的，因为你不能重新赋值 `test` 变量。

如果你想帮助自己和其他人更好地理解你的代码，可以使用注释。  
注释可以通过 `//` 创建，其后的所有内容都会被 JavaScript 完全忽略。

#### 显示输出

很多时候，您希望看到变量的当前值，以确保程序正确运行。 
您可以通过将变量打印到终端来实现这一点.  
在Javascript中，我们可以使用 `console.log()` 函数  

```js
const test = 5

console.log(test)
```

现在，当您保存并运行此代码时，您最终应该会看到：

```txt
5
```

#### Javascript 函数

接下来，你将学习函数。函数是一段可以在整个代码中多次使用的代码。  
这很有用，因为你不需要多次输入一些东西。

```js
const addition = (a, b) => {
  return a + b
}

const test1 = addition(5, 10)
const test2 = addition(1, 0)

console.log(test1)
console.log(test2)
```

`=>` 用于定义函数，称为箭头操作符。  
箭头操作符之前是参数列表，圆括号 `()` 之间的所有内容都是参数，以逗号分隔。  
参数是你传递给函数的变量，以便函数可以使用它们进行工作。  
箭头操作符之后是函数体，即花括号 `{}` 之间的所有内容。  
这里放置函数的代码。  
现在函数已完整，我们将它赋值给一个变量以赋予其名称，在本例中为 `addition`。 

正如你所见，这段代码接收参数 `a` 和 `b` 并将它们相加。  
然后函数将返回结果。  
当定义函数时，函数体中的代码尚未执行。要运行函数，你必须调用它。  
你可以通过使用函数名后跟圆括号来调用函数。在本例中为 `addition()`。  
然而，`addition` 函数需要 2 个参数。可以通过将它们放在圆括号内并以逗号分隔来传递这些参数：`addition(1, 2)`。  
当函数执行完毕时，你可以想象函数调用被函数返回的任何值所替换。因此，在本例中 `let test1 = addition(5, 10)` 将变为 `let test1 = 运算结果`（你实际上不会看到这种情况，但这有助于你理解概念）。

有时你会遇到以下写法：`function addition() {}` 这意味着相同的事情，尽管更推荐使用 `() => {}`。（如果你真的想知道原因，请搜索 'javascript function vs arrow function'）《普通函数和箭头函数对比》

上述代码应输出以下内容：

```txt
15
1
```

#### Javascript 数据类型

到目前为止，我们只处理了数字，但 JavaScript 可以处理更多的变量类型：

- 字符串（String）是一段可以包含多个字符的文本。字符串通过引号 `''` 定义。

```js
const string = 'This is a string' // string type
```

- 数组（Array）是一种可以在其内部保存多个变量的类型。数组通过方括号 `[]` 定义。

```js
const array = [1, 2, 3] // array type
```
- 对象（Object）基本上是高级数组，是一个独立的抽象的物的概念，你将在本教程的后面部分了解更多关于它们的内容。它们通过花括号 `{}` 定义。

```js
const object = {} // object type
```

- 函数（Functions）也有自己的类型。

```js
const adder = (a, b) => { return a + b } // function type
```

- 布尔值（Boolean）是一种只能是 `true` 或 `false` 的类型。

```js
const boolean = true // boolean type
```

- 当某物尚未定义时，其类型为 `undefined`。

```js
let nothing // undefined type
const notDefined = undefined // undefined type
```

#### if语句

有时你想根据特定的条件做不同的事情。这可以使用if语句来实现。

```js
const name = 'Bob'

if (name === 'Bob') {
  console.log('你的名字是 Bob')
} else if (name === 'Alice') {
  console.log('你的名字是 Alice')
} else {
  console.log('你的名字不是Bob或Alice')
}
```

if 语句是使用 `if` 关键字创建的。之后，圆括号 `()` 之间是一个条件， followed by 花括号 `{}` 之间的主体。  
条件必须是一个计算结果为布尔值的表达式。  
在本例中，它使用相等运算符 `===`，如果前面的值与后面的值相同，则结果为 `true`。否则为 `false`。  
如果条件为 `true`，则执行主体中的代码。  
你可以将 if 语句与 else-if 语句或 else 语句链接起来。  
你可以拥有任意数量的 else-if 语句，但只能有 1 个 if 语句和 1 个 else 语句。  
如果你有 else 语句，仅当之前的所有链接语句都为 `false` 时，才会执行它。

#### 循环

循环用于重复执行某些代码，直到满足特定条件为止。

```js
let countDown = 5

while (countDown > 0) {
  console.log(countDown)
  countDown = countDown - 1 // 从1递减
}

console.log('已完成!')
```

上述代码将打印以下内容

```txt
5
4
3
2
1
已完成!
```

`while` 循环有一个条件 `()` 和一个主体 `{}`。  
当代码到达循环时，它会检查条件。如果条件为 `true`，则执行主体中的代码。  
到达主体末尾后，再次检查条件，如果为 `true`，则再次执行主体。  
只要条件检查结果仍为 `true`，这种情况就会持续发生。  
在每次循环中，此代码打印当前的 `countDown` 数字，然后将其减 1。  
在第 5 次循环后，条件 `0 > 0` 将为 `false`，因此代码将继续执行后续内容。

`for` 循环也经常使用，它与 `while` 循环略有不同。

```js
for (let countDown = 5; countDown > 0; countDown = countDown - 1) {
  console.log(countDown)
}
```

for 循环不仅有条件，还有三个不同的部分。  
这些部分由分号分隔。  
第一部分 `let countDown = 5` 仅在循环开始时执行一次。  
第二部分 `countDown > 0` 是条件，这与 while 循环相同。  
第三部分 `countDown = countDown - 1` 在每次循环后执行。

如果你想对数组中的每个项目执行某些操作，`for of` 循环会很有用。

```js
const array = [1, 2, 3]

for (const item of array) {
  console.log(item)
}
```

`for of` 循环需要在 `of` 之前有一个变量，这是用于访问当前项目的变量。  
`of` 之后的变量需要是包含其他变量的东西。这些通常是数组，但也包括某些对象。  
该循环将对 `array` 中的每个项目执行主体，并且在每次循环中，`item` 变量将是 `array` 的当前项目。

#### Node 包管理器

你需要知道的最后一件事是如何使用[Node Package Manager](https://www.npmjs.com/)。  
NPM会在安装Node时自动安装。  
NPM被用来获取其他人创建的有用的包，这些包可以为你做有用的事情。  
你可以在 [他们的网站](https://www.npmjs.com/) 上搜索软件包，然后在你的终端上使用 `npm install` 命令安装它们。  
例如，要安装Mineflayer，在当前项目的文件夹终端运行 `npm install mineflayer` 

然后，Node可以使用 `require()` 函数访问已安装的模块。注意，正常情况下，node的每个模块安装都是独立于各个工程项目的，因此你不能导入在别的工程安装的模块。

```js
const mineflayer = require('mineflayer')
```

在此之后， `mineflayer` 变量可以用来访问Mineflayer的所有功能。

### 创建一只机器人

现在你已经了解了Javascript、Node和NPM的基础知识，你可以开始创建你的第一个bot了！  
如果你不知道上面的任何术语，你应该回到 [第一段落](#javascript-基础知识) 阅读。

下面是创建Mineflayer机器人所需的绝对最少代码

```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot()
```

如果运行这个示例，您将注意到程序不会停止。如果要停止当前运行的程序，请按 `Ctrl` + `c`  
然而，这个bot不是很有用，因为默认情况下，它将连接到您机器上运行的Minecraft服务器，默认端口为25565。  
如果您想要选择您希望您的bot连接到哪个服务器，您必须传递一些选项。

```js
const mineflayer = require('mineflayer')

const options = {
  host: 'localhost', // 将此项更改为所需的ip
  port: 25565 // 将此项更改为所需的端口
}

const bot = mineflayer.createBot(options)
```

#### Javascript对象

大括号 `{}` 用于创建对象。对象包含所谓的键值对，键-值对由冒号 `:` 和冒号之前的键以及冒号之后的键的值组成。然后可以使用键来检索它们的值。  
可以同时有多个键值对，用逗号分隔它们。

```js
const object = {
  number: 10,
  another: 5
}

console.log(object.number) // 这将打印值10
```

这个概念通常用于创建“命名参数”。  
这样做的好处是，您不必使用所有可用的选项，并且它们的位置无关紧要。  
该值可以是任何值，甚至是其他对象。如果值是一个函数，则该函数通常称为该对象的方法。  
您也可以内联创建对象。

```js
const bot = mineflayer.createBot({ host: 'localhost', port: 25565 })
```

#### 登录

没有任何参数，机器人将有名字 `Player` 玩家，只能登录到离线服务器。（破解和开放局域网）  
如果您为 `createBot` 提供一个 `username` 选项，它将使用该用户名登录。（仍然只在离线服务器）  
要登录一个特定的账户，你必须同时提供用户名和密码（ `username` 和 `password`）。

```js
const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Player',
  password: 'password'
})
```

#### 命令行参数

如果其他人喜欢你的机器人并想要使用它，但在不同的服务器上使用它，并使用不同的帐户，该怎么办？  
这意味着每个人都必须根据自己的喜好更改服务器地址和登录设置。（当然，分享密码也不是个好主意。）  
为了解决这个问题，很多人使用命令行参数。

```js
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4],
  password: process.argv[5]
})
```

正如你所见，代码中不再包含敏感数据！但是现在，如何运行它呢？  
现在，启动程序时不再仅仅使用 `node filename.js`，而是使用 `node filename.js host port username password`。  
Node 会自动将整个命令行按空格分割成一个数组。  
这个数组就是 `process.argv`。  
可以使用每个项目的索引来访问数组中的数据。索引总是从 0 开始，因此第一个项目可以通过 `[0]` 访问，在本例中将是 `node`，依此类推。

| | 第一项 | 第二项 | 第三项 | 第四项 | 第五项 | 第六项 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| 值 | `node` | `filename.js` | `host` | `port` | `username` | `password` |
| 索引 | `[0]` | `[1]` | `[2]` | `[3]` | `[4]` | `[5]` |

### 传递函数

不仅像数字和字符串这样的基本变量可以作为参数给出。
函数也可以作为变量传递。

```js
const welcome = () => {
  bot.chat('你好!')
}

bot.once('spawn', welcome)// 只触发一次，在第一次
```

如你所见， `bot.once()` 方法接受2个参数。  
第一个参数是事件名称，第二个参数是事件发生时要调用的函数。  
记住，在传递函数时，只使用名称，而不使用圆括号 `()`。

`bot.chat()` 是将消息发送到聊天的方法。

您还可以通过使用匿名函数来简化这段代码。
匿名函数没有名称，它是在函数名称原来所在的位置创建的。
它们仍然必须有一个参数列表 `()` 和一个函数体 `{}` ，即使不填参数。

```js
bot.once('spawn', () => {
  bot.chat('你好!')
})
```

### 监听事件

bot 对象拥有许多有用的[事件](http://prismarinejs.github.io/mineflayer/#/api?id=events)。
你可以使用 bot 对象的 `bot.on()` 方法或 `bot.once()` 方法来监听事件，这两个方法都需要传入事件名称和一个函数。
若要移除特定的监听器，可以使用 `bot.removeListener()` 方法。

- `bot.on(eventName, listener)`
  每当名为 `eventName` 的事件被触发时，执行 `listener` 函数。
- `bot.once(eventName, listener)`
  仅在名为 `eventName` 的事件第一次被触发时，执行一次 `listener` 函数。
- `bot.removeListener(eventName, listener)`
  移除名为 `eventName` 的事件的指定 `listener`。为了使用此方法，你需要保留函数的名字，使用 `function myNamedFunc() {}` 定义函数，或者将函数赋值给变量，如 `const myNamedFunc = () => {}`。然后，你可以在 listener 参数中使用 `myNamedFunc`。

不仅 bot 对象，[`Chest`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerchest)、[`Furnace`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerfurnace)、[`Dispenser`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerdispenser)、[`EnchantmentTable`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerenchantmenttable)、[`Villager`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayervillager) 对象也拥有它们自己的事件！

### 回调函数
回调函数 [callback](https://en.wikipedia.org/wiki/Callback_(computer_programming)) 是一个函数，它可以给另一个函数传值，这个函数通常在函数结束时被 *回调* 。
在 Mineflayer, callbacks 收听错误处理.

```js
bot.consume((error) => {
  if (error) { // 这将检查吃喝时是否发生错误
    console.log(error)
  } else {
    console.log('吃完了！')
  }
})
```

上面的代码将尝试使用bot当前持有的内容。  
当进食的动作结束时，将调用传递的函数。  
然后我们可以做其他我们想做的事情。  
当发生错误时也会调用该函数。

#### 正确与不正确的方法

下面是一个机器人的例子，它将把橡木原木加工成橡木板，然后再加工成木棍。

错误例子 ❌:

```js
const plankRecipe = bot.recipesFor(5)[0] // Get the first recipe for item id 5, which is oak planks.获取物品id 5的第一个配方，即橡木木板。
bot.craft(plankRecipe, 1) // ❌ start crafting oak planks.开始制作橡木板。

const stickRecipe = bot.recipesFor(280)[0] // Get the first recipe for item id 280, which is sticks.
bot.craft(stickRecipe, 1) // ❌ start crafting sticks.开始制作木棍。
```

回调的正确方法 ✔️:

```js
const plankRecipe = bot.recipesFor(5)[0]

bot.craft(plankRecipe, 1, null, (error) => {
  // After bot.craft(plankRecipe, ...) is finished, this callback is called and we continue. ✔️
  if (error) { // 检查是否发生了错误
    console.log(error)
  } else {
    const stickRecipe = bot.recipesFor(280)[0]

    bot.craft(stickRecipe, 1, null, (error) => {
      // After bot.craft(stickRecipe, ...) is finished, this callback is called and we continue. ✔️
      if (error) { // Check if an error happened.
        console.log(error)
      } else {
        bot.chat('Crafting Sticks finished')
      }
    })
  }
})
```

不正确的方法是错误的，因为当调用 `bot.craft()` 时，代码将在机器人制作时继续执行。  
当代码到达第二个 `bot.craft()` 时，第一个可能还没有完成，这意味着所需的资源还不可用。  
使用回调可以解决这个问题，因为它们只有在 `bot.craft()` 完成后才会被调用。

更多在 [bot.craft()](https://prismarinejs.github.io/mineflayer/#/api?id=botcraftrecipe-count-craftingtable-callback) 方法.

## 高级

下面的概念对于创建一个Mineflayer bot并不是必需的，但是它们对于理解和创建更高级的bot是有用的。
我们假设您已经理解了[基础](#基础)教程。

### Asynchronousy
在 JavaScript 中，异步（asynchronous）是一个重要的概念。  
默认情况下，JavaScript 会逐行运行代码，只有当前一行执行完毕后才会进入下一行。这被称为阻塞（blocking）。  
然而，有时你需要执行一些耗时相对较长的操作，而你并不希望整个程序因此阻塞并等待其完成。

与文件系统的交互通常是通过异步方式完成的，因为读取和写入大型文件可能需要很长时间。

```js
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!') // 耶！一切都很顺利！
  }, 1000)
})

myPromise.then((successMessage) => {
  console.log(successMessage)
})

myPromise.catch((error) => {
  console.log(error)
})
```

上述代码使用了所谓的 **Promise**（承诺）。Promise 承诺它最终会完成。
传递给创建 Promise 的函数始终有两个参数：一个 `resolve` 函数和一个 `reject` 函数。
如果 Promise 成功，它将调用 `resolve` 函数；否则，它将调用 `reject` 函数。
上述代码使用了 `setTimeout`，它会在设定的毫秒数（本例中为 1000）后调用给定的函数。
然后，你可以使用 `.then(function)` 告诉 Promise 在成功时该做什么，或者使用 `.catch(function)` 告诉它在失败时该做什么。

`.then` 和 `.catch` 函数还可以与 Promise 链式调用，以简化代码。

```js
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!') // Yay! Everything went well!
  }, 1000)
}).then((successMessage) => {
  console.log(successMessage)
}).catch((error) => {
  console.log(error)
})
```

### 在对象上循环

在[循环](#循环)章节中描述的for of循环也可以用于遍历对象。

如果我们有以下对象：

```js
const obj = {
  a: 1,
  b: 2,
  c: 3
}
```

下面的代码将循环遍历对象的所有值。

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

这将循环遍历对象的所有键。

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

您还可以同时遍历键和值。首先必须解构变量，[原因是](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

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

这些循环之所以可行，是因为 `Object.values(obj)` 和 `Object.keys(obj)` 分别返回对象值和键的数组。  
`Object.entries(obj)` 返回一个数组，其中每个元素都是一个包含两项的数组：一个键及其对应的值。  
重要的是要知道，与 `Object.values()` 和 `Object.keys()` 函数不同，`Object.entries()` 函数不保证顺序与定义对象时的顺序相同。

还有一种 `for in` 循环。然而，你通常更希望使用 `for of` 而不是 `for in`，因为它们之间存在关键差异。  
`for in` 循环遍历的是对象的键，而不是值。（如果是数组，则是索引）  
然而，它不仅遍历对象自身的键，还遍历从其“继承”的其他对象的键，这可能会造成混淆或产生非预期的结果。更多详情见[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)。  
通常来说，你应该使用 `for of` 而不是 `for in`，因此请确保不要混淆两者。

### 从聊天中创建事件

你可以使用[`bot.addChatPattern()`](http://prismarinejs.github.io/mineflayer/#/api?id=botchataddpatternpattern-chattype-description)方法。对于聊天格式变化很大的Bukkit服务器非常有用。
[' bot.addChatPattern ()](http://prismarinejs.github.io/mineflayer/#/api?id=botchataddpatternpattern-chattype-description)方法接受三个参数：

- `pattern` - 匹配聊天的正则表达式(regex)
- `chatType` - 模式匹配时bot发出的事件。如 "chat" 或 "whisper"
- `description` - 可选，描述模式的用途

You can add [Groups and Range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) into the `pattern`, then the listener will spread the captured groups into arguments of your callback sequentially.

阅读有关[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)的更多信息

例子 :

#### 回答你好 机器人

在这里，我们创建一个机器人，从另一个玩家那里回答“你好”。

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

#### 自定义聊天

基于自定义聊天格式创建事件  
自定义聊天示例:

```txt
[Player] 路人甲 > 你好
[Admin] 李四 > Hi
[Player] 法外狂徒张三 > 焯!我卡住了
[Mod] Jim > 我马上到
```

```js
bot.addChatPattern(
  /^\[(.+)\] (\S+) > (.+)$/,
  'my_chat_event',
  'Custom chat event'
)

const logger = (rank, username, message) => {
  console.log(`${username} 说 ${message}`)
}

bot.on('my_chat_event', logger)
```

关于 `^\[(.+)\] (\S+) > (.+)$` 正则表达式的解释可在[此处](https://regex101.com/r/VDUrDC/2)找到

## FAQ

### 如何在Android上运行机器人

下面是在Android设备上用 [Termux](https://termux.com/)运行bot的快速设置教程

#### 安装Termux

安装[Termux](https://termux.com/) 并启动。Termux 是一款手机上的终端运行程序，内置完整linux系统。

#### Setup

安装 `Node.js`:

```bash
pkg update -y
pkg install nodejs -y
```

❗️ 允许应用程序设置上Termux的存储权限.
在内部存储上创建新文件夹：

```bash
cd /sdcard
mkdir my_scripts
cd my_scripts
```

安装 `mineflayer`:

```bash
npm install mineflayer
```

现在，您可以将所有脚本复制/存储到内部存储器中的`my_scripts`文件夹中。

#### 启动你的机器人

要启动机器人，请使用Node运行脚本名称

```bash
node script_name.js
```

❗️ 每次打开 Termux 时，您都必须在启动机器人之前将 cwd 更改为 `/sdcard/my_scripts`:

```bash
cd /sdcard/my_scripts
```
