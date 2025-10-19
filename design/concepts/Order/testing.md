[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: Order
# response:

```typescript
// file: src/concepts/Order/OrderConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * **concept** Order [User, Item, Option, Choice]
 *
 * **purpose**
 * Capture a member’s order lifecycle and chosen customizations (no pricing).
 *
 * **principle**
 * Scanning a valid member starts a **pending** order; barista adds a **Latte** with
 * **hot** and **oat** (valid); submitting, then completing, marks the order **completed**;
 * canceled orders stop accepting changes.
 */

// Declare collection prefix, use concept name
const PREFIX = "Order" + ".";

// Generic types of this concept
type User = ID;
type Item = ID;
type Option = ID;
type Choice = ID;

// Internal IDs for Order concept
type Order = ID;
type OrderLine = ID;
type SelectedChoice = ID;

type OrderStatus = "pending" | "completed" | "canceled";

/**
 * a set of Orders with
 *  – user User
 *  – status {pending, completed, canceled}
 *  – createdAt Time
 */
interface OrderDocument {
  _id: Order;
  user: User;
  status: OrderStatus;
  createdAt: Date;
}

/**
 * a set of OrderLines with
 *  – order Order
 *  – item Item
 *  – qty Number
 *  – displayItemName String
 */
interface OrderLineDocument {
  _id: OrderLine;
  order: Order;
  item: Item;
  qty: number;
  displayItemName: string; // Added to document per discussion in prompt
}

/**
 * a set of SelectedChoices with
 *  – line OrderLine
 *  – option Option
 *  – choice Choice
 *  – displayOptionName String
 *  – displayChoiceName String
 */
interface SelectedChoiceDocument {
  _id: SelectedChoice;
  line: OrderLine;
  option: Option;
  choice: Choice;
  displayOptionName: string; // Added to document per discussion in prompt
  displayChoiceName: string; // Added to document per discussion in prompt
}

/**
 * Input for selections in addItem, including display names for completeness
 * and independence of the Order concept. A sync would fetch these and provide them.
 */
interface SelectionInput {
  option: Option;
  choice: Choice;
  displayOptionName: string;
  displayChoiceName: string;
}

// Output structure for _lines query
interface OrderLineOutput {
  id: OrderLine;
  item: Item;
  qty: number;
  displayItemName: string;
  selections: {
    option: Option;
    choice: Choice;
    displayOptionName: string;
    displayChoiceName: string;
  }[];
}

export default class OrderConcept {
  orders: Collection<OrderDocument>;
  orderLines: Collection<OrderLineDocument>;
  selectedChoices: Collection<SelectedChoiceDocument>;

  constructor(private readonly db: Db) {
    this.orders = this.db.collection(PREFIX + "orders");
    this.orderLines = this.db.collection(PREFIX + "orderLines");
    this.selectedChoices = this.db.collection(PREFIX + "selectedChoices");
  }

  /**
   * open (user: User) : (order: Order | error: String)
   *
   * **requires** true (membership gating via sync)
   *
   * **effects** creates order with status := pending, createdAt := now; returns the new order's ID
   */
  async open({ user }: { user: User }): Promise<{ order: Order } | { error: string }> {
    const newOrderId = freshID();
    const newOrder: OrderDocument = {
      _id: newOrderId,
      user: user,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      await this.orders.insertOne(newOrder);
      return { order: newOrderId };
    } catch (e) {
      console.error("Error creating new order:", e);
      return { error: "Failed to open new order." };
    }
  }

  /**
   * addItem (order: Order, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]) : (line: OrderLine | error: String)
   *
   * **requires** order exists and status = pending (validity checked via sync)
   *
   * **effects** creates line; copies displayItemName; stores SelectedChoices with copied display names; returns the new order line's ID
   *
   * NOTE: For concept independence and completeness, display names for item, options, and choices are expected as input arguments.
   * A sync would be responsible for fetching these from the Menu concept and passing them to this action.
   */
  async addItem(
    {
      order,
      item,
      qty,
      displayItemName,
      selections,
    }: {
      order: Order;
      item: Item;
      qty: number;
      displayItemName: string;
      selections: SelectionInput[];
    },
  ): Promise<{ line: OrderLine } | { error: string }> {
    if (qty <= 0) {
      return { error: "Quantity must be a positive number." };
    }

    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return {
        error: `Cannot add items to an order with status '${existingOrder.status}'. Only 'pending' orders can be modified.`,
      };
    }

    const newLineId = freshID();
    const newOrderLine: OrderLineDocument = {
      _id: newLineId,
      order: order,
      item: item,
      qty: qty,
      displayItemName: displayItemName,
    };

    const newSelectedChoices: SelectedChoiceDocument[] = selections.map((s) => ({
      _id: freshID(),
      line: newLineId,
      option: s.option,
      choice: s.choice,
      displayOptionName: s.displayOptionName,
      displayChoiceName: s.displayChoiceName,
    }));

    try {
      await this.orderLines.insertOne(newOrderLine);
      if (newSelectedChoices.length > 0) {
        await this.selectedChoices.insertMany(newSelectedChoices);
      }
      return { line: newLineId };
    } catch (e) {
      console.error("Error adding item to order:", e);
      // Attempt to clean up partially inserted data if any
      await this.orderLines.deleteOne({ _id: newLineId });
      await this.selectedChoices.deleteMany({ line: newLineId });
      return { error: "Failed to add item to order." };
    }
  }

  /**
   * submit (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending (the line count check is enforced via sync)
   *
   * **effects** lifecycle only (does not change status within this concept, acts as a prerequisite for completion)
   *
   * NOTE: The `submit` action, as per the concept's state and actions definition, primarily serves as a logical
   * step in the order lifecycle. It does not modify the order's `status` field directly. Syncs are expected
   * to use this action's successful execution as a trigger for subsequent logic (e.g., preventing further `addItem`).
   */
  async submit({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    // The requirement that "order has >= 1 line" is enforced by a sync, not this action.
    // This action only checks if the order exists and is pending.
    if (existingOrder.status !== "pending") {
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be submitted.`,
      };
    }
    // No state change (status remains 'pending' from this concept's perspective)
    return {};
  }

  /**
   * complete (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := completed
   */
  async complete({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "completed" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be completed.`,
      };
    }

    return {};
  }

  /**
   * cancel (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := canceled
   */
  async cancel({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "canceled" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be canceled.`,
      };
    }

    return {};
  }

  /**
   * _lines (order: Order) : (line: {id: OrderLine, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]})
   *
   * **requires** order exists
   *
   * **effects** returns structured lines + selections for the order
   */
  async _lines(
    { order }: { order: Order },
  ): Promise<{ line: OrderLineOutput }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }

    const lines = await this.orderLines.find({ order: order }).toArray();
    const results: { line: OrderLineOutput }[] = [];

    for (const line of lines) {
      const selections = await this.selectedChoices.find({ line: line._id }).toArray();
      results.push({
        line: {
          id: line._id,
          item: line.item,
          qty: line.qty,
          displayItemName: line.displayItemName,
          selections: selections.map((s) => ({
            option: s.option,
            choice: s.choice,
            displayOptionName: s.displayOptionName,
            displayChoiceName: s.displayChoiceName,
          })),
        },
      });
    }

    return results;
  }

  /**
   * _status (order: Order) : (status: String | error: String)
   *
   * **requires** order exists
   *
   * **effects** returns current status of the order
   */
  async _status(
    { order }: { order: Order },
  ): Promise<{ status: OrderStatus }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    // Queries return an array of dictionaries
    return [{ status: existingOrder.status }];
  }
}
```

```typescript
// file: src/concepts/Order/OrderConcept.test.ts

