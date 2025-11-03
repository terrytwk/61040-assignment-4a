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


