# 贡献

Mineflayer 最初主要是由 [andrewrk](http://github.com/andrewrk) 制作的
但自那以后，许多[贡献者](https://github.com/andrewrk/mineflayer/graphs/contributors)对其进行了改进和修复 
所以知道如何为mineflayer做出贡献的最佳方式很重要

## Issue organization

我们有3个阶段标签来尝试组织Issue:

* Stage 1: 只是由项目新手创建的，我们还不知道它是否值得实现/修复
* Stage 2: 有希望的想法，但在实施前需要更多思考
* Stage 3: 想法被精确地指定了，就剩写代码了

链接如 https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 can be used to filter out stage 1 if you're looking for things that are ready for contribution

## 创建测试
Mineflayer 有两种测试 :

 * [internal tests](test/internalTest.js) : 针对使用node-minecraft-protocol创建的简单服务器进行的测试
 * [external tests](test/externalTests/) : 针对原版服务器进行的测试

The objective of these tests is to know automatically what works and what doesn't in mineflayer, so it's easier to make mineflayer work.

### 创建外部测试

In order to add an external test now you only need to create a file in [test/externalTests](test/externalTests)

一个例子 : [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

That file needs to export a function returning a function or an array of function taking as parameter the bot object and a done callback,
 it should contain asserts to test if the tested functionality failed.


## 创建第三方插件
Mineflayer 是可扩展的插件化的； 任何人都可以创建一个插件，在 Mineflayer 之上添加更高级别的 API。

已经开发了几个这样的第三方插件 [查看](https://github.com/andrewrk/mineflayer#third-party-plugins)

为了创建一个新的，您需要 :

1. 创建一个新的 repo
2. 在你的 index.js 文件中, 导出一个接受参数 mineflayer 的 init 函数 ([查看例子](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. that function returns a inject function taking in argument the bot object ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. that inject function add functionalities to the bot object ([example](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

Since the mineflayer object is passed in parameter, that new package doesn't need to depend on mineflayer (no mineflayer dependency in the package.json)

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

```
npm install -g doctoc
```
