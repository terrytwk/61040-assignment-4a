[@implementation](../../concepts/Order/implementation.md)

[@sync-background](../../tools/sync-background.md)

[@sample.sync.ts](../../../src/syncs/sample.sync.ts)

[@order.sync.ts](../../../src/syncs/order.sync.ts)

# implement order.sync.ts
# response:

```typescript
// file: src/syncs/order.sync.ts

import { actions, Frames, Sync } from "@engine";
import { Menu, Order, Requesting } from "@concepts";

// --- Open Order Syncs ---

export const OpenOrderRequest: Sync = ({ request, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/open", user },
    { request },
  ]),
  then: actions([Order.open, { user }]),
});

export const OpenOrderResponse: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/open" }, { request }],
    [Order.open, {}, { order }],
  ),
  then: actions([Requesting.respond, { request, order }]),
});

export const OpenOrderResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/open" }, { request }],
    [Order.open, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Add Item Syncs ---

export const AddItemRequest: Sync = (
  { request, order, item, qty, displayItemName, selections },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/addItem", order, item, qty, displayItemName, selections },
    { request },
  ]),
  where: async (frames) => {
    const original = frames[0];
    const itemId = original[item] as string;
    // Selections input format in Requesting is typically an array of objects
    // where each object has option, choice, displayOptionName, displayChoiceName
    const sels = original[selections] as
      | Array<{ option: string; choice: string; displayOptionName: string; displayChoiceName: string }>
      | undefined;

    // Call Menu._isSelectionSetValid to enforce "validity checked via sync" requirement
    // This query is expected to return an array of { ok: boolean, reason: string }
    const validationResult = await Menu._isSelectionSetValid({
      item: itemId,
      selections: sels ?? [],
    });

    if (
      Array.isArray(validationResult) && validationResult.length > 0 &&
      (validationResult[0] as { ok?: boolean }).ok === true
    ) {
      // If validation passes, pass the original frame through
      return new Frames(original);
    }
    // If validation fails, return an empty set of frames, preventing Order.addItem from firing
    return new Frames();
  },
  then: actions([
    Order.addItem,
    { order, item, qty, displayItemName, selections },
  ]),
});

export const AddItemResponse: Sync = ({ request, line }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/addItem" }, { request }],
    [Order.addItem, {}, { line }],
  ),
  then: actions([Requesting.respond, { request, line }]),
});

export const AddItemResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/addItem" }, { request }],
    [Order.addItem, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Submit Order Syncs ---

export const SubmitOrderRequest: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/submit", order }, { request }],
  ),
  where: async (frames) => {
    const original = frames[0];
    const orderId = original[order] as string;
    // Check if order has at least one line (enforced via sync)
    // The _lines query returns an array of { line: ... } objects, so checking length > 0 is correct
    const result = await Order._lines({ order: orderId });
    if (Array.isArray(result) && result.length > 0) {
      return new Frames(original);
    }
    return new Frames(); // If no lines or error, prevent submission
  },
  then: actions([Order.submit, { order }]),
});

export const SubmitOrderResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/submit" }, { request }],
    [Order.submit, {}, {}], // No specific return value for successful submit
  ),
  then: actions([Requesting.respond, { request }]),
});

export const SubmitOrderResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/submit" }, { request }],
    [Order.submit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Complete Order Syncs ---

export const CompleteOrderRequest: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/complete", order }, { request }],
  ),
  then: actions([Order.complete, { order }]),
});

export const CompleteOrderResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/complete" }, { request }],
    [Order.complete, {}, {}], // No specific return for successful complete
  ),
  then: actions([Requesting.respond, { request }]),
});

export const CompleteOrderResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/complete" }, { request }],
    [Order.complete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- New Syncs: Cancel Order ---

export const CancelOrderRequest: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/cancel", order }, { request }],
  ),
  then: actions([Order.cancel, { order }]),
});

export const CancelOrderResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/cancel" }, { request }],
    [Order.cancel, {}, {}], // No specific return for successful cancel
  ),
  then: actions([Requesting.respond, { request }]),
});

export const CancelOrderResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/cancel" }, { request }],
    [Order.cancel, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- New Syncs: Query _lines ---

export const GetOrderLinesRequest: Sync = ({ request, order }) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/_lines", order },
    { request },
  ]),
  then: actions([Order._lines, { order }]),
});

export const GetOrderLinesResponse: Sync = ({ request, line, results }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_lines" }, { request }],
    // The query returns an array of objects, where each object has a 'line' key
    // containing the structured OrderLineOutput.
    [Order._lines, {}, { line }],
  ),
  where: async (frames) => {
    // If multiple lines are returned, we collect them into a single 'results' array.
    // Ensure we handle the case where no lines are found for an order.
    // Get the original request frame to persist its bindings in case of empty results
    const originalRequestFrame = frames.find((f) => f[request] !== undefined);
    if (!originalRequestFrame) {
      // This case should ideally not be hit if the 'when' clause fired correctly
      return new Frames();
    }

    // If 'frames' is empty after the Order._lines action, it means no lines were found.
    // In this scenario, we create a new frame with an empty 'results' array and the original request binding.
    if (frames.length === 0) {
      return new Frames({ ...originalRequestFrame, [results]: [] });
    }

    // Collect all 'line' objects from individual frames into a single 'results' array.
    // Each frame contains a 'line' binding, which is the structured OrderLineOutput.
    return frames.collectAs([line], results);
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetOrderLinesResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_lines" }, { request }],
    [Order._lines, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- New Syncs: Query _status ---

export const GetOrderStatusRequest: Sync = ({ request, order }) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/_status", order },
    { request },
  ]),
  then: actions([Order._status, { order }]),
});

export const GetOrderStatusResponse: Sync = ({ request, status }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_status" }, { request }],
    // Order._status returns an array with one element { status: '...' }.
    // We extract the 'status' value directly here.
    [Order._status, {}, { status }],
  ),
  then: actions([Requesting.respond, { request, status }]),
});

export const GetOrderStatusResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_status" }, { request }],
    [Order._status, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- New Syncs: Query _byStatus ---

export const GetOrdersByStatusRequest: Sync = ({ request, status }) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/_byStatus", status },
    { request },
  ]),
  then: actions([Order._byStatus, { status }]),
});

export const GetOrdersByStatusResponse: Sync = (
  { request, order, user, createdAt, lines, results },
) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_byStatus" }, { request }],
    // _byStatus returns an array of structured order objects.
    // Each object directly contains 'order', 'user', 'createdAt', and 'lines'.
    // These are bound as individual variables for each order found.
    [Order._byStatus, {}, { order, user, createdAt, lines }],
  ),
  where: async (frames) => {
    // Get the original request frame to persist its bindings in case of empty results
    const originalRequestFrame = frames.find((f) => f[request] !== undefined);
    if (!originalRequestFrame) {
      return new Frames();
    }

    // If 'frames' is empty after the Order._byStatus action, it means no orders were found.
    if (frames.length === 0) {
      return new Frames({ ...originalRequestFrame, [results]: [] });
    }

    // Collect all the individual order details (order, user, createdAt, lines)
    // from each frame into a single 'results' array.
    return frames.collectAs([order, user, createdAt, lines], results);
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetOrdersByStatusResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/_byStatus" }, { request }],
    [Order._byStatus, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```