# Common Errors

> if there is a ?, it means that your error may be different there

* `UnhandledPromiseRejectionWarning: Error: Failed to read asymmetric key`

This is what happens when either you gave mineflayer the wrong server version, or mineflayer detects the wrong server version

* `TypeError: Cannot read property '?' of undefined`

You may be trying to use something on the bot object that isn't there yet, try calling the statement after the `spawn` event

* You can't break/place blocks or open chests

Check that spawn protection isn't stopping the bot from it's action
