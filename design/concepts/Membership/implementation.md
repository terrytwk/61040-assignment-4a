[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concepts](../../brainstorming/concepts.md)

# implement: Membership
# response:

# file: src/concepts/MembershipConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Membership" + ".";

// Generic types of this concept
type User = ID;
type Time = Date; // Assuming Time maps to Date in TypeScript

/**
 * A set of Users with associated membership status and join date.
 * Represents the state for the Membership concept.
 *
 * `_id`: The ID of the user (external reference, e.g., from UserAuthentication).
 * `isActive`: Boolean flag indicating active membership status.
 * `joinedDate`: The date/time when the user first activated their membership.
 *               This field is optional if a user has a record but hasn't activated yet,
 *               or if the concept evolves to allow pre-creation of inactive users.
 *               Per the current spec, it's set upon first activation.
 */
interface Users {
  _id: User;
  isActive: boolean;
  joinedDate?: Time;
}

/**
 * Concept: Membership [User]
 *
 * **purpose**
 * Represent eligibility for ordering at the student-run cafe.
 *
 * **principle**
 * Active members can place orders; deactivated members cannot.
 */
export default class MembershipConcept {
  private users: Collection<Users>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * activate (user: User) : ( )
   *
   * **requires** `user` exists as a valid identifier (e.g., created by UserAuthentication).
   *
   * **effects** Sets the `isActive` status for the given user to `true`.
   *            If a membership record for the user does not yet exist, it creates a new one,
   *            setting `isActive` to `true` and `joinedDate` to the current timestamp.
   *            If a record already exists, it updates `isActive` to `true` and sets `joinedDate`
   *            if it was previously unset.
   */
  async activate({ user }: { user: User }): Promise<Empty> {
    await this.users.updateOne(
      { _id: user },
      {
        $set: { isActive: true },
        $setOnInsert: { joinedDate: new Date() }, // Only set joinedDate if it's a new document being inserted
      },
      { upsert: true } // Creates the document if it doesn't exist
    );
    return {};
  }

  /**
   * deactivate (user: User) : ( )
   *
   * **requires** A membership record for the given `user` already exists in this concept's state.
   *
   * **effects** Sets the `isActive` status for the specified user to `false`.
   *            Returns an error if no membership record is found for the user.
   */
  async deactivate({ user }: { user: User }): Promise<Empty | { error: string }> {
    const result = await this.users.updateOne(
      { _id: user },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      return { error: `Membership record for user ${user} not found. Cannot deactivate.` };
    }
    return {};
  }

  /**
   * _isActive (user: User) : (isActive: Boolean)
   *
   * **requires** A membership record for the given `user` already exists in this concept's state.
   *
   * **effects** Returns an array containing a single object with the current `isActive` status
   *            for the specified user. Returns an empty array if no membership record is found.
   */
  async _isActive({ user }: { user: User }): Promise<{ isActive: boolean }[]> {
    const existingUser = await this.users.findOne({ _id: user });
    if (!existingUser) {
      return []; // As per query conventions, return empty array if not found
    }
    return [{ isActive: existingUser.isActive }];
  }

  /**
   * _joinedDate (user: User) : (joinedDate: Time?)
   *
   * **requires** A membership record for the given `user` already exists in this concept's state.
   *
   * **effects** Returns an array containing a single object with the `joinedDate` for the user.
   *            The `joinedDate` will be `undefined` if it has not been set (e.g., if the user
   *            record exists but hasn't gone through the `activate` action that sets `joinedDate`).
   *            Returns an empty array if no membership record is found.
   */
  async _joinedDate({ user }: { user: User }): Promise<{ joinedDate?: Time }[]> {
    const existingUser = await this.users.findOne({ _id: user });
    if (!existingUser) {
      return []; // As per query conventions, return empty array if not found
    }
    return [{ joinedDate: existingUser.joinedDate }];
  }
}
```