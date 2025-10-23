import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserProfileConcept from "./UserProfileConcept.ts";

Deno.test("UserProfile Concept", async (t: Deno.TestContext) => {
  const [db, client] = await testDb();
  const userProfileConcept = new UserProfileConcept(db);

  const userA: ID = "user:Alice" as ID;
  const userB: ID = "user:Bob" as ID;
  const userC: ID = "user:Charlie" as ID;

  // Helper to query and assert for a single profile document, for legibility
  const getAndAssertProfile = async (
    user: ID,
    expectedProfile: {
      name: string;
      classYear?: string | null;
      major?: string | null;
      bio: string;
      favoriteDrink?: string | null;
      favoriteCafe?: string | null;
      avatar?: string | null;
    },
    message: string,
  ) => {
    // console.log(`    Querying profile for ${user}...`); // Make internal logging more subtle
    const result = await userProfileConcept._profile({ user });
    if ("error" in result) {
      throw new Error(`Failed to get profile for ${user}: ${result.error}`);
    }
    assertEquals(
      result.length,
      1,
      `Expected one profile for ${user}, got ${result.length}`,
    );
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

    // Check optional fields
    if (
      expectedProfile.classYear === undefined ||
      expectedProfile.classYear === null
    ) {
      assertEquals(
        actualProfile.classYear,
        undefined,
        `${message}: ClassYear should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.classYear,
        expectedProfile.classYear,
        `${message}: ClassYear mismatch for ${user}`,
      );
    }

    if (expectedProfile.major === undefined || expectedProfile.major === null) {
      assertEquals(
        actualProfile.major,
        undefined,
        `${message}: Major should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.major,
        expectedProfile.major,
        `${message}: Major mismatch for ${user}`,
      );
    }

    if (
      expectedProfile.favoriteDrink === undefined ||
      expectedProfile.favoriteDrink === null
    ) {
      assertEquals(
        actualProfile.favoriteDrink,
        undefined,
        `${message}: FavoriteDrink should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.favoriteDrink,
        expectedProfile.favoriteDrink,
        `${message}: FavoriteDrink mismatch for ${user}`,
      );
    }

    if (
      expectedProfile.favoriteCafe === undefined ||
      expectedProfile.favoriteCafe === null
    ) {
      assertEquals(
        actualProfile.favoriteCafe,
        undefined,
        `${message}: FavoriteCafe should be undefined/not present for ${user}`,
      );
    } else {
      assertEquals(
        actualProfile.favoriteCafe,
        expectedProfile.favoriteCafe,
        `${message}: FavoriteCafe mismatch for ${user}`,
      );
    }

    if (
      expectedProfile.avatar === undefined || expectedProfile.avatar === null
    ) {
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

  await t.step(
    "Action: setProfile - Update an existing user profile (only bio)",
    async () => {
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
    },
  );

  await t.step("Action: setProfile - Set avatar for user A", async () => {
    const avatarUrl = "http://example.com/alice.jpg";
    console.log(`  Setting user A's avatar: '${avatarUrl}'.`);
    const result = await userProfileConcept.setProfile({
      user: userA,
      avatar: avatarUrl,
    });
    assertEquals(
      result,
      {},
      "Expected empty object for successful setProfile (set avatar)",
    );
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

  await t.step(
    "Action: setProfile - Remove avatar for user A (avatar: null)",
    async () => {
      console.log("  Removing user A's avatar.");
      const result = await userProfileConcept.setProfile({
        user: userA,
        avatar: null,
      });
      assertEquals(
        result,
        {},
        "Expected empty object for successful setProfile (remove avatar)",
      );
      await getAndAssertProfile(
        userA,
        { name: "Alice Smith", bio: "Senior Software Engineer", avatar: null },
        "Profile after avatar removal check",
      );
    },
  );

  await t.step(
    "Action: setProfile - Create a profile with all new fields",
    async () => {
      console.log(
        "  Creating comprehensive profile for user B with all fields.",
      );
      const result = await userProfileConcept.setProfile({
        user: userB,
        name: "Bob Johnson",
        classYear: "2025",
        major: "Computer Science",
        bio: "CS student passionate about algorithms",
        favoriteDrink: "Oat Milk Latte",
        favoriteCafe: "Main Campus Cafe",
        avatar: "http://example.com/bob.png",
      });
      assertEquals(
        result,
        {},
        "Expected empty object for successful setProfile (comprehensive)",
      );
      await getAndAssertProfile(
        userB,
        {
          name: "Bob Johnson",
          classYear: "2025",
          major: "Computer Science",
          bio: "CS student passionate about algorithms",
          favoriteDrink: "Oat Milk Latte",
          favoriteCafe: "Main Campus Cafe",
          avatar: "http://example.com/bob.png",
        },
        "Comprehensive profile check",
      );
    },
  );

  await t.step(
    "Action: setProfile - Update individual optional fields",
    async () => {
      console.log("  Updating user B's class year to '2026'.");
      let result = await userProfileConcept.setProfile({
        user: userB,
        classYear: "2026",
      });
      assertEquals(
        result,
        {},
        "Expected empty object for successful setProfile (update classYear)",
      );
      await getAndAssertProfile(
        userB,
        {
          name: "Bob Johnson",
          classYear: "2026",
          major: "Computer Science",
          bio: "CS student passionate about algorithms",
          favoriteDrink: "Oat Milk Latte",
          favoriteCafe: "Main Campus Cafe",
          avatar: "http://example.com/bob.png",
        },
        "Updated classYear profile check",
      );

      console.log("  Updating user B's major to 'Mathematics'.");
      result = await userProfileConcept.setProfile({
        user: userB,
        major: "Mathematics",
      });
      assertEquals(
        result,
        {},
        "Expected empty object for successful setProfile (update major)",
      );
      await getAndAssertProfile(
        userB,
        {
          name: "Bob Johnson",
          classYear: "2026",
          major: "Mathematics",
          bio: "CS student passionate about algorithms",
          favoriteDrink: "Oat Milk Latte",
          favoriteCafe: "Main Campus Cafe",
          avatar: "http://example.com/bob.png",
        },
        "Updated major profile check",
      );
    },
  );

  await t.step(
    "Action: setProfile - Remove optional fields (set to null)",
    async () => {
      console.log("  Removing user B's favorite drink and cafe.");
      const result = await userProfileConcept.setProfile({
        user: userB,
        favoriteDrink: null,
        favoriteCafe: null,
      });
      assertEquals(
        result,
        {},
        "Expected empty object for successful setProfile (remove optional fields)",
      );
      await getAndAssertProfile(
        userB,
        {
          name: "Bob Johnson",
          classYear: "2026",
          major: "Mathematics",
          bio: "CS student passionate about algorithms",
          favoriteDrink: null,
          favoriteCafe: null,
          avatar: "http://example.com/bob.png",
        },
        "Profile after removing optional fields",
      );
    },
  );

  await t.step(
    "Query: _profile - Retrieve an existing profile (no avatar)",
    async () => {
      // Ensuring userA's avatar is removed for this check
      await userProfileConcept.setProfile({ user: userA, avatar: null });

      console.log("  Querying user A's profile (expecting no avatar).");
      const result = await userProfileConcept._profile({ user: userA });
      if ("error" in result) {
        throw new Error(`Failed to get profile for user A: ${result.error}`);
      }
      assertEquals(
        result.length,
        1,
        "Expected one result for user A profile query",
      );
      assertEquals(
        result[0],
        { name: "Alice Smith", bio: "Senior Software Engineer" }, // No avatar should be returned
        "Retrieved profile for user A matches expected (no avatar)",
      );
    },
  );

  await t.step("Query: _profile - Retrieve a profile with avatar", async () => {
    // Re-add avatar for user A for this specific test
    const avatarUrl = "http://example.com/alice_new.jpg";
    await userProfileConcept.setProfile({ user: userA, avatar: avatarUrl });

    console.log("  Querying user A's profile (expecting avatar).");
    const result = await userProfileConcept._profile({ user: userA });
    if ("error" in result) {
      throw new Error(`Failed to get profile for user A: ${result.error}`);
    }
    assertEquals(
      result.length,
      1,
      "Expected one result for user A profile query (with avatar)",
    );
    assertEquals(
      result[0],
      {
        name: "Alice Smith",
        bio: "Senior Software Engineer",
        avatar: avatarUrl,
      },
      "Retrieved profile for user A matches expected (with avatar)",
    );
  });

  await t.step(
    "Query: _profile - Retrieve a non-existent profile",
    async () => {
      console.log(
        "  Querying non-existent user C's profile (expecting error).",
      );
      const result = await userProfileConcept._profile({ user: userC });
      if (!("error" in result)) {
        throw new Error(
          "Expected an error when querying non-existent profile, but got success.",
        );
      }
      assertEquals(
        result.error,
        `UserProfile for user ${userC} not found.`,
        "Error message for non-existent profile matches expected",
      );
    },
  );

  await t.step(
    "Principle Test: Calling `setProfile` with new name/bio/avatar updates how the profile appears.",
    async () => {
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
        { name: "Charlie Brown", bio: "Just a kid with a dog." },
        "Principle: Initial profile",
      );

      console.log("  2. Updating user C's name to 'Charles Brown'.");
      result = await userProfileConcept.setProfile({
        user: userC,
        name: "Charles Brown",
      });
      assertEquals(result, {}, "Update name for user C failed");
      await getAndAssertProfile(
        userC,
        { name: "Charles Brown", bio: "Just a kid with a dog." },
        "Principle: Name updated",
      );

      const avatarUrl = "http://example.com/charlie.jpg";
      console.log(
        `  3. Updating user C's bio and adding avatar '${avatarUrl}'.`,
      );
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

      console.log(
        "  4. Updating user C's name to 'Chuck' and removing avatar.",
      );
      result = await userProfileConcept.setProfile({
        user: userC,
        name: "Chuck",
        avatar: null,
      });
      assertEquals(
        result,
        {},
        "Update name and remove avatar for user C failed",
      );
      await getAndAssertProfile(
        userC,
        {
          name: "Chuck",
          bio: "Loves baseball, despite losing often.",
          avatar: null,
        },
        "Principle: Name updated, avatar removed",
      );

      console.log(
        "  Principle demonstrated: Profile updates reflect correctly.",
      );
    },
  );

  await client.close();
});
