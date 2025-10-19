# Test Console Output

```
running 1 test from ./src/concepts/CustomerFeedback/CustomerFeedbackConcept.test.ts
CustomerFeedbackConcept ...
  Principle: After an order is completed, user can record feedback ...
------- output -------

--- Principle Test: Feedback Recording ---
Action: userA leaves feedback for order1: "Great coffee, fast service!"
Result: Feedback created with ID: 0199f9e3-b59a-7892-862e-a698814a7dcd
Query: Retrieve feedback for order1
Verification: Feedback for order1 retrieved successfully.
Query: Retrieve feedback left by userA
Verification: Feedback from userA retrieved successfully.
Principle demonstrated: Feedback is successfully recorded and retrievable after creation.
----- output end -----
  Principle: After an order is completed, user can record feedback ... ok (85ms)
  Action: create - successful creation ...
------- output -------

--- Action Test: create (successful) ---
Action: Create feedback for user 0199f9e3-b5ee-7eb4-b5fa-e63ec369a139, order 0199f9e3-b5ee-759e-afb1-f7f91d89c9a6, comment "Test comment for successful creation."
Result: Feedback created with ID: 0199f9e3-b5ee-71bf-aa22-c97378c3f01f
Verification: Query _forOrder to confirm existence.
Verification successful: Feedback found and content matches.
----- output end -----
  Action: create - successful creation ... ok (35ms)
  Query: _forOrder - retrieve feedback for a specific order ...
------- output -------

--- Query Test: _forOrder ---
Action: userA leaves feedback for order2: "Feedback from Alice for order2."
Action: userB leaves feedback for order2: "Feedback from Bob for order2, also great!"
Query: Retrieve feedback for order2
Verification: Two feedback entries for order2 retrieved successfully.
Query: Retrieve feedback for order3 (no feedback)
Verification: No feedback found for order3, as expected.
----- output end -----
  Query: _forOrder - retrieve feedback for a specific order ... ok (72ms)
  Query: _forUser - retrieve feedback left by a specific user ...
------- output -------

--- Query Test: _forUser ---
Action: userA leaves feedback for order4: "Another feedback by Alice for a new order."
Query: Retrieve feedback left by userA
Verification: All feedback entries from userA retrieved successfully.
Query: Retrieve feedback left by userC (no feedback)
Verification: No feedback found for userC, as expected.
----- output end -----
  Query: _forUser - retrieve feedback left by a specific user ... ok (52ms)
CustomerFeedbackConcept ... ok (875ms)

ok | 1 passed (4 steps) | 0 failed (883ms)
```