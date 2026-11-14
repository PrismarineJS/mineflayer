------------------------- MODULE TeleportReplies -------------------------
EXTENDS Naturals, Sequences

\* Mineflayer physics.js at 5a252e6d: immediately after death, before two
\* successive absolute teleports. IDs represent arrival order, not wire values.
\* A Node callback drains the ENTIRE queue atomically. Receipt cancels a timer
\* that already exists; it cannot cancel one a queued callback creates later.
CONSTANT CancelOnAnswer
VARIABLES received, queue, recentDeath, timer, replies, ended
vars == <<received, queue, recentDeath, timer, replies, ended>>

RECURSIVE Drain(_, _, _, _)
Drain(q, recent, pending, sent) ==
  IF Len(q) = 0 THEN [recent |-> recent, timer |-> pending, replies |-> sent]
  ELSE IF recent
    THEN Drain(Tail(q), FALSE, Head(q), sent)
    ELSE Drain(Tail(q), FALSE, IF CancelOnAnswer THEN 0 ELSE pending,
               Append(sent, Head(q)))

Init == /\ received = 0
        /\ queue = <<>>
        /\ recentDeath = TRUE
        /\ timer = 0
        /\ replies = <<>>
        /\ ended = FALSE

Receive == /\ ~ended /\ received < 2
           /\ received' = received + 1
           /\ queue' = Append(queue, received + 1)
           /\ timer' = 0
           /\ UNCHANGED <<recentDeath, replies, ended>>

Flush == /\ ~ended /\ Len(queue) > 0
         /\ LET result == Drain(queue, recentDeath, timer, replies)
            IN /\ recentDeath' = result.recent
               /\ timer' = result.timer
               /\ replies' = result.replies
         /\ queue' = <<>>
         /\ UNCHANGED <<received, ended>>

Fire == /\ ~ended /\ timer # 0
        /\ replies' = Append(replies, timer)
        /\ timer' = 0
        /\ UNCHANGED <<received, queue, recentDeath, ended>>

Expire == /\ ~ended /\ recentDeath
          /\ recentDeath' = FALSE
          /\ UNCHANGED <<received, queue, timer, replies, ended>>

End == /\ ~ended
       /\ ended' = TRUE
       /\ queue' = <<>> /\ timer' = 0
       /\ UNCHANGED <<received, recentDeath, replies>>

Next == Receive \/ Flush \/ Fire \/ Expire \/ End
Spec == Init /\ [][Next]_vars /\ WF_vars(Flush) /\ WF_vars(Fire)

TypeOK == /\ received \in 0..2 /\ queue \in Seq(1..2)
          /\ recentDeath \in BOOLEAN /\ timer \in 0..2
          /\ replies \in Seq(1..2) /\ ended \in BOOLEAN
ReplyOrder == \A i, j \in 1..Len(replies): i < j => replies[i] < replies[j]
Cleanup == ended => (queue = <<>> /\ timer = 0)
Settles == (received = 2) ~> (ended \/ (queue = <<>> /\ timer = 0))
=============================================================================
