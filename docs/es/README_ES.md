# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| <sub>EN</sub> [English](../README.md) | <sub>RU</sub> [русский](../ru/README_RU.md) | <sub>ES</sub> [Español](../es/README_ES.md) | <sub>FR</sub> [Français](../fr/README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [中文](../zh/README_ZH_CN.md) | <sub>BR</sub> [Português](../br/README_BR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

Crea bots para Minecraft con una API de JavaScript potente, estable y de alto nivel.

¿Primera vez usando node.js? Puede que quieras empezar con el tutorial [tutorial](../tutorial.md)

## Características

 * Soporta Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19 y 1.20.
 * Rastreo e información de entidades.
 * Información sobre bloques. Puedes solicitar información de todo lo que te rodea. Encuentra bloques en milisegundos
 * Físicas y movimientos básicos - maneja todos los cuadros de colisión
 * Atacar entidades y usar vehículos.
 * Gestión del inventario.
 * Crafteo, cofres, dispensadores, mesas de encantamiento.
 * Cavar y contruir.
 * Diversas cosas como saber tu salud y si está lloviendo.
 * Activar bloques y usar ítems.
 * Chatear/Hablar.

### Planes para el futuro

Echa un vistazo a nuestros [proyectos actuales](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects)

## Instalación
Primero instala Node.js >= 18 desde [nodejs.org](https://nodejs.org/)

`npm install mineflayer`

## Documentación

| link | descripción |
|---|---|
|[tutorial](../tutorial.md) | Empieza con node.js y mineflayer |
| [FAQ.md](FAQ_ES.md) | Alguna duda? Echa un vistazo a esto |
| [api.md](api_es.md) [unstable_api.md](unstable_api_es.md) | Toda la documentación de la API |
| [history.md](../history.md) | Historial de cambios de Mineflayer |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Todos los ejemplos de mineflayer |

## Contribuir

Por favor, lee [CONTRIBUTING.md](CONTRIBUTING_ES.md) y [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Uso

**Vídeos**

Puedes encontrar un tutorial que explica el proceso de como empezar un bot [aquí](https://www.youtube.com/watch?v=ltWosy4Z0Kw) (en inglés).  

Si quieres aprender más, puedes mirar [aquí, ](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) los códigos usados en los vídeos [aquí](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Empezando**

Si no se especifica una versión, la versión del servidor se detectará automáticamente. Si no se especifica ningún tipo de autenticación, se utilizará el login de Mojang automáticamente. 

### Ejemplo: echo
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // ip del servidor de minecraft
  username: 'email@example.com', // usuario de la cuenta, e-mail si es premium
  password: '12345678' // para servidores premium
  // port: 25565, // modificar solo si es un servidor que no utiliza el puerto predeterminado (25565)
  // version: false, // modificar solo si se necesita una version específica
  // auth: 'mojang', // solo modificar si tienes una cuenta microsoft (en ese caso sería auth: 'microsoft')
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Imprimir errores y la razón del kickeo si te kickean:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### Mira lo que hace tu bot

Gracias al proyecto [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), puedes ver en una pestaña del navegador qué está haciendo tu bot.
Solo tienes que ejecutar `npm install prismarine-viewer` y añadir lo siguiente a tu bot:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // el puerto es en que puerto del buscador hostear el plugin, y firstPerson es por si quieres la vista en primera persona o no
})
```
Y podrás ver una representación *en vivo* como esta:

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### Más ejemplos

| ejemplo | descripción |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Visualiza lo que ve tu bot en el buscador |
|[pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Haz que tu bot vaya a cualquier ubicación automáticamente |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Aprende a usar cofres, hornos, dispensadores y mesas de encantamiento |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Aprende como crear un bot que pueda romper un bloque |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Conecta un bot de discord con un bot de mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Aprende a moverte, saltar, ir en vehiculos y atacar entidades cercanas |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Muestra todos los mensajes que mandan al chat en tu consola con sus colores correspondientes |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Haz un bot que defienda un área predefinida de mobs |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Usa un archivo de texto con cuentas para crear bots |

Más ejemplos en la carpeta de [ejemplos](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Módulos

La mayoría del desarrollo se está produciendo dentro de pequeños módulos npm que son usados por mineflayer

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Módulos
Estos son los módulos principales que forman mineflayer:

| módulo | descripción |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Analiza y crea paquetes de minecraft, autentificación and encriptación.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Módulo independiente del lenguaje que provee datos de minecraft para clientes, servidores y librerías.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Motor de físicas para las entidades de minecraft
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Representa un chunk de minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | Usa vectores 3d con pruebas sólidas
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Representa un bloque y su información asociada de Minecraft
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Analizador para los mensajes de chat de minecraft (extraído de mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Librería Node.js para interactuar con el sistema de autentificación de Mojang conocido como Yggdrasil.
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | Implementación principal de los mundos de Minecraft para Prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Representa las interfaces de minecraft
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Representa un item y su información asociada de Minecraft
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Analizador de NBT para node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Representa recetas/crafteos de Minecraft
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Representa un bioma y su información asociada de Minecraft
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Representa una entidad y su información asociada de Minecraft

### Depuración

Puedes habilitar la depuración del protocolo utilizando la variable de entorno `DEBUG`:

```bash
DEBUG="minecraft-protocol" node [...]
```

En windows :
```
set DEBUG=minecraft-protocol
node tu_archivo.js
```
## Plugins de terceros

Mineflayer tiene la capacidad de instalar plugins; cualquiera puede crear un plugin que agregue
un API de nivel superior a Mineflayer.

Los más actualizados y útiles son:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - algoritmo de busqueda A* avanzado con muchas características configurables
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - visualizador de chunks en la web
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - visualizador de inventario en la web
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - API para comportamientos más complejos
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - gestión automática de armaduras
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - API rápida y simple para recolectar bloques.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Panel de instrumentos para un bot de Mineflayer
 * [PVP](https://github.com/TheDudeFromCI/mineflayer-pvp) - API sencilla para PVP y PVE.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - Plugin para comer automáticamente.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - Plugin con un API de alto nivel para seleccionar automáticamente la mejor arma/herramienta.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - Plugin para apuntar automáticamente con arcos.


Pero también echa un vistazo a:

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - interfaz de radar en la web utilizando canvas y socket.io [Demo en Youtube](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - encuentra bloques en el mundo tridimensional
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - ir a un destino específico incluso si es necesario construir o rompler bloques para lograrlo [Demo en Youtube](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - autentificación automática por chat
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determina quién y/o qué es responsable de dañar a otra entidad
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - obtener el tps actual (tps procesado)
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - toma imágenes panorámicas de tu mundo

## Proyectos que utilizan Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - construyendo una escalera en espiral](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicando una estructura](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualiza que está
   haciendo el bot, utilizando voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  registra la actividad de un jugador en una API en línea
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (última versión de código libre, creada por AlexKvazos) -  Interfaz de chat en la web para Minecraft <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - bot con una interfaz limpia. Hecho con Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - bot de Minecraft que utiliza algoritmos genéticos, ver [sus videos de youtube](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  puente para Telegram, hecho con Mineflayer y Telegraf.
 * [and hundreds more](https://github.com/PrismarineJS/mineflayer/network/dependents) - todos los proyectos que usan mineflayer y que han sido detectados por github

## Pruebas

### Ejecuta todas las pruebas

Simplemente ejecuta:

```bash
npm test
```

### Ejecuta pruebas para una versión específica de Minecraft

Ejecuta
```bash
npm test -- -g <version>
```

donde `<version>` es una versión de minecraft como `1.12`, `1.15.2`...

### Ejecuta una prueba específica

Ejecuta
```bash
npm test -- -g <test_name>
```

donde `<test_name>` es el nombre de la prueba que quieres ejecutar como `bed`, `useChests`, `rayTrace`...

## Licencia

[MIT](../../LICENSE)


Esta documentación no está mantenida oficialmente, si quiere ver las últimas novedades, por favor dirijase a la documentación original: [unstable_api](../README.md)
