# lib/core: sans-io plugin cores

The files here hold plugin logic as plain state machines:

```
step(state, event) -> outputs
```

- **`state`** is plain data: no sockets, timers, closures or event emitters. `step` updates it in place.
- **Events** are inputs: `{ type: 'packet', name, data }` for a clientbound packet, and `{ type: 'command', name, ... }` for a call to the bot API.
- **Outputs** are effects: `{ type: 'send', name, data }` writes a packet, and `{ type: 'emit', event, args }` emits a bot event.

The matching plugin in `lib/plugins/` is a thin adapter. It feeds `bot._client` packets and API calls into the core through `driver.js`, and exposes the core's state as the same `bot.*` properties as before. The public API and the events stay the same, so unconverted plugins and user code can't tell the difference.

Because a core does no IO, it can be tested directly: feed it events and assert on the outputs. No server, no socket, no waiting. See `test/healthCoreTest.js`.

## Converted so far

| Core | Plugin |
|---|---|
| `health.js` | `lib/plugins/health.js` |

## Converting another plugin

1. Move the plugin's state and packet handling into `lib/core/<name>.js` with `createState(...)` and `step(state, event)`. Turn every `bot._client.write` into a `send` output and every `bot.emit` into an `emit` output.
2. Resolve `bot.supportFeature(...)` checks once in `createState`, into a `features` record.
3. Rewrite the plugin as an adapter. Register its `_client` listeners in the same order as before, because other plugins handle the same packets and handler order is observable. Expose state with `exposeState`, and turn API methods into `command` events.
4. If the core needs data from a plugin that isn't converted yet, pass it in explicitly (as event data, or as a read-only query given to `createState`) rather than reading `bot.*` inside the core.
5. Add `test/<name>CoreTest.js` with one `describe` per tested version (named `... ${version}v`, so CI's per-version `-g` filter picks it up). `test/internalTest.js` and `test/externalTests` must still pass unchanged.

Over time the cores combine into one `step` for the whole bot, called in the plugin load order.
