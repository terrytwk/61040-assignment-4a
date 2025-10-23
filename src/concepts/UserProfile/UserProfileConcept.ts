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
 *  – classYear String?
 *  – major String?
 *  – bio String
 *  – favoriteDrink String?
 *  – favoriteCafe String?
 *  – avatar Image?
 *
 * MongoDB document structure for a user profile.
 * `_id` is the User ID. `name` and `bio` are mandatory strings (defaulting to empty).
 * `classYear`, `major`, `favoriteDrink`, and `favoriteCafe` are optional strings.
 * `avatar` is an optional string (Image URL/data) or null if explicitly removed.
 */
interface UserProfileDoc {
  _id: User;
  name: string;
  classYear?: string | null;
  major?: string | null;
  bio: string;
  favoriteDrink?: string | null;
  favoriteCafe?: string | null;
  avatar?: Image | null; // Allow null to represent explicit removal of avatar
}

export default class UserProfileConcept {
  private users: Collection<UserProfileDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * setProfile (user: User, name?: String, classYear?: String, major?: String, bio?: String, favoriteDrink?: String, favoriteCafe?: String, avatar?: Image | null) : ( )
   *
   * **purpose** Store display information about a user.
   *
   * **principle** Calling `setProfile` with new profile fields updates how the profile appears.
   *
   * **requires** The User ID exists (if not, a default profile is implicitly created).
   *
   * **effects** Updates only provided fields; others remain unchanged. If a profile doesn't exist, it's created with default empty name/bio, and then updated.
   *            Setting optional fields to `null` will explicitly remove them from the profile.
   */
  async setProfile({
    user,
    name,
    classYear,
    major,
    bio,
    favoriteDrink,
    favoriteCafe,
    avatar,
  }: {
    user: User;
    name?: string;
    classYear?: string | null;
    major?: string | null;
    bio?: string;
    favoriteDrink?: string | null;
    favoriteCafe?: string | null;
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
    if (classYear !== undefined) {
      fieldsToSet.classYear = classYear;
    }
    if (major !== undefined) {
      fieldsToSet.major = major;
    }
    if (bio !== undefined) {
      fieldsToSet.bio = bio;
    }
    if (favoriteDrink !== undefined) {
      fieldsToSet.favoriteDrink = favoriteDrink;
    }
    if (favoriteCafe !== undefined) {
      fieldsToSet.favoriteCafe = favoriteCafe;
    }
    if (avatar !== undefined) {
      fieldsToSet.avatar = avatar;
    }

    // Handle fields that can be explicitly removed (set to null)
    const fieldsToUnset: { [key: string]: "" } = {};
    if (classYear === null) {
      fieldsToUnset.classYear = "";
    }
    if (major === null) {
      fieldsToUnset.major = "";
    }
    if (favoriteDrink === null) {
      fieldsToUnset.favoriteDrink = "";
    }
    if (favoriteCafe === null) {
      fieldsToUnset.favoriteCafe = "";
    }
    if (avatar === null) {
      fieldsToUnset.avatar = "";
    }

    if (Object.keys(fieldsToSet).length > 0) {
      updateOps.$set = fieldsToSet;
    }
    if (Object.keys(fieldsToUnset).length > 0) {
      updateOps.$unset = fieldsToUnset;
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
    } catch (e: Error | any) {
      console.error(
        `UserProfileConcept.setProfile: Error setting profile for user ${user}:`,
        e,
      );
      return { error: `Failed to set profile: ${e.message}` };
    }
  }

  /**
   * _profile (user: User) : (name: String, classYear: String?, major: String?, bio: String, favoriteDrink: String?, favoriteCafe: String?, avatar: Image?)
   *
   * **requires** user exists (a profile document for the given user ID must be present in the database).
   *
   * **effects** Returns the current profile fields for the specified user.
   *             If the profile does not exist, an error is returned.
   */
  async _profile({
    user,
  }: {
    user: User;
  }): Promise<
    {
      name: string;
      classYear?: string;
      major?: string;
      bio: string;
      favoriteDrink?: string;
      favoriteCafe?: string;
      avatar?: Image;
    }[] | { error: string }
  > {
    try {
      const profile = await this.users.findOne({ _id: user });

      if (!profile) {
        return { error: `UserProfile for user ${user} not found.` };
      }

      // Queries return an array of dictionaries.
      // The spec defines the profile fields directly, not nested under "profile".
      // So the returned dictionary should have all the profile fields.
      const result: {
        name: string;
        classYear?: string;
        major?: string;
        bio: string;
        favoriteDrink?: string;
        favoriteCafe?: string;
        avatar?: Image;
      } = {
        name: profile.name,
        bio: profile.bio,
      };

      // Only include optional fields in the result if they exist and are not null
      if (profile.classYear !== undefined && profile.classYear !== null) {
        result.classYear = profile.classYear;
      }
      if (profile.major !== undefined && profile.major !== null) {
        result.major = profile.major;
      }
      if (
        profile.favoriteDrink !== undefined && profile.favoriteDrink !== null
      ) {
        result.favoriteDrink = profile.favoriteDrink;
      }
      if (profile.favoriteCafe !== undefined && profile.favoriteCafe !== null) {
        result.favoriteCafe = profile.favoriteCafe;
      }
      if (profile.avatar !== undefined && profile.avatar !== null) {
        result.avatar = profile.avatar;
      }

      return [result];
    } catch (e: Error | any) {
      console.error(
        `UserProfileConcept._profile: Error fetching profile for user ${user}:`,
        e,
      );
      return { error: `Failed to fetch profile: ${e.message}` };
    }
  }
}
