# 贡献

Mineflayer 最初主要是由 [andrewrk](http://github.com/andrewrk) 制作的
但自那以后，许多[贡献者](https://github.com/andrewrk/mineflayer/graphs/contributors)对其进行了改进和修复 
所以知道如何为mineflayer做出贡献的最佳方式很重要

## Issue organization

我们有3个阶段标签来尝试组织Issue:

* Stage 1: 只是由项目新手创建的，我们还不知道它是否值得实现/修复
* Stage 2: 有希望的想法，但在实施前需要更多思考
* Stage 3: 想法被精确地指定了，就剩写代码了

如同 https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 这样的链接可以用来过滤掉第1阶段，如果你正在寻找可以贡献的东西。

## 创建测试
Mineflayer 有两种测试 :

 * [internal tests](test/internalTest.js) : 针对使用node-minecraft-protocol创建的简单服务器进行的测试
 * [external tests](test/externalTests/) : 针对原版服务器进行的测试

这些测试的目的是自动知道在 mineflayer 中什么是有效的，什么是无效的，因此使mineflayer更容易工作。


## 运行测试
你可以在 npm run mocha_test 中使用 `-g` 标志来运行不同 Minecraft 版本的测试。例如:

```bash
# 运行所有支持版本中的所有测试
npm run test

# 在 Minecraft 1.20.4 中运行一个具体的测试
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*exampleBee"

# 仅在 1.20.4 版本中运行所有测试
npm run mocha_test -- -g "mineflayer_external 1.20.4v"
```


### 创建外部测试

现在，为了添加外部测试，您只需要在 [test/externalTests](test/externalTests) 创建一个文件。

一个例子 : [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

该文件需要导出一个函数，返回一个函数或一个函数数组，以bot对象和一个done回调作为参数，
 如果测试功能失败，它应该包含用于测试的断言。


## 创建第三方插件
Mineflayer 是可扩展的插件化的； 任何人都可以创建一个插件，在 Mineflayer 之上添加更高级别的 API。

已经开发了几个这样的第三方插件 [查看](https://github.com/andrewrk/mineflayer#third-party-plugins)

为了创建一个新的，您需要 :

1. 创建一个新的 repo
2. 在你的 index.js 文件中, 导出一个接受参数 mineflayer 的 init 函数 ([查看例子](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. 该函数返回一个以 bot 对象为参数的注入函数 ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. 注入函数向 bot 对象添加功能 ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

由于 mineflayer 对象是在参数中传递的，因此新包不需要依赖于 mineflayer （ package.json 中没有 mineflayer 依赖关系

参考 [全部示例](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) 

## 反馈Bug
Mineflayer 在大多数情况下都能很好地工作，但有时仍然存在bug.

找到一个问题时，最好报告一个提供这些信息的问题 :

* 你想做什么 (英语目标)
* 你尝试过什么 (代码)
* 发生了什么事
* 你期望会发生什么

## Mineflayer 代码
提交请求或提交提交时需要考虑的一些事情 :

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
docs/api.md 的内容是用doctoc制作的。更新该文件后，应运行 `doctoc docs/api.md` 以更新目录。

没有doctoc命令使用下面的命令安装

```bash
npm install -g doctoc
```
