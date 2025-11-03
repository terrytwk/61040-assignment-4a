---
timestamp: 'Mon Nov 03 2025 14:24:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_142417.a413165c.md]]'
content_id: 11b149fb6ccb4fd80dca7772af1e1df02800c646e37e1e766c0ad22ff11a94d1
---

# file: src/syncs/userProfile.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserProfile } from "@concepts";

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
    { request },
  ]),
  then: actions([
    UserProfile.setProfile,
    { user, name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar },
  ]),
});

export const SetProfileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/setProfile" }, { request }],
    [UserProfile.setProfile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const SetProfileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserProfile/setProfile" }, { request }],
    [UserProfile.setProfile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});



```
