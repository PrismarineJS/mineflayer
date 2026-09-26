# 贡献

Mineflayer 最初主要是由 [andrewrk](http://github.com/andrewrk) 制作的
但自那以后，许多[贡献者](https://github.com/andrewrk/mineflayer/graphs/contributors)对其进行了改进和修复所以知道如何为mineflayer做出贡献的最佳方式很重要。

## Issue organization

我们有3个阶段标签来尝试组织Issue:

* Stage 1: 只是由项目新手创建的，我们还不知道它是否值得实现/修复
* Stage 2: 有希望的想法，但在实施前需要更多思考
* Stage 3: 想法被精确地指定了，就剩写代码了

如果您正在寻找已准备好贡献的内容，可以使用类似 https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 这样的链接来筛选出第一阶段的内容。

## 创建测试
Mineflayer 有两种测试 :

 * [internal tests](test/internalTest.js) : 针对使用node-minecraft-protocol创建的简单服务器进行的测试
 * [external tests](test/externalTests/) : 针对原版服务器进行的测试

这些测试的目的是自动了解 Mineflayer 中哪些功能正常、哪些功能不正常，从而让 Mineflayer 的运行变得更容易（或者：从而更轻松地让 Mineflayer 正常運作）。


### 创建外部测试

要添加外部测试，现在只需在 [test/externalTests](test/externalTests) 中创建一个文件。

一个例子 : [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

该文件需要导出：一个返回函数的函数，或者一个返回函数数组的函数，该函数（或数组中的函数）以 bot 对象和 done 回调函数作为参数；它应当包含用于测试被测功能是否失败的断言（asserts）。

## 运行测试
你可以使用 -g 标志搭配 npm run mocha_test 来针对不同的 Minecraft 版本运行测试。例如：

```bash
# 运行所有支持版本中的所有测试
npm run test

# 在 Minecraft 1.20.4 中运行特定的测试
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*exampleBee"

# 仅在 1.20.4 版本中运行所有测试
npm run mocha_test -- -g "mineflayer_external 1.20.4v"
```


### 创建外部测试

若要添加外部测试，你只需要在 [test/externalTests](test/externalTests) 目录下创建一个文件。

示例： [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

该文件需要导出一个函数（该函数需返回一个函数，或者返回一个函数数组），且这些函数应接收 bot 对象和 done 回调函数作为参数。它应当包含断言（asserts）来检测所测试的功能是否失败。


## 创建第三方插件
Mineflayer 是可扩展的插件化的； 任何人都可以创建一个插件，在 Mineflayer 之上添加更高级别的 API。

已经开发了几个这样的第三方插件 [查看](https://github.com/andrewrk/mineflayer#third-party-plugins)

为了创建一个新的，您需要 :

1. 创建一个新的 repo
2. 在你的 index.js 文件中, 导出一个接受参数 mineflayer 的 init 函数 ([查看例子](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. 该函数会返回一个注入函数（inject function），该函数以 bot 对象作为参数 ([查看例子](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23)) 。
4. 该注入函数会为 bot 对象添加各项功能 ([查看例子](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))。

由于 mineflayer 对象是通过参数传入的，因此这个新套件（或：新软件包）不需要依赖 mineflayer（在其 package.json 中不需要包含 mineflayer 依赖项）。

参考 [全部示例](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) 

## 反馈Bug
Mineflayer 在大多数情况下都能很好地工作，但有时仍然存在bug.

找到一个问题时，最好报告一个提供这些信息的问题 :

* 你想做什么 (英语目标)
* 你尝试过什么 (代码)
* 发生了什么事
* 你期望会发生什么

## Mineflayer 代码
在提交 Pull Request (PR) 或进行提交 (Commit) 时需要考虑的一些事项：

### 错误处理
在大多数情况下，mineflayer不会让机器人崩溃。即使有些东西失败了，机器人也可以选择另一条路线来达到它的目标。

这意味着我们不应该使用 `throw(new Error("error"))` 而是使用node.js约定在回调中传递错误。

例如 : 

```js
function myfunction (param1, callback) {
  // do stuff
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // 一切正常
    callback()
  } else {
    callback(new Error('什么东西出错了'))
  }
}
```

请参考另一个例子 [mineflayer code](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10)

### 更新文档
docs/api.md 的目录（Table of Contents）是用 doctoc 生成的。在更新该文件后，你应该运行 doctoc docs/api.md 来更新目录。
