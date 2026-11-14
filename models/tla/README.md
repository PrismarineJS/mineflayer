# TLA+ reliability models

These small state machines check selected asynchronous behavior in Mineflayer.
Each model lives beside its configurations and source correspondence notes in
`models/tla/<subsystem>/`. JavaScript regressions remain in `test/` and exercise
the real implementation. Checking a model does not check JavaScript automatically:
changes to the corresponding handlers must also be reviewed against the model.

## Running locally

Install Node.js 22 or newer and Java 17, then run:

```sh
npm run test:models:runner
npm run test:models
npm run test:models -- teleport_replies
```

No npm dependencies or Minecraft server are needed for these commands. The runner
downloads the official TLC release pinned in `toolchain.json`, verifies its SHA-256,
and caches it under `.cache/tla/`. Set `TLA_JAR` to use an existing copy; the same
checksum is required. Updating TLC means updating both the release URL and hash.

Each check uses one worker, seed 1, fingerprint polynomial 0, a 512 MiB JVM heap,
and a two-minute deadline. Logs and any generated counterexamples are retained
under `.cache/tla/results/`. The logs include commands and TLC state counts.

`small.cfg` checks repaired behavior. `regression.cfg` selects historical behavior
and must fail with the exact invariant named in `model.json`. A syntax error,
unexpected invariant failure, process failure, or timeout is a failed check.
This negative control guards against accidentally removing the modeled failure.
It does not replace running the JavaScript regression before and after a fix.

## CI and maintenance

The separate `ModelCheck` CI job runs all registered models on every pull request
and master push, outside the Minecraft-version matrix. Runner tests run first;
failure logs are uploaded as artifacts. This change does not alter required-check
or branch-protection settings. Start with these small configurations; larger
explorations can be added separately when their coverage justifies the runtime.

To add a model, create a directory containing a `.tla` module, finite `.cfg` files,
`model.json`, and a README. The manifest names the module and an array of checks,
each with a `config` filename and optional `expectViolation` invariant name.
Document the source handlers, bounds, atomic actions, environmental assumptions,
fairness assumptions, properties, counterexample, and JavaScript regression.

A successful check exhausts the specified finite state space, subject to TLC's
fingerprinting. It is not a proof of all Minecraft versions or all implementation
behavior. Liveness depends on the fairness assumptions stated in each model.
The historical switches and their source correspondence require review whenever
the implementation changes.
