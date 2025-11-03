---
timestamp: 'Mon Nov 03 2025 14:22:58 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_142258.8d623941.md]]'
content_id: 288ebc2dbce67cb866da846ea2a5f0399a2ea3e720de733ad2ec410e5086c37a
---

# response:

```typescript
import { actions, Frames, Sync } from "@engine";
import { Requesting, CustomerFeedback, Order } from "@concepts";

/**
 * sync AllowFeedbackOnCompletedOrders
 * when
 *   Request.leaveFeedback (user, order, comment)
 * where
 *   in Order: _status(order) -> (status)
 *   status = "completed"
 * then
 *   CustomerFeedback.create (user, order, comment)
 *
 * This synchronization handles the request to create customer feedback.
 * It first captures the incoming request and then uses a 'where' clause
 * to ensure that feedback can only be created for orders that have a
 * "completed" status.
 */
export const CreateFeedbackRequest: Sync = ({ request, user, order, comment, status }) => ({
  when: actions(
    // Match an incoming request to create feedback
    [Requesting.request, { path: "/CustomerFeedback/create", user, order, comment }, { request }],
  ),
  where: async (frames) => {
    // For each frame (which will typically be one per request), query the status of the specified order.
    // The 'order' variable from the 'when' clause is used as input, and the 'status' variable
    // is bound to the result of the query.
    frames = await frames.query(Order._status, { order }, { status });

    // Filter the frames to keep only those where the order's status is "completed".
    // If the order is not completed, the frame is removed, preventing the 'then' clause from firing.
    return frames.filter(($) => $[status] === "completed");
  },
  then: actions(
    // If the 'where' clause passes, create the customer feedback record
    [CustomerFeedback.create, { user, order, comment }],
  ),
});

/**
 * sync CreateFeedbackResponse
 * when
 *   Requesting.request (path: "/CustomerFeedback/create") : (request)
 *   CustomerFeedback.create () : (feedbackId)
 * then
 *   Requesting.respond (request, feedbackId)
 *
 * This synchronization handles the successful response for a feedback creation request.
 * It listens for a 'CustomerFeedback.create' action that returns a 'feedbackId'
 * and then responds to the original 'Requesting.request' with that ID.
 */
export const CreateFeedbackResponse: Sync = ({ request, feedbackId }) => ({
  when: actions(
    // Match the original request that initiated the feedback creation
    [Requesting.request, { path: "/CustomerFeedback/create" }, { request }],
    // Match the successful completion of the CustomerFeedback.create action
    [CustomerFeedback.create, {}, { feedbackId }],
  ),
  then: actions(
    // Respond to the original request with the newly created feedback ID
    [Requesting.respond, { request, feedbackId }],
  ),
});

/**
 * sync CreateFeedbackResponseError
 * when
 *   Requesting.request (path: "/CustomerFeedback/create") : (request)
 *   CustomerFeedback.create () : (error)
 * then
 *   Requesting.respond (request, error)
 *
 * This synchronization handles error responses for feedback creation requests.
 * It listens for a 'CustomerFeedback.create' action that returns an 'error'
 * and then responds to the original 'Requesting.request' with that error message.
 */
export const CreateFeedbackResponseError: Sync = ({ request, error }) => ({
  when: actions(
    // Match the original request that initiated the feedback creation
    [Requesting.request, { path: "/CustomerFeedback/create" }, { request }],
    // Match the failure of the CustomerFeedback.create action (indicated by 'error' result)
    [CustomerFeedback.create, {}, { error }],
  ),
  then: actions(
    // Respond to the original request with the error message
    [Requesting.respond, { request, error }],
  ),
});
```
