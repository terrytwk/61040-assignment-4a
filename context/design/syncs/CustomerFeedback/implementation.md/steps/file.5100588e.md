---
timestamp: 'Mon Nov 03 2025 14:22:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_142243.51e1e157.md]]'
content_id: 5100588eb7456b5235969087967da4fd9bba19724eb81502cc89d84883d8a6b1
---

# file: src/syncs/feedback.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { Requesting, CustomerFeedback, Order } from "@concepts";

export const CreateFeedbackRequest: Sync = ({ request, user, order, comment }) => ({
  when: actions(
    [Requesting.request, { path: "/CustomerFeedback/create", user, order, comment }, { request }],
  ),
  where: async (frames) => {
    const original = frames[0];
    const orderId = original[order] as string;
    const completed = await Order._byStatus({ status: "completed" });
    const ok = completed.some((o) => o.order === orderId);
    return ok ? new Frames(original) : new Frames();
  },
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



```
