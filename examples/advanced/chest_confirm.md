# Manual Chest Confirm

This code snippet will tell the bot not to wait for chest confirmations that some spigot plugins will not send

```js
bot.on('windowOpen', async (window) => {
  window.requiresConfirmation = false // fix
  await bot.clickWindow(13, 0, 0)
  console.log(bot._events) // without the fix this code is unreachable, the promise never resolve
})
bot.on('windowClose', () => {
  console.log(bot._events) // without the fix there is a confirmTransaction1 listener that is never removed
})
```
