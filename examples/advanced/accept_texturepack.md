# Accept server's texturepack

This code snippet tells the server that the client accepted a custom texture pack when the server sends a texture pack

```js
bot._client.on('resource_pack_send', (data) => {
  bot._client.write('resource_pack_receive', { // This tells the server that the client accepted the resource pack.
    result: 3
  })
  bot._client.write('resource_pack_receive', { // This tells the server the client successfully loaded the resource pack.
    result: 0
  })
})
```
