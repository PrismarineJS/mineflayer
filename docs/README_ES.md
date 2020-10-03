# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| 🇺🇸 [Inglés](README.md) | 🇷🇺 [Ruso](README_RU.md) | 🇪🇸 [Español](README_ES.md) |
|------------------------|-------------------------|----------------------------|

Crea bots de Minecraft con una API JavaScript potente, estable y de alto nivel.

¿Primera vez usando node.js? Puede que te interese empezar con el tutorial [tutorial](tutorial.md)

## Características

 * Soporta Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15 y 1.16.
 * Rastreo e información de entidades.
 * Información de bloques. Puedes solicitar información de todo lo que te rodea.
 * Física y movimiento básicos: actualmente los bloques son "sólidos" o "vacíos".
 * Atacar entidades y usar vehículos.
 * Gestión del inventario.
 * Crafteo, cofres, dispensadores, mesas de encantamiento.
 * Excavar y contruir.
 * Cosas diversas como conocer tu salud y si está lloviendo.
 * Activar bloques y usar objetos.
 * Chat.

### Planes a futuro

Echa un vistazo a nuestros [proyectos actuales](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects)

## Instalación

`npm install mineflayer`

## Documentación

| link | descripción |
|---|---|
|[tutorial](tutorial.md) | Empezar con node.js y mineflayer |
| [FAQ.md](FAQ.md) | Alguna duda? Mira esto primero! |
| [api.md](api.md) [unstable_api.md](unstable_api.md) | Toda la documentación de la API |
| [history.md](history.md) | Historial de cambios de Mineflayer |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Todos los ejemplos para mineflayer |

## Contribuir

Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) y [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Uso

**Vídeo**

Puedes encontrar un vídeo tutorial que explica el proceso inicial para empezar un bot [aquí](https://www.youtube.com/watch?v=ltWosy4Z0Kw) (en inglés).  

**Empezando**

Sin especificar una versión, la versión del servidor se detectará automáticamente, puedes configurar una versión específica utilizando la opción de versión.
Por ejemplo `version:" 1.8 "`.

### Ejemplo
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: "localhost", // opcional
  port: 25565,       // opcional
  username: "email@example.com", // el correo electrónico y contraseña sólo son necesarios   
  password: "12345678",          // para servidores con el flag online-mode=true
  version: false                 // el valor false implica detectar la versión automáticamente, puedes configurar una versión específica utilizando por ejemplo "1.8.8"
})

bot.on('chat', function (username, message) {
  if (username === bot.username) return
  bot.chat(message)
})

// Imprimir errores y la razón si eres kickeado:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### See what your bot is doing

Gracias al proyecto [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), puedes ver en una pestaña del navegador qué está haciendo tu bot.
Solo tienes que ejecutar `npm install prismarine-viewer` y añadir lo siguiente a tu bot:
```js
const mineflayerViewer = require('prismarine-viewer').mineflayer
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})
```
Y podrás ver una representación *en vivo* como esta:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### Más ejemplos

| ejemplo | descripción |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Visualiza lo que ve tu bot en el buscador |
|[pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Haz que tu bot vaya a una ubicación automáticamente |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Aprende a usar cofres, hornos, dispensadores y mesas de encantamiento |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Aprende como crear un bot que pueda cavar romper un bloque |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Conecta un bot de discord con un bot de mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Aprende a moverte, saltar, ir en vehiculos y atacar entidades cercanas |

Puedes encontrar muchos más ejemplos en la carpeta de [ejemplos](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Modulos

Una buena porcion del desarrollo se esta produciendo dentro de pequeños paquetes npm que son usados por mineflayer

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Módulos
Estos son los módulos principales que forman mineflayer:

| módulo | descripción |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Analiza y crea paquetes de minecraft, autentificación and encriptación.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Modulo independiente de lenguaje que provee datos de minecraft para clientes, servidores y librerías.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Motor físico para las entidades de minecraft
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Representa un chunk de minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | Matemáticas de vectores 3d con tests unitarios
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Representa un bloque y su información asociada en Minecraft
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Analizador de mensajes de chat (extraído de mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Librería Node.js para interactuar con el sistema de autentificación de Mojang conocido como Yggdrasil.
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | Implementación principal de los mundos de Minecraft para Prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Representa ventanas en minecraft
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Representa un item y su información asociada en Minecraft
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Analizador de NBT para node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Representa recetas/crafteos en Minecraft
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Representa un bioma y su información asociada en Minecraft
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Representa una entidad y su información asociada en Minecraft

### Depuración

Puedes habilitar la depuración del protocolo utilizando la variable de entorno `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

En windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```
## Complementos de terceros

Mineflayer tiene la capacidad de instalar complementos; cualquiera puede crear un complemento que agregue
un API de nivel superior a Mineflayer.

Los más actualizados y útiles son:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - algoritmo de busqueda A* avanzado con muchas características configurables
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - visualizador de chunks basado en web
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - visualizador de inventario basado en web
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - API de autómata infinito para comportamientos más complejos
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - gestión automática de armaduras
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - API rápida y simple para recolectar bloques.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Panel de instrumentos para un bot de Mineflayer


Pero también echa un vistazo a:

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - moverse fácilmente
   utlizando el algoritmo de búsqueda A* [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - interfaz de radar
   basada en web utilizando canvas y socket.io [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - encontrar bloques en el mundo 3D
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - moverse a un destino
   específico incluso si es necesario construir o rompler bloques para lograrlo
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - autenticación basada en chat
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determinar quién y qué es responsable de dañar a otra entidad
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - obtener los tps actuales (tps procesados)

## Proyectos que utilizan Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualizar que está
   haciendo el bot utilizando voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  registrar la actividad del jugador en una API en línea
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (última versión de código abierto, creada por AlexKvazos) -  Cliente de chat en web para Minecraft <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - bot basado en complementos con una GUI limpia. Hecho con Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - bot de Minecraft usando algoritmos genéticos, ver [sus videos de youtube](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  puente de Telegram, construido sobre Mineflayer y Telegraf.
 * [and hundreds more](https://github.com/PrismarineJS/mineflayer/network/dependents) - todos los proyectos que github detecta usando mineflayer

## Pruebas Unitarias

Después de clonar el proyecto, se requiere una configuración adicional para ejecutar las pruebas, pero una vez hecho esto, es muy fácil ejecutarlas

### Preparación

Para que todas las pruebas se ejecuten correctamente, primero debes:

1. crear una nueva carpeta donde se ubicará el jar del servidor de Minecraft
2. definir la variable de entorno MC_SERVER_JAR_DIR para esta carpeta

Ejemplo:

1. `mkdir server_jars`
2. `export MC_SERVER_JAR_DIR=/full/path/to/server_jars`

Donde "/full/path/to/" es la ruta completa.

### Ejecutar todas las pruebas

Simplemente ejecuta: `npm test`

### Ejecutar pruebas para una versión específica de Minecraft
Ejecuta `npm test -g <version>`, donde `<version>` es una versión de minecraft, es decir, `1.12`, `1.15.2`...

### Ejecutar una pruebas específica
Ejecuta `npm test -g <test_name>`, donde `<test_name>` es el nombre de la prueba que quieres ejecutar por ejemplo `bed`, `useChests`, `rayTrace`...

## Licencia

[MIT](LICENSE)
