# Contribuir

O Mineflayer foi originalmente criado principalmente por [andrewrk](http://github.com/andrewrk), mas tem sido muito aprimorado e corrigido por muitos [contribuidores](https://github.com/andrewrk/mineflayer/graphs/contributors). Portanto, é importante saber a melhor maneira de contribuir para o Mineflayer.

## Organização de Problemas

Temos 3 etiquetas para 3 fases de organização de problemas:

* Estágio 1: (Fase 1) criado por alguém novo no projeto, não sabemos se merece uma implementação / solução
* Estágio 2: (Fase 2) ideia promissora, mas é necessário pensar mais sobre o assunto antes de implementá-lo
* Estágio 3: (Fase 3) a ideia é muito precisa, só precisa ser programada

Links como https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 podem ser usados como filtro para a fase 1 se você estiver procurando coisas prontas para serem contribuídas.

## Criando Testes
O Mineflayer possui dois tipos de testes:

 * [Testes internos](test/internalTest.js): testes feitos com um servidor simples criado com o node-minecraft-protocol
 * [Testes externos](test/externalTests/): testes feitos com um servidor Vanilla
 
O objetivo desses testes é determinar automaticamente o que funciona e o que não funciona no Mineflayer, tornando mais fácil a correção de problemas.

### Criando um Teste Externo

Para criar um teste externo, basta criar um arquivo em [test/externalTests](test/externalTests).

Um exemplo: [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

Esse arquivo deve exportar uma função que retorna uma função ou um array de funções que recebem o objeto bot e um callback como parâmetros, e deve conter verificações para determinar se a função testada falhou.

## Criando um Plugin de Terceiros
O Mineflayer suporta plugins; qualquer pessoa pode criar um plugin que adiciona uma API de nível mais alto acima do Mineflayer.

Vários plugins de terceiros foram [criados](https://github.com/andrewrk/mineflayer#third-party-plugins).

Para criar um novo plugin, você deve:

1. Criar um novo repositório.
2. No seu arquivo index.js, exportar uma função para inicializar o plugin com o argumento Mineflayer ([exemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18)).
3. Essa função deve retornar uma função para introduzir o plugin com o objeto bot ([exemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23)).
4. A partir dessa função, você pode adicionar mais funcionalidades ao bot ([exemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32)).

Como o objeto Mineflayer é passado como argumento, esse plugin de terceiros não deve depender do Mineflayer (não deve haver referência ao Mineflayer no package.json).

Veja um [exemplo completo](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) aqui.

## Relatando Bugs
O Mineflayer funciona bem na maioria das situações, mas às vezes ainda pode ter bugs.

Ao encontrar um bug, é melhor relatar o erro fornecendo as seguintes informações:

* O que você está tentando fazer (o objetivo em inglês).
* O que você tentou (o código).
* O que aconteceu.
* O que você esperava que acontecesse.

## Código do Mineflayer
Aqui estão algumas coisas a se considerar ao criar uma solicitação de pull (pull request) ou fazer um commit:

### Tratamento de Erros
Na maioria dos casos, o Mineflayer não deve quebrar ou travar o bot. Mesmo se algo der errado, o bot pode seguir uma rota alternativa para alcançar o objetivo.

Isso significa que não devemos usar `throw new Error("erro")`, mas sim passar o erro junto com o callback.

Por exemplo:

```js
function myfunction (param1, callback) {
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // everything worked (todo está funcionado)
    callback()
  } else {
    callback(new Error('something failed')) // (algo falhou)
  }
}
```

Veja outro exemplo no [código do Mineflayer](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10).

### Atualizando a Documentação
A tabela de conteúdo no arquivo docs/api.md é gerada com o Doctoc. Após atualizar o arquivo, você deve executar doctoc docs/api.md para atualizar a tabela de conteúdo.

Esta documentação não é oficialmente mantida; para ver as informações mais recentes, consulte a documentação original: [unstable_api](../CONTRIBUTING.md).