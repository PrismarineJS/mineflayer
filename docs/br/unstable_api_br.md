<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Tabla de contenidos**  *generado con [DocToc](https://github.com/thlorenz/doctoc)*

- [API inestable : bot._](#api-instable--bot_)
  - [bot._client](#bot_client)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API instável: bot._

Esses métodos e classes são úteis em alguns casos especiais, mas não são estáveis e podem mudar a qualquer momento.

## bot._client

`bot._client` é criado usando [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol).
Lida com a escrita e recepção de pacotes.
O comportamento pode mudar (por exemplo, em cada nova versão do Minecraft), portanto, é melhor usar os métodos do mineflayer, se possível.

Esta documentação não é oficialmente mantida. Se você deseja ver as últimas novidades, por favor, consulte a documentação original: [unstable_api](../unstable_api.md)
