
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

/**
 * a set of Users with
 *  – username String
 *  – passwordHash String
 */
interface UserDocument {
  _id: User;
  username: string;
  passwordHash: string;
}

// In a real application, you'd use a robust password hashing library like bcrypt.
// For this exercise, we'll use simple placeholder functions.
function _hashPassword(password: string): string {
  // This is a simplified placeholder. DO NOT USE IN PRODUCTION.
  // In real-world, use: await bcrypt.hash(password, saltRounds);
  return `hashed-${password}`;
}

function _comparePassword(password: string, hashedPassword: string): boolean {
  // This is a simplified placeholder. DO NOT USE IN PRODUCTION.
  // In real-world, use: await bcrypt.compare(password, hashedPassword);
  return `hashed-${password}` === hashedPassword;
}

/**
 * Concept: UserAuthentication
 *
 * purpose: Authenticate users by credential.
 *
 * principle: After registering, logging in with the same credentials authenticates you;
 *            logging out ends that authentication.
 */
export default class UserAuthenticationConcept {
  users: Collection<UserDocument>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * register (username: String, password: String) : (user: User | error: String)
   *
   * **requires** username not already taken
   *
   * **effects** creates user; stores password hash
   */
  async register({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: User } | { error: string }> {
    // Check requires: username not already taken
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "Username already taken" };
    }

    const newUser: UserDocument = {
      _id: freshID() as User, // Override _id with a fresh ID
      username,
      passwordHash: _hashPassword(password), // Store password hash
    };

    await this.users.insertOne(newUser);

    // effects: creates user; stores password hash; returns user
    return { user: newUser._id };
  }

  /**
   * login (username: String, password: String) : (user: User | error: String)
   *
   * **requires** user exists and password matches
   *
   * **effects** returns the corresponding user
   */
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: User } | { error: string }> {
    // Check requires: user exists
    const userDoc = await this.users.findOne({ username });
    if (!userDoc) {
      return { error: "Invalid username or password" };
    }

    // Check requires: password matches
    if (!_comparePassword(password, userDoc.passwordHash)) {
      return { error: "Invalid username or password" };
    }

    // effects: returns the corresponding user
    return { user: userDoc._id };
  }

  /**
   * changePassword (user: User, oldPassword: String, newPassword: String) : ( | error: String)
   *
   * **requires** user exists and oldPassword matches
   *
   * **effects** updates passwordHash
   */
  async changePassword({
    user,
    oldPassword,
    newPassword,
  }: {
    user: User;
    oldPassword: string;
    newPassword: string;
  }): Promise<Empty | { error: string }> {
    // Check requires: user exists
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return { error: "User not found" };
    }

    // Check requires: oldPassword matches
    if (!_comparePassword(oldPassword, userDoc.passwordHash)) {
      return { error: "Incorrect old password" };
    }

    // effects: updates passwordHash
    await this.users.updateOne(
      { _id: user },
      { $set: { passwordHash: _hashPassword(newPassword) } },
    );

    return {}; // Empty result for success
  }

  /**
   * _byUsername (username: String) : (user: User)
   *
   * **requires** true
   *
   * **effects** returns user if present
   */
  async _byUsername({
    username,
  }: {
    username: string;
  }): Promise<{ user: User }[]> {
    const userDoc = await this.users.findOne({ username });
    if (userDoc) {
      return [{ user: userDoc._id }];
    }
    return []; // Return empty array if not found
  }
}