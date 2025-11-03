import { actions, Frames, Sync } from "@engine";
import { Requesting, Order } from "@concepts";

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

export const AddItemRequest: Sync = (
  { request, order, item, qty, displayItemName, selections },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Order/addItem", order, item, qty, displayItemName, selections },
    { request },
  ]),
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

export const SubmitOrderRequest: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/submit", order }, { request }],
  ),
  where: async (frames) => {
    const original = frames[0];
    const orderId = original[order] as string;
    const result = await Order._lines({ order: orderId });
    if (Array.isArray(result) && result.length > 0) {
      return new Frames(original);
    }
    return new Frames();
  },
  then: actions([Order.submit, { order }]),
});

export const SubmitOrderResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/submit" }, { request }],
    [Order.submit, {}, {}],
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

export const CompleteOrderRequest: Sync = ({ request, order }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/complete", order }, { request }],
  ),
  then: actions([Order.complete, { order }]),
});

export const CompleteOrderResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Order/complete" }, { request }],
    [Order.complete, {}, {}],
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


