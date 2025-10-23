#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

/**
 * Data Generation Script
 *
 * This script automates the creation of test data for the cafe ordering system
 * based on the instructions in data-generation.md
 *
 * Usage: deno run --allow-net --allow-env --allow-read generate-data.ts [--server-url=http://localhost:8000]
 */

import { parseArgs } from "jsr:@std/cli/parse-args";

// Configuration - easily customizable
const CONFIG = {
  users: [
    {
      username: "terrytwk",
      password: "password",
      profile: {
        name: "Terry",
        classYear: "2026",
        major: "6-3",
        bio: "i love coffee",
        favoriteDrink: "cortado",
        favoriteCafe: "George Howell",
      },
    },
    {
      username: "alice_cs",
      password: "password123",
      profile: {
        name: "Alice Chen",
        classYear: "2025",
        major: "6-3",
        bio: "Computer Science student passionate about algorithms",
        favoriteDrink: "oat milk latte",
        favoriteCafe: "Main Campus Cafe",
      },
    },
    {
      username: "bob_math",
      password: "password456",
      profile: {
        name: "Bob Johnson",
        classYear: "2026",
        major: "18",
        bio: "Mathematics major who loves coffee breaks",
        favoriteDrink: "americano",
        favoriteCafe: "Student Center",
      },
    },
    {
      username: "charlie_eng",
      password: "password789",
      profile: {
        name: "Charlie Brown",
        classYear: "2027",
        major: "6-2",
        bio: "Engineering student exploring different coffee roasts",
        favoriteDrink: "cappuccino",
        favoriteCafe: "Tech Square",
      },
    },
  ],
  menu_items: [
    {
      name: "Latte",
      description: "Espresso with steamed milk",
      has_milk: true,
    },
    {
      name: "Americano",
      description: "Espresso with hot water",
      has_milk: false,
    },
    {
      name: "Cappuccino",
      description: "Espresso with equal parts steamed milk and foam",
      has_milk: true,
    },
    {
      name: "Cortado",
      description: "Espresso with a small amount of warm milk",
      has_milk: true,
    },
  ],
  options: {
    temperature: {
      name: "Temperature",
      required: true,
      maxChoices: 1,
      choices: ["hot", "iced"],
    },
    milk: {
      name: "Milk",
      required: false,
      maxChoices: 1,
      choices: ["whole", "oat"],
    },
  },
};

// Parse command line arguments
const args = parseArgs(Deno.args, {
  string: ["server-url"],
  default: {
    "server-url": "http://localhost:8000",
  },
});

const SERVER_URL = args["server-url"];

// Types for tracking generated IDs
interface GeneratedData {
  users: Map<string, string>; // username -> user_id
  options: Map<string, string>; // option_name -> option_id
  choices: Map<string, string>; // choice_name -> choice_id
  items: Map<string, string>; // item_name -> item_id
}

const generatedData: GeneratedData = {
  users: new Map(),
  options: new Map(),
  choices: new Map(),
  items: new Map(),
};

// Utility functions
async function makeRequest(endpoint: string, payload: any): Promise<any> {
  const url = `${SERVER_URL}/api${endpoint}`;
  console.log(`POST ${url}`);
  console.log(`Payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Response:`, JSON.stringify(result, null, 2));
    console.log("---");
    return result;
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    throw error;
  }
}

async function createUser(username: string, password: string): Promise<string> {
  const result = await makeRequest("/UserAuthentication/register", {
    username,
    password,
  });
  if ("error" in result) {
    throw new Error(`Failed to create user ${username}: ${result.error}`);
  }
  return result.user;
}

