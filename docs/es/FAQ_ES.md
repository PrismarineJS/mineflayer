## FAQ

Este documento sobre preguntas frecuentes es para ayudar la gente para las cosas básicas

## Como ocultar errores?

Escribe `hideErrors: true` en las opciones de createBot
También puedes usar estos eventos:

```js
client.on('error', () => {})
client.on('end', () => {})
```

## Mi evento de chat no se dispara en un servidor personalizado, cómo lo resuelvo?

Los servidores spigot, en particular algunos plugins, usan formatos personalizados de chat, tienes que analizarlos con un regex personalizado.
Lee y modifica [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) para que funcione con tu plugin de chat particular. Lee también http://mineflayer.prismarine.js.org/#/tutorial?id=custom-chat

### Como puedo recolectar información de un plugin de chat personalizado?

La mayoría de servidores de minecraft tienen plugins, que mandan mensajes al chat cuando ocurre algo. Si es algo sencillo, se puede utilizar la solución anterior, pero si tiene mucha información en un solo mensaje, la otra opción sería usar el evento `"messagestr"` que te permite analizar los mensajes fácilmente.

**Ejemplo:**

El mensaje podría ser así:
```
(!) U9G ha ganado la /lotería y ha recibido
$26,418,402,450! Compró 2,350,000 (76.32%) ticket(s) del total de
3,079,185 ticket(s) vendidos!
```
```js
const regex = {
  primero: /\(!\) (.+) ha ganado la \/lotería y ha recibido +/,
  segundo: /\$(.+)! Compró (.+) \((.+)%\) ticket\(s\) del total de /,
  tercero: /(.+) ticket\(s\) vendidos!/
}

let loteria = {}
bot.on('messagestr', msg => {
  if (regex.primero.test(msg)) {
    const nombre = msg.match(regex.primero)[1]
    loteria.nombre = nombre
  } else if (regex.segundo.test(msg)) {
    const [, dineroGanado, ticketsComprados, porcentajeGanancia] = msg.match(regex.segundo)
    loteria.dineroGanado = parseInt(dineroGanado.replace(/,/g, ''))
    loteria.ticketsComprados = parseInt(ticketsComprados.replace(/,/g, ''))
    loteria.porcentajeGanancia = parseFloat(porcentajeGanancia)
  } else if (regex.tercero.test(msg)) {
    const totalTickets = msg.match(regex.tercero)[1]
    loteria.totalTickets = parseInt(totalTickets.replace(/,/g, ''))
    alFinalizar(loteria)
    loteria = {}
  }
})
```

### Como puedo mandar un comando?

Usando `bot.chat()`.

**Ejemplo:**
```js
bot.chat('/give @p diamond')
```

### Es posible crear multiples bots y controlandolos separadamente?

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
function obtenerLore (item) {
  let texto = ''
  if (item.nbt == null) return texto

  const nbt = require('prismarine-nbt')
  const ChatMessage = require('prismarine-chat')(bot.version)

  const data = nbt.simplify(item.nbt)
  const display = data.display
  if (display == null) return texto

  const lore = display.Lore
  if (lore == null) return texto
  for (const line of lore) {
    texto += new ChatMessage(line).toString()
    texto += '\n'
  }

  return texto
}
```

### Como puedo mandar un mensaje de la consola al servidor?

Puedes usar una librería como `repl` para leer lo que escribes en la consola y usar `bot.chat()` para mandarlo al servidor. Puedes encontrar un ejemplo [aquí](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### Cuando creo un plugin, como puedo especificar otro plugin como dependencia?

En la función `inject()` the tu plugin, puedes ejecutar la función `bot.loadPlugin()` para cargar ese plugin. Si el plugin ya estaba cargado de antes, no pasará nada.

Nota: el orden en el cual los plugins son cargados es dinámico, nunca deberías llamar otro plugin en tu función `inject()`.

### Como puedo usar un proxy socks5?

En las opciones de `mineflayer.createBot(opciones)`, quita tu `host` de las opciones y pon las cosas que se necesite en estas variables `IP_PROXY`, `PUERTO_PROXY`, `USUARIO_PROXY`, `CONTRASEÑA_PROXY` (Puede que algunos programas no admitan la 'ñ') , `IP_SERVIDOR`, `PUERTO_SERVIDOR`, y añade esto a tus opciones:
```js
connect: (client) => {
  socks.createConnection({
    proxy: {
      host: IP_PROXY,
      port: PUERTO_PROXY,
      type: 5,
      userId: USUARIO_PROXY,
      password: CONTRASEÑA_PROXY
    },
    command: 'connect',
    destination: {
      host: IP_SERVIDOR,
      port: PUERTO_SERVIDOR
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
