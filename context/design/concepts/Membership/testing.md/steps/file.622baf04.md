---
timestamp: 'Sat Oct 18 2025 19:41:23 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_194123.259e1e2f.md]]'
content_id: 622baf0448b02c609c3cbd47a6f658adce9e204456ad40dab5e735899817ffff
---

# file: src/concepts/MembershipConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { ID } from "@utils/types.ts";
import { testDb } from "@utils/database.ts";
import MembershipConcept from "./MembershipConcept.ts";

Deno.test("Membership Concept Tests", async (t) => {
  const [db, client] = await testDb();
  const membershipConcept = new MembershipConcept(db);

  const userAlice = "user:Alice" as ID;
  const userBob = "user:Bob" as ID;
  const userCharlie = "user:Charlie" as ID;

  // Helper to get current joined date for comparison
  const getJoinedDate = async (user: ID) => {
    const result = await membershipConcept._joinedDate({ user });
    return result.length > 0 ? result[0].joinedDate : undefined;
  };

  await t.step("Action: activate (new user)", async () => {
    console.log(`Trace: Activating user ${userAlice} for the first time.`);
    const activateResult = await membershipConcept.activate({ user: userAlice });
    assertEquals(activateResult, {}, "Activate should return an empty object on success.");

    console.log(`Trace: Querying isActive for ${userAlice}.`);
    const isActiveResult = await membershipConcept._isActive({ user: userAlice });
    assertEquals(isActiveResult.length, 1, "Should find one membership record.");
    assertEquals(isActiveResult[0].isActive, true, "User should be active after activation.");

    console.log(`Trace: Querying joinedDate for ${userAlice}.`);
    const joinedDateResult = await membershipConcept._joinedDate({ user: userAlice });
    assertEquals(joinedDateResult.length, 1, "Should find one membership record.");
    assertExists(joinedDateResult[0].joinedDate, "joinedDate should be set for a new activation.");
    console.log(`User ${userAlice} joined on: ${joinedDateResult[0].joinedDate}`);
  });

  await t.step("Action: activate (existing active user - idempotency)", async () => {
    console.log(`Trace: Storing original joinedDate for ${userAlice}.`);
    const originalJoinedDate = await getJoinedDate(userAlice);
    assertExists(originalJoinedDate, "Original joinedDate must exist for idempotency test.");

    console.log(`Trace: Activating user ${userAlice} again (already active).`);
    const activateResult = await membershipConcept.activate({ user: userAlice });
    assertEquals(activateResult, {}, "Re-activating should still return an empty object.");

    console.log(`Trace: Querying isActive for ${userAlice}.`);
    const isActiveResult = await membershipConcept._isActive({ user: userAlice });
    assertEquals(isActiveResult.length, 1);
    assertEquals(isActiveResult[0].isActive, true, "User should remain active.");

    console.log(`Trace: Querying joinedDate for ${userAlice} after re-activation.`);
    const newJoinedDate = await getJoinedDate(userAlice);
    assertEquals(newJoinedDate?.toISOString(), originalJoinedDate?.toISOString(), "joinedDate should not change on re-activation.");
    console.log(`User ${userAlice} joined on: ${newJoinedDate}`);
  });

  await t.step("Action: deactivate (active user)", async () => {
    console.log(`Trace: Deactivating user ${userAlice}.`);
    const deactivateResult = await membershipConcept.deactivate({ user: userAlice });
    assertEquals(deactivateResult, {}, "Deactivate should return an empty object on success.");

    console.log(`Trace: Querying isActive for ${userAlice}.`);
    const isActiveResult = await membershipConcept._isActive({ user: userAlice });
    assertEquals(isActiveResult.length, 1);
    assertEquals(isActiveResult[0].isActive, false, "User should be inactive after deactivation.");
  });

  await t.step("Action: deactivate (non-existent user)", async () => {
    console.log(`Trace: Attempting to deactivate non-existent user ${userBob}.`);
    const deactivateResult = await membershipConcept.deactivate({ user: userBob });
    assertNotEquals(deactivateResult, {}, "Deactivate should return an error for non-existent user.");
    assertEquals((deactivateResult as { error: string }).error, `Membership record for user ${userBob} not found. Cannot deactivate.`, "Error message should be specific.");

    console.log(`Trace: Querying isActive for non-existent user ${userBob}.`);
    const isActiveResult = await membershipConcept._isActive({ user: userBob });
    assertEquals(isActiveResult.length, 0, "No record should exist for non-existent user.");
  });

  await t.step("Action: activate (deactivated user - re-activation)", async () => {
    console.log(`Trace: Storing original joinedDate for ${userAlice} before re-activation.`);
    const originalJoinedDate = await getJoinedDate(userAlice);
    assertExists(originalJoinedDate, "Original joinedDate must exist for re-activation test.");

    console.log(`Trace: Re-activating user ${userAlice}.`);
    await membershipConcept.activate({ user: userAlice });

    console.log(`Trace: Querying isActive for ${userAlice}.`);
    const isActiveResult = await membershipConcept._isActive({ user: userAlice });
    assertEquals(isActiveResult.length, 1);
    assertEquals(isActiveResult[0].isActive, true, "User should be active again after re-activation.");

    console.log(`Trace: Querying joinedDate for ${userAlice} after re-activation.`);
    const newJoinedDate = await getJoinedDate(userAlice);
    assertEquals(newJoinedDate?.toISOString(), originalJoinedDate?.toISOString(), "joinedDate should not change on re-activation.");
    console.log(`User ${userAlice} re-activated, joined on: ${newJoinedDate}`);
  });

  await t.step("Query: _isActive (non-existent user)", async () => {
    console.log(`Trace: Querying isActive for non-existent user ${userCharlie}.`);
    const result = await membershipConcept._isActive({ user: userCharlie });
    assertEquals(result, [], "Query should return an empty array for a non-existent user.");
  });

  await t.step("Query: _joinedDate (non-existent user)", async () => {
    console.log(`Trace: Querying joinedDate for non-existent user ${userCharlie}.`);
    const result = await membershipConcept._joinedDate({ user: userCharlie });
    assertEquals(result, [], "Query should return an empty array for a non-existent user.");
  });

  await t.step("Principle: Active members can place orders; deactivated members cannot.", async () => {
    // This principle directly relates to how syncs would use this concept.
    // Here, we demonstrate the internal state changes that enable/disable such external logic.

    console.log(`Trace: Activating user ${userBob}.`);
    await membershipConcept.activate({ user: userBob });
    console.log(`Trace: Verifying ${userBob} is active.`);
    let isActiveBob = await membershipConcept._isActive({ user: userBob });
    assertEquals(isActiveBob[0].isActive, true, "User Bob should be active, allowing orders.");
    console.log(`User ${userBob} is active: ${isActiveBob[0].isActive}`);

    console.log(`Trace: Deactivating user ${userBob}.`);
    await membershipConcept.deactivate({ user: userBob });
    console.log(`Trace: Verifying ${userBob} is inactive.`);
    isActiveBob = await membershipConcept._isActive({ user: userBob });
    assertEquals(isActiveBob[0].isActive, false, "User Bob should be inactive, disallowing orders.");
    console.log(`User ${userBob} is active: ${isActiveBob[0].isActive}`);

    console.log(`Trace: Activating user ${userBob} again.`);
    await membershipConcept.activate({ user: userBob });
    console.log(`Trace: Verifying ${userBob} is active again.`);
    isActiveBob = await membershipConcept._isActive({ user: userBob });
    assertEquals(isActiveBob[0].isActive, true, "User Bob should be active again, allowing orders.");
    console.log(`User ${userBob} is active: ${isActiveBob[0].isActive}`);

    console.log(`Principle demonstrated: The concept correctly toggles 'isActive' status, which (via syncs) would control ordering eligibility.`);
  });

  await client.close();
});
```
