# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Issue Hunt](https://github.com/BoostIO/issuehunt-materials/blob/master/v1/issuehunt-shield-v1.svg)](https://issuehunt.io/r/PrismarineJS/mineflayer)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| <sub>EN</sub> [Anglais](../README.md) | <sub>RU</sub> [Russe](../ru/README_RU.md) | <sub>ES</sub> [Espagnol](../es/README_ES.md) | <sub>FR</sub> [Français](README_FR.md) | <sub>TR</sub> [Türkçe](../tr/README_TR.md) | <sub>ZH</sub> [Chinois](../zh/README_ZH_CN.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|----------------------------|

Créé des robots Minecraft avec API stable, puissante et facilement maniable, [API](api.md).

Si c'est la première fois que vous utilisez Node.js, il vaut mieux commencer avec le [tutoriel](tutorial.md)

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

 Visite cette page pour voir nos projets [projets](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Installation

En premier installer Node.js (version minimale requise: 14) sur [nodejs.org](https://nodejs.org/) puis taper dans la console:

`npm install mineflayer`

## Documentation

| lien | description |
|---|---|
| [tutoriel](tutorial.md) | Démarre par un tutoriel node js et mineflayer |
| [FAQ](FAQ.md) | Une question? Regardez d'abord ici ! |
| [API](api.md) [unstable_api.md](unstable_api.md) | L'API intégrale |
| [changement](history.md) | Les derniers changements dans mineflayer |
| [exemples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | quelques exemples réalisables avec mineflayer |


## Pour Aider

Allez lire [CONTRIBUTING.md](CONTRIBUTING.md) et [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute).

## Utilisation

**Vidéos**

Un tutoriel vidéo qui explique comment mettre en place un robot mineflayer est disponible [ici.](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

Si vous voulez en apprendre plus, des video peuvent être trouvées [ici,](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) et le code source correspondant peut être trouvé [ici.](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Introduction à mineflayer**

Si aucune version n'est specifiée, la version du serveur est automatiquement détectée.
Vous pouvez toujours en specifier une manuellement dans les options:
Par exemple `version:"1.16.5"`.

### Echo Example
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // optionel
  port: 25565, // optionel
  username: 'email@example.com', // l'email et le mot de passe sont requis seulement pour les serveurs
  password: '12345678', // online-mode=true
  version: false, // faux, corresponds pour la detection automatique(par défaut), met "1.8.8" par exemple si tu a besoin d'une version specifique
  auth: 'mojang' // optionel; par defaut utilise mojang, si vous utilisez un compte microsoft, preciser 'microsoft'
})

bot.on('chat', function (username, message) {
  if (username === bot.username) return
  bot.chat(message)
})

// erreur de code, ou raison de kick:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### Observer ce que fait votre robot en temp réel
Grace au projet [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer), il est maintenant possible de voir ce que votre robot fait.
Il suffit de lancer `npm install prismarine-viewer` dans votre console et d'ajouter ceci à votre code:
```js
const mineflayerViewer = require('prismarine-viewer').mineflayer
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})
```
et vous obtiendrez un affichage en *direct* qui ressemble à ceci:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### Exemples:

| exemple | description |
|---|---|
|[maps](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | afficher ce que votre robot fait en direct |
|[pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | Faire votre robot se déplacer la oû vous voulez |
|[coffre](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Utiliser les coffres, fours, distrubuteurs, tables d'enchantements |
|[pelteuse](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Aprener comment créer un robot simple capable de creuser |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | connectez un bot discord avec un robot mineflayer |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Un robot simple qui peut bouger, sauter, conduire des véhicules, attaquer des créatures proches |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Afficher le chat du robot avec les couleurs du chat dans votre terminal |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Faire un robot qui garde une zone definie |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | fichier texte avec tous vos comptes minecraft |

Et de nombreux exemples dans le dossier [exemples](https://github.com/PrismarineJS/mineflayer/tree/master/examples)

### Modules

Beaucoup de development arrive à l'interieur de petit package npm, qui sont utilisé par mineflayer

#### The Node Way&trade;

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
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | l'implementation des mondes pour prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Represente une fenetre minecraft
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Contient les items minecraft et les donnnées qui y sont associé
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | Un traducteur NBT pour node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Contient les récettes minecraft
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Contient les biome et leur données 
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Represente une entitées minecraft


### Debug

Vous pouvez activer le debug du protocole en utilisant `DEBUG` comme variable d'environnement:

```bash
DEBUG="minecraft-protocol" node [...]
```

Sur windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Third Party Plugins

Mineflayer peut être amélioré avec plusieurs plugins; tout le monde peut créer un plugin qui ajoute une API de plus haut niveaux au-dessus de Mineflayer.

Les plugins les plus récents et les plus utiles sont :

 * [pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) - advanced A* pathfinding avec de nombres paramètres configurables
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - Un simple inspecteur web de chunk
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - un inspecteur d'inventaire en ligne
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - Une API pour state machine pour robots aux comportements complexes
 * [Armor Manager](https://github.com/PrismarineJS/MineflayerArmorManager) - gestion d'armure automatique
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - Une API rapide et flexible pour colleter des blocs.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - intertace en ligne pour robots mineflayer
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - Une API facile pour les combats contre les entités et les joueurs.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - pour manger automatiquement de la nouriture.
 * [Tool](https://github.com/PrismarineJS/mineflayer-tool) - Un plugin pour choisir automatiquement le meilleur outil pour une tâche donnée
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - Un plugin pour viser à la perfection avec des arcs.


Laissez un coup d'oeil à ses projets :
 
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - interface web utilisant un canvas et une communication socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - trouver des blocs dans un monde 3D
 * [scaffold](https://github.com/PrismarineJS/mineflayer-scaffold) - trouver le meilleur chemin vers une destination précise en cassant et dispoant des blocs
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - remplissage de compte de capchat pour serveur hors-ligne
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determiner ce qui a attaqué une autre entité.
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - trouver le tps du serveur
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - prendre des photos panoramiques de vos mondes.

## Projets utilisant Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - créé un escalier en collimasson](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - réplicé une contruction](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualiser se qui se passe avec son robot grâce à [voxel.js](https://www.voxeljs.com/)
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  Afficher les info des joueurs sur une API en ligne
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (derniere version open source, par AlexKvazos) -  Un client minecraft basé seulement sur le chat<https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Un robot basé sur les plugins, qui a une jolie interface. Réalisée avec Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Des robots minecraft qui utilisent des algorithmes génétiques, regarder [ces videos youtube](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - une API telgram, construite sur Mineflayer et Telegraf.
 * [ProZedd/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - "Imprimme" un .schematic dans Minecraft
 * [et beaucoup plus](https://github.com/PrismarineJS/mineflayer/network/dependents) - Tous les les projets utilisant Mineflayer


## Test

### Tout tester

Exécuter seulement : `npm test`

### Tester une version spécifique
Exécutez `npm test -g <version>`, où `<version>` est une version de Minecraft comme `1.12`, `1.15.2`...

### Tester un test spécifique
Executer `npm test -g <test_name>`, où `<test_name>` est le nom d'un teste comme `lit`, `utiliseCoffre`, `rayTrace`...

## Licence

[MIT](LICENCE)
