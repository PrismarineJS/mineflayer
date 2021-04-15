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

This code snippet tells the server that the client declined a custom texture pack when the server sends a texture pack
```js
bot._client.on('resource_pack_send', (data) => {
  bot._client.write('resource_pack_receive', { // This tells the server that the client declined the resource pack.
    result: 1
  })
})
```

This code snippet tells the server that the client failed download of a custom texture pack when the server sends a texture pack

```js
bot._client.on('resource_pack_send', (data) => {
  bot._client.write('resource_pack_receive', { // This tells the server that the client accepted the resource pack.
    result: 2
  })
})
```

Add `hash: data.hash` if you are on a version prior to 1.10 like:
```js
bot._client.on('resource_pack_send', (data) => {
  bot._client.write('resource_pack_receive', { // This tells the server that the client accepted the resource pack.
    result: 3
    hash: data.hash
  })
  bot._client.write('resource_pack_receive', { // This tells the server the client successfully loaded the resource pack.
    result: 0
    hash: data.hash
  })
})
```


