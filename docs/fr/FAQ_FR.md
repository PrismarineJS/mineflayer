## FAQ

Ce document de foire aux questions a pour but d'aider les gens pour les choses les plus courantes.

### Je reçois une erreur lorsque j'essaie de me connecter avec un compte Microsoft.

Assurez-vous que l'email que vous avez entré dans l'option username de createBot peut être utilisé pour vous connecter à `minecraft.net` en utilisant le bouton 'Login with Microsoft'.
Assurez-vous que vous avez l'option `auth : 'microsoft'` dans vos options createBot.

Lorsque vous obtenez une erreur qui dit quelque chose au sujet des informations d'identification invalides ou "Ce compte possède Minecraft ?", essayez de supprimer le champ du mot de passe dans les options `createBot` et réessayez.

### Comment masquer les erreurs ?

Utiliser `hideErrors : true` dans les options de createBot
Vous pouvez également choisir d'ajouter ces listeners :

```js
client.on('error', () => {})
client.on('end', () => {})
```

### Je ne reçois pas d'événement de chat sur un serveur personnalisé, comment puis-je résoudre ce problème ?

Les serveurs Spigot, en particulier certains plugins, utilisent des formats de chat personnalisés, vous devez les analyser avec une expression rationnelle / un analyseur syntaxique personnalisé.
Lisez et adaptez [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) pour qu'il fonctionne pour vos besoins particuliers.
plugin de chat. A lire également <http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat>

### Comment puis-je collecter les informations d'un plugin personnalisé dans le chat ?

La plupart des serveurs Minecraft personnalisés ont le support des plugins, et beaucoup de ces plugins disent quelque chose dans le chat quand quelque chose se passe. Si c'est juste un message, il est préférable d'utiliser la solution discutée dans la solution ci-dessus, mais quand ces messages sont divisés en plusieurs petits messages, une autre option est d'utiliser l'événement `"messagestr"` car il permet d'analyser facilement les messages de plusieurs lignes.

**Exemple:**

Le message du chat dans le chat ressemble à ceci :

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

### Comment puis-je envoyer une commande ?

En utilisant `bot.chat()`.

**Example:**

```js
bot.chat('/give @p diamond')
```

### Est-il possible de se connecter à plusieurs comptes en utilisant bot = mineflayer.createbot tout en les contrôlant tous séparément ?

Créer différentes instances de bot en appelant createBot puis faire différentes choses pour chacune, voir multiple.js

### Comment faire pour que le robot lâche tout son inventaire ?

bot.inventory.items() renvoie un tableau des objets du bot. Vous pouvez utiliser une fonction récursive pour les parcourir en boucle et déposer chaque objet en utilisant bot.toss(). Cliquez [ici](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9) pour voir un exemple.

### Comment vérifier les paquets qui sont envoyés/reçus ?

Activation du mode de débogage <https://github.com/PrismarineJS/mineflayer#debug>

### Je veux éviter la déconnexion même en cas de lag du serveur, comment puis-je y parvenir ?

Un moyen est d'augmenter l'option [checkTimeoutInterval](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions) (à définir dans createBot) à une valeur plus élevée (par exemple `300*1000` qui est 5min au lieu des 30s par défaut). Si vous êtes toujours déconnecté, vous pouvez vous reconnecter automatiquement en utilisant quelque chose comme cet exemple <https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js>

### Comment obtenir l'histoire / le texte d'un objet ?

Vous pouvez utiliser la propriété `item.nbt`. Il est également recommandé d'utiliser la bibliothèque `prismarine-nbt`. La méthode `nbt.simplify()` peut être utile.

**Exemple:**

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

### Comment puis-je envoyer un message de la console au serveur ?

You can use a library like `repl` to read the console input and use `bot.chat()` to send it. You can find an example [here.](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js)

### Lors de la création d'un plugin, comment puis-je spécifier un autre plugin comme dépendance ?

Dans la fonction `inject()` de votre plugin, vous pouvez appeler sans risque `bot.loadPlugin(anotherPlugin)` pour vous assurer que ce plugin est chargé. Si le plugin a déjà été chargé auparavant, rien ne se passe.

Notez que l'ordre dans lequel les plugins sont chargés est dynamique, donc vous ne devriez jamais appeler un autre plugin dans votre fonction `inject()`.

### Comment puis-je utiliser un proxy socks5 ?

In the options object for `mineflayer.createBot(options)`, remove your `host` option from the options object, have the following variables declared `PROXY_IP, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, MC_SERVER_ADDRESS, MC_SERVER_PORT` and add this to your options object:

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
        host: MC_SERVER_ADDRESS,
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

`socks` est déclaré avec `const socks = require('socks').SocksClient` et utilise le paquet [this](https://www.npmjs.com/package/socks).
Certains serveurs peuvent rejeter la connexion. Si cela se produit, essayez d'ajouter `fakeHost : MC_SERVER_ADDRESS` aux options de votre createBot.
  
# Erreurs courantes

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

Voici ce qui se passe lorsque vous avez donné à Mineflayer la mauvaise version du serveur, ou que Mineflayer détecte la mauvaise version du serveur.

### `TypeError: Cannot read property '?' of undefined`

Vous essayez peut-être d'utiliser quelque chose sur l'objet bot qui n'existe pas encore, essayez d'appeler l'instruction après l'événement `spawn`.

### `SyntaxError: Unexpected token '?'`

Mettez à jour la version de votre node.

### The bot can't break/place blocks or open chests

Vérifiez que la protection contre le spawn n'empêche pas le bot d'agir.
