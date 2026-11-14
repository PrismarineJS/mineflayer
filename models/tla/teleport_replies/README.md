# Teleport reply ordering

## Source and regression

`lib/plugins/physics.js`: the `position` handler queues `answerTeleport` callbacks;
`doPhysics` drains the queue; `cancelRespawnReply` cancels the delayed reply.
The regression in `test/internalTest.js` is named
"cancels a delayed respawn reply created while draining two queued teleports".
Historical behavior is based on Mineflayer commit
`5a252e6d258882b042e60e21c37d552cdf3b3380`.

Two position packets arrive after death, before one physics tick. Both packet
handlers cancel a timer that does not exist yet. Draining the callbacks creates a
delayed reply for the first teleport, then replies immediately to the second.
The timer subsequently sends the older coordinates. Canceling the pending timer
inside `answerTeleport` also covers timers created earlier in the same drain.

## Model correspondence and limits

The initial state is immediately after one death. `Receive` is a position packet
handler; `Flush` represents the entire synchronous queue drain as one atomic Node
callback. `Fire` is the delayed timer; `Expire` ends the recent-death eligibility;
`End` clears queued work and the timer. Two distinct absolute teleports are the
finite bound. Integers 1 and 2 denote arrival order, not wire teleport IDs.
`replies` represents movement replies (`position_look`), not `teleport_confirm`.

`ReplyOrder` forbids older movement replies after newer ones. `Cleanup` requires
no pending work after disconnect. `Settles` requires eventual clearing after two
receipts, assuming weak fairness of the queue drain and delayed timer. Receipt,
disconnect, and expiry are not forced. Timer durations are abstracted to ordering;
there is no synchronous user callback reentrancy within a drain. Repeated deaths,
relative teleports, configuration transitions, world changes, and general physics
are outside this model.

The shortest historical counterexample is:

1. Receive teleport 1.
2. Receive teleport 2.
3. Drain both: delay reply 1, send reply 2.
4. Fire the old timer: replies become `<<2, 1>>`, violating `ReplyOrder`.

With TLC 1.7.4, the historical configuration generates 20 states (16 distinct)
before the invariant failure. The repaired configuration generates 29 states
(22 distinct), passing safety and liveness. The JavaScript regression reproduces
movement coordinates `[100, 90]` before the fix and `[100]` afterward, using the
real plugin and fake Date/setTimeout with a real physics interval.

Earlier work in issues/PRs #4099 and #4107 covers related cancellation and deferred
replies; this regression addresses the same-drain interaction. A bounded issue
search found no exact report, which does not establish universal novelty.