import { assertEquals, assertExists, assertNotEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import OrderConcept from "./OrderConcept.ts";

Deno.test("OrderConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new OrderConcept(db);

  // Test data IDs
  const userA = "user:Alice" as ID;
  const itemLatte = "item:Latte" as ID;
  const itemAmericano = "item:Americano" as ID;
  const optionTemp = "option:Temperature" as ID;
  const choiceHot = "choice:Hot" as ID;
  const choiceCold = "choice:Cold" as ID;
  const optionMilk = "option:Milk" as ID;
  const choiceOat = "choice:Oat" as ID;
  const choiceAlmond = "choice:Almond" as ID;

  await t.step("open: should create a new pending order", async () => {
    console.log("--- Test: open a new pending order ---");
    const result = await concept.open({ user: userA });
    assertExists((result as { order: ID }).order, "Should return an order ID on success");
    const orderId = (result as { order: ID }).order;
    console.log(`Opened order with ID: ${orderId}`);

    const statusResult = await concept._status({ order: orderId });
    assertObjectMatch(statusResult[0], { status: "pending" }, "New order should have 'pending' status");
    console.log(`Order ${orderId} status: pending (verified)`);
  });

  let orderId1: ID;
  await t.step("addItem: should add an item with selections to a pending order", async () => {
    console.log("\n--- Test: addItem with selections ---");
    const openResult = await concept.open({ user: userA });
    orderId1 = (openResult as { order: ID }).order;
    console.log(`Opened order for addItem test with ID: ${orderId1}`);

    const selections = [
      { option: optionTemp, choice: choiceHot, displayOptionName: "Temperature", displayChoiceName: "Hot" },
      { option: optionMilk, choice: choiceOat, displayOptionName: "Milk", displayChoiceName: "Oat" },
    ];
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemLatte,
      qty: 2,
      displayItemName: "Latte",
      selections: selections,
    });
    assertExists((addResult as { line: ID }).line, "Should return an order line ID on success");
    const lineId = (addResult as { line: ID }).line;
    console.log(`Added line ${lineId} to order ${orderId1}`);

    const linesResult = await concept._lines({ order: orderId1 });
    assertNotEquals(linesResult.length, 0, "Should have at least one line");
    const line = (linesResult as { line: { id: ID; selections: unknown[] } }[])[0].line;
    assertObjectMatch(line, {
      id: lineId,
      item: itemLatte,
      qty: 2,
      displayItemName: "Latte",
    }, "Order line details should match");
    assertEquals(line.selections.length, 2, "Should have two selections");
    assertObjectMatch(line.selections[0], {
      option: optionTemp,
      choice: choiceHot,
      displayOptionName: "Temperature",
      displayChoiceName: "Hot",
    });
    console.log(`Verified line ${lineId} and its selections.`);
  });

  await t.step("addItem: should prevent adding item to a non-existent order", async () => {
    console.log("\n--- Test: addItem to non-existent order ---");
    const nonExistentOrder = "order:NonExistent" as ID;
    const addResult = await concept.addItem({
      order: nonExistentOrder,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    assertExists((addResult as { error: string }).error, "Should return an error");
    assertEquals(
      (addResult as { error: string }).error,
      `Order with ID ${nonExistentOrder} not found.`,
      "Error message should indicate order not found",
    );
    console.log(`Attempted to add item to non-existent order ${nonExistentOrder}, got expected error.`);
  });

  await t.step("addItem: should prevent adding item with non-positive quantity", async () => {
    console.log("\n--- Test: addItem with non-positive quantity ---");
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemAmericano,
      qty: 0,
      displayItemName: "Americano",
      selections: [],
    });
    assertExists((addResult as { error: string }).error, "Should return an error");
    assertEquals(
      (addResult as { error: string }).error,
      "Quantity must be a positive number.",
      "Error message should indicate invalid quantity",
    );
    console.log(`Attempted to add item with qty 0, got expected error.`);
  });

  await t.step("submit: should allow submitting a pending order with lines", async () => {
    console.log("\n--- Test: submit pending order ---");
    const submitResult = await concept.submit({ order: orderId1 });
    assertEquals(submitResult, {}, "Should return empty object on successful submit (no status change)");
    console.log(`Order ${orderId1} submitted. (Status remains pending as per spec)`);

    const statusResult = await concept._status({ order: orderId1 });
    assertObjectMatch(statusResult[0], { status: "pending" }, "Order status should still be 'pending' after submit");
    console.log(`Order ${orderId1} status: pending (verified after submit)`);
  });

  await t.step("submit: should prevent submitting a non-existent order", async () => {
    console.log("\n--- Test: submit non-existent order ---");
    const nonExistentOrder = "order:NonExistent" as ID;
    const submitResult = await concept.submit({ order: nonExistentOrder });
    assertExists((submitResult as { error: string }).error, "Should return an error");
    assertEquals(
      (submitResult as { error: string }).error,
      `Order with ID ${nonExistentOrder} not found.`,
      "Error message should indicate order not found",
    );
    console.log(`Attempted to submit non-existent order ${nonExistentOrder}, got expected error.`);
  });

  await t.step("complete: should change order status to 'completed'", async () => {
    console.log("\n--- Test: complete order ---");
    const completeResult = await concept.complete({ order: orderId1 });
    assertEquals(completeResult, {}, "Should return empty object on successful completion");
    console.log(`Order ${orderId1} completed.`);

    const statusResult = await concept._status({ order: orderId1 });
    assertObjectMatch(statusResult[0], { status: "completed" }, "Order status should be 'completed'");
    console.log(`Order ${orderId1} status: completed (verified)`);
  });

  await t.step("addItem: should prevent adding item to a completed order", async () => {
    console.log("\n--- Test: addItem to completed order ---");
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    assertExists((addResult as { error: string }).error, "Should return an error");
    assertEquals(
      (addResult as { error: string }).error,
      `Cannot add items to an order with status 'completed'. Only 'pending' orders can be modified.`,
      "Error message should indicate order is completed",
    );
    console.log(`Attempted to add item to completed order ${orderId1}, got expected error.`);
  });

  await t.step("submit: should prevent submitting a completed order", async () => {
    console.log("\n--- Test: submit completed order ---");
    const submitResult = await concept.submit({ order: orderId1 });
    assertExists((submitResult as { error: string }).error, "Should return an error");
    assertEquals(
      (submitResult as { error: string }).error,
      `Order with ID ${orderId1} is already 'completed' and cannot be submitted.`,
      "Error message should indicate order is completed",
    );
    console.log(`Attempted to submit completed order ${orderId1}, got expected error.`);
  });

  await t.step("cancel: should change order status to 'canceled' (alternative path)", async () => {
    console.log("\n--- Test: cancel order (alternative path) ---");
    const openResult = await concept.open({ user: userA });
    const orderId2 = (openResult as { order: ID }).order;
    console.log(`Opened order for cancel test with ID: ${orderId2}`);

    await concept.addItem({
      order: orderId2,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    console.log(`Added item to order ${orderId2}.`);

    const cancelResult = await concept.cancel({ order: orderId2 });
    assertEquals(cancelResult, {}, "Should return empty object on successful cancellation");
    console.log(`Order ${orderId2} canceled.`);

    const statusResult = await concept._status({ order: orderId2 });
    assertObjectMatch(statusResult[0], { status: "canceled" }, "Order status should be 'canceled'");
    console.log(`Order ${orderId2} status: canceled (verified)`);
  });

  await t.step("complete: should prevent completing a canceled order", async () => {
    console.log("\n--- Test: complete canceled order ---");
    const openResult = await concept.open({ user: userA });
    const orderId3 = (openResult as { order: ID }).order;
    await concept.cancel({ order: orderId3 }); // Cancel first
    console.log(`Opened and canceled order ${orderId3}.`);

    const completeResult = await concept.complete({ order: orderId3 });
    assertExists((completeResult as { error: string }).error, "Should return an error");
    assertEquals(
      (completeResult as { error: string }).error,
      `Order with ID ${orderId3} is already 'canceled' and cannot be completed.`,
      "Error message should indicate order is canceled",
    );
    console.log(`Attempted to complete canceled order ${orderId3}, got expected error.`);
  });

  await t.step("Principle Trace: Scanning -> Pending -> Add Items -> Submit -> Complete -> No Changes", async () => {
    console.log("\n--- Principle Trace Test ---");

    // 1. Scanning a valid member starts a pending order
    console.log("Trace Step 1: User scans QR (simulated via open action)");
    const openResult = await concept.open({ user: userA });
    const orderId = (openResult as { order: ID }).order;
    console.log(`   Order ${orderId} opened for user ${userA}.`);
    let status = await concept._status({ order: orderId });
    assertObjectMatch(status[0], { status: "pending" });
    console.log(`   Status is 'pending'. (Verified)`);

    // 2. Barista adds a Latte with hot and oat (valid)
    console.log("Trace Step 2: Barista adds Latte with selections.");
    const latteSelections = [
      { option: optionTemp, choice: choiceHot, displayOptionName: "Temperature", displayChoiceName: "Hot" },
      { option: optionMilk, choice: choiceOat, displayOptionName: "Milk", displayChoiceName: "Oat" },
    ];
    const addLatteResult = await concept.addItem({
      order: orderId,
      item: itemLatte,
      qty: 1,
      displayItemName: "Latte",
      selections: latteSelections,
    });
    assertExists((addLatteResult as { line: ID }).line);
    const latteLineId = (addLatteResult as { line: ID }).line;
    console.log(`   Added Latte (Line ID: ${latteLineId}) to Order ${orderId}.`);

    const linesAfterAdd = await concept._lines({ order: orderId });
    assertEquals(linesAfterAdd.length, 1);
    assertEquals((linesAfterAdd as { line: OrderLineOutput }[])[0].line.selections.length, 2);
    console.log(`   Order ${orderId} has 1 line with 2 selections. (Verified)`);

    // 3. Submitting marks the order ready
    console.log("Trace Step 3: Barista submits the order.");
    const submitResult = await concept.submit({ order: orderId });
    assertEquals(submitResult, {}, "Submit should succeed");
    console.log(`   Order ${orderId} submitted.`);
    status = await concept._status({ order: orderId });
    assertObjectMatch(status[0], { status: "pending" }); // Status remains pending internally
    console.log(`   Status is still 'pending' after submit. (Verified)`);

    // 4. Completing marks the order completed
    console.log("Trace Step 4: Barista completes the order.");
    const completeResult = await concept.complete({ order: orderId });
    assertEquals(completeResult, {}, "Complete should succeed");
    console.log(`   Order ${orderId} completed.`);
    status = await concept._status({ order: orderId });
    assertObjectMatch(status[0], { status: "completed" });
    console.log(`   Status is 'completed'. (Verified)`);

    // 5. Canceled orders stop accepting changes (already tested, but confirm again)
    console.log("Trace Step 5: Attempt to add item to completed order (should fail).");
    const addAfterCompleteResult = await concept.addItem({
      order: orderId,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    assertExists((addAfterCompleteResult as { error: string }).error, "Should fail to add item to completed order");
    console.log(`   Failed to add item to completed order. (Verified)`);
  });

  await client.close();
});
```

# prompt: I get this error. fix it.
TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(statusResult[0], { status: "pending" }, "New order should have 'pending' status");
                      ~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:29:23

TS2339 [ERROR]: Property 'length' does not exist on type '{ line: OrderLineOutput; }[] | { error: string; }'.
  Property 'length' does not exist on type '{ error: string; }'.
    assertNotEquals(linesResult.length, 0, "Should have at least one line");
                                ~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:56:33

TS2345 [ERROR]: Argument of type 'unknown' is not assignable to parameter of type 'Record<PropertyKey, any>'.
    assertObjectMatch(line.selections[0], {
                      ~~~~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:65:23

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(statusResult[0], { status: "pending" }, "Order status should still be 'pending' after submit");
                      ~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:118:23

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(statusResult[0], { status: "completed" }, "Order status should be 'completed'");
                      ~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:142:23

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(statusResult[0], { status: "canceled" }, "Order status should be 'canceled'");
                      ~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:196:23

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(status[0], { status: "pending" });
                      ~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:226:23

TS2339 [ERROR]: Property 'length' does not exist on type '{ line: OrderLineOutput; }[] | { error: string; }'.
  Property 'length' does not exist on type '{ error: string; }'.
    assertEquals(linesAfterAdd.length, 1);
                               ~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:247:32

TS2304 [ERROR]: Cannot find name 'OrderLineOutput'.
    assertEquals((linesAfterAdd as { line: OrderLineOutput }[])[0].line.selections.length, 2);
                                           ~~~~~~~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:248:44

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(status[0], { status: "pending" }); // Status remains pending internally
                      ~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:257:23

TS7053 [ERROR]: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ status: OrderStatus; }[] | { error: string; }'.
  Property '0' does not exist on type '{ status: OrderStatus; }[] | { error: string; }'.
    assertObjectMatch(status[0], { status: "completed" });
                      ~~~~~~~~~
    at file:///Users/terrykim/Desktop/mit/6.1040/latteapp/src/concepts/Order/OrderConcept.test.ts:266:23

Found 11 errors.

error: Type checking failed.
# response:

```typescript
// file: src/concepts/Order/OrderConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * **concept** Order [User, Item, Option, Choice]
 *
 * **purpose**
 * Capture a member’s order lifecycle and chosen customizations (no pricing).
 *
 * **principle**
 * Scanning a valid member starts a **pending** order; barista adds a **Latte** with
 * **hot** and **oat** (valid); submitting, then completing, marks the order **completed**;
 * canceled orders stop accepting changes.
 */

// Declare collection prefix, use concept name
const PREFIX = "Order" + ".";

// Generic types of this concept
type User = ID;
type Item = ID;
type Option = ID;
type Choice = ID;

// Internal IDs for Order concept
type Order = ID;
type OrderLine = ID;
type SelectedChoice = ID;

type OrderStatus = "pending" | "completed" | "canceled";

/**
 * a set of Orders with
 *  – user User
 *  – status {pending, completed, canceled}
 *  – createdAt Time
 */
interface OrderDocument {
  _id: Order;
  user: User;
  status: OrderStatus;
  createdAt: Date;
}

/**
 * a set of OrderLines with
 *  – order Order
 *  – item Item
 *  – qty Number
 *  – displayItemName String
 */
interface OrderLineDocument {
  _id: OrderLine;
  order: Order;
  item: Item;
  qty: number;
  displayItemName: string; // Added to document per discussion in prompt
}

/**
 * a set of SelectedChoices with
 *  – line OrderLine
 *  – option Option
 *  – choice Choice
 *  – displayOptionName String
 *  – displayChoiceName String
 */
interface SelectedChoiceDocument {
  _id: SelectedChoice;
  line: OrderLine;
  option: Option;
  choice: Choice;
  displayOptionName: string; // Added to document per discussion in prompt
  displayChoiceName: string; // Added to document per discussion in prompt
}

/**
 * Input for selections in addItem, including display names for completeness
 * and independence of the Order concept. A sync would fetch these and provide them.
 */
interface SelectionInput {
  option: Option;
  choice: Choice;
  displayOptionName: string;
  displayChoiceName: string;
}

// Output structure for _lines query
export interface OrderLineOutput { // Exported for use in tests
  id: OrderLine;
  item: Item;
  qty: number;
  displayItemName: string;
  selections: {
    option: Option;
    choice: Choice;
    displayOptionName: string;
    displayChoiceName: string;
  }[];
}

export default class OrderConcept {
  orders: Collection<OrderDocument>;
  orderLines: Collection<OrderLineDocument>;
  selectedChoices: Collection<SelectedChoiceDocument>;

  constructor(private readonly db: Db) {
    this.orders = this.db.collection(PREFIX + "orders");
    this.orderLines = this.db.collection(PREFIX + "orderLines");
    this.selectedChoices = this.db.collection(PREFIX + "selectedChoices");
  }

  /**
   * open (user: User) : (order: Order | error: String)
   *
   * **requires** true (membership gating via sync)
   *
   * **effects** creates order with status := pending, createdAt := now; returns the new order's ID
   */
  async open({ user }: { user: User }): Promise<{ order: Order } | { error: string }> {
    const newOrderId = freshID();
    const newOrder: OrderDocument = {
      _id: newOrderId,
      user: user,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      await this.orders.insertOne(newOrder);
      return { order: newOrderId };
    } catch (e) {
      console.error("Error creating new order:", e);
      return { error: "Failed to open new order." };
    }
  }

  /**
   * addItem (order: Order, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]) : (line: OrderLine | error: String)
   *
   * **requires** order exists and status = pending (validity checked via sync)
   *
   * **effects** creates line; copies displayItemName; stores SelectedChoices with copied display names; returns the new order line's ID
   *
   * NOTE: For concept independence and completeness, display names for item, options, and choices are expected as input arguments.
   * A sync would be responsible for fetching these from the Menu concept and passing them to this action.
   */
  async addItem(
    {
      order,
      item,
      qty,
      displayItemName,
      selections,
    }: {
      order: Order;
      item: Item;
      qty: number;
      displayItemName: string;
      selections: SelectionInput[];
    },
  ): Promise<{ line: OrderLine } | { error: string }> {
    if (qty <= 0) {
      return { error: "Quantity must be a positive number." };
    }

    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    if (existingOrder.status !== "pending") {
      return {
        error: `Cannot add items to an order with status '${existingOrder.status}'. Only 'pending' orders can be modified.`,
      };
    }

    const newLineId = freshID();
    const newOrderLine: OrderLineDocument = {
      _id: newLineId,
      order: order,
      item: item,
      qty: qty,
      displayItemName: displayItemName,
    };

    const newSelectedChoices: SelectedChoiceDocument[] = selections.map((s) => ({
      _id: freshID(),
      line: newLineId,
      option: s.option,
      choice: s.choice,
      displayOptionName: s.displayOptionName,
      displayChoiceName: s.displayChoiceName,
    }));

    try {
      await this.orderLines.insertOne(newOrderLine);
      if (newSelectedChoices.length > 0) {
        await this.selectedChoices.insertMany(newSelectedChoices);
      }
      return { line: newLineId };
    } catch (e) {
      console.error("Error adding item to order:", e);
      // Attempt to clean up partially inserted data if any
      await this.orderLines.deleteOne({ _id: newLineId });
      await this.selectedChoices.deleteMany({ line: newLineId });
      return { error: "Failed to add item to order." };
    }
  }

  /**
   * submit (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending (the line count check is enforced via sync)
   *
   * **effects** lifecycle only (does not change status within this concept, acts as a prerequisite for completion)
   *
   * NOTE: The `submit` action, as per the concept's state and actions definition, primarily serves as a logical
   * step in the order lifecycle. It does not modify the order's `status` field directly. Syncs are expected
   * to use this action's successful execution as a trigger for subsequent logic (e.g., preventing further `addItem`).
   */
  async submit({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    // The requirement that "order has >= 1 line" is enforced by a sync, not this action.
    // This action only checks if the order exists and is pending.
    if (existingOrder.status !== "pending") {
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be submitted.`,
      };
    }
    // No state change (status remains 'pending' from this concept's perspective)
    return {};
  }

  /**
   * complete (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := completed
   */
  async complete({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "completed" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be completed.`,
      };
    }

    return {};
  }

  /**
   * cancel (order: Order) : (Empty | error: String)
   *
   * **requires** order exists and status = pending
   *
   * **effects** sets status := canceled
   */
  async cancel({ order }: { order: Order }): Promise<Empty | { error: string }> {
    const result = await this.orders.updateOne(
      { _id: order, status: "pending" },
      { $set: { status: "canceled" } },
    );

    if (result.matchedCount === 0) {
      const existingOrder = await this.orders.findOne({ _id: order });
      if (!existingOrder) {
        return { error: `Order with ID ${order} not found.` };
      }
      return {
        error: `Order with ID ${order} is already '${existingOrder.status}' and cannot be canceled.`,
      };
    }

    return {};
  }

  /**
   * _lines (order: Order) : (line: {id: OrderLine, item: Item, qty: Number, displayItemName: String, selections: {option: Option, choice: Choice, displayOptionName: String, displayChoiceName: String}[]})
   *
   * **requires** order exists
   *
   * **effects** returns structured lines + selections for the order
   */
  async _lines(
    { order }: { order: Order },
  ): Promise<{ line: OrderLineOutput }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }

    const lines = await this.orderLines.find({ order: order }).toArray();
    const results: { line: OrderLineOutput }[] = [];

    for (const line of lines) {
      const selections = await this.selectedChoices.find({ line: line._id }).toArray();
      results.push({
        line: {
          id: line._id,
          item: line.item,
          qty: line.qty,
          displayItemName: line.displayItemName,
          selections: selections.map((s) => ({
            option: s.option,
            choice: s.choice,
            displayOptionName: s.displayOptionName,
            displayChoiceName: s.displayChoiceName,
          })),
        },
      });
    }

    return results;
  }

  /**
   * _status (order: Order) : (status: String | error: String)
   *
   * **requires** order exists
   *
   * **effects** returns current status of the order
   */
  async _status(
    { order }: { order: Order },
  ): Promise<{ status: OrderStatus }[] | { error: string }> {
    const existingOrder = await this.orders.findOne({ _id: order });
    if (!existingOrder) {
      return { error: `Order with ID ${order} not found.` };
    }
    // Queries return an array of dictionaries
    return [{ status: existingOrder.status }];
  }
}
```

```typescript
// file: src/concepts/Order/OrderConcept.test.ts

