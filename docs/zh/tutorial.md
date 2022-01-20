# 使用教程

**目录**

- [基础](#基础)
  - [Javascript 基础](#Javascript 基础知识)
    - [Installing Node](#installing-node)
    - [Javascript variables](#javascript-variables)
    - [Show output](#show-output)
    - [Javascript functions](#javascript-functions)
    - [Javascript 数据类型](#Javascript 数据类型)
    - [If-statements](#if-statements)
    - [Loops](#loops)
    - [Node 包管理器](#Node 包管理器)
  - [Creating a bot](#creating-a-bot)
    - [Javascript objects](#javascript-objects)
    - [Logging in](#logging-in)
  - [Passing along functions](#passing-along-functions)
  - [Listening for an event](#listening-for-an-event)
  - [Callbacks](#callbacks)
    - [Correct and incorrect approach](#correct-and-incorrect-approach)
- [高级](#高级)
  - [Asynchronousy](#asynchronousy)
  - [Loop over an object](#loop-over-an-object)
  - [Creating an event from chat](#creating-an-event-from-chat)
    - [Answer Hello Bot](#answer-hello-bot)
    - [Custom Chat](#custom-chat)
- [FAQ](#faq)
  - [How to run a bot on android](#how-to-run-a-bot-on-android)
    - [Install Termux](#install-termux)
    - [Setup](#setup)
    - [Start your bot](#start-your-bot)

## 介绍

This tutorial will help you get started with Mineflayer, even if you know nothing about coding.  
If you already know some things about Node and NPM, you can go to the [Create a bot](#creating-a-bot) section, otherwise start here.

## 基础

以下几节是关于开始使用Mineflayer需要知道的基本概念。

### Javascript 基础知识

#### Installing Node

In this section you will learn the basics about Javascript, Node and NPM.

Javascript, often abbreviated to JS, is a programming language designed for the web. It is what makes most interactivity on the web possible.  
Node.js, often just Node, makes it possible to use Javascript outside of web browsers.

So the first thing you have to do to get started is to install Node. You can get it [here](https://nodejs.org/en/download/).  
After it is installed, open a command prompt (also known as a terminal) and then type `node -v`  
If you have installed Node correctly, it should return a version number. If it says it can't find the command, try installing it again.

Now you have Node, you could start writing code, but we need to do 1 more thing.  
Javascript can be written in any basic text editor, but it is much easier if you use what is called an [Integrated development environment](https://en.wikipedia.org/wiki/Integrated_development_environment)(IDE)  
An IDE will help you write code because it can give you suggestions, or tell you if your code has potential problems. A good IDE to start with is [Visual Studio Code](https://code.visualstudio.com/)(VSCode)  
Once you have installed and set-up VSCode, create a new file and then save it somewhere with a name ending with `.js`, e.g. `bot.js`  
This will let VSCode know we are working with Javascript, and give you the correct suggestions.

#### Javascript variables

首先输入以下内容：

```js
const test = 5
```

This will create a new variable named `test` and assign it the value `5`  
Variable are used to save data and use it later in the code.

Now save the file so we can run the code. Open a terminal again (or a new terminal in VSCode) and navigate to the same folder the file is saved in. This can be done using the `cd` command, for example: `cd Documents\javascript`  
Once your terminal is in the same folder as your Javascript file, you can run `node filename.js`  
If you have done everything correctly, you should see nothing.  
In the next chapter we will show you how you can 'print' things to the terminal.

In general, it is good practice to use the `const` keyword instead of the `let` keyword when defining a variable. A variable defined with `const` can't be modified later and thus is a constant.  
Javascript is then able to make your code run more efficiently because it knows it doesn't have to account for value changes for that variable.  
If you want a modifiable variable, you will still have to use `let` of course.

```js
const test = 5
// eslint-disable-next-line
test = 10 // This line is invalid.
```

The second line is invallid because you can't reassign the `test` variable.

If you want to help yourself and other people understand your code better, you can use comments.  
Comments can be created using `//` and everything after that is completely ignored by Javascript.

#### 显示输出

A lot of times you want to see the current value of a variable, to make sure your program is running correctly.  
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

#### Javascript functions

Next you will learn about functions. Functions are a piece of code that can be used multiple times throughout your code.  
These can be useful because you don't have to type something multiple times.

```js
const addition = (a, b) => {
  return a + b
}

const test1 = addition(5, 10)
const test2 = addition(1, 0)

console.log(test1)
console.log(test2)
```

The `=>` is used to define a function, called the arrow operator.  
Before the arrow operator is the parameter list, everything between the round brackets `()` are parameters, separated by a comma.  
Parameters are variables you can give to your function so that your function can work with them.  
Then after the arrow operator comes the function body, this is everything between the curly brackets `{}`  
This is where you put the code of the function.  
Now that the function is complete, we assign it to a variable to give it a name, in this case `addition`  

As you can see, this code takes the parameters `a` and `b` and adds them together.  
Then the function will return the result.  
When a function is defined, the code in the function body is not yet executed. To run a function you have to call it.  
You can call a function by using the name of a function followed by round brackets. In this case `addition()`  
However, the `addition` function requires 2 parameters. These can be passed along by putting them inside the round brackets, comma separated: `addition(1, 2)`  
When the function is done, you can imagine that the function call is replaced by whatever the function has returned. So in this case `let test1 = addition(5, 10)` will become `let test1 = result` (You will not actually see this, but this can help you understand the concept)

Sometimes you will come across the following: `function addition() {}` This means the same thing, although `() => {}` is preferred. (If you really want to know why, look up 'javascript function vs arrow function')

The above should output the following:

```txt
15
1
```

#### Javascript 数据类型

So far we have only worked with numbers, but Javascript can work with more variable types:

- A string is a piece of text that can contain multiple characters. Strings are defined by using the quotes `''`

```js
const string = 'This is a string' // string type
```

- An array is a type that can hold multiple variables inside itself. Arrays are defined by using the square brackets `[]`

```js
const array = [1, 2, 3] // array type
```
- Object are basically advanced arrays, you will learn more about it later in this tutorial. Their defined by curly brackets `{}`

```js
const object = {} // object type
```

- Functions are also their own type.

```js
const adder = (a, b) => { return a + b } // function type
```

- A boolean is a type that can only be `true` or `false`

```js
const boolean = true // boolean type
```

- When something is not (yet) defined, its type is `undefined`

```js
let nothing // undefined type
const notDefined = undefined // undefined type
```

#### If-statements

Sometimes you want to do different things based on a certain condition.  
This can be achieved using if-statements.

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

An if-statement is created using the `if` keyword. After that you have a condition between the round brackets `()` followed by the body between the curly brackets `{}`
A condition has to be something that computes to a boolean.  
In this case it uses an equal operator `===` which will be `true` if the value in front is the same as the value after. Otherwise it will be `false`
If the condition is `true` the code in the body will be executed.  
You can chain an if-statement with an else-if-statement or an else-statement.  
You can have as many else-if-statements as you want, but only 1 if and else statement.  
If you have an else-statement, it will be called only if all the chained statements before it are `false`

#### Loops

Loops are used to repeat certain code until a certain conditional is met.

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

The `while` loop has a condition `()` and a body `{}`  
When the code reaches the loop, it will check the condition. If the condition is `true`, the code in the body will be executed.  
After the end of the body is reached, the condition is checked again, and if `true`, the body executed again.  
This will happen for as long as the condition check is still `true`  
Each loop, this code prints the current `countDown` number, and then decrements it by 1.  
After the 5th loop, the condition `0 > 0` will be `false`, and thus the code will move on.

A `for` loop is also often used, and differs slightly from a `while` loop.  

```js
for (let countDown = 5; countDown > 0; countDown = countDown - 1) {
  console.log(countDown)
}
```

Instead of only a condition, the for loops has 3 different parts  
These parts are separated by a semi-column.  
The first parts `let countDown = 5` is only executed once, at the start of the loop.  
The second part `countDown > 0` is the condition, this is the same as the while loop.  
The third part `countDown = countDown - 1` is executed after each loop.:

If you want to do something for every item in an array, a `for of` loop can be useful.  

```js
const array = [1, 2, 3]

for (const item of array) {
  console.log(item)
}
```

A `for of` loop needs to have a variable before the `of`, this is the variable that can be used to access the current item.  
The variable after the `of` needs to be something that contains other variable. These are mostly arrays, but also some objects.  
The loop will execute the body for each item in the `array` and each loop the `item` variable will be the current item of the `array`

#### Node 包管理器

The last thing you need to know is how to use the [Node Package Manager](https://www.npmjs.com/).  
NPM is automatically installed when you install Node.  
NPM is used to get useful packages that other people created that can do useful things for you.  
You can search for packages on [their website](https://www.npmjs.com/), and then install them using the `npm install` command in your terminal.  
To install Mineflayer for example, run `npm install mineflayer`  

Then, Node can access installed modules by using the `require()` function.

```js
const mineflayer = require('mineflayer')
```

After this, the `mineflayer` variable can be used to access all the features of Mineflayer.

### 创建机器人

Now that you know the basics of Javascript, Node and NPM, you're ready to start creating your first bot!  
If you don't know any of the terms above, you should go back to the [previous section](#javascript-basics)

下面是创建Mineflayer机器人所需的绝对最少代码

```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot()
```

If you run this example, you'll notice that your program will not stop. If you want to stop your currently running program, press `Ctrl` + `c`  
However, this bot isn't quite useful, as by default this will connect to a Minecraft server running on your machine with the port 25565.  
If you want to choose which server you want your bot to connect to, you have to pass along a few options.


```js
const mineflayer = require('mineflayer')

const options = {
  host: 'localhost', // 将此项更改为所需的ip
  port: 25565 // 将此项更改为所需的端口
}

const bot = mineflayer.createBot(options)
```

#### Javascript objects

The curly brackets `{}` are used to create an object.  
Objects contain what is called a key-value pair.  
A key-value pair consist of a colon `:` and a key before the colon, and the value of that key after the colon.  
The keys can then be used to retrieve their value.  
You can have multiple key-value pairs by separating them by commas.

```js
const object = {
  number: 10,
  another: 5
}

console.log(object.number) // 这将打印值10
```

This concept is often used to create what is named 'named parameters'  
The advantage of this is that you don't have to use all the options available, and their position does not matter.  
The value can be anything, even other object. If the value is a function, that function is often called a method for that object.  
You can also create the object in-line.

```js
const bot = mineflayer.createBot({ host: 'localhost', port: 25565 })
```

#### 登录

Without any parameters, the bot will have the name `Player` and can only log into offline servers. (Cracked & open-to-lan)  
If you supply the `createBot` with an `username` option, it will log in with that username. (Still only in offline server)  
To log into a specific account, you have to supply both the `username` and the `password`

```js
const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Player',
  password: 'password'
})
```

#### Command line arguments

What if somebody else likes your bot and wants to use it, but uses it on a different server and with a different account?  
This means that everyone has to change the server address and login settings to their preference. (And it's of course also a bad idea to share your password)  
To counter this, a lot of people use command line arguments.

```js
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4],
  password: process.argv[5]
})
```

As you can see, no more sensitive data in your code! But now, how do you run it?  
Now, instead of starting your program with just `node filename.js` you start it with `node filename.js host port username password`  
Node will automatically split the whole command line into an array, separated by spaces.  
This array is `process.argv`  
The data in an array can be accessed using the index of each item. The index always start at 0, so the first item can be accessed with `[0]` and in this case will be `node` etc.

| | First item | Second item | Third Item | Fourth item | Fifth item | Sixth item |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| Value | `node` | `filename.js` | `host` | `port` | `username` | `password` |
| Index | `[0]` | `[1]` | `[2]` | `[3]` | `[4]` | `[5]`

### Passing along functions

Not only basics variables like numbers and strings can be given as an argument.  
Functions can also be passed as a variable.

```js
const welcome = () => {
  bot.chat('你好!')
}

bot.once('spawn', welcome)
```

As you can see, the `bot.once()` method takes 2 parameters.  
The first parameter is an event name, the second parameter is the function to call when that event happens.  
Remember, when passing along a function, only use the name and not the round brackets `()`

`bot.chat()` is the method for sending message to the chat.

You can also simplify this code by using a anonymous function.  
An anonymous function doesn't have a name, and is created at the position where the function name used to go.  
They still have to have a parameter list `()` and a function body `{}`, even if it isn't used.

```js
bot.once('spawn', () => {
  bot.chat('你好!')
})
```

### Listening for an event

The bot object has many useful [events](http://mineflayer.prismarine.js.org/#/api?id=events).
You can listen for an event by using either `bot.on()` method or `bot.once()` method of the bot object, which takes the name of an event and a function.
To remove specific listener you can use `bot.removeListener()` method.

- `bot.on(eventName, listener)`
  Execute the `listener` function for each time the event named `eventName` triggered.
- `bot.once(eventName, listener)`
  Execute the `listener` function, only once, the first time the event named `eventName` triggered.
- `bot.removeListener(eventName, listener)`
  Removes the specified `listener` for the event named `eventName`. In order to use this you either need to define your function with `function myNamedFunc() {}` or put your function in a variable with `const myNamedFunc = () => {}`. You can then use `myNamedFunc` in the listener argument.

Not only bot object, [`Chest`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerchest), [`Furnace`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerfurnace), [`Dispenser`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerdispenser), [`EnchantmentTable`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerenchantmenttable), [`Villager`](http://mineflayer.prismarine.js.org/#/api?id=mineflayervillager) object also have their own events!

### Callbacks
A [callback](https://en.wikipedia.org/wiki/Callback_(computer_programming)) is a function that you can give to another function, that is expected to be *called back*, generally when that function ends.  
In Mineflayer, callbacks are often used to handle errors.

```js
bot.consume((error) => {
  if (error) { // 这将检查是否发生错误
    console.log(error)
  } else {
    console.log('Finished consuming')
  }
})
```

The above code will try to consume what the bot is currently holding.  
When the consuming ends, the function that is passed along is called.  
We can then do other things that we want to do after.  
The function could also be called when an error occurs.

#### Correct and incorrect approach

Below is an example of a bot that will craft oak logs into oak planks and then into sticks.

Incorect approach ❌:

```js
const plankRecipe = bot.recipesFor(5)[0] // Get the first recipe for item id 5, which is oak planks.
bot.craft(plankRecipe, 1) // ❌ start crafting oak planks.

const stickRecipe = bot.recipesFor(280)[0] // Get the first recipe for item id 5, which is sticks.
bot.craft(stickRecipe, 1) // ❌ start crafting sticks.
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

The reason the incorrect approach is wrong is because when `bot.craft()` is called, the code will continue below while the bot is crafting.  
By the time the code reaches the second `bot.craft()`, the first probably hasn't finished yet, which means the wanted resource is not available yet.  
Using callbacks can fix this because they will only be called after the `bot.craft()` is finished.

More on the [bot.craft()](https://mineflayer.prismarine.js.org/#/api?id=botcraftrecipe-count-craftingtable-callback) method.

## 高级

The following concepts aren't necessary to create a Mineflayer bot, but they can be useful to understand and create more advanced bots.  
We assume you have understood the [Basics](#basics) tutorial.

### Asynchronousy
In Javascript, asynchronousy is an important concept.  
By default, Javascript will run everything line by line, and only go to the next line if the current line is done. This is called blocking.  
However, sometimes you have to do something that takes a relatively long time, and you don't want your whole program to block and wait for it to finish.  

Interacting with the filesystem is often done using asynchronousy, because reading and writing large files can take a long time.  

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

The above codes uses what is called a Promise. A promise promises it will eventually complete.  
The function given you a promise always has 2 parameters, a `resolve` function and a `reject` function.  
If the promise is successful, it will call the `resolve` function, otherwise it will call the `reject` function.  
The above code uses a `setTimeout`, which calls the given function after the set amount of milliseconds, 1000 in this case.  
You can then tell the promise what it should do when it succeeds with `.then(function)` or when it fails with `.catch(function)`

The `.then` and `.catch` function can also be chained together with the promise to simplify the code.

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

### Loop over an object

The `for of` loop described in the [loops](#loops) chapter can also be used to loop over an object.

If we have the following object:

```js
const obj = {
  a: 1,
  b: 2,
  c: 3
}
```

The following will loop over all the values of the object.

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

This will loop over all the keys of the object.

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

You can also loop over the keys and values at the same time. You will have to destructure the variables first, explained [here.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

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

These loops are possible because `Object.values(obj)` and `Object.keys(obj)` both return an array of the objects values and keys respectively.  
`Object.entries(obj)` returns an array where each item is an array with 2 items: a key and its corresponding value.  
It's important to know that, unlike the `Object.values()` and `Object.keys()` functions, the `Object.entries()` function does not guarantee that the order is the same as the order when the object was defined.

There is also a `for in` loop. However, you will most often want to use `for of` instead of `for in` because there are key differences.  
The `for in` loop loops over the keys of an object instead of the values. (The index in case it is an array)
However, it doesn't loop only over its own keys, but also keys from other object it 'inherits' from, which can be confusing or unwanted. More on this [here.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)
In general, you'll want to use `for of` instead of `for in` so make sure you don't confuse the two.

### 从聊天中创建事件

You can create your own event from chat using [`bot.chatAddPattern()`](http://mineflayer.prismarine.js.org/#/api?id=botchataddpatternpattern-chattype-description) method. Useful for Bukkit servers where the chat format changes a lot.
[`bot.chatAddPattern()`](http://mineflayer.prismarine.js.org/#/api?id=botchataddpatternpattern-chattype-description) method takes three arguments :

- `pattern` - regular expression (regex) to match chat
- `chatType` - the event the bot emits when the pattern matches. e.g. "chat" or "whisper"
- `description` - Optional, describes what the pattern is for

You can add [Groups and Range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) into the `pattern`, then the listener will spread the captured groups into arguments of your callback sequentially.

阅读有关[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)的更多信息

例子 :

#### 回答你好 机器人

在这里，我们创建一个机器人，从另一个玩家那里回答“你好”。

```js
bot.chatAddPattern(
  /(helo|hello|Hello)/,
  'hello',
  'Someone says hello'
)

const hi = () => {
  bot.chat('Hi!')
}

bot.on('hello', hi)
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
bot.chatAddPattern(
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

安装[Termux](https://termux.com/) 并启动

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
