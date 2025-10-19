# Test Console Output

```
running 1 test from ./src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts
UserAuthentication Concept Tests ...
  Action: register - Successful registration ...
------- output -------
Trace: Attempting to register a new user.
  Register result: {"user":"0199f9e7-cd38-716b-afc0-57c5fff96272"}
  Found user by username query: [{"user":"0199f9e7-cd38-716b-afc0-57c5fff96272"}]
----- output end -----
  Action: register - Successful registration ... ok (78ms)
  Action: register - Username already taken ...
------- output -------
Trace: Attempting to register with an already taken username.
  Initial register result: {"user":"0199f9e7-cd90-7829-b2be-08781a6e759a"}
  Duplicate register result: {"error":"Username already taken"}
----- output end -----
  Action: register - Username already taken ... ok (61ms)
  Action: login - Successful login ...
------- output -------
Trace: Registering a user and then logging in successfully.
  Registered user: 0199f9e7-cdc2-781d-83d0-8ba26b79aa61
  Login result: {"user":"0199f9e7-cdc2-781d-83d0-8ba26b79aa61"}
----- output end -----
  Action: login - Successful login ... ok (50ms)
  Action: login - Incorrect username ...
------- output -------
Trace: Attempting to log in with an incorrect username.
  Login result (incorrect username): {"error":"Invalid username or password"}
----- output end -----
  Action: login - Incorrect username ... ok (51ms)
  Action: login - Incorrect password ...
------- output -------
Trace: Attempting to log in with an incorrect password.
  Login result (incorrect password): {"error":"Invalid username or password"}
----- output end -----
  Action: login - Incorrect password ... ok (50ms)
  Action: changePassword - Successful password change ...
------- output -------
Trace: Registering a user, changing their password, and verifying login with new password.
  Registered user: 0199f9e7-ce59-7884-8340-b7cb07b2f49c
  Login with old password succeeded.
  Change password result: {}
  Login with old password failed as expected.
  Login with new password succeeded.
----- output end -----
  Action: changePassword - Successful password change ... ok (117ms)
  Action: changePassword - User not found ...
------- output -------
Trace: Attempting to change password for a non-existent user.
  Change password result (non-existent user): {"error":"User not found"}
----- output end -----
  Action: changePassword - User not found ... ok (16ms)
  Action: changePassword - Incorrect old password ...
------- output -------
Trace: Attempting to change password with an incorrect old password.
  Registered user: 0199f9e7-cede-7702-a702-02ab7d48aaf2
  Change password result (incorrect old password): {"error":"Incorrect old password"}
  Login with old password still works, confirming password not changed.
----- output end -----
  Action: changePassword - Incorrect old password ... ok (66ms)
  Query: _byUsername - Existing user ...
------- output -------
Trace: Querying for an existing user by username.
  Registered user: 0199f9e7-cf20-76e9-84d2-4ca3713d92cc
  Query result: [{"user":"0199f9e7-cf20-76e9-84d2-4ca3713d92cc"}]
----- output end -----
  Query: _byUsername - Existing user ... ok (52ms)
  Query: _byUsername - Non-existent user ...
------- output -------
Trace: Querying for a non-existent user by username.
  Query result: []
----- output end -----
  Query: _byUsername - Non-existent user ... ok (16ms)
  Principle fulfillment: Register and Login ...
------- output -------
Principle: After registering, logging in with the same credentials authenticates you; logging out ends that authentication. (Note: logout not in this concept's actions.)
Trace: Demonstrating core authentication flow: register then login.
  1. Attempting to register user 'testuser_1760834342742_8'.
  User 'testuser_1760834342742_8' registered with ID: 0199f9e7-cf65-7366-aaf2-ad8f22c71a76
  2. Attempting to log in user 'testuser_1760834342742_8' with provided password.
  User 'testuser_1760834342742_8' successfully logged in with ID: 0199f9e7-cf65-7366-aaf2-ad8f22c71a76
  Principle demonstrated: Registering a user allows subsequent login with the same credentials, authenticating the user.
----- output end -----
  Principle fulfillment: Register and Login ... ok (51ms)
UserAuthentication Concept Tests ... ok (1s)

ok | 1 passed (11 steps) | 0 failed (1s)
```