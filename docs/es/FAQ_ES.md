## FAQ

Este documento sobre preguntas frecuentes es para ayudar la gente en cosas básicas

## Como ocultar errores?

Escribe `hideErrors: true` en las opciones de createBot
También puedes usar estos eventos:

```js
client.on('error', () => {})
client.on('end', () => {})
```

## Mi evento de chat no se emite en un servidor personalizado, cómo lo resuelvo?

Los servidores spigot, en particular algunos plugins, usan formatos personalizados de chat, tienes que analizarlos con un regex personalizado.
Lee y modifica [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) para que funcione con tu plugin de chat particular. Lee también http://mineflayer.prismarine.js.org/#/tutorial?id=custom-chat

### Como puedo recolectar información de un plugin de chat personalizado?

La mayoría de servidores de minecraft tienen plugins, que mandan mensajes al chat cuando ocurre algo. Si es algo sencillo, se puede utilizar la solución anterior, pero si tiene mucha información en un solo mensaje, la otra opción sería usar el evento `"messagestr"` que te permite analizar los mensajes fácilmente.

**Ejemplo:**

El mensaje podría ser así:
```
(!) U9G has won the /jackpot and received
$26,418,402,450! They purchased 2,350,000 (76.32%) ticket(s) out of the
3,079,185 ticket(s) sold!
```
```js
const regex = {
  first: /\(!\) (.+) has won the \/jackpot and received +/,
  second: /\$(.+)! They purchased (.+) \((.+)%\) ticket\(s\) out of the /,
  third: /(.+) ticket\(s\) sold!/
}

let jackpot = {}
bot.on('messagestr', msg => {
  if (regex.first.test(msg)) {
    const username = msg.match(regex.first)[1]
    jackpot.username = username
  } else if (regex.second.test(msg)) {
    const [, moneyWon, boughtTickets, winPercent] = msg.match(regex.second)
    jackpot.moneyWon = parseInt(moneyWon.replace(/,/g, ''))
    jackpot.boughtTickets = parseInt(boughtTickets.replace(/,/g, ''))
    jackpot.winPercent = parseFloat(winPercent)
  } else if (regex.third.test(msg)) {
    const totalTickets = msg.match(regex.third)[1]
    jackpot.totalTickets = parseInt(totalTickets.replace(/,/g, ''))
    onDone(jackpot)
    jackpot = {}
  }
})
```

### Como puedo mandar un comando?

Usando `bot.chat()`.

**Ejemplo:**
```js
bot.chat('/give @p diamond')
```

### Es posible crear multiples bots y controlarlos separadamente?

Crea diferentes bots con createBot y haz diferentes cosas para cada uno, echa un vistazo a multiple.js

### Como hago para que el bot dropee/tire todo su inventario?

bot.inventory.items() te proporciona un array de los ítems del bot. Puedes usar una función recursiva para tirar cada ítem usando bot.toss(). Haz click [aquí](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) para ver un ejemplo

### Como veo los paquetes que con mandados/recibidos?

Activa el modo de depuración https://github.com/PrismarineJS/mineflayer/blob/master/docs/es/README_ES.md#depuraci%C3%B3n

### Quiero prevenir una desconexión en caso de lag en el servidor, como puedo hacerlo?

Una forma de hacerlo es aumentar el valor en la opción [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) (por ejemplo `300*1000` que es 5 minutos en vez del valor predeterminado, que es 30 segundos). Si con eso todavía te desconecta del servidor, puedes reconectarte automáticamente con este ejemplo https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js

### Como puedo obtener el lore / texto de un ítem?

Puedes usar la propiedad `item.nbt`. Está recomendado usar la librería `prismarine-nbt`. El método nbt.simplify() podría ser útil.

**Ejemplo:**
```js
function getLore (item) {
  let message = ''
  if (item.nbt == null) return message

  const nbt = require('prismarine-nbt')
  const ChatMessage = require('prismarine-chat')(bot.version)

  const data = nbt.simplify(item.nbt)
  const display = data.display
  if (display == null) return message

  const lore = display.Lore
  if (lore == null) return message
  for (const line of lore) {
    message += new ChatMessage(line).toString()
    message += '\n'
  }

  return message
}
```

### Como puedo mandar un mensaje de la consola al servidor?

Puedes usar una librería como `repl` para leer lo que escribes en la consola y usar `bot.chat()` para mandarlo al servidor. Puedes encontrar un ejemplo [aquí](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### Cuando creo un plugin, como puedo especificar otro plugin como dependencia?

En la función `inject()` the tu plugin, puedes ejecutar la función `bot.loadPlugin()` para cargar ese plugin. Si el plugin ya estaba cargado de antes, no pasará nada.

Nota: el orden en el cual los plugins son cargados es dinámico, nunca deberías llamar otro plugin en tu función `inject()`.

### Como puedo usar un proxy socks5?

En las opciones de `mineflayer.createBot(opciones)`, quita tu `host` de las opciones y pon las cosas que se necesite en estas variables `PROXY_IP`, `PROXY_PORT`, `PROXY_USERNAME`, `PROXY_PASSWORD`, `MC_SERVER_IP`, `MC_SERVER_PORT`, y añade esto a tus opciones:
```js
connect: (client) => {
  socks.createConnection({
    proxy: {
      host: PROXY_IP,
      port: PROXY_PORT,
      type: 5,
      userId: PROXY_USERNAME,
      password: PROXY_PASSWORD
    },
    command: 'connect',
    destination: {
      host: MC_SERVER_IP,
      port: MC_SERVER_PORT
    }
  }, (err, info) => {
    if (err) {
      console.log(err)
      return
    }
    client.setSocket(info.socket)
    client.emit('connect')
  })
}
```

# Errores frecuentes

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

Esto pasa cuando proporcionas una versión equivocada a mineflayer o mineflayer detecta la versión equivocada

### `TypeError: Cannot read property '?' of undefined`

Podrías estar intentando usar una propiedad del bot que todavía no existe, intenta usar la propiedad despues del evento `spawn`

### `SyntaxError: Unexpected token '?'`

Actualiza la versión de tu node

### The bot can't break/place blocks or open chests

Comprueba que la protección de spawn no está impidiendo el bot de realizar la acción


Esta documentación no está mantenida oficialmente, si quiere ver las últimas novedades, por favor dirijase a la documentación original: [FAQ](../FAQ.md)
