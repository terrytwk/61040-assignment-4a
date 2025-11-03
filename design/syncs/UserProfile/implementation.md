[@implementation](../../concepts/UserProfile/implementation.md)

[@sync-background](../../tools/sync-background.md)

[@sample.sync.ts](../../../src/syncs/sample.sync.ts)

[@userProfile.sync.ts](../../../src/syncs/userProfile.sync.ts)

# implement userProfile.sync.ts
# response:

To implement the synchronizations for the `UserProfile` concept, we need to cover both the `setProfile` action and the `_profile` query. The provided `userProfile.sync.ts` already handles `setProfile`. I will implement the synchronizations for the `_profile` query following the request-response pattern established by the framework.

Given the `_profile` query can return either profile data (as an array of objects) or an `error` object, we will create three synchronizations for it:
1.  **`GetProfileRequest`**: Catches the incoming HTTP request for `_profile` and triggers the `UserProfile._profile` query.
2.  **`GetProfileResponse`**: Catches the successful return of `UserProfile._profile` (i.e., when it provides profile data) and responds to the original HTTP request with that data.
3.  **`GetProfileResponseError`**: Catches the error return of `UserProfile._profile` and responds to the original HTTP request with the error message.

This pattern aligns with how the framework handles action outcomes (success vs. error) as seen in the `LikertSurvey.addQuestion` example.

### `src/syncs/userProfile.sync.ts` Implementation

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserProfile } from "@concepts"; // Ensure UserProfile is imported

// --- Synchronizations for UserProfile.setProfile action ---

/**
 * SetProfileRequest:
 * When an HTTP request for "/UserProfile/setProfile" is received,
 * it triggers the UserProfile.setProfile action.
 */
export const SetProfileRequest: Sync = (
  { request, user, name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserProfile/setProfile",
      user,
      name,
      classYear,
      major,
      bio,
      favoriteDrink,
      favoriteCafe,
      avatar,
    },
    { request }, // Capture the request ID
  ]),
  then: actions([
    UserProfile.setProfile,
    { user, name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar },
  ]),
});

/**
 * SetProfileResponse:
 * When a Requesting.request for "/UserProfile/setProfile" leads to a successful
 * UserProfile.setProfile action (returning an empty object),
 * respond to the original request with success.
 */
export const SetProfileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/setProfile" }, { request }],
    [UserProfile.setProfile, {}, {}], // Matches successful empty return
  ),
  then: actions([Requesting.respond, { request }]), // Respond with an empty success object
});

/**
 * SetProfileResponseError:
 * When a Requesting.request for "/UserProfile/setProfile" leads to a failed
 * UserProfile.setProfile action (returning an error string),
 * respond to the original request with the error.
 */
export const SetProfileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/setProfile" }, { request }],
    [UserProfile.setProfile, {}, { error }], // Matches error return
  ),
  then: actions([Requesting.respond, { request, error }]), // Respond with the error
});

// --- Synchronizations for UserProfile._profile query ---

/**
 * GetProfileRequest:
 * When an HTTP request for "/UserProfile/_profile" is received,
 * it triggers the UserProfile._profile query.
 */
export const GetProfileRequest: Sync = ({ request, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserProfile/_profile", user },
    { request }, // Capture the request ID
  ]),
  then: actions([
    // This explicitly triggers the _profile query.
    // Its return (data or error) will then be observable by subsequent syncs.
    UserProfile._profile,
    { user },
  ]),
});

/**
 * GetProfileResponse:
 * When a Requesting.request for "/UserProfile/_profile" leads to a successful
 * UserProfile._profile query (returning profile data),
 * respond to the original request with that data.
 */
export const GetProfileResponse: Sync = (
  { request, name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar },
) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/_profile" }, { request }],
    [
      UserProfile._profile,
      {}, // Input parameters for the query, not relevant for the 'when' match
      { name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar }, // Match successful profile fields
    ],
  ),
  then: actions([
    Requesting.respond,
    {
      request,
      name,
      classYear,
      major,
      bio,
      favoriteDrink,
      favoriteCafe,
      avatar,
    },
  ]),
});

/**
 * GetProfileResponseError:
 * When a Requesting.request for "/UserProfile/_profile" leads to a failed
 * UserProfile._profile query (returning an error string),
 * respond to the original request with the error.
 */
export const GetProfileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/_profile" }, { request }],
    [UserProfile._profile, {}, { error }], // Matches error return
  ),
  then: actions([Requesting.respond, { request, error }]), // Respond with the error
});
```