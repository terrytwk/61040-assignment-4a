import { actions, Sync } from "@engine";
import { Requesting, Membership } from "@concepts";

export const ActivateMembershipRequest: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/activate", user }, { request }],
  ),
  then: actions([Membership.activate, { user }]),
});

export const ActivateMembershipResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/activate" }, { request }],
    [Membership.activate, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ActivateMembershipResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/activate" }, { request }],
    [Membership.activate, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeactivateMembershipRequest: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/deactivate", user }, { request }],
  ),
  then: actions([Membership.deactivate, { user }]),
});

export const DeactivateMembershipResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/deactivate" }, { request }],
    [Membership.deactivate, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeactivateMembershipResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Membership/deactivate" }, { request }],
    [Membership.deactivate, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


