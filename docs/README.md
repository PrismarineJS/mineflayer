# Mineflayer

[![NPM version](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Try it on gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Open In Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](README.md) | <sub>RU</sub> [русский](ru/README_RU.md) | <sub>ES</sub> [Español](es/README_ES.md) | <sub>FR</sub> [Français](fr/README_FR.md) | <sub>TR</sub> [Türkçe](tr/README_TR.md) | <sub>ZH</sub> [中文](zh/README_ZH_CN.md) | <sub>BR</sub> [Português](br/README_BR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|-------------------------|--------------------|

Create Minecraft bots with a powerful, stable, and high level JavaScript [API](api.md), also usable from Python.

First time using Node.js? You may want to start with the [tutorial](tutorial.md). Know Python? Checkout some [Python examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python) and try out [Mineflayer on Google Colab](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb).

## Features

 * Supports Minecraft 1.8 to 1.21.11 (1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21, 1.21.9, 1.21.11) <!--version-->
 * Entity knowledge and tracking.
 * Block knowledge. You can query the world around you. Milliseconds to find any block.
 * Physics and movement - handle all bounding boxes
 * Attacking entities and using vehicles.
 * Inventory management.
 * Crafting, chests, dispensers, enchantment tables.
 * Digging and building.
 * Miscellaneous stuff such as knowing your health and whether it is raining.
 * Activating blocks and using items.
 * Chat.

### Roadmap

 Checkout [this page](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) to see what our current projects are.

## Installation

```
npm i github:binmasterdotpro/mineflayer#master
```

## Features

 * Everything from [mineflayer](https://github.com/PrismarineJS/mineflayer) (**except version compatibility guarantee**. this package is only designed to work on 1.8.9)
 * General anticheat fixes for 1.8.9
 * 1:1 movement replication compared to vanilla 1.8.9 client
 * Passes Grim's simulation checks
 * Works on Hypixel out of the box
