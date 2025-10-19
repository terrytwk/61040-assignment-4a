---
timestamp: 'Sat Oct 18 2025 15:13:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_151303.79d989d0.md]]'
content_id: f24cfe1829a9920277d7c6149e2ae31122e8243443f8576df77198fa0b4d1067
---

# response:

```typescript
// file: src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("UserAuthentication Concept Tests", async (test) => {
  const [db, client] = await testDb();
  const concept = new UserAuthenticationConcept(db);

  await test.step("Principle: After registering, logging in with the same credentials authenticates you; (logging out ends that authentication - implied by successful login for current credentials)", async () => {
    console.log(
      "Trace: Demonstrating the principle of user authentication.",
    );

    const username = "alice";
    const password = "password123";
    const newPassword = "newPassword456";
    let aliceId: ID | undefined;

    // 1. Register Alice
    console.log(`  Action: register(${username}, ${password})`);
    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) {
      throw new Error(`Registration failed: ${registerResult.error}`);
    }
    aliceId = registerResult.user;
    console.log(`    Effect: User '${username}' registered with ID: ${aliceId}`);
    assertEquals(typeof aliceId, "string", "User ID should be a string");

    // Verify user exists via query
    const queryResult = await concept._byUsername({ username });
    assertEquals(queryResult.length, 1, "User should be found by username");
    assertEquals(queryResult[0].user, aliceId, "Query should return correct user ID");

    // 2. Login with correct credentials
    console.log(`  Action: login(${username}, ${password}) - expecting success`);
    const loginResult1 = await concept.login({ username, password });
    if ("error" in loginResult1) {
      throw new Error(`Login failed unexpectedly: ${loginResult1.error}`);
    }
    assertEquals(
      loginResult1.user,
      aliceId,
      "Login with correct credentials should return Alice's ID",
    );
    console.log(`    Effect: Successfully logged in as user ID: ${loginResult1.user}`);

    // 3. Attempt login with incorrect password (should fail)
    const incorrectPassword = "wrongpassword";
    console.log(
      `  Action: login(${username}, ${incorrectPassword}) - expecting failure`,
    );
    const loginResult2 = await concept.login({
      username,
      password: incorrectPassword,
    });
    assertEquals(
      "error" in loginResult2,
      true,
      "Login with incorrect password should return an error",
    );
    assertEquals(
      loginResult2.error,
      "Invalid username or password",
      "Error message should indicate invalid credentials",
    );
    console.log(`    Effect: Login failed as expected: ${loginResult2.error}`);

    // 4. Change password
    console.log(
      `  Action: changePassword(${aliceId}, ${password}, ${newPassword})`,
    );
    const changePasswordResult = await concept.changePassword({
      user: aliceId,
      oldPassword: password,
      newPassword: newPassword,
    });
    assertEquals(
      "error" in changePasswordResult,
      false,
      "Password change should succeed",
    );
    console.log(`    Effect: Password for '${username}' successfully changed.`);

    // 5. Attempt login with old password (should fail)
    console.log(
      `  Action: login(${username}, ${password}) - expecting failure with old password`,
    );
    const loginResult3 = await concept.login({ username, password });
    assertEquals(
      "error" in loginResult3,
      true,
      "Login with old password after change should fail",
    );
    assertEquals(
      loginResult3.error,
      "Invalid username or password",
      "Error message should indicate invalid credentials",
    );
    console.log(`    Effect: Login failed as expected with old password: ${loginResult3.error}`);

    // 6. Login with new password (should succeed)
    console.log(
      `  Action: login(${username}, ${newPassword}) - expecting success with new password`,
    );
    const loginResult4 = await concept.login({
      username,
      password: newPassword,
    });
    if ("error" in loginResult4) {
      throw new Error(`Login failed unexpectedly with new password: ${loginResult4.error}`);
    }
    assertEquals(
      loginResult4.user,
      aliceId,
      "Login with new password should return Alice's ID",
    );
    console.log(`    Effect: Successfully logged in with new password as user ID: ${loginResult4.user}`);
  });

  await test.step("Action: register (success)", async () => {
    console.log("\nTesting successful registration.");
    const username = "bob";
    const password = "bobpassword";

    console.log(`  Action: register(${username}, ${password})`);
    const result = await concept.register({ username, password });

    assertEquals(
      "error" in result,
      false,
      "Registration should not return an error",
    );
    const bobId = (result as { user: ID }).user;
    assertEquals(typeof bobId, "string", "Returned user ID should be a string");
    console.log(
      `    Effects: User '${username}' created with ID: ${bobId}. Password hash stored.`,
    );

    // Verify state change: User should be retrievable
    const queryResult = await concept._byUsername({ username });
    assertEquals(queryResult.length, 1, "User should be found by username");
    assertEquals(queryResult[0].user, bobId, "Query should return correct user ID");
    console.log("    Verification: User found in database via query.");
  });

  await test.step("Action: register (failure - username already taken)", async () => {
    console.log("\nTesting registration with existing username.");
    const username = "charlie";
    const password = "charliepassword";
    const password2 = "charliepassword2";

    // First, register charlie successfully
    await concept.register({ username, password });
    console.log(`  Pre-condition: User '${username}' already registered.`);

    console.log(`  Action: register(${username}, ${password2})`);
    const result = await concept.register({ username, password: password2 });

    assertEquals(
      "error" in result,
      true,
      "Registration with existing username should return an error",
    );
    assertEquals(
      (result as { error: string }).error,
      "Username already taken",
      "Error message should be 'Username already taken'",
    );
    console.log(
      `    Requires: Username not already taken (violated).`,
    );
    console.log(
      `    Effects: Registration failed as expected: ${
        (result as { error: string }).error
      }`,
    );

    // Verify no new user was created with the same username
    const allUsers = await db.collection("UserAuthentication.users").find().toArray();
    assertEquals(
      allUsers.filter((u) => u.username === username).length,
      1,
      "Only one user with this username should exist",
    );
  });

  await test.step("Action: login (failure - invalid username)", async () => {
    console.log("\nTesting login with non-existent username.");
    const username = "nonexistent";
    const password = "anypassword";

    console.log(`  Action: login(${username}, ${password})`);
    const result = await concept.login({ username, password });

    assertEquals(
      "error" in result,
      true,
      "Login with non-existent username should return an error",
    );
    assertEquals(
      (result as { error: string }).error,
      "Invalid username or password",
      "Error message should be 'Invalid username or password'",
    );
    console.log(
      `    Requires: User exists (violated).`,
    );
    console.log(
      `    Effects: Login failed as expected: ${
        (result as { error: string }).error
      }`,
    );
  });

  await test.step("Action: changePassword (failure - user not found)", async () => {
    console.log("\nTesting change password for non-existent user.");
    const nonExistentUser = "user:NonExistent" as ID;
    const oldPassword = "old";
    const newPassword = "new";

    console.log(
      `  Action: changePassword(${nonExistentUser}, ${oldPassword}, ${newPassword})`,
    );
    const result = await concept.changePassword({
      user: nonExistentUser,
      oldPassword,
      newPassword,
    });

    assertEquals(
      "error" in result,
      true,
      "Change password for non-existent user should return an error",
    );
    assertEquals(
      (result as { error: string }).error,
      "User not found",
      "Error message should be 'User not found'",
    );
    console.log(
      `    Requires: User exists (violated).`,
    );
    console.log(
      `    Effects: Change password failed as expected: ${
        (result as { error: string }).error
      }`,
    );
  });

  await test.step("Action: changePassword (failure - incorrect old password)", async () => {
    console.log("\nTesting change password with incorrect old password.");
    const username = "diana";
    const password = "dianapassword";
    const wrongOldPassword = "wrongoldpassword";
    const newPassword = "newdianapassword";

    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) throw new Error("Setup failed");
    const dianaId = registerResult.user;
    console.log(`  Pre-condition: User '${username}' registered.`);

    console.log(
      `  Action: changePassword(${dianaId}, ${wrongOldPassword}, ${newPassword})`,
    );
    const result = await concept.changePassword({
      user: dianaId,
      oldPassword: wrongOldPassword,
      newPassword,
    });

    assertEquals(
      "error" in result,
      true,
      "Change password with incorrect old password should return an error",
    );
    assertEquals(
      (result as { error: string }).error,
      "Incorrect old password",
      "Error message should be 'Incorrect old password'",
    );
    console.log(
      `    Requires: Old password matches (violated).`,
    );
    console.log(
      `    Effects: Change password failed as expected: ${
        (result as { error: string }).error
      }`,
    );

    // Verify original password still works
    const loginResult = await concept.login({ username, password });
    assertEquals(
      "error" in loginResult,
      false,
      "Original password should still work after failed change attempt",
    );
    console.log("    Verification: Original password still authenticates.");
  });

  await test.step("Query: _byUsername (user present)", async () => {
    console.log("\nTesting _byUsername query for an existing user.");
    const username = "eve";
    const password = "evepassword";
    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) throw new Error("Setup failed");
    const eveId = registerResult.user;
    console.log(`  Pre-condition: User '${username}' registered with ID: ${eveId}`);

    console.log(`  Query: _byUsername(${username})`);
    const result = await concept._byUsername({ username });

    assertEquals(result.length, 1, "Query should return one user");
    assertEquals(result[0].user, eveId, "Returned user ID should match Eve's ID");
    console.log(
      `    Effects: Returns user ID ${result[0].user} as expected.`,
    );
  });

  await test.step("Query: _byUsername (user not present)", async () => {
    console.log("\nTesting _byUsername query for a non-existent user.");
    const username = "frank";

    console.log(`  Query: _byUsername(${username})`);
    const result = await concept._byUsername({ username });

    assertEquals(result.length, 0, "Query should return an empty array");
    console.log(`    Effects: Returns empty array as expected for non-existent user.`);
  });

  await client.close();
});
```
