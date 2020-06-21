## FAQ

This Frequently Asked Question document is meant to help people for the most common things.

### How to hide errors ?

Use `hideErrors: True` in createBot options
You may also choose to add these listeners :
```js
client.on('error', () => {})
client.on('end', () => {})
```

### How can I send a command ?

by using bot.chat

### Is it possible to login multiple accounts using bot = mineflayer.createbot while controlling them all separately ?

Create different bot instances by calling createBot then do different things for each, see multiple.js

### How would I make the bot drop it's entire inventory?

bot.inventory.items() returns an array of the bot's items. You can use a recursive function to loop through them and drop every item using bot.toss(). Click [here](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) to see an example
