# MineFlayer

## Fonctionnalités

* Prise en charge de Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18 et 1.19.
* Connaissance et suivi des entités.
* Connaissance des blocs. Vous pouvez interroger le monde qui vous entoure. Quelques millisecondes pour trouver un bloc.
* Physique et mouvement - gestion de toutes les boîtes de délimitation.
* Attaquer des entités et utiliser des véhicules.
* Gestion de l'inventaire.
* Artisanat, coffres, distributeurs, tables d'enchantement.
* Creuser et construire.
* Diverses fonctions telles que connaître votre état de santé et savoir s'il pleut.
* Activation de blocs et utilisation d'objets.
* Chat.

## Installation

```bash copy
npm install mineflayer
```

## Exemple

```js copy
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node echo.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'echo',
  password: process.argv[5]
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})
```
