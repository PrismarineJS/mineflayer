# Legacy inventory transaction wraparound

## Source and regression

`lib/plugins/inventory.js`: `getNextActionId`, `clickWindow`, and
`confirmTransaction`. Historical behavior is from Mineflayer
`5a252e6d258882b042e60e21c37d552cdf3b3380`. The JavaScript regression is
"reconciles an omitted transaction acknowledgement across the action ID wrap"
in `test/internalTest.js`.

Action IDs wrap from 32767 to 1. If the server omits acknowledgement 32767, the
click promise times out but its queue entry remains. A later acknowledgement for
1 reaches a numeric ordering assertion against 32767. Queue order already records
send order, so the fix consumes entries until the matching ID, preserving the
existing policy that an acknowledgement implies acceptance of earlier entries.
The existing membership check ensures a matching entry is present.

## Model correspondence and limits

The model starts after a confirmed prefix of `MaxAction - 1` clicks and explores
two sequential clicks. `MaxAction = 3` is the finite wrap bound; the JavaScript
test performs 32766 real public clicks before testing the actual 32767-to-1 wrap.
`Send` enqueues a click, `ServerAck` and `ServerOmit` process FIFO requests,
`ClientAck` is the synchronous transaction handler, and `Timeout` settles the
promise without removing the queued entry. Operation identity is distinct from
the reused wire ID. Requests and responses remain FIFO.

The explicit environmental precondition is a server omitting one acknowledgement,
a case the source comments already intend to tolerate. This is not TCP reordering
or network packet loss. No stock Vanilla server trigger has been demonstrated.
The model excludes concurrent callers, duplicate wire IDs after multiple wraps,
window replacement, and inventory slot contents.

`NoAssertion` checks the ordering assertion. `Reconciled` requires eventual queue
clearance after both requests are sent and processed, with weak fairness of
server acknowledgements, client acknowledgement handling, and pending timeouts.
A timed-out promise remains timed out even when its queue entry is reconciled.

A historical counterexample is:

1. Send the final pre-wrap ID and let the server omit its response.
2. Time out that click; its entry remains queued.
3. Send ID 1 and receive its acknowledgement.
4. Compare the earlier maximum ID numerically with 1 and fail the assertion.

TLC 1.7.4 generates 38 states (27 distinct) before `NoAssertion` fails for the
historical configuration, and 47 (31 distinct) for the repaired configuration,
which passes safety and liveness. `control.cfg` checks historical behavior with
omission disabled: 35 states (25 distinct), passing. The JavaScript regression
uses actual packet serialization and public clicks with controlled responses;
it fails before the fix and passes afterward on transaction-based versions.

The assertion symptom was already reported in #1976. Issue #1109 and the fix in
#1428 concern action ID bounds; this identifies the remaining wrap-ordering cause.
It should not be presented as an entirely previously unknown symptom.
