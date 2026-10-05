# lib/core: sans-io plugin cores

The files here hold plugin logic as plain state machines, split in two layers:

```
core:   step(config, state, event) -> outputs
codec:  packet -> event,  output -> packets      (one per version)
```

- **The core** holds the plugin's logic and knows nothing about packets or versions.
  - **`config`** is fixed when the bot is created: user options, and any version difference in *behaviour* (as a boolean, resolved from `bot.supportFeature`). It is frozen; `step` never changes it.
  - **`state`** is plain data: no sockets, timers, closures or event emitters. `step` updates it in place.
  - **Events** are what happened, in the plugin's own terms: `{ type: 'healthUpdate', health, ... }`, `{ type: 'respawnCommand' }`.
  - **Outputs** are what to do: `{ type: 'emit', event, args }` emits a bot event, and any other type (`{ type: 'requestRespawn' }`) is for the codec to send.
- **The codec** holds every version difference in packet names and fields. `createCodec(supportFeature)` returns `packets` (the clientbound packets it listens to), `decode(name, data)` and `encode(output)`, which returns zero or more `{ name, data }` packets. An output can encode to nothing on versions without that packet.

The matching plugin in `lib/plugins/` is a thin adapter. `driver.js` feeds the codec's packets and the bot's API calls into the core and performs its outputs, and the plugin exposes the core's state as the same `bot.*` properties as before. The public API and the events stay the same, so unconverted plugins and user code can't tell the difference.

## Testing

Because neither layer does IO, both are tested without a server. See `test/healthCoreTest.js`.

- **Core:** feed events and assert on the outputs, for each combination of `config` values. No version data is needed, so this runs once.
- **Codec:** for each tested version, write its packets with that version's real schema (`minecraft-protocol`'s serializer) and parse them back. A field the version doesn't have is lost on the way, so a wrong field name fails here instead of against a value the test derived from the same feature flag.

CI only runs tests whose name contains a tested version (`mocha -g "<version>v"`). Name codec suites `... ${version}v`, and name the core suite after the newest tested version so it runs exactly once.

## Converted so far

| Core | Codec | Plugin |
|---|---|---|
| `health.js` | `healthCodec.js` | `lib/plugins/health.js` |

## Converting another plugin

1. Move the plugin's state and logic into `lib/core/<name>.js` with `createConfig(...)`, `createState()` and `step(config, state, event)`. Turn every `bot.emit` into an `emit` output and every `bot._client.write` into an output named for what it means.
2. Move packet handling into `lib/core/<name>Codec.js`: decode each packet into an event, encode each output into packets. `bot.supportFeature(...)` checks about packet formats go here; checks that change behaviour go in `config`.
3. Rewrite the plugin as an adapter with `createDriver`. List the codec's packets in the order the plugin registered its `_client` listeners, because other plugins handle the same packets and handler order is observable. Expose state with `exposeState`, and turn API methods into events.
4. If the core needs data from a plugin that isn't converted yet, pass it in explicitly (as event data, or as a read-only query in `config`) rather than reading `bot.*` inside the core.
5. Add `test/<name>CoreTest.js` as described above. `test/internalTest.js` and `test/externalTests` must still pass unchanged.

Over time the cores combine into one `step` for the whole bot, called in the plugin load order.
