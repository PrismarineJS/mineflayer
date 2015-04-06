<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [unstable API : bot._](#unstable-api--bot_)
  - [bot._chunkColumn(x, z)](#bot_chunkcolumnx-z)
  - [bot._client](#bot_client)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# unstable API : bot._

These methods and classes are useful in some special cases but are not stable and can change at any moment.

## bot._chunkColumn(x, z)

Return the column at `x` and `y`. A column has :

 * a `blockType`
 * a `light`
 * a `skylight`
 * a `biome`
 
`blockType`, `light` and `skylight` are arrays of size 16.

## bot._client

`bot._client` is created using [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol).
It handles writing and reading packet.
Its behaviour can change (for example at each new minecraft version) so it's better to use mineflayer methods if possible.