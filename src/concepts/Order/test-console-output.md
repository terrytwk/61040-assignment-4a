# Test Console Output

```
OrderConcept ...
  open: should create a new pending order ...
------- output -------
--- Test: open a new pending order ---
Opened order with ID: 0199f9e7-172e-7392-800b-e628881a1e9c
Order 0199f9e7-172e-7392-800b-e628881a1e9c status: pending (verified)
----- output end -----
  open: should create a new pending order ... ok (51ms)
  addItem: should add an item with selections to a pending order ...
------- output -------

--- Test: addItem with selections ---
Opened order for addItem test with ID: 0199f9e7-1760-7231-a455-5effa2b870f1
Added line 0199f9e7-1783-7797-9ec4-984b2ecd6a36 to order 0199f9e7-1760-7231-a455-5effa2b870f1
Verified line 0199f9e7-1783-7797-9ec4-984b2ecd6a36 and its selections.
----- output end -----
  addItem: should add an item with selections to a pending order ... ok (167ms)
  addItem: should prevent adding item to a non-existent order ...
------- output -------

--- Test: addItem to non-existent order ---
Attempted to add item to non-existent order order:NonExistent, got expected error.
----- output end -----
  addItem: should prevent adding item to a non-existent order ... ok (17ms)
  addItem: should prevent adding item with non-positive quantity ...
------- output -------

--- Test: addItem with non-positive quantity ---
Attempted to add item with qty 0, got expected error.
----- output end -----
  addItem: should prevent adding item with non-positive quantity ... ok (0ms)
  submit: should allow submitting a pending order with lines ...
------- output -------

--- Test: submit pending order ---
Order 0199f9e7-1760-7231-a455-5effa2b870f1 submitted. (Status remains pending as per spec)
Order 0199f9e7-1760-7231-a455-5effa2b870f1 status: pending (verified after submit)
----- output end -----
  submit: should allow submitting a pending order with lines ... ok (34ms)
  submit: should prevent submitting a non-existent order ...
------- output -------

--- Test: submit non-existent order ---
Attempted to submit non-existent order order:NonExistent, got expected error.
----- output end -----
  submit: should prevent submitting a non-existent order ... ok (16ms)
  complete: should change order status to 'completed' ...
------- output -------

--- Test: complete order ---
Order 0199f9e7-1760-7231-a455-5effa2b870f1 completed.
Order 0199f9e7-1760-7231-a455-5effa2b870f1 status: completed (verified)
----- output end -----
  complete: should change order status to 'completed' ... ok (37ms)
  addItem: should prevent adding item to a completed order ...
------- output -------

--- Test: addItem to completed order ---
Attempted to add item to completed order 0199f9e7-1760-7231-a455-5effa2b870f1, got expected error.
----- output end -----
  addItem: should prevent adding item to a completed order ... ok (16ms)
  submit: should prevent submitting a completed order ...
------- output -------

--- Test: submit completed order ---
Attempted to submit completed order 0199f9e7-1760-7231-a455-5effa2b870f1, got expected error.
----- output end -----
  submit: should prevent submitting a completed order ... ok (17ms)
  cancel: should change order status to 'canceled' (alternative path) ...
------- output -------

--- Test: cancel order (alternative path) ---
Opened order for cancel test with ID: 0199f9e7-1893-7734-b247-e61b34b78a42
Added item to order 0199f9e7-1893-7734-b247-e61b34b78a42.
Order 0199f9e7-1893-7734-b247-e61b34b78a42 canceled.
Order 0199f9e7-1893-7734-b247-e61b34b78a42 status: canceled (verified)
----- output end -----
  cancel: should change order status to 'canceled' (alternative path) ... ok (91ms)
  complete: should prevent completing a canceled order ...
------- output -------

--- Test: complete canceled order ---
Opened and canceled order 0199f9e7-18ee-7474-bfc5-2d1fc031a915.
Attempted to complete canceled order 0199f9e7-18ee-7474-bfc5-2d1fc031a915, got expected error.
----- output end -----
  complete: should prevent completing a canceled order ... ok (71ms)
  Principle Trace: Scanning -> Pending -> Add Items -> Submit -> Complete -> No Changes ...
------- output -------

--- Principle Trace Test ---
Trace Step 1: User scans QR (simulated via open action)
   Order 0199f9e7-1936-794b-91e0-4d48b98e45e0 opened for user user:Alice.
   Status is 'pending'. (Verified)
Trace Step 2: Barista adds Latte with selections.
   Added Latte (Line ID: 0199f9e7-196a-76e6-817a-b07bf198773f) to Order 0199f9e7-1936-794b-91e0-4d48b98e45e0.
   Order 0199f9e7-1936-794b-91e0-4d48b98e45e0 has 1 line with 2 selections. (Verified)
Trace Step 3: Barista submits the order.
   Order 0199f9e7-1936-794b-91e0-4d48b98e45e0 submitted.
   Status is still 'pending' after submit. (Verified)
Trace Step 4: Barista completes the order.
   Order 0199f9e7-1936-794b-91e0-4d48b98e45e0 completed.
   Status is 'completed'. (Verified)
Trace Step 5: Attempt to add item to completed order (should fail).
   Failed to add item to completed order. (Verified)
----- output end -----
  Principle Trace: Scanning -> Pending -> Add Items -> Submit -> Complete -> No Changes ... ok (226ms)
OrderConcept ... ok (1s)

ok | 1 passed (12 steps) | 0 failed (1s)
```