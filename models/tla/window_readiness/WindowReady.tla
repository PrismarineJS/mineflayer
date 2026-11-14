---------------------------- MODULE WindowReady ----------------------------
EXTENDS Naturals, Sequences
CONSTANT Fixed
VARIABLES stage, current, pending, announced, closed, stale
vars == <<stage, current, pending, announced, closed, stale>>

\* A and B use the same wire window ID, but are different objects/generations.
\* Inbound order is fixed: open A, contents A, login, open B, contents B.
\* A public closeWindow call may occur between A's open and contents packets.
Init == /\ stage = 0 /\ current = 0 /\ pending = <<>>
        /\ announced = <<>> /\ closed = FALSE /\ stale = FALSE

OpenA == /\ stage = 0 /\ stage' = 1 /\ current' = 1 /\ pending' = <<1>>
         /\ UNCHANGED <<announced, closed, stale>>

CloseA == /\ stage = 1 /\ ~closed
          /\ closed' = TRUE /\ current' = 0
          /\ pending' = IF Fixed THEN <<>> ELSE pending
          /\ UNCHANGED <<stage, announced, stale>>

ItemsA == /\ stage = 1 /\ stage' = 2
          /\ announced' = IF current = 1 THEN Append(announced, 1) ELSE announced
          /\ pending' = IF current = 1 THEN <<>> ELSE pending
          /\ UNCHANGED <<current, closed, stale>>

\* Any early/trailing contents buffer is cleared by the existing login handler.
Login == /\ stage = 2 /\ stage' = 3 /\ current' = 0
         /\ pending' = IF Fixed THEN <<>> ELSE pending
         /\ UNCHANGED <<announced, closed, stale>>

OpenB == /\ stage = 3 /\ stage' = 4 /\ current' = 2
         /\ pending' = IF Fixed THEN <<2>> ELSE Append(pending, 2)
         /\ UNCHANGED <<announced, closed, stale>>

ItemsB == /\ stage = 4 /\ stage' = 5
          /\ stale' = \E i \in 1..Len(pending): pending[i] # current
          /\ announced' = announced \o pending
          /\ pending' = <<>>
          /\ UNCHANGED <<current, closed>>

Receive == OpenA \/ ItemsA \/ Login \/ OpenB \/ ItemsB
Next == Receive \/ CloseA
Spec == Init /\ [][Next]_vars /\ WF_vars(Receive)

TypeOK == /\ stage \in 0..5 /\ current \in 0..2
          /\ pending \in Seq(1..2) /\ announced \in Seq(1..2)
          /\ closed \in BOOLEAN /\ stale \in BOOLEAN
NoStaleOpen == ~stale
EventuallyReady == (stage = 4) ~> (stage = 5 /\ announced[Len(announced)] = 2)
=============================================================================
