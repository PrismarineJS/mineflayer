# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Issue Hunt](https://github.com/BoostIO/issuehunt-materials/blob/master/v1/issuehunt-shield-v1.svg)](https://issuehunt.io/r/PrismarineJS/mineflayer)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| 🇺🇸 [Anglais](README.md) | 🇷🇺 [Russe](README_RU.md) | 🇪🇸 [Espagnol](README_ES.md) | 🇫🇷 [Français](README_FR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|

Créé des robots Minecraft avec API stable, puissante et facilement maniable, [API (en anglais)](api.md).

Si c'est la première fois que vous utilisez Node.js, il vaut mieux commencer avec le [tutoriel (en anglais)](tutorial.md)

## Caractéristiques:

 * Compatible avec Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15 et 1.16.
 * Reconnaissante et pistage des entités.
 * Identification des blocs. Vous pouvez passer en revue le monde autour de vous. Quelques millisecondes suffisent pour trouver n'importe quel bloc.
 * Information sur la physique et mouvements, données sur la taille des blocs...
 * Peut attaquer des entitées et utiliser des véhicules.
 * Gestion d'inventaire.
 * Gestion de l'établi, coffre, distributeur, table d'enchantement.
 * creuser et construire.
 * Autres actions diverses, telle que connaitre tes points de vie ou si il pleut.
 * Utiliser les blocs et items.
 * Discuter avec le chat.

### Projets à venir:

 Visite cette page pour voir nos projets [projets (en anglais)](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Installation

En premier installer Node.js (version minimale requise: 14) sur [nodejs.org](https://nodejs.org/) puis taper dans la console:

`npm install mineflayer`

## Documentation (en anglais)

| lien | description |
|---|---|
|[tutoriel](tutorial.md) | Démarre par un tutoriel node js et mineflayer |
| [FAQ](FAQ.md) | Une question? Regarde d'abord ici ! |
| [API](api.md) [unstable_api.md](unstable_api.md) | L'API intégrale |
| [changement](history.md) | Les derniers changement dans mineflayer |
| [exemples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | quelques  exemples mineflayer |


## Pour Aider

Aller lire [CONTRIBUTING.md](CONTRIBUTING.md) et [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute) (en anglais)

## Usage

**Vidéos**

une tutoriel vidéo que explique comment mettre en place un robot mineflayer est trouvable [ici (en anglais).](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Si tu veut en apprendre plus, plus de tutoriel video peuve être trouvées [ici,](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) et le code source correspondant peut être trouver [ici.](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Introduction à mineflayer**

Sans de version specifié, la version du serveur est automatiquement trouvé, mais tu peut toujour en mettre une manuellement en la specifiant dans les options:
Par exemple `version:"1.8"`.

### Echo Example
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // optionel
  port: 25565,       // optionel
  username: 'email@example.com', // l'email et le mot de passe sont requis seulement pour les serveurs
  password: '12345678',          // online-mode=true
  version: false,                 // faux, corresponds pour la detection automatique(par défaut), met "1.8.8" par exemple si tu a besoin d'une version specifique
  auth: 'mojang'      // optionel; par defaut utilise mojang, si vous utilisez un compte microsoft, preciser 'microsoft'
})

bot.on('chat', function (username, message) {
  if (username === bot.username) return
  bot.chat(message)
})

// érreur de code, ou raison de kick:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### See what your bot is doing
Grace au projet [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), il est maintenant possible de voir ce que ton bot fait.
Juste lance `npm install prismarine-viewer` dans ta console et ajoute ceci a ton code:
```js
const mineflayerViewer = require('prismarine-viewer').mineflayer
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})
```
et to aura un affichage en *direct* qui ressemble a ceci:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### Exemples:

| exemple | description |
|---|---|
|[maps](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | affiche ce que ton bot fait en direct |
|[pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Fait ton robot ce déplacé la ou tu veux |
|[coffre](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Utilise les coffres, fours, dispensers, tables d'enchantements |
|[pelteuse](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Aprend comment créer a robot simple capable de creuser |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | connecte un bot discord avec un robot mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Un bot simple qui peut bouger, sauter, conduire des vehicules, attaque des créatures proche |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Affiche la chat du robot avec les couleurs du chat dans ton terminal |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Fait a robot guarder une zone definie |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Est un fichier texte avec tout les comptes minecraft |

Et beaucoup plus d'exemples dans le dossier [exemples](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Modules

Beaucoup du development arrive à l'interieur de petit package npm, qui sont utilisé par mineflayer

#### The Node Way&trade; (en anglais)

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Modules

Voici les modules principales qui contruisent mineflayer:

| module | description |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Traduis et serialise les packets minecraft, plus l'authentication et l'encryption.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Module qui provide des données minecraft pour les clients minecraft, les serveurs et les librairies.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | provide les moteurs de physique pour les entitées minecraft.
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | Une class pour contenir les chunks minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | Mathematique de vecteur 3D
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Represente un block minecraft avec les données associés.
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | Une traducteur pour les messages de chat minecraft (extracté depuis mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Une librairies Node.js pour intéragir avecles systeme d'authenfication de mojang, connue sous le nom de Yggdrasil
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | The core implementation of worlds for prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Represent minecraft windows
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Represent a minecraft item with its associated data
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | An NBT parser for node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Represent minecraft recipes
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Represent a minecraft biome with its associated data
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Represent a minecraft entity


### Debug

Tu peut activer le debug du protocol en utilisant `DEBUG` comme variable d'environnement:

```bash
DEBUG="minecraft-protocol" node [...]
```

Sur windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Third Party Plugins

Mineflayer is pluggable; anyone can create a plugin that adds an even
higher level API on top of Mineflayer.

The most updated and useful are :

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - advanced A* pathfinding with a lot of configurable features
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - simple web chunk viewer
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - web based inventory viewer
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - A state machine API for more complex bot behavors
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - automatic armor managment
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - Quick and simple block collection API.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Frontend dashboard for mineflayer bot
 * [PVP](https://github.com/TheDudeFromCI/mineflayer-pvp) - Easy API for basic PVP and PVE.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - Automatic eating of food.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - A utility for automatic tool/weapon selection with a high level API.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - A utility for using auto-aim with bows.


 But also check out :

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - get around
   easily using A* pathfinding. [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - find blocks in the 3D world
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - get to
   a target destination even if you have to build or break blocks to do so.
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - chat-based bot authentication
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determine who and what is responsible for damage to another entity
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - get the current tps (processed tps)

## Projets utilisant Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - créé un escalier en collimasson](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - réplicé une contruction](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualise se qui se passe avec to robot en utilisant [voxel.js](https://www.voxeljs.com/)
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  log player activity onto an online API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (last open source version, built by AlexKvazos) -  Minecraft web based chat client <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Plugin based bot with a clean GUI. Made with Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Des robots minecraft en utilisant des algorithmes genetiques, regarde [ces videos youtube (en anglais)](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - Telegram bridge, build on top of mineflayer & telegraf.
 * [ProZedd/mineflayer-printer](https://github.com/ProZedd/mineflayer-printer) - Prints minecraft schematics
 * [and hundreds more](https://github.com/PrismarineJS/mineflayer/network/dependents) - All the projects that github detected are using mineflayer


## Testing

### Tester tout

Simplement executer: `npm test`

### Tester une version specifique
Execute `npm test -g <version>`, ou `<version>` est une version de minecraft comme `1.12`, `1.15.2`...

### Testing specific test
Run `npm test -g <test_name>`, where `<test_name>` is a name of the test like `bed`, `useChests`, `rayTrace`...

## Licence

[MIT](LICENCE)

