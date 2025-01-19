# Contribute

Mineflayer has originally been made mostly by [andrewrk](http://github.com/andrewrk)
but has since then be improved and fixed by many [contributors](https://github.com/andrewrk/mineflayer/graphs/contributors).
That's why it is important to know the best ways to contribute to mineflayer.

## Issue organization

We have 3 stage labels to try to organize issues:

* Stage 1: just created by someone new to the project, we don't know yet if it deserves an implementation / a fix
* Stage 2: promising idea, but needs more thinking before implementation
* Stage 3: idea is precisely specified, only coding is left to do

Links like https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 can be used to filter out stage 1 if you're looking for things that are ready for contribution

## Creating tests
Mineflayer has two kind of tests :

 * [internal tests](test/internalTest.js) : tests that are done against a simple server created with node-minecraft-protocol
 * [external tests](test/externalTests/) : tests that are done against the vanilla server
 
The objective of these tests is to know automatically what works and what doesn't in mineflayer, so it's easier to make mineflayer work.


## Running tests
You can run tests for Different Minecraft versions using the `-g` flag with npm run mocha_test. For example:

```bash
# Run all tests in all supported versions
npm run test

# Run a specific test in Minecraft 1.20.4
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*exampleBee"

# Run all tests in just version 1.20.4
npm run mocha_test -- -g "mineflayer_external 1.20.4v"
```


### Creating an external test

In order to add an external test now you only need to create a file in [test/externalTests](test/externalTests)

An example : [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

That file needs to export a function returning a function or an array of function taking as parameter the bot object and a done callback,
 it should contain asserts to test if the tested functionality failed.


## Creating a third party plugin
Mineflayer is pluggable; anyone can create a plugin that adds an even higher level API on top of Mineflayer.

Several such third party plugins have already been [created](https://github.com/andrewrk/mineflayer#third-party-plugins)

In order to create a new one you need to :

1. create a new repo
2. in your index.js file, exports an init function taking in argument mineflayer ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. that function returns a inject function taking in argument the bot object ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. that inject function add functionalities to the bot object ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

Since the mineflayer object is passed in parameter, that new package doesn't need to depend on mineflayer (no mineflayer dependency in the package.json)

See a [full example](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) here.

## Reporting bugs
Mineflayer works well for most usages, but it sometimes still has bugs.

When finding one it's best to report an issue providing these information :

* what you want to do (the objective in english)
* what you tried (the code)
* what happened
* what you expected to happen

## Mineflayer code
Some things to think about when submitting a Pull Request or making a commit :

### Error handling
In most cases, mineflayer shouldn't crash the bot. Even if something fails, the bot can take an alternative route to get to its objective.

What that means is we shouldn't use `throw(new Error("error"))` but instead use the node.js convention of passing the error in the callback.

For example : 

```js
function myfunction (param1, callback) {
  // do stuff
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // everything worked
    callback()
  } else {
    callback(new Error('something failed'))
  }
}
```

See an other example of that in [mineflayer code](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10)

### Updating the documentation
The table of content of docs/api.md is made with doctoc. After updating that file, you should run doctoc docs/api.md to update the table of content.
