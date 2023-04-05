# Tutorial

**Table of Contents**

- [Basics](#basics)
  - [Javascript basics](#javascript-basics)
    - [Installing Node](#installing-node)
    - [Javascript variables](#javascript-variables)
    - [Show output](#show-output)
    - [Javascript functions](#javascript-functions)
    - [Javascript types](#javascript-types)
    - [If-statements](#if-statements)
    - [Loops](#loops)
    - [Node Package manager](#node-package-manager)
  - [Creating a bot](#creating-a-bot)
    - [Javascript objects](#javascript-objects)
    - [Logging in](#logging-in)
  - [Passing along functions](#passing-along-functions)
  - [Listening for an event](#listening-for-an-event)
  - [Promises](#promises)
    - [Correct and incorrect approach](#correct-and-incorrect-approach)
- [Advanced](#advanced)
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

## Introduction

This tutorial will help you get started with Mineflayer, even if you know nothing about coding.  
If you already know some things about Node and NPM, you can go to the [Create a bot](#creating-a-bot) section, otherwise start here.

## Basics

The following sections are about basics concepts you need to know to get started using Mineflayer.

### Javascript basics

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

Start by typing the following:

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

#### Show output

A lot of times you want to see the current value of a variable, to make sure your program is running correctly.  
You do this by printing the variables to the terminal.  
In Javascript, we can do this using the `console.log()` function.  

```js
const test = 5

console.log(test)
```

Now when you save and run this code, you should finally see something:

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

#### Javascript types

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
  console.log('Your name is Bob')
} else if (name === 'Alice') {
  console.log('Your name is Alice')
} else {
  console.log('Your name is not Bob or Alice')
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
  countDown = countDown - 1 // Decrement countDown by 1
}

console.log('Finished!')
```

The above code will print the following

```txt
5
4
3
2
1
Finished!
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

#### Node Package manager

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

### Creating a bot

Now that you know the basics of Javascript, Node and NPM, you're ready to start creating your first bot!  
If you don't know any of the terms above, you should go back to the [previous section](#javascript-basics)

Below is the absolute minimum necessary to create a Mineflayer bot.

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
  host: 'localhost', // Change this to the ip you want.
  port: 25565 // Change this to the port you want.
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

console.log(object.number) // This will print the value 10
```

This concept is often used to create what is named 'named parameters'  
The advantage of this is that you don't have to use all the options available, and their position does not matter.  
The value can be anything, even other object. If the value is a function, that function is often called a method for that object.  
You can also create the object in-line.

```js
const bot = mineflayer.createBot({ host: 'localhost', port: 25565 })
```

#### Logging in

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
  bot.chat('hi!')
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
  bot.chat('hi!')
})
```

### Listening for an event

The bot object has many useful [events](http://prismarinejs.github.io/mineflayer/#/api?id=events).
You can listen for an event by using either `bot.on()` method or `bot.once()` method of the bot object, which takes the name of an event and a function.
To remove specific listener you can use `bot.removeListener()` method.

- `bot.on(eventName, listener)`
  Execute the `listener` function for each time the event named `eventName` triggered.
- `bot.once(eventName, listener)`
  Execute the `listener` function, only once, the first time the event named `eventName` triggered.
- `bot.removeListener(eventName, listener)`
  Removes the specified `listener` for the event named `eventName`. In order to use this you either need to define your function with `function myNamedFunc() {}` or put your function in a variable with `const myNamedFunc = () => {}`. You can then use `myNamedFunc` in the listener argument.

Not only bot object, [`Chest`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerchest), [`Furnace`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerfurnace), [`Dispenser`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerdispenser), [`EnchantmentTable`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayerenchantmenttable), [`Villager`](http://prismarinejs.github.io/mineflayer/#/api?id=mineflayervillager) object also have their own events!

### Promises
A [promise](https://nodejs.dev/learn/understanding-javascript-promises) is a function that you can use the `await` variable to wait on until it's job is complete. (you can omit the await to not wait for results)

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

The above code will try to consume what the bot is currently holding.  
When the consuming ends, the function that is passed along is called.  
We can then do other things that we want to do after.  
The function could also be called when an error occurs.

#### Correct and incorrect approach

Below is an example of a bot that will craft oak logs into oak planks and then into sticks.

Incorect approach ❌:

```js
function craft (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id ?? mcData.itemsByName.planks.id)[0] // Get the first recipe for oak planks
  bot.craft(plankRecipe, 1) // ❌ start crafting oak planks.

  const stickRecipe = bot.recipesFor(mcData.itemsByName.sticks.id)[0] // Get the first recipe for sticks
  bot.craft(stickRecipe, 1) // ❌ start crafting sticks.
}
```

Correct approach with promises ✔️:

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

The reason the incorrect approach is wrong is because when `bot.craft()` is called, the code will continue below while the bot is crafting.  
By the time the code reaches the second `bot.craft()`, the first probably hasn't finished yet, which means the wanted resource is not available yet.  
Using promises can fix this because they will only be called after the `bot.craft()` is finished.

More on the [bot.craft()](https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#botcraftrecipe-count-craftingtable) method.

## Advanced

The following concepts aren't necessary to create a Mineflayer bot, but they can be useful to understand and create more advanced bots.  
We assume you have understood the [Basics](#basics) tutorial.

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

### Creating an event from chat

You can create your own event from chat using [`bot.chatAddPattern()`](http://prismarinejs.github.io/mineflayer/#/api?id=botchataddpatternpattern-chattype-description) method. Useful for Bukkit servers where the chat format changes a lot.
[`bot.chatAddPattern()`](http://prismarinejs.github.io/mineflayer/#/api?id=botchataddpatternpattern-chattype-description) method takes three arguments :

- `pattern` - regular expression (regex) to match chat
- `chatType` - the event the bot emits when the pattern matches. e.g. "chat" or "whisper"
- `description` - Optional, describes what the pattern is for

You can add [Groups and Range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) into the `pattern`, then the listener will spread the captured groups into arguments of your callback sequentially.

Read more about [regular expression](https://en.wikipedia.org/wiki/Regular_expression).

Examples :

#### Answer Hello Bot

Here we're creating a bot that answer 'hello' from the other player.

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

#### Custom chat

Creating an event based on custom chat format.  
Custom chat example:

```txt
[Player] Player1 > Hello
[Admin] Alex > Hi
[Player] Player2 > Help me, im stuck
[Mod] Jim > On my way
```

```js
bot.chatAddPattern(
  /^\[(.+)\] (\S+) > (.+)$/,
  'my_chat_event',
  'Custom chat event'
)

const logger = (rank, username, message) => {
  console.log(`${username} said ${message}`)
}

bot.on('my_chat_event', logger)
```

Explanation on the regex `^\[(.+)\] (\S+) > (.+)$` can be found [here](https://regex101.com/r/VDUrDC/2).

## FAQ

### How to run a bot on android

Here is a quick setup for running a bot on an android device using [Termux](https://termux.com/).

#### Install Termux

Install [Termux](https://termux.com/) and start it.

#### Setup

Install `Node.js`:

```bash
pkg update -y
pkg install nodejs -y
```

❗️ Allow Storage permission for Termux on app settings.
Create new folder on internal storage :

```bash
cd /sdcard
mkdir my_scripts
cd my_scripts
```

Install `mineflayer`:

```bash
npm install mineflayer
```

Now you can copy / store all of your scripts into `my_scripts` folder inside Internal Storage.

#### Start your bot

To start the bot, run Node with the name of your script.

```bash
node script_name.js
```

❗️ For each time opening Termux you must change the cwd into `/sdcard/my_scripts`, before starting the bot:

```bash
cd /sdcard/my_scripts
```
