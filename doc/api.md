# API

## Bot

### Properties

`bot.username`

### Events

`"chat" (username, message, rawMessage)`

 * `username` - who said the message
 * `message` - stripped of any control characters
 * `rawMessage` - unmodified message from the server

`"nonSpokenChat" (message, rawMessage)`

 * `message` - stripped of all control characters
 * `rawMessage` - unmodified message from the server

### Methods

`chat(message)`

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary. If message begins with "/tell <username> ", then all split messages will be whispered as well.
