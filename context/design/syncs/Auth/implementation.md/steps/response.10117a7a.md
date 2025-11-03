---
timestamp: 'Mon Nov 03 2025 14:21:37 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_142137.5a195bda.md]]'
content_id: 10117a7a9dcb22d7054c6846a986d1daa0f919da78358dec863f01829d84faa3
---

# response:

```typescript
// file: src/syncs/auth.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting, UserAuthentication } from "@concepts";

/**
 * Synchronization for handling user registration requests.
 *
 * This sync checks if the username is already taken using the UserAuthentication._searchByKerb query
 * before attempting to register the user. If the username is unique, it proceeds with registration.
 */
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  where: async (frames) => {
    // Keep the original frame to ensure the request binding is preserved for the 'then' clause.
    const original = frames[0]; 
    
    // Query to check if a user with the given username already exists.
    // The `_searchByKerb` query is used here, assuming it effectively checks for exact username match
    // for the purpose of preventing duplicates during registration.
    const matches = await UserAuthentication._searchByKerb({ kerbQuery: original[username] as string });
    
    // If no existing users match the username, the 'requires' condition is met, so proceed.
    if (Array.isArray(matches) && matches.length === 0) {
      return new Frames(original); // Return the original frame to allow the 'then' clause to fire.
    }
    
    // If a user with that username already exists, return an empty set of frames
    // to prevent the `UserAuthentication.register` action from being called via this sync.
    // The error will be handled by a separate sync reacting to the direct API call's error return.
    return new Frames();
  },
  then: actions([UserAuthentication.register, { username, password }]),
});

/**
 * Synchronization for responding to successful user registration.
 *
 * Catches the successful return of UserAuthentication.register and responds to the original request.
 */
export const RegisterResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/**
 * Synchronization for responding to user registration errors.
 *
 * Catches the error return of UserAuthentication.register and responds to the original request.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Synchronization for handling user login requests.
 *
 * Directly calls UserAuthentication.login; the concept itself handles password matching and user existence checks.
 */
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

/**
 * Synchronization for responding to successful user login.
 *
 * Catches the successful return of UserAuthentication.login and responds to the original request.
 */
export const LoginResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/**
 * Synchronization for responding to user login errors.
 *
 * Catches the error return of UserAuthentication.login and responds to the original request.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Synchronization for handling change password requests.
 *
 * Directly calls UserAuthentication.changePassword; the concept handles old password validation.
 */
export const ChangePasswordRequest: Sync = (
  { request, user, oldPassword, newPassword },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/changePassword", user, oldPassword, newPassword },
    { request },
  ]),
  then: actions([UserAuthentication.changePassword, { user, oldPassword, newPassword }]),
});

/**
 * Synchronization for responding to successful password changes.
 *
 * Catches the successful (empty) return of UserAuthentication.changePassword and responds to the original request.
 */
export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, {}], // Matches an action with no explicit success result
  ),
  then: actions([Requesting.respond, { request }]), // Respond with just the request ID for success
});

/**
 * Synchronization for responding to change password errors.
 *
 * Catches the error return of UserAuthentication.changePassword and responds to the original request.
 */
export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