async function createUserProfile(
  userId: string,
  profile: {
    name: string;
    classYear: string;
    major: string;
    bio: string;
    favoriteDrink: string;
    favoriteCafe: string;
  },
): Promise<void> {
  const result = await makeRequest("/UserProfile/setProfile", {
    user: userId,
    name: profile.name,
    classYear: profile.classYear,
    major: profile.major,
    bio: profile.bio,
    favoriteDrink: profile.favoriteDrink,
    favoriteCafe: profile.favoriteCafe,
  });
  if ("error" in result) {
    throw new Error(
      `Failed to create profile for user ${userId}: ${result.error}`,
    );
  }
}

async function createOption(
  name: string,
  required: boolean,
  maxChoices: number,
): Promise<string> {
  const result = await makeRequest("/Menu/createOption", {
    name,
    required,
    maxChoices,
  });
  if ("error" in result) {
    throw new Error(`Failed to create option ${name}: ${result.error}`);
  }
  return result.option;
}

async function createChoice(optionId: string, name: string): Promise<string> {
  const result = await makeRequest("/Menu/createChoice", {
    option: optionId,
    name,
  });
  if ("error" in result) {
    throw new Error(`Failed to create choice ${name}: ${result.error}`);
  }
  return result.choice;
}

async function createItem(name: string, description: string): Promise<string> {
  const result = await makeRequest("/Menu/createItem", { name, description });
  if ("error" in result) {
    throw new Error(`Failed to create item ${name}: ${result.error}`);
  }
  return result.item;
}

async function attachOption(itemId: string, optionId: string): Promise<void> {
  const result = await makeRequest("/Menu/attachOption", {
    item: itemId,
    option: optionId,
  });
  if ("error" in result) {
    throw new Error(`Failed to attach option to item: ${result.error}`);
  }
}

async function verifyOptionsForItem(
  itemId: string,
  itemName: string,
): Promise<void> {
  const result = await makeRequest("/Menu/_optionsForItem", { item: itemId });
  if ("error" in result) {
    throw new Error(
      `Failed to verify options for ${itemName}: ${result.error}`,
    );
  }
  console.log(
    `✓ ${itemName} has ${result.length} option(s):`,
    result.map((r: any) => r.option.name),
  );
}

async function verifyChoicesForOption(
  itemId: string,
  optionId: string,
  optionName: string,
): Promise<void> {
  const result = await makeRequest("/Menu/_choicesFor", {
    item: itemId,
    option: optionId,
  });
  if ("error" in result) {
    throw new Error(
      `Failed to verify choices for ${optionName}: ${result.error}`,
    );
  }
  console.log(
    `✓ ${optionName} has choices:`,
    result.map((r: any) => r.choice.name),
  );
}

// Main data generation functions
async function createUsers(): Promise<void> {
  console.log("=== Creating Users and Profiles ===");
  for (const user of CONFIG.users) {
    const userId = await createUser(user.username, user.password);
    generatedData.users.set(user.username, userId);
    console.log(`✓ Created user: ${user.username} (ID: ${userId})`);

    // Create user profile
    await createUserProfile(userId, user.profile);
    console.log(
      `✓ Created profile for ${user.username}: ${user.profile.name} (${user.profile.major}, ${user.profile.classYear})`,
    );
  }
}

async function createOptions(): Promise<void> {
  console.log("\n=== Creating Options ===");
  for (const [optionKey, optionConfig] of Object.entries(CONFIG.options)) {
    const optionId = await createOption(
      optionConfig.name,
      optionConfig.required,
      optionConfig.maxChoices,
    );
    generatedData.options.set(optionKey, optionId);
    console.log(`✓ Created option: ${optionConfig.name} (ID: ${optionId})`);
  }
}

async function createChoices(): Promise<void> {
  console.log("\n=== Creating Choices ===");
  for (const [optionKey, optionConfig] of Object.entries(CONFIG.options)) {
    const optionId = generatedData.options.get(optionKey)!;
    console.log(`Creating choices for ${optionConfig.name}:`);

    for (const choiceName of optionConfig.choices) {
      const choiceId = await createChoice(optionId, choiceName);
      generatedData.choices.set(choiceName, choiceId);
      console.log(`  ✓ Created choice: ${choiceName} (ID: ${choiceId})`);
    }
  }
}

