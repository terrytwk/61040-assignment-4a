import { actions, Sync } from "@engine";
import { Requesting, CustomerFeedback } from "@concepts";

export const CreateFeedbackRequest: Sync = ({ request, user, order, comment }) => ({
  when: actions(
    [Requesting.request, { path: "/CustomerFeedback/create", user, order, comment }, { request }],
  ),
  then: actions([CustomerFeedback.create, { user, order, comment }]),
});

export const CreateFeedbackResponse: Sync = ({ request, feedbackId }) => ({
  when: actions(
    [Requesting.request, { path: "/CustomerFeedback/create" }, { request }],
    [CustomerFeedback.create, {}, { feedbackId }],
  ),
  then: actions([Requesting.respond, { request, feedbackId }]),
});

export const CreateFeedbackResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/CustomerFeedback/create" }, { request }],
    [CustomerFeedback.create, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


