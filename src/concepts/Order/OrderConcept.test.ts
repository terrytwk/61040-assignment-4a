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