import { assertEquals, assertExists, assertNotEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import OrderConcept from "./OrderConcept.ts";
import type { OrderLineOutput } from "./OrderConcept.ts"; // Import the type

Deno.test("OrderConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new OrderConcept(db);

  // Test data IDs
  const userA = "user:Alice" as ID;
  const itemLatte = "item:Latte" as ID;
  const itemAmericano = "item:Americano" as ID;
  const optionTemp = "option:Temperature" as ID;
  const choiceHot = "choice:Hot" as ID;
  const choiceCold = "choice:Cold" as ID;
  const optionMilk = "option:Milk" as ID;
  const choiceOat = "choice:Oat" as ID;
  const choiceAlmond = "choice:Almond" as ID;

  await t.step("open: should create a new pending order", async () => {
    console.log("--- Test: open a new pending order ---");
    const result = await concept.open({ user: userA });
    if ('error' in result) { // Type guard
      throw new Error(`Failed to open order: ${result.error}`);
    }
    assertExists(result.order, "Should return an order ID on success");
    const orderId = result.order;
    console.log(`Opened order with ID: ${orderId}`);

    const statusResult = await concept._status({ order: orderId });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "pending" }, "New order should have 'pending' status");
    console.log(`Order ${orderId} status: pending (verified)`);
  });

  let orderId1: ID;
  await t.step("addItem: should add an item with selections to a pending order", async () => {
    console.log("\n--- Test: addItem with selections ---");
    const openResult = await concept.open({ user: userA });
    if ('error' in openResult) { // Type guard
      throw new Error(`Failed to open order: ${openResult.error}`);
    }
    orderId1 = openResult.order;
    console.log(`Opened order for addItem test with ID: ${orderId1}`);

    const selections = [
      { option: optionTemp, choice: choiceHot, displayOptionName: "Temperature", displayChoiceName: "Hot" },
      { option: optionMilk, choice: choiceOat, displayOptionName: "Milk", displayChoiceName: "Oat" },
    ];
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemLatte,
      qty: 2,
      displayItemName: "Latte",
      selections: selections,
    });
    if ('error' in addResult) { // Type guard
      throw new Error(`Failed to add item: ${addResult.error}`);
    }
    assertExists(addResult.line, "Should return an order line ID on success");
    const lineId = addResult.line;
    console.log(`Added line ${lineId} to order ${orderId1}`);

    const linesResult = await concept._lines({ order: orderId1 });
    if ('error' in linesResult) { // Type guard
      throw new Error(`Failed to get lines: ${linesResult.error}`);
    }
    assertNotEquals(linesResult.length, 0, "Should have at least one line");
    const line = linesResult[0].line; // Access element directly after type guard
    assertObjectMatch(line, {
      id: lineId,
      item: itemLatte,
      qty: 2,
      displayItemName: "Latte",
    }, "Order line details should match");
    assertEquals(line.selections.length, 2, "Should have two selections");
    assertObjectMatch(line.selections[0], { // Now line.selections[0] is correctly typed
      option: optionTemp,
      choice: choiceHot,
      displayOptionName: "Temperature",
      displayChoiceName: "Hot",
    });
    console.log(`Verified line ${lineId} and its selections.`);
  });

  await t.step("addItem: should prevent adding item to a non-existent order", async () => {
    console.log("\n--- Test: addItem to non-existent order ---");
    const nonExistentOrder = "order:NonExistent" as ID;
    const addResult = await concept.addItem({
      order: nonExistentOrder,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    if (!('error' in addResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(addResult.error, "Should return an error");
    assertEquals(
      addResult.error,
      `Order with ID ${nonExistentOrder} not found.`,
      "Error message should indicate order not found",
    );
    console.log(`Attempted to add item to non-existent order ${nonExistentOrder}, got expected error.`);
  });

  await t.step("addItem: should prevent adding item with non-positive quantity", async () => {
    console.log("\n--- Test: addItem with non-positive quantity ---");
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemAmericano,
      qty: 0,
      displayItemName: "Americano",
      selections: [],
    });
    if (!('error' in addResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(addResult.error, "Should return an error");
    assertEquals(
      addResult.error,
      "Quantity must be a positive number.",
      "Error message should indicate invalid quantity",
    );
    console.log(`Attempted to add item with qty 0, got expected error.`);
  });

  await t.step("submit: should allow submitting a pending order with lines", async () => {
    console.log("\n--- Test: submit pending order ---");
    const submitResult = await concept.submit({ order: orderId1 });
    if ('error' in submitResult) { // Type guard
        throw new Error(`Failed to submit order: ${submitResult.error}`);
    }
    assertEquals(submitResult, {}, "Should return empty object on successful submit (no status change)");
    console.log(`Order ${orderId1} submitted. (Status remains pending as per spec)`);

    const statusResult = await concept._status({ order: orderId1 });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "pending" }, "Order status should still be 'pending' after submit");
    console.log(`Order ${orderId1} status: pending (verified after submit)`);
  });

  await t.step("submit: should prevent submitting a non-existent order", async () => {
    console.log("\n--- Test: submit non-existent order ---");
    const nonExistentOrder = "order:NonExistent" as ID;
    const submitResult = await concept.submit({ order: nonExistentOrder });
    if (!('error' in submitResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(submitResult.error, "Should return an error");
    assertEquals(
      submitResult.error,
      `Order with ID ${nonExistentOrder} not found.`,
      "Error message should indicate order not found",
    );
    console.log(`Attempted to submit non-existent order ${nonExistentOrder}, got expected error.`);
  });

  await t.step("complete: should change order status to 'completed'", async () => {
    console.log("\n--- Test: complete order ---");
    const completeResult = await concept.complete({ order: orderId1 });
    if ('error' in completeResult) { // Type guard
        throw new Error(`Failed to complete order: ${completeResult.error}`);
    }
    assertEquals(completeResult, {}, "Should return empty object on successful completion");
    console.log(`Order ${orderId1} completed.`);

    const statusResult = await concept._status({ order: orderId1 });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "completed" }, "Order status should be 'completed'");
    console.log(`Order ${orderId1} status: completed (verified)`);
  });

  await t.step("addItem: should prevent adding item to a completed order", async () => {
    console.log("\n--- Test: addItem to completed order ---");
    const addResult = await concept.addItem({
      order: orderId1,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    if (!('error' in addResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(addResult.error, "Should return an error");
    assertEquals(
      addResult.error,
      `Cannot add items to an order with status 'completed'. Only 'pending' orders can be modified.`,
      "Error message should indicate order is completed",
    );
    console.log(`Attempted to add item to completed order ${orderId1}, got expected error.`);
  });

  await t.step("submit: should prevent submitting a completed order", async () => {
    console.log("\n--- Test: submit completed order ---");
    const submitResult = await concept.submit({ order: orderId1 });
    if (!('error' in submitResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(submitResult.error, "Should return an error");
    assertEquals(
      submitResult.error,
      `Order with ID ${orderId1} is already 'completed' and cannot be submitted.`,
      "Error message should indicate order is completed",
    );
    console.log(`Attempted to submit completed order ${orderId1}, got expected error.`);
  });

  await t.step("cancel: should change order status to 'canceled' (alternative path)", async () => {
    console.log("\n--- Test: cancel order (alternative path) ---");
    const openResult = await concept.open({ user: userA });
    if ('error' in openResult) { // Type guard
      throw new Error(`Failed to open order: ${openResult.error}`);
    }
    const orderId2 = openResult.order;
    console.log(`Opened order for cancel test with ID: ${orderId2}`);

    const addResult = await concept.addItem({
      order: orderId2,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    if ('error' in addResult) { // Type guard
        throw new Error(`Failed to add item to order ${orderId2}: ${addResult.error}`);
    }
    console.log(`Added item to order ${orderId2}.`);

    const cancelResult = await concept.cancel({ order: orderId2 });
    if ('error' in cancelResult) { // Type guard
        throw new Error(`Failed to cancel order: ${cancelResult.error}`);
    }
    assertEquals(cancelResult, {}, "Should return empty object on successful cancellation");
    console.log(`Order ${orderId2} canceled.`);

    const statusResult = await concept._status({ order: orderId2 });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "canceled" }, "Order status should be 'canceled'");
    console.log(`Order ${orderId2} status: canceled (verified)`);
  });

  await t.step("complete: should prevent completing a canceled order", async () => {
    console.log("\n--- Test: complete canceled order ---");
    const openResult = await concept.open({ user: userA });
    if ('error' in openResult) { // Type guard
      throw new Error(`Failed to open order: ${openResult.error}`);
    }
    const orderId3 = openResult.order;
    const cancelFirstResult = await concept.cancel({ order: orderId3 }); // Cancel first
    if ('error' in cancelFirstResult) { // Type guard
        throw new Error(`Failed to cancel order ${orderId3}: ${cancelFirstResult.error}`);
    }
    console.log(`Opened and canceled order ${orderId3}.`);

    const completeResult = await concept.complete({ order: orderId3 });
    if (!('error' in completeResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(completeResult.error, "Should return an error");
    assertEquals(
      completeResult.error,
      `Order with ID ${orderId3} is already 'canceled' and cannot be completed.`,
      "Error message should indicate order is canceled",
    );
    console.log(`Attempted to complete canceled order ${orderId3}, got expected error.`);
  });

  await t.step("Principle Trace: Scanning -> Pending -> Add Items -> Submit -> Complete -> No Changes", async () => {
    console.log("\n--- Principle Trace Test ---");

    // 1. Scanning a valid member starts a pending order
    console.log("Trace Step 1: User scans QR (simulated via open action)");
    const openResult = await concept.open({ user: userA });
    if ('error' in openResult) { // Type guard
      throw new Error(`Failed to open order: ${openResult.error}`);
    }
    const orderId = openResult.order;
    console.log(`   Order ${orderId} opened for user ${userA}.`);
    let statusResult = await concept._status({ order: orderId });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "pending" });
    console.log(`   Status is 'pending'. (Verified)`);

    // 2. Barista adds a Latte with hot and oat (valid)
    console.log("Trace Step 2: Barista adds Latte with selections.");
    const latteSelections = [
      { option: optionTemp, choice: choiceHot, displayOptionName: "Temperature", displayChoiceName: "Hot" },
      { option: optionMilk, choice: choiceOat, displayOptionName: "Milk", displayChoiceName: "Oat" },
    ];
    const addLatteResult = await concept.addItem({
      order: orderId,
      item: itemLatte,
      qty: 1,
      displayItemName: "Latte",
      selections: latteSelections,
    });
    if ('error' in addLatteResult) { // Type guard
      throw new Error(`Failed to add item: ${addLatteResult.error}`);
    }
    assertExists(addLatteResult.line);
    const latteLineId = addLatteResult.line;
    console.log(`   Added Latte (Line ID: ${latteLineId}) to Order ${orderId}.`);

    const linesAfterAdd = await concept._lines({ order: orderId });
    if ('error' in linesAfterAdd) { // Type guard
      throw new Error(`Failed to get lines: ${linesAfterAdd.error}`);
    }
    assertEquals(linesAfterAdd.length, 1);
    assertEquals(linesAfterAdd[0].line.selections.length, 2); // Access elements directly after type guard
    console.log(`   Order ${orderId} has 1 line with 2 selections. (Verified)`);

    // 3. Submitting marks the order ready
    console.log("Trace Step 3: Barista submits the order.");
    const submitResult = await concept.submit({ order: orderId });
    if ('error' in submitResult) { // Type guard
      throw new Error(`Failed to submit order: ${submitResult.error}`);
    }
    assertEquals(submitResult, {}, "Submit should succeed");
    console.log(`   Order ${orderId} submitted.`);
    statusResult = await concept._status({ order: orderId });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "pending" }); // Status remains pending internally
    console.log(`   Status is still 'pending' after submit. (Verified)`);

    // 4. Completing marks the order completed
    console.log("Trace Step 4: Barista completes the order.");
    const completeResult = await concept.complete({ order: orderId });
    if ('error' in completeResult) { // Type guard
      throw new Error(`Failed to complete order: ${completeResult.error}`);
    }
    assertEquals(completeResult, {}, "Complete should succeed");
    console.log(`   Order ${orderId} completed.`);
    statusResult = await concept._status({ order: orderId });
    if ('error' in statusResult) { // Type guard
      throw new Error(`Failed to get status: ${statusResult.error}`);
    }
    assertObjectMatch(statusResult[0], { status: "completed" });
    console.log(`   Status is 'completed'. (Verified)`);

    // 5. Canceled orders stop accepting changes (already tested, but confirm again)
    console.log("Trace Step 5: Attempt to add item to completed order (should fail).");
    const addAfterCompleteResult = await concept.addItem({
      order: orderId,
      item: itemAmericano,
      qty: 1,
      displayItemName: "Americano",
      selections: [],
    });
    if (!('error' in addAfterCompleteResult)) { // Expect error
        throw new Error("Expected an error but got success.");
    }
    assertExists(addAfterCompleteResult.error, "Should fail to add item to completed order");
    console.log(`   Failed to add item to completed order. (Verified)`);
  });

  await client.close();
});
```
# response:

