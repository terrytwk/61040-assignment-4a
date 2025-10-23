#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

/**
 * Data Reset Script
 *
 * This script resets the database by dropping all collections,
 * providing a clean slate for testing and development.
 *
 * Usage: deno run --allow-net --allow-env --allow-read data-reset.ts [--confirm]
 */

import { parseArgs } from "jsr:@std/cli/parse-args";
import { getDb } from "../../src/utils/database.ts";

// Parse command line arguments
const args = parseArgs(Deno.args, {
  boolean: ["confirm"],
  default: {
    confirm: false,
  },
});

const CONFIRM_RESET = args.confirm;

// Utility function to drop all collections
async function dropAllCollections(db: any): Promise<void> {
  try {
    // Get all collection names
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("ℹ️  No collections found in database");
      return;
    }

    console.log(`📋 Found ${collections.length} collection(s) to drop:`);
    collections.forEach((collection: any) => {
      console.log(`  - ${collection.name}`);
    });

    // Drop each collection
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`✓ Dropped collection: ${collection.name}`);
    }
  } catch (error) {
    console.error("❌ Error dropping collections:", error);
    throw error;
  }
}

// Main reset function
async function resetDatabase(): Promise<void> {
  console.log("🔄 Starting Database Reset");

  try {
    // Initialize database connection
    const [db, client] = await getDb();
    const dbName = db.databaseName;

    console.log(`📡 Connected to database: ${dbName}`);

    // Show current collections before dropping
    const collections = await db.listCollections().toArray();
    console.log(`📊 Current collections: ${collections.length}`);

    if (collections.length === 0) {
      console.log("ℹ️  Database is already empty");
      return;
    }

    // Drop all collections
    await dropAllCollections(db);

    // Verify reset
    const remainingCollections = await db.listCollections().toArray();
    console.log(
      `✅ Reset complete. Remaining collections: ${remainingCollections.length}`,
    );

    // Close connection
    await client.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
}

// Confirmation prompt
async function confirmReset(): Promise<boolean> {
  if (CONFIRM_RESET) {
    return true;
  }

  console.log(
    "⚠️  WARNING: This will permanently delete ALL data in the database!",
  );
  console.log("⚠️  This action cannot be undone.");
  console.log("");
  console.log("To proceed, run the script with --confirm flag:");
  console.log(
    "deno run --allow-net --allow-env --allow-read data-reset.ts --confirm",
  );

  return false;
}

// Main execution
async function main(): Promise<void> {
  console.log("🗑️  Database Reset Script");
  console.log("=========================");

  const confirmed = await confirmReset();

  if (!confirmed) {
    console.log("❌ Reset cancelled - confirmation required");
    Deno.exit(1);
  }

  try {
    await resetDatabase();
    console.log("\n🎉 Database reset completed successfully!");
    console.log(
      "💡 You can now run generate-data.ts to populate with fresh test data",
    );
  } catch (error) {
    console.error("\n💥 Database reset failed:", error);
    Deno.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main();
}
