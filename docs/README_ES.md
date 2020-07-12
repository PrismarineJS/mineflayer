# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| US [Inglés](README.md) | RU [Ruso](README_RU.md) | ES [Español](README_ES.md) |
|------------------------|-------------------------|----------------------------|

Crea bots de Minecraft con una API JavaScript potente, estable y de alto nivel.

## Características

 * Versiones de Minecraft admitidas 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15 y 1.16.
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

 * Mesa de pociones y yunques.
 * Mejor física (soporte para puertas, escaleras, agua, etc).
 * ¿Quieres contribuir en algo importante para PrismarineJS? Visita https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects

## Cómo utilizar

Sin especificar una versión, la versión del servidor se detectará automáticamente, puedes configurar una versión específica utilizando la opción de versión.
Por ejemplo `version:" 1.8 "`.

### Ejemplo
```js
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: "localhost", // opcional
  port: 25565,       // opcional
  username: "email@example.com", // el correo electrónico y contraseña sólo son necesarios   
  password: "12345678",          // para servidores con el flag online-mode=true
  version: false                 // el valor false implica detectar la versión automáticamente, puedes configurar una versión específica utilizando por ejemplo "1.8.8"
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
bot.on('error', err => console.log(err))
```

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

#### Más ejemplos

 * En la carpeta de [ejemplos](https://github.com/PrismarineJS/mineflayer/tree/master/examples)
 * [vogonistic's REPL bot](https://gist.github.com/vogonistic/4631678)

## Complementos de terceros

Mineflayer tiene la capacidad de instalar complementos; cualquiera puede crear un complemento que agregue
un API de nivel superior a Mineflayer.

Los más actualizados y útiles son:

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - algoritmo de busqueda A* avanzado con muchas características configurables
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - visualizador de chunks basado en web
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - visualizador de inventario basado en web
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - API de autómata infinito para comportamientos más complejos
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - gestión automática de armaduras


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

## Instalación

`npm install mineflayer`

## Documentación

 * Ver [docs/api.md](api.md).
 * Ver [docs/FAQ.md](FAQ.md).
 * Ver [docs/history.md](history.md).
 * Ver [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples).
 * Ver [docs/unstable_api.md](unstable_api.md).
 * Ver [docs/CONTRIBUTING.md](CONTRIBUTING.md).

## Contribuir

Por favor lee https://github.com/PrismarineJS/prismarine-contribute

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

## Actualizar el protocolo a una nueva versión

1. Espera una actualización de
   [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol)
   que admitirá nuevas versiones.
2. `npm install --save minecraft-protocol@latest`
3. Aplica los [cambios de protocolo](http://wiki.vg/Protocol_History) donde sea necesario.
4. Ejecuta el conjunto de pruebas. Usando los ejemplos anteriores.

## Licencia

[MIT](LICENSE)
