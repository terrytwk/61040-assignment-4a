---
timestamp: 'Mon Nov 03 2025 14:21:55 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_142155.e814faae.md]]'
content_id: 32e292d53db9d79f41256157d3c63e4517937cbb57fe035436c9e49df3db0790
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { Requesting, UserAuthentication } from "@concepts";

export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  where: async (frames) => {
    const original = frames[0];
    const matches = await UserAuthentication._searchByKerb({ kerbQuery: original[username] as string });
    if (Array.isArray(matches) && matches.length === 0) {
      return new Frames(original);
    }
    return new Frames();
  },
  then: actions([UserAuthentication.register, { username, password }]),
});

export const RegisterResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

export const LoginResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

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

export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});



```
