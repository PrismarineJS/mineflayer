# Contribuir

Mineflayer originalmente fue hecho mayormemente por [andrewrk](http://github.com/andrewrk)
pero ha sido arreglado y mejorado mucho por muchos [contribuyentes](https://github.com/andrewrk/mineflayer/graphs/contributors).
Por eso es importante saber cual es la mejor manera de contribuir a mineflayer.

## Organización de problemas

Tenemos 3 etiquetas para 3 fases de organizar los problemas:

* Stage 1: (Fase 1) creado por alguien nuevo al proyecto, no sabemos si merece una implementación / solución
* Stage 2: (Fase 2) idea prometedora, pero se necesita pensar más sobre el tema antes de implementarlo
* Stage 3: (Fase 3) la idea es muy precisa, solo hace falta programarlo

Los links como https://github.com/PrismarineJS/mineflayer/issues?q=is%3Aopen+is%3Aissue+-label%3AStage1 se pueden usar como filtro para la fase 1 si estás buscando cosas que están listas para que sean contribuidas

## Creando tests
Mineflayer tiene dos tipos de tests :

 * [tests internos](test/internalTest.js) : tests que se hacen con un servidor simple creado con node-minecraft-protocol
 * [tests externos](test/externalTests/) : tests que se hacen con un servidor vanilla
 
El objectivo de estos tests es saber automáticamente qué funciona y qué no funciona en mineflayer, así es más fácil hacer funcionar mineflayer.

### Creando un text externo

Para crear un test externo solo tienes que crear un archivo en [test/externalTests](test/externalTests)

Un ejemplo : [test/externalTests/digAndBuild.js](https://github.com/PrismarineJS/mineflayer/blob/master/test/externalTests/digAndBuild.js)

Ese archivo tiene que exportar una función que devuelve una función o un array de funciones que necesitan como parámetros el object de bot y un callback para cuando haya finalizado, debería contener asserts para saber si la función testeada ha fallado.


## Creando un plugin de terceros
Mineflayer admite plugins; cualquiera puede crear un plugin que añade una API con un nivel más alto encima de Mineflayer.

Bastantes plugins de terceros han sido [creados](https://github.com/andrewrk/mineflayer#third-party-plugins)

Para crear un plugin nuevo tienes que :

1. crear un repositorio nuevo
2. en tu archivo index.js, exportar una función para inicializar el plugin con argumento mineflayer ([ejemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L18))
3. esa función devuelve una función para introducir el plugin con argumento el object del bot ([ejemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L23))
4. a partir de esa función se pueden añadir más funcionalidades al bot ([ejemplo](https://github.com/andrewrk/mineflayer-navigate/blob/e24cb6a868ce64ae43bea2d035832c15ed01d301/index.js#L32))

Como el object de mineflayer fue pasado como argumento, ese plugin de terceros no tiene que depender en mineflayer (no hay mineflayer en el package.json)

Mira un [ejemplo completo](https://github.com/andrewrk/mineflayer-navigate/tree/e24cb6a868ce64ae43bea2d035832c15ed01d301) here.

## Reportando bugs
Mineflayer funciona bien para la mayoría de cosas, pero a veces sigue teniendo bugs.

Cuando encuentras uno es mejor que informes sobre el error proporcionando esta información :

* que quieres hacer (el objetivo en english)
* que es lo que has intentado (el código)
* que ha pasado
* que esperabas que pasara

## Código de Mineflayer
Algunas cosas para pensar al crear un Pull Request (solicitud de pull) o hacer un commit :

### Gestión de errores
En la mayoría de casos, mineflayer no debería romper/crashear el bot. Incluso si algo falla, el bot puede coger una ruta alternativa para coseguir el objetivo.

Con esto se refiere a que no deberíamos usar el `throw new Error("error")` sino pasar el error junto al callback.

Por ejemplo : 

```js
function myfunction (param1, callback) {
  // do stuff
  let toDo = 1
  toDo = 2
  if (toDo === 2) { // everything worked (todo ha funcionado)
    callback()
  } else {
    callback(new Error('something failed')) // (algo ha fallado)
  }
}
```

Mira otro ejemplo en el [código de mineflayer](https://github.com/andrewrk/mineflayer/blob/a8736c4ea473cf1a609c5a29046c0cdad006d429/lib/plugins/bed.js#L10)

### Actualizando la documentación
La tabla de contenidos del docs/api.md está hecho con doctoc. Tras actualizar el archivo, deberías ejecutar doctoc docs/api.md para actualizar la tabla de contenidos.


Esta documentación no está mantenida oficialmente, si quiere ver las últimas novedades, por favor dirijase a la documentación original: [unstable_api](../CONTRIBUTING.md)
