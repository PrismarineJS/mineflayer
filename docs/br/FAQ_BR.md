## Perguntas Frequentes

Este documento de perguntas frequentes tem o objetivo de ajudar as pessoas com informações básicas.

## Como ocultar erros?

Para ocultar erros, você pode adicionar a opção `hideErrors: true` nas configurações ao criar o bot. Também é possível usar os seguintes eventos:

```js
client.on('error', () => {})
client.on('end', () => {})
```

## Meu evento de chat não está sendo emitido em um servidor personalizado. Como posso resolver isso?

Alguns servidores Spigot, em particular certos plugins, utilizam formatos personalizados de chat. Nesse caso, é necessário analisar esses formatos com expressões regulares personalizadas. Recomenda-se ler e modificar o arquivo [chat_parsing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js) para que funcione com o plugin de chat específico do seu servidor. Você também pode consultar http://prismarinejs.github.io/mineflayer/#/tutorial?id=custom-chat para obter mais informações.

## Como posso coletar informações de um plugin de chat personalizado?

A maioria dos servidores de Minecraft possui plugins que enviam mensagens ao chat quando ocorrem eventos. Se a informação enviada for simples, você pode utilizar a solução mencionada anteriormente. No entanto, se as mensagens contêm muita informação em um único bloco de texto, outra opção é utilizar o evento `"messagestr"`, que permite analisar as mensagens de forma mais fácil.

**Exemplo:**

Suponha que a mensagem seja semelhante a esta:

```
(!) U9G ganhou o /jackpot e recebeu
$26,418,402,450! Eles compraram 2,350,000 (76.32%) bilhetes
de um total de 3,079,185 bilhetes vendidos!
```

```js
const regex = {
  first: /\(!\) (.+) ganhou o \/jackpot e recebeu +/,
  second: /\$(.+)! Eles compraram (.+) \((.+)%\) bilhetes do total de /,
  third: /(.+) bilhetes vendidos!/
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

## Como posso enviar um comando?

Usando `bot.chat()`.

**Exmemplo:**
```js
bot.chat('/give @p diamond')
```

### É possível criar vários bots e controlá-los separadamente?

Você pode criar bots diferentes com a função `createBot` e executar ações diferentes para cada um deles. Dê uma olhada no arquivo `multiple.js` para mais informações.

### Como faço para o bot largar todo o seu inventário?

Você pode usar a função `bot.inventory.items()` para obter uma matriz dos itens no inventário do bot. Você pode criar uma função recursiva para largar cada item usando `bot.toss()`. Veja um exemplo [aqui](https://gist.github.com/dada513/3d88f772be4224b40f9e5d1787bd63e9).

### Como vejo os pacotes que foram enviados/recebidos?

Você pode ativar o modo de depuração. Para obter mais informações, consulte [este link](https://github.com/PrismarineJS/mineflayer/blob/master/docs/br/README_BR.md#depuraci%C3%B3n).

### Quero evitar desconexões devido a lag no servidor, como posso fazer isso?

Uma maneira de evitar desconexões devido à latência no servidor é aumentar o valor na opção `checkTimeoutInterval` (por exemplo, `300*1000`, que representa 5 minutos, em vez do valor padrão, que é 30 segundos). Se mesmo assim você continuar sendo desconectado do servidor, você pode se reconectar automaticamente usando este exemplo [aqui](https://github.com/PrismarineJS/mineflayer/blob/master/examples/reconnector.js).

### Como posso obter a descrição/texto de um item?

Você pode usar a propriedade `item.nbt`. É recomendável utilizar a biblioteca `prismarine-nbt`. O método `nbt.simplify()` pode ser útil para simplificar a obtenção da descrição de um item.

**Exemplo:**
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

### Como posso enviar uma mensagem do console para o servidor?

Você pode usar uma biblioteca como `repl` para ler o que você escreve no console e usar `bot.chat()` para enviá-lo para o servidor. Você pode encontrar um exemplo [aqui](https://github.com/PrismarineJS/mineflayer/blob/master/examples/repl.js).

### Ao criar um plugin, como posso especificar outro plugin como dependência?

Na função `inject()` do seu plugin, você pode executar a função `bot.loadPlugin()` para carregar esse plugin. Se o plugin já estiver carregado anteriormente, nada acontecerá.

Nota: a ordem em que os plugins são carregados é dinâmica; você nunca deve chamar outro plugin em sua função `inject()`.

### Como posso usar um proxy SOCKS5?

Nas opções de `mineflayer.createBot(opções)`, remova o seu `host` das opções e coloque as informações necessárias nas variáveis `PROXY_IP`, `PROXY_PORT`, `PROXY_USERNAME`, `PROXY_PASSWORD`, `MC_SERVER_IP` e `MC_SERVER_PORT`. Em seguida, adicione o seguinte ao seu objeto de opções:

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

# Erros Comuns

### `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

Isso ocorre quando você fornece uma versão incorreta ao mineflayer, ou o mineflayer detecta a versão errada.

### `TypeError: Cannot read property '?' of undefined`

Você pode estar tentando acessar uma propriedade do bot que ainda não existe; tente acessar a propriedade após o evento `spawn`.

### `SyntaxError: Unexpected token '?'`

Atualize a versão do seu Node.js.

### O bot não consegue quebrar/colocar blocos ou abrir baús

Verifique se a proteção do spawn não está impedindo o bot de realizar a ação.

Esta documentação não é oficial. Para as informações mais atualizadas, consulte a documentação original: [FAQ](../FAQ.md).