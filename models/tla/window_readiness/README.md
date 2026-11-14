# Window readiness ownership

Closing a window before its contents arrive used to leave its readiness listener
registered. If a later login reset the contents buffer and another window reused
the numeric ID, the new contents announced both the closed and current window.
The fix cancels the owned listener on lifecycle changes and checks window object
identity before announcing readiness.

## Source and regression correspondence

The model was derived from `lib/plugins/inventory.js` at upstream commit
`5a252e6d258882b042e60e21c37d552cdf3b3380`. `OpenA` and `OpenB` represent
`open_window` and `prepareWindow`; `pending` records their readiness listeners.
`CloseA` represents the public `closeWindow` call. `ItemsA` and `ItemsB` represent
`window_items`, and `Login` represents the existing login reset. Model values 1
and 2 identify distinct window objects sharing one wire ID, not two wire IDs.

`test/internalTest.js`, **does not announce a closed pending window when its ID
is reused after login**, replays the counterexample through the existing bot and
protocol-server fixture, real inventory handlers and real window objects. It
checks the identity of each announced window and the new window's contents.
Controlled packet-event delivery selects the schedule without sleeps. For legacy
versions, the close-sync acknowledgement is awaited after A's contents arrive.

The original implementation produces this six-transition trace:

1. Open A; register A's readiness listener.
2. Call `closeWindow(A)` before A's separate contents packet arrives.
3. Receive A's contents; buffer them because no window is current.
4. Receive login; clear the contents buffer, but retain the old listener.
5. Open B with the same numeric ID; register B's listener.
6. Receive B's contents; announce closed A, then current B.

Inbound packet order is fixed throughout. The application close interleaves
between the open and contents packets; no TCP packet reordering is assumed.
Each synchronous handler, including its listener dispatch, is one model action.

## Checks and bounds

`small.cfg` selects `Fixed = TRUE` and checks `TypeOK`, `NoStaleOpen` and
`EventuallyReady`. `regression.cfg` selects the original behavior and must fail
specifically at `NoStaleOpen`; this counterexample is an expected regression
control, not a successful safety check. With TLC 2.19, one worker, seed 1 and
fingerprint index 0, both configurations explore **11 generated / 11 distinct
states**, with graph depth 7. The fixed configuration also passes liveness.

The finite scenario has two window objects, one reused wire ID, one optional
public close, and five ordered inbound packets. Weak fairness of `Receive`
assumes these specified packets eventually arrive. It makes no promise that an
unresponsive server will send contents. `EventuallyReady` only requires B's
readiness once its open has been received. Terminal deadlock checking is disabled
because the bounded scenario intentionally ends after B's contents.

From the repository root, run both model configurations through the shared
runner. It requires the historical invariant failure and keeps traces under
`.cache/tla/results/`:

```sh
npm run test:models -- window_readiness
```

Run the new test and existing early/trailing-contents tests:

```sh
node node_modules/mocha/bin/mocha.js test/internalTest.js --grep 'windows' --reporter spec --exit
npm run lint
```

## Limits and related work

The model excludes the buffered immediate-ready path, arbitrary user callback
reentrancy, inventory contents, click transactions and additional sessions.
Cleanup on replacement, server close, respawn and end, and the identity guard
against callbacks already captured by `emit`, are implementation defenses beyond
the scenario proved here. Passing this model does not prove all window behavior.

[#4003](https://github.com/PrismarineJS/mineflayer/pull/4003) repairs early/trailing
contents buffering and resets the buffer on login/respawn; its patch does not
cancel the retained readiness listener. [#3974](https://github.com/PrismarineJS/mineflayer/pull/3974)
addresses slot mapping and crafting synchronization. This counterexample clears
the buffer before reproducing the stale callback, distinguishing the mechanisms.
No exact prior report was found in the reviewed material; that is a bounded
novelty search, not proof that the bug was unknown to everyone.
