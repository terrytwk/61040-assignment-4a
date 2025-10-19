---
timestamp: 'Sat Oct 18 2025 15:37:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_153753.d5c3a30c.md]]'
content_id: 7b3047c85cd4f33f42624aa94cb92e87ef13ff1bdabb60d200e6062ac07bf807
---

# response:

The `MongoServerError: Updating the path 'name' would create a conflict at 'name'` error occurs because you're attempting to set the `name` (and potentially `bio`) field in both the `$set` and `$setOnInsert` operators during an `upsert` operation, for the same field.

When `upsert: true` is used:

1. If the document *doesn't exist*, MongoDB first applies `$setOnInsert` to create the document with those default values.
2. Then, it attempts to apply `$set` to update the document. If `name` (or `bio`) was passed in the `setProfile` arguments, `$set` would try to overwrite the `name` (or `bio`) field that was just set by `$setOnInsert`, causing a conflict.

To fix this, `$setOnInsert` should only include fields that are *not* being explicitly set by `$set` in the current operation.

Here's the corrected `setProfile` method:

```typescript
// file: src/concepts/UserProfile/UserProfileConcept.ts
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "UserProfile" + ".";

// Generic types of this concept
type User = ID;
type Image = string; // Assuming Image is represented as a string (e.g., URL or base64)

/**
 * a set of Users with
 *  – name String
 *  – bio String
 *  – avatar Image?
 *
 * MongoDB document structure for a user profile.
 * `_id` is the User ID. `name` and `bio` are mandatory strings (defaulting to empty).
 * `avatar` is an optional string (Image URL/data) or null if explicitly removed.
 */
interface UserProfileDoc {
  _id: User;
  name: string;
  bio: string;
  avatar?: Image | null; // Allow null to represent explicit removal of avatar
}

export default class UserProfileConcept {
  private users: Collection<UserProfileDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * setProfile (user: User, name?: String, bio?: String, avatar?: Image | null) : ( )
   *
   * **purpose** Store display information about a user.
   *
   * **principle** Calling `setProfile` with a new name/bio/avatar updates how the profile appears.
   *
   * **requires** The User ID exists (if not, a default profile is implicitly created).
   *
   * **effects** Updates only provided fields; others remain unchanged. If a profile doesn't exist, it's created with default empty name/bio, and then updated.
   *            Setting `avatar` to `null` will explicitly remove it from the profile.
   */
  async setProfile({
    user,
    name,
    bio,
    avatar,
  }: {
    user: User;
    name?: string;
    bio?: string;
    avatar?: Image | null; // Allow null to explicitly remove avatar
  }): Promise<Empty | { error: string }> {
    const filter = { _id: user };

    // Prepare update operations
    const updateOps: {
      $set?: Partial<UserProfileDoc>;
      $unset?: { [key: string]: "" };
      $setOnInsert?: Partial<UserProfileDoc>;
    } = {};

    // Fields to set (or overwrite) if provided
    const fieldsToSet: Partial<UserProfileDoc> = {};
    if (name !== undefined) {
      fieldsToSet.name = name;
    }
    if (bio !== undefined) {
      fieldsToSet.bio = bio;
    }

    // Handle avatar: if explicitly provided (even as null), process it.
    if (avatar !== undefined) {
      if (avatar === null) {
        updateOps.$unset = { avatar: "" }; // If null is passed, explicitly remove the field
      } else {
        fieldsToSet.avatar = avatar; // Otherwise, set/update it
      }
    }

    if (Object.keys(fieldsToSet).length > 0) {
      updateOps.$set = fieldsToSet;
    }

    // For upsert: Set default values for name/bio ONLY IF they are NOT being provided in the current call.
    // This prevents the conflict between $set and $setOnInsert on document creation.
    updateOps.$setOnInsert = { _id: user };
    if (name === undefined) {
      updateOps.$setOnInsert.name = "";
    }
    if (bio === undefined) {
      updateOps.$setOnInsert.bio = "";
    }

    // If there's nothing to set or unset (e.g., calling setProfile with just a user ID and no updates),
    // ensure $setOnInsert still creates the document with defaults.
    // However, MongoDB requires at least one operator. If only $setOnInsert is present, it will work.
    // If $set and $unset are empty and $setOnInsert is just {_id: user}, then it effectively does nothing
    // if the document already exists, which is acceptable.

    // If updateOps becomes empty (e.g., if only user is passed and user already exists)
    // updateOne will still work, but it's good practice to ensure operators are correctly structured.
    // The current logic correctly builds the operators based on provided fields.

    try {
      await this.users.updateOne(filter, updateOps, { upsert: true });
      return {};
    } catch (e) {
      console.error(`UserProfileConcept.setProfile: Error setting profile for user ${user}:`, e);
      return { error: `Failed to set profile: ${e.message}` };
    }
  }

  /**
   * _profile (user: User) : (name: String, bio: String, avatar: Image?)
   *
   * **requires** user exists (a profile document for the given user ID must be present in the database).
   *
   * **effects** Returns the current profile fields (name, bio, and optionally avatar) for the specified user.
   *             If the profile does not exist, an error is returned.
   */
  async _profile({
    user,
  }: {
    user: User;
  }): Promise<
    { name: string; bio: string; avatar?: Image }[] | { error: string }
  > {
    try {
      const profile = await this.users.findOne({ _id: user });

      if (!profile) {
        return { error: `UserProfile for user ${user} not found.` };
      }

      // Queries return an array of dictionaries.
      // The spec defines (name: String, bio: String, avatar: Image?) directly, not nested under "profile".
      // So the returned dictionary should have 'name', 'bio', 'avatar' fields.
      const result: { name: string; bio: string; avatar?: Image } = {
        name: profile.name,
        bio: profile.bio,
      };

      // Only include avatar in the result if it exists and is not null
      if (profile.avatar !== undefined && profile.avatar !== null) {
        result.avatar = profile.avatar;
      }

      return [result];
    } catch (e) {
      console.error(`UserProfileConcept._profile: Error fetching profile for user ${user}:`, e);
      return { error: `Failed to fetch profile: ${e.message}` };
    }
  }
}
```
