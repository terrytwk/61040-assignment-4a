# Test Console Output 

```
running 1 test from ./src/concepts/Membership/MembershipConcept.test.ts
Membership Concept Tests ...
  Action: activate (new user) ...
------- output -------
Trace: Activating user user:Alice for the first time.
Trace: Querying isActive for user:Alice.
Trace: Querying joinedDate for user:Alice.
User user:Alice joined on: Sat Oct 18 2025 20:36:19 GMT-0400 (Eastern Daylight Time)
----- output end -----
  Action: activate (new user) ... ok (74ms)
  Action: activate (existing active user - idempotency) ...
------- output -------
Trace: Storing original joinedDate for user:Alice.
Trace: Activating user user:Alice again (already active).
Trace: Querying isActive for user:Alice.
Trace: Querying joinedDate for user:Alice after re-activation.
User user:Alice joined on: Sat Oct 18 2025 20:36:19 GMT-0400 (Eastern Daylight Time)
----- output end -----
  Action: activate (existing active user - idempotency) ... ok (72ms)
  Action: deactivate (active user) ...
------- output -------
Trace: Deactivating user user:Alice.
Trace: Querying isActive for user:Alice.
----- output end -----
  Action: deactivate (active user) ... ok (38ms)
  Action: deactivate (non-existent user) ...
------- output -------
Trace: Attempting to deactivate non-existent user user:Bob.
Trace: Querying isActive for non-existent user user:Bob.
----- output end -----
  Action: deactivate (non-existent user) ... ok (37ms)
  Action: activate (deactivated user - re-activation) ...
------- output -------
Trace: Storing original joinedDate for user:Alice before re-activation.
Trace: Re-activating user user:Alice.
Trace: Querying isActive for user:Alice.
Trace: Querying joinedDate for user:Alice after re-activation.
User user:Alice re-activated, joined on: Sat Oct 18 2025 20:36:19 GMT-0400 (Eastern Daylight Time)
----- output end -----
  Action: activate (deactivated user - re-activation) ... ok (74ms)
  Query: _isActive (non-existent user) ...
------- output -------
Trace: Querying isActive for non-existent user user:Charlie.
----- output end -----
  Query: _isActive (non-existent user) ... ok (17ms)
  Query: _joinedDate (non-existent user) ...
------- output -------
Trace: Querying joinedDate for non-existent user user:Charlie.
----- output end -----
  Query: _joinedDate (non-existent user) ... ok (17ms)
  Principle: Active members can place orders; deactivated members cannot. ...
------- output -------
Trace: Activating user user:Bob.
Trace: Verifying user:Bob is active.
User user:Bob is active: true
Trace: Deactivating user user:Bob.
Trace: Verifying user:Bob is inactive.
User user:Bob is active: false
Trace: Activating user user:Bob again.
Trace: Verifying user:Bob is active again.
User user:Bob is active: true
Principle demonstrated: The concept correctly toggles 'isActive' status, which (via syncs) would control ordering eligibility.
----- output end -----
  Principle: Active members can place orders; deactivated members cannot. ... ok (118ms)
Membership Concept Tests ... ok (1s)

ok | 1 passed (8 steps) | 0 failed (1s)
```