async function createItems(): Promise<void> {
  console.log("\n=== Creating Menu Items ===");
  for (const item of CONFIG.menu_items) {
    const itemId = await createItem(item.name, item.description);
    generatedData.items.set(item.name, itemId);
    console.log(`✓ Created item: ${item.name} (ID: ${itemId})`);
  }
}

async function attachOptionsToItems(): Promise<void> {
  console.log("\n=== Attaching Options to Items ===");

  const temperatureOptionId = generatedData.options.get("temperature")!;
  const milkOptionId = generatedData.options.get("milk")!;

  for (const item of CONFIG.menu_items) {
    const itemId = generatedData.items.get(item.name)!;

    // All items get temperature option
    await attachOption(itemId, temperatureOptionId);
    console.log(`✓ Attached temperature option to ${item.name}`);

    // Only milk-based drinks get milk option
    if (item.has_milk) {
      await attachOption(itemId, milkOptionId);
      console.log(`✓ Attached milk option to ${item.name}`);
    } else {
      console.log(`✓ ${item.name} does not get milk option (as expected)`);
    }
  }
}

async function verifyMenuStructure(): Promise<void> {
  console.log("\n=== Verifying Menu Structure ===");

  for (const item of CONFIG.menu_items) {
    const itemId = generatedData.items.get(item.name)!;
    await verifyOptionsForItem(itemId, item.name);

    // Verify choices for each attached option
    const temperatureOptionId = generatedData.options.get("temperature")!;
    await verifyChoicesForOption(itemId, temperatureOptionId, "Temperature");

    if (item.has_milk) {
      const milkOptionId = generatedData.options.get("milk")!;
      await verifyChoicesForOption(itemId, milkOptionId, "Milk");
    }
  }
}

async function printSummary(): Promise<void> {
  console.log("\n=== Data Generation Summary ===");
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Users created: ${generatedData.users.size}`);
  console.log(`User profiles created: ${generatedData.users.size}`);
  console.log(`Options created: ${generatedData.options.size}`);
  console.log(`Choices created: ${generatedData.choices.size}`);
  console.log(`Items created: ${generatedData.items.size}`);

  console.log("\nGenerated IDs:");
  console.log("Users:", Object.fromEntries(generatedData.users));
  console.log("Options:", Object.fromEntries(generatedData.options));
  console.log("Choices:", Object.fromEntries(generatedData.choices));
  console.log("Items:", Object.fromEntries(generatedData.items));

  console.log("\nUser Profiles Created:");
  for (const user of CONFIG.users) {
    const userId = generatedData.users.get(user.username);
    console.log(
      `- ${user.username} (${userId}): ${user.profile.name} - ${user.profile.major} ${user.profile.classYear}`,
    );
    console.log(`  Bio: "${user.profile.bio}"`);
    console.log(
      `  Favorite: ${user.profile.favoriteDrink} at ${user.profile.favoriteCafe}`,
    );
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Test user login: POST /api/UserAuthentication/login");
  console.log("2. Test profile retrieval: POST /api/UserProfile/_profile");
  console.log(
    "3. Activate user membership (if Membership concept is implemented)",
  );
  console.log("4. Test order creation flow");
  console.log("5. Verify menu structure matches expectations");
}

// Main execution
async function main(): Promise<void> {
  console.log("🚀 Starting Data Generation Script");
  console.log(`📡 Server URL: ${SERVER_URL}`);
  console.log("📋 Configuration:", JSON.stringify(CONFIG, null, 2));

  try {
    await createUsers();
    await createOptions();
    await createChoices();
    await createItems();
    await attachOptionsToItems();
    await verifyMenuStructure();
    await printSummary();

    console.log("\n✅ Data generation completed successfully!");
  } catch (error) {
    console.error("\n❌ Data generation failed:", error);
    Deno.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main();
}
