# Test Console Output

```
running 1 test from ./src/concepts/UserProfile/UserProfileConcept.test.ts
UserProfile Concept ...
  Action: setProfile - Create a new user profile ...
------- output -------
  Creating profile for user A (Alice Smith, Software Engineer).
----- output end -----
  Action: setProfile - Create a new user profile ... ok (53ms)
  Action: setProfile - Update an existing user profile (only bio) ...
------- output -------
  Updating user A's bio: 'Senior Software Engineer'.
----- output end -----
  Action: setProfile - Update an existing user profile (only bio) ... ok (36ms)
  Action: setProfile - Set avatar for user A ...
------- output -------
  Setting user A's avatar: 'http://example.com/alice.jpg'.
----- output end -----
  Action: setProfile - Set avatar for user A ... ok (36ms)
  Action: setProfile - Remove avatar for user A (avatar: null) ...
------- output -------
  Removing user A's avatar.
----- output end -----
  Action: setProfile - Remove avatar for user A (avatar: null) ... ok (37ms)
  Action: setProfile - Create a profile with only name and avatar (no bio) ...
------- output -------
  Creating profile for user B (Bob Johnson) with avatar, bio defaults.
----- output end -----
  Action: setProfile - Create a profile with only name and avatar (no bio) ... ok (37ms)
  Query: _profile - Retrieve an existing profile (no avatar) ...
------- output -------
  Querying user A's profile (expecting no avatar).
----- output end -----
  Query: _profile - Retrieve an existing profile (no avatar) ... ok (35ms)
  Query: _profile - Retrieve a profile with avatar ...
------- output -------
  Querying user A's profile (expecting avatar).
----- output end -----
  Query: _profile - Retrieve a profile with avatar ... ok (36ms)
  Query: _profile - Retrieve a non-existent profile ...
------- output -------
  Querying non-existent user C's profile (expecting error).
----- output end -----
  Query: _profile - Retrieve a non-existent profile ... ok (17ms)
  Principle Test: Calling `setProfile` with new name/bio/avatar updates how the profile appears. ...
------- output -------

# trace: Demonstrating UserProfile principle
  1. Creating initial profile for user C.
  2. Updating user C's name to 'Charles Brown'.
  3. Updating user C's bio and adding avatar 'http://example.com/charlie.jpg'.
  4. Updating user C's name to 'Chuck' and removing avatar.
  Principle demonstrated: Profile updates reflect correctly.
----- output end -----
  Principle Test: Calling `setProfile` with new name/bio/avatar updates how the profile appears. ... ok (145ms)
UserProfile Concept ... ok (930ms)

ok | 1 passed (9 steps) | 0 failed (936ms)
```