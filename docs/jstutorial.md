# Javascript basics

## Installing Node

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

## Javascript variables

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

## Show output

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

## Javascript functions

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

## Javascript types

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

## If-statements

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

## Loops

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

## Javascript objects

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

## Node Package manager

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
