[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: UserProfile
# response:

```typescript
// file: src/concepts/UserProfile/UserProfileConcept.test.ts
import { assertEquals } from "jsr:@std/assert";
import { Deno } from "https://deno.land/std@0.224.0/testing/mod.ts";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserProfileConcept from "./UserProfileConcept.ts";

Deno.test("UserProfile Concept", async (t) => {
  const [db, client] = await testDb();
  const userProfileConcept = new UserProfileConcept(db);

  const userA: ID = "user:Alice" as ID;
  const userB: ID = "user:Bob" as ID;
  const userC: ID = "user:Charlie" as ID;

  // Helper to query and assert for a single profile document, for legibility
  const getAndAssertProfile = async (
    user: ID,
    expectedProfile: { name: string; bio: string; avatar?: string | null },
    message: string,
  ) => {
    console.log(`  Querying profile for ${user}...`);
    const result = await userProfileConcept._profile({ user });
    if ("error" in result) {
      throw new Error(`Failed to get profile for ${user}: ${result.error}`);
    }
    assertEquals(result.length, 1, `Expected one profile for ${user}, got ${result.length}`);
    const actualProfile = result[0];

    assertEquals(
      actualProfile.name,
      expectedProfile.name,
      `${message}: Name mismatch for ${user}`,
    );
    assertEquals(
      actualProfile.bio,
      expectedProfile.bio,
      `${message}: Bio mismatch for ${user}`,
    );

    // Special handling for avatar: undefined means not present, null means explicitly removed.
    // The query returns `avatar` field only if it has a non-null value.
    if (expectedProfile.avatar === undefined || expectedProfile.avatar === null) {
      assertEquals(
        actualProfile.avatar,
        undefined, // If expected is null or undefined, the query should return undefined for avatar field
        `${message}: Avatar should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.avatar,
        expectedProfile.avatar,
        `${message}: Avatar mismatch for ${user}`,
      );
    }
    console.log(`  Profile for ${user} confirmed:`, actualProfile);
  };

  await t.step("Action: setProfile - Create a new user profile", async () => {
    console.log(
      "  Calling setProfile to create a new profile for user A (Alice Smith, Software Engineer)...",
    );
    const result = await userProfileConcept.setProfile({
      user: userA,
      name: "Alice Smith",
      bio: "Software Engineer",
    });
    assertEquals(
      result,
      {},
      "Expected empty object for successful setProfile (creation)",
    );
    console.log("  New profile created. Verifying effects with _profile query.");
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Software Engineer" },
      "Newly created profile check",
    );
  });

  await t.step("Action: setProfile - Update an existing user profile (only bio)", async () => {
    console.log(
      "  Calling setProfile to update bio for user A to 'Senior Software Engineer'. Name should remain unchanged.",
    );
    const result = await userProfileConcept.setProfile({
      user: userA,
      bio: "Senior Software Engineer",
    });
    assertEquals(
      result,
      {},
      "Expected empty object for successful setProfile (update)",
    );
    console.log("  Profile updated. Verifying effects with _profile query.");
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Senior Software Engineer" },
      "Updated bio profile check",
    );
  });

  await t.step("Action: setProfile - Set avatar for user A", async () => {
    const avatarUrl = "http://example.com/alice.jpg";
    console.log(`  Calling setProfile to set avatar for user A to '${avatarUrl}'...`);
    const result = await userProfileConcept.setProfile({
      user: userA,
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (set avatar)");
    console.log("  Avatar set. Verifying effects with _profile query.");
    await getAndAssertProfile(
      userA,
      {
        name: "Alice Smith",
        bio: "Senior Software Engineer",
        avatar: avatarUrl,
      },
      "Profile with avatar check",
    );
  });

  await t.step("Action: setProfile - Remove avatar for user A (avatar: null)", async () => {
    console.log("  Calling setProfile to remove avatar for user A by passing avatar: null...");
    const result = await userProfileConcept.setProfile({
      user: userA,
      avatar: null,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (remove avatar)");
    console.log("  Avatar removed. Verifying effects with _profile query.");
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Senior Software Engineer", avatar: null },
      "Profile after avatar removal check",
    );
  });

  await t.step("Action: setProfile - Create a profile with only name and avatar (no bio)", async () => {
    const avatarUrl = "http://example.com/bob.png";
    console.log("  Calling setProfile to create a profile for user B with name 'Bob Johnson' and an avatar. Bio should default to empty.");
    const result = await userProfileConcept.setProfile({
      user: userB,
      name: "Bob Johnson",
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (create with partial data)");
    console.log("  New profile with partial data created. Verifying effects with _profile query.");
    await getAndAssertProfile(
      userB,
      { name: "Bob Johnson", bio: "", avatar: avatarUrl }, // Bio should default to empty string
      "User B profile check (name, avatar, default bio)",
    );
  });

  await t.step("Query: _profile - Retrieve an existing profile (no avatar)", async () => {
    // Ensuring userA's avatar is removed for this check
    await userProfileConcept.setProfile({ user: userA, avatar: null });

    console.log("  Explicitly querying profile for user A (expecting no avatar)...");
    const result = await userProfileConcept._profile({ user: userA });
    if ("error" in result) {
      throw new Error(`Failed to get profile for user A: ${result.error}`);
    }
    assertEquals(result.length, 1, "Expected one result for user A profile query");
    assertEquals(
      result[0],
      { name: "Alice Smith", bio: "Senior Software Engineer" }, // No avatar should be returned
      "Retrieved profile for user A matches expected (no avatar)",
    );
    console.log("  Retrieved profile for user A:", result[0]);
  });

  await t.step("Query: _profile - Retrieve a profile with avatar", async () => {
    // Re-add avatar for user A for this specific test
    const avatarUrl = "http://example.com/alice_new.jpg";
    await userProfileConcept.setProfile({ user: userA, avatar: avatarUrl });

    console.log("  Explicitly querying profile for user A (with avatar)...");
    const result = await userProfileConcept._profile({ user: userA });
    if ("error" in result) {
      throw new Error(`Failed to get profile for user A: ${result.error}`);
    }
    assertEquals(result.length, 1, "Expected one result for user A profile query (with avatar)");
    assertEquals(
      result[0],
      { name: "Alice Smith", bio: "Senior Software Engineer", avatar: avatarUrl },
      "Retrieved profile for user A matches expected (with avatar)",
    );
    console.log("  Retrieved profile for user A (with avatar):", result[0]);
  });

  await t.step("Query: _profile - Retrieve a non-existent profile", async () => {
    console.log("  Attempting to query profile for non-existent user C...");
    const result = await userProfileConcept._profile({ user: userC });
    if (!("error" in result)) {
      throw new Error("Expected an error when querying non-existent profile, but got success.");
    }
    assertEquals(
      result.error,
      `UserProfile for user ${userC} not found.`,
      "Error message for non-existent profile matches expected",
    );
    console.log("  Successfully received error for non-existent profile:", result.error);
  });

  await t.step("Principle Test: Calling `setProfile` with new name/bio/avatar updates how the profile appears.", async () => {
    console.log("\n# trace: Demonstrating UserProfile principle");

    console.log("  1. Creating initial profile for user C.");
    let result = await userProfileConcept.setProfile({
      user: userC,
      name: "Charlie Brown",
      bio: "Just a kid with a dog.",
    });
    assertEquals(result, {}, "Initial setProfile for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Charlie Brown", bio: "Just a kid with a dog" },
      "Principle: Initial profile",
    );

    console.log("  2. Updating only the name for user C to 'Charles Brown'.");
    result = await userProfileConcept.setProfile({ user: userC, name: "Charles Brown" });
    assertEquals(result, {}, "Update name for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Charles Brown", bio: "Just a kid with a dog" },
      "Principle: Name updated",
    );

    const avatarUrl = "http://example.com/charlie.jpg";
    console.log(`  3. Updating bio to 'Loves baseball, despite losing often.' and adding avatar '${avatarUrl}' for user C.`);
    result = await userProfileConcept.setProfile({
      user: userC,
      bio: "Loves baseball, despite losing often.",
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Update bio and avatar for user C failed");
    await getAndAssertProfile(
      userC,
      {
        name: "Charles Brown",
        bio: "Loves baseball, despite losing often.",
        avatar: avatarUrl,
      },
      "Principle: Bio and avatar updated",
    );

    console.log("  4. Updating name again to 'Chuck' and removing avatar for user C.");
    result = await userProfileConcept.setProfile({ user: userC, name: "Chuck", avatar: null });
    assertEquals(result, {}, "Update name and remove avatar for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Chuck", bio: "Loves baseball, despite losing often.", avatar: null },
      "Principle: Name updated, avatar removed",
    );

    console.log("  Principle demonstrated: User profile updates (including setting/removing avatar) are correctly reflected when queried.");
  });

  await client.close();
});
```

# prompt: keep the console.log concise and readable.
# response:

```typescript
// file: src/concepts/UserProfile/UserProfileConcept.test.ts
import { assertEquals } from "jsr:@std/assert";
import { Deno } from "https://deno.land/std@0.224.0/testing/mod.ts";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserProfileConcept from "./UserProfileConcept.ts";

Deno.test("UserProfile Concept", async (t) => {
  const [db, client] = await testDb();
  const userProfileConcept = new UserProfileConcept(db);

  const userA: ID = "user:Alice" as ID;
  const userB: ID = "user:Bob" as ID;
  const userC: ID = "user:Charlie" as ID;

  // Helper to query and assert for a single profile document, for legibility
  const getAndAssertProfile = async (
    user: ID,
    expectedProfile: { name: string; bio: string; avatar?: string | null },
    message: string,
  ) => {
    // console.log(`    Querying profile for ${user}...`); // Make internal logging more subtle
    const result = await userProfileConcept._profile({ user });
    if ("error" in result) {
      throw new Error(`Failed to get profile for ${user}: ${result.error}`);
    }
    assertEquals(result.length, 1, `Expected one profile for ${user}, got ${result.length}`);
    const actualProfile = result[0];

    assertEquals(
      actualProfile.name,
      expectedProfile.name,
      `${message}: Name mismatch for ${user}`,
    );
    assertEquals(
      actualProfile.bio,
      expectedProfile.bio,
      `${message}: Bio mismatch for ${user}`,
    );

    if (expectedProfile.avatar === undefined || expectedProfile.avatar === null) {
      assertEquals(
        actualProfile.avatar,
        undefined,
        `${message}: Avatar should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.avatar,
        expectedProfile.avatar,
        `${message}: Avatar mismatch for ${user}`,
      );
    }
    // console.log(`    Profile for ${user} confirmed.`); // Make internal logging more subtle
  };

  await t.step("Action: setProfile - Create a new user profile", async () => {
    console.log(
      "  Creating profile for user A (Alice Smith, Software Engineer).",
    );
    const result = await userProfileConcept.setProfile({
      user: userA,
      name: "Alice Smith",
      bio: "Software Engineer",
    });
    assertEquals(
      result,
      {},
      "Expected empty object for successful setProfile (creation)",
    );
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Software Engineer" },
      "Newly created profile check",
    );
  });

  await t.step("Action: setProfile - Update an existing user profile (only bio)", async () => {
    console.log(
      "  Updating user A's bio: 'Senior Software Engineer'.",
    );
    const result = await userProfileConcept.setProfile({
      user: userA,
      bio: "Senior Software Engineer",
    });
    assertEquals(
      result,
      {},
      "Expected empty object for successful setProfile (update)",
    );
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Senior Software Engineer" },
      "Updated bio profile check",
    );
  });

  await t.step("Action: setProfile - Set avatar for user A", async () => {
    const avatarUrl = "http://example.com/alice.jpg";
    console.log(`  Setting user A's avatar: '${avatarUrl}'.`);
    const result = await userProfileConcept.setProfile({
      user: userA,
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (set avatar)");
    await getAndAssertProfile(
      userA,
      {
        name: "Alice Smith",
        bio: "Senior Software Engineer",
        avatar: avatarUrl,
      },
      "Profile with avatar check",
    );
  });

  await t.step("Action: setProfile - Remove avatar for user A (avatar: null)", async () => {
    console.log("  Removing user A's avatar.");
    const result = await userProfileConcept.setProfile({
      user: userA,
      avatar: null,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (remove avatar)");
    await getAndAssertProfile(
      userA,
      { name: "Alice Smith", bio: "Senior Software Engineer", avatar: null },
      "Profile after avatar removal check",
    );
  });

  await t.step("Action: setProfile - Create a profile with only name and avatar (no bio)", async () => {
    const avatarUrl = "http://example.com/bob.png";
    console.log("  Creating profile for user B (Bob Johnson) with avatar, bio defaults.");
    const result = await userProfileConcept.setProfile({
      user: userB,
      name: "Bob Johnson",
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Expected empty object for successful setProfile (create with partial data)");
    await getAndAssertProfile(
      userB,
      { name: "Bob Johnson", bio: "", avatar: avatarUrl }, // Bio should default to empty string
      "User B profile check (name, avatar, default bio)",
    );
  });

  await t.step("Query: _profile - Retrieve an existing profile (no avatar)", async () => {
    // Ensuring userA's avatar is removed for this check
    await userProfileConcept.setProfile({ user: userA, avatar: null });

    console.log("  Querying user A's profile (expecting no avatar).");
    const result = await userProfileConcept._profile({ user: userA });
    if ("error" in result) {
      throw new Error(`Failed to get profile for user A: ${result.error}`);
    }
    assertEquals(result.length, 1, "Expected one result for user A profile query");
    assertEquals(
      result[0],
      { name: "Alice Smith", bio: "Senior Software Engineer" }, // No avatar should be returned
      "Retrieved profile for user A matches expected (no avatar)",
    );
  });

  await t.step("Query: _profile - Retrieve a profile with avatar", async () => {
    // Re-add avatar for user A for this specific test
    const avatarUrl = "http://example.com/alice_new.jpg";
    await userProfileConcept.setProfile({ user: userA, avatar: avatarUrl });

    console.log("  Querying user A's profile (expecting avatar).");
    const result = await userProfileConcept._profile({ user: userA });
    if ("error" in result) {
      throw new Error(`Failed to get profile for user A: ${result.error}`);
    }
    assertEquals(result.length, 1, "Expected one result for user A profile query (with avatar)");
    assertEquals(
      result[0],
      { name: "Alice Smith", bio: "Senior Software Engineer", avatar: avatarUrl },
      "Retrieved profile for user A matches expected (with avatar)",
    );
  });

  await t.step("Query: _profile - Retrieve a non-existent profile", async () => {
    console.log("  Querying non-existent user C's profile (expecting error).");
    const result = await userProfileConcept._profile({ user: userC });
    if (!("error" in result)) {
      throw new Error("Expected an error when querying non-existent profile, but got success.");
    }
    assertEquals(
      result.error,
      `UserProfile for user ${userC} not found.`,
      "Error message for non-existent profile matches expected",
    );
  });

  await t.step("Principle Test: Calling `setProfile` with new name/bio/avatar updates how the profile appears.", async () => {
    console.log("\n# trace: Demonstrating UserProfile principle");

    console.log("  1. Creating initial profile for user C.");
    let result = await userProfileConcept.setProfile({
      user: userC,
      name: "Charlie Brown",
      bio: "Just a kid with a dog.",
    });
    assertEquals(result, {}, "Initial setProfile for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Charlie Brown", bio: "Just a kid with a dog" },
      "Principle: Initial profile",
    );

    console.log("  2. Updating user C's name to 'Charles Brown'.");
    result = await userProfileConcept.setProfile({ user: userC, name: "Charles Brown" });
    assertEquals(result, {}, "Update name for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Charles Brown", bio: "Just a kid with a dog" },
      "Principle: Name updated",
    );

    const avatarUrl = "http://example.com/charlie.jpg";
    console.log(`  3. Updating user C's bio and adding avatar '${avatarUrl}'.`);
    result = await userProfileConcept.setProfile({
      user: userC,
      bio: "Loves baseball, despite losing often.",
      avatar: avatarUrl,
    });
    assertEquals(result, {}, "Update bio and avatar for user C failed");
    await getAndAssertProfile(
      userC,
      {
        name: "Charles Brown",
        bio: "Loves baseball, despite losing often.",
        avatar: avatarUrl,
      },
      "Principle: Bio and avatar updated",
    );

    console.log("  4. Updating user C's name to 'Chuck' and removing avatar.");
    result = await userProfileConcept.setProfile({ user: userC, name: "Chuck", avatar: null });
    assertEquals(result, {}, "Update name and remove avatar for user C failed");
    await getAndAssertProfile(
      userC,
      { name: "Chuck", bio: "Loves baseball, despite losing often.", avatar: null },
      "Principle: Name updated, avatar removed",
    );

    console.log("  Principle demonstrated: Profile updates reflect correctly.");
  });

  await client.close();
});
```
# response:

