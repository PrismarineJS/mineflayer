--------------------------- MODULE InventoryWrap ---------------------------
EXTENDS Naturals, Sequences
CONSTANTS MaxAction, Fixed, AllowOmission

\* Two sequential legacy clicks after a confirmed prefix of MaxAction-1 clicks.
\* Operation identities differ from wire IDs; requests and responses are FIFO.
VARIABLES sent, processed, queue, acknowledgements, status, assertionFailed
vars == <<sent, processed, queue, acknowledgements, status, assertionFailed>>
Id(op) == IF op = 1 THEN MaxAction ELSE 1

Init == /\ sent = 0 /\ processed = 0
        /\ queue = <<>> /\ acknowledgements = <<>>
        /\ status = [op \in 1..2 |-> "idle"]
        /\ assertionFailed = FALSE

Send == /\ sent < 2
        /\ IF sent = 0 THEN TRUE ELSE status[sent] \in {"accepted", "timeout"}
        /\ queue' = Append(queue, sent + 1)
        /\ status' = [status EXCEPT ![sent + 1] = "pending"]
        /\ sent' = sent + 1
        /\ UNCHANGED <<processed, acknowledgements, assertionFailed>>

ServerAck == /\ processed < sent
             /\ acknowledgements' = Append(acknowledgements, processed + 1)
             /\ processed' = processed + 1
             /\ UNCHANGED <<sent, queue, status, assertionFailed>>

\* Explicit environment precondition: omit a response for the first request.
\* This is not packet loss or packet reordering on a TCP connection.
ServerOmit == /\ AllowOmission /\ processed = 0 /\ sent > 0
              /\ processed' = 1
              /\ UNCHANGED <<sent, queue, acknowledgements, status, assertionFailed>>

Timeout(op) == /\ status[op] = "pending"
               /\ status' = [status EXCEPT ![op] = "timeout"]
               /\ UNCHANGED <<sent, processed, queue, acknowledgements, assertionFailed>>

ClientAck ==
  /\ Len(acknowledgements) > 0 /\ ~assertionFailed
  /\ LET op == Head(acknowledgements)
         target == CHOOSE i \in 1..Len(queue): queue[i] = op
         fail == ~Fixed /\ Id(Head(queue)) > Id(op)
     IN /\ assertionFailed' = fail
        /\ queue' = IF fail THEN Tail(queue) ELSE SubSeq(queue, target + 1, Len(queue))
        /\ status' = IF fail THEN status ELSE
             [i \in 1..2 |-> IF status[i] = "pending" /\ i <= op
                              THEN "accepted" ELSE status[i]]
  /\ acknowledgements' = Tail(acknowledgements)
  /\ UNCHANGED <<sent, processed>>

Next == Send \/ ServerAck \/ ServerOmit \/ ClientAck \/ (\E op \in 1..2: Timeout(op))
Spec == Init /\ [][Next]_vars /\ WF_vars(ServerAck) /\ WF_vars(ClientAck)
        /\ (\A op \in 1..2: WF_vars(Timeout(op)))

TypeOK == /\ sent \in 0..2 /\ processed \in 0..sent
          /\ queue \in Seq(1..2) /\ acknowledgements \in Seq(1..2)
          /\ status \in [1..2 -> {"idle", "pending", "accepted", "timeout"}]
          /\ assertionFailed \in BOOLEAN
NoAssertion == ~assertionFailed
Reconciled == (sent = 2 /\ processed = 2) ~> (queue = <<>>)
=============================================================================
