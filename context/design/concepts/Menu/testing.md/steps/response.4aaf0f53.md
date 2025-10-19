---
timestamp: 'Sat Oct 18 2025 19:58:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_195838.bcb6ca96.md]]'
content_id: 4aaf0f53b14228d3ab6d74149054997555de7d0ca4eca43163cdf41bd1a3c7d7
---

# response:

```typescript
// file: src/concepts/Menu/MenuConcept.test.ts
import { assertEquals, assertExists, assertFalse, assert } from "jsr:@std/assert"; // 'assert' for truthiness
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import MenuConcept from "./MenuConcept.ts";

Deno.test("Menu Concept - Actions", async (t) => {
  const [db, client] = await testDb();
  const menu = new MenuConcept(db);

  // Define variables to hold IDs from created entities
  let latteItem: ID;
  let americanoItem: ID;
  let temperatureOption: ID;
  let milkOption: ID;
  let sweetenerOption: ID;
  let hotChoice: ID;
  let coldChoice: ID;
  let wholeMilkChoice: ID;
  let oatMilkChoice: ID;
  let sugarChoice: ID;

  await t.step("createItem: should create items successfully", async () => {
    console.log("Action: createItem (Latte)");
    const latteResult = await menu.createItem({
      name: "Latte",
      description: "Espresso with steamed milk",
    });
    // Type guard: ensure no error before accessing 'item'
    assertFalse("error" in latteResult, `Expected no error, but got: ${latteResult.error}`);
    assertExists(latteResult.item, "Item ID for Latte should be returned");
    latteItem = latteResult.item;
    console.log(`Created Latte item with ID: ${latteItem}`);

    console.log("Action: createItem (Americano)");
    const americanoResult = await menu.createItem({
      name: "Americano",
      description: "Espresso with hot water",
    });
    // Type guard
    assertFalse("error" in americanoResult, `Expected no error, but got: ${americanoResult.error}`);
    assertExists(americanoResult.item, "Item ID for Americano should be returned");
    americanoItem = americanoResult.item;
    console.log(`Created Americano item with ID: ${americanoItem}`);
  });

  await t.step("setItemActive: should change item active status", async () => {
    console.log(`Action: setItemActive (Latte, isActive: false)`);
    const result = await menu.setItemActive({ item: latteItem, isActive: false });
    // Type guard
    assertFalse("error" in result, `Expected no error, but got: ${result.error}`);
    const updatedItem = await menu.items.findOne({ _id: latteItem });
    assertEquals(updatedItem?.isActive, false, "Latte item should be inactive");
    console.log(`Latte item set to inactive.`);

    console.log(`Action: setItemActive (Latte, isActive: true)`);
    const reactivateResult = await menu.setItemActive({ item: latteItem, isActive: true });
    // Type guard
    assertFalse("error" in reactivateResult, `Expected no error, but got: ${reactivateResult.error}`);
    const reactivatedItem = await menu.items.findOne({ _id: latteItem });
    assertEquals(reactivatedItem?.isActive, true, "Latte item should be active again");
    console.log(`Latte item set to active.`);

    console.log(`Action: setItemActive (non-existent item)`);
    const errorResult = await menu.setItemActive({ item: "non-existent-item" as ID, isActive: true });
    assertExists(errorResult.error, "Expected an error for non-existent item");
    assertEquals(errorResult.error, "Item with ID non-existent-item not found.");
    console.log(`Correctly failed to set active status for non-existent item: ${errorResult.error}`);
  });

  await t.step("createOption: should create options successfully", async () => {
    console.log("Action: createOption (Temperature)");
    const tempResult = await menu.createOption({ name: "Temperature", required: true, maxChoices: 1 });
    // Type guard
    assertFalse("error" in tempResult, `Expected no error, but got: ${tempResult.error}`);
    assertExists(tempResult.option, "Option ID for Temperature should be returned");
    temperatureOption = tempResult.option;
    console.log(`Created Temperature option with ID: ${temperatureOption}`);

    console.log("Action: createOption (Milk)");
    const milkResult = await menu.createOption({ name: "Milk", required: false, maxChoices: 1 });
    // Type guard
    assertFalse("error" in milkResult, `Expected no error, but got: ${milkResult.error}`);
    assertExists(milkResult.option, "Option ID for Milk should be returned");
    milkOption = milkResult.option;
    console.log(`Created Milk option with ID: ${milkOption}`);

    console.log("Action: createOption (Sweetener)");
    const sweetenerResult = await menu.createOption({ name: "Sweetener", required: false, maxChoices: 5 });
    // Type guard
    assertFalse("error" in sweetenerResult, `Expected no error, but got: ${sweetenerResult.error}`);
    assertExists(sweetenerResult.option, "Option ID for Sweetener should be returned");
    sweetenerOption = sweetenerResult.option;
    console.log(`Created Sweetener option with ID: ${sweetenerOption}`);

    console.log("Action: createOption (invalid maxChoices)");
    const invalidOptionResult = await menu.createOption({ name: "Invalid", required: true, maxChoices: 0 });
    assertExists(invalidOptionResult.error, "Expected an error for maxChoices < 1");
    assertEquals(invalidOptionResult.error, "maxChoices must be greater than or equal to 1.");
    console.log(`Correctly failed to create option with invalid maxChoices: ${invalidOptionResult.error}`);
  });

  await t.step("createChoice: should create choices successfully under options", async () => {
    console.log("Action: createChoice (Hot for Temperature)");
    const hotResult = await menu.createChoice({ option: temperatureOption, name: "Hot" });
    // Type guard
    assertFalse("error" in hotResult, `Expected no error, but got: ${hotResult.error}`);
    assertExists(hotResult.choice, "Choice ID for Hot should be returned");
    hotChoice = hotResult.choice;
    console.log(`Created Hot choice with ID: ${hotChoice}`);

    console.log("Action: createChoice (Cold for Temperature)");
    const coldResult = await menu.createChoice({ option: temperatureOption, name: "Cold" });
    // Type guard
    assertFalse("error" in coldResult, `Expected no error, but got: ${coldResult.error}`);
    assertExists(coldResult.choice, "Choice ID for Cold should be returned");
    coldChoice = coldResult.choice;
    console.log(`Created Cold choice with ID: ${coldChoice}`);

    console.log("Action: createChoice (Whole Milk for Milk)");
    const wholeMilkResult = await menu.createChoice({ option: milkOption, name: "Whole Milk" });
    // Type guard
    assertFalse("error" in wholeMilkResult, `Expected no error, but got: ${wholeMilkResult.error}`);
    assertExists(wholeMilkResult.choice, "Choice ID for Whole Milk should be returned");
    wholeMilkChoice = wholeMilkResult.choice;
    console.log(`Created Whole Milk choice with ID: ${wholeMilkChoice}`);

    console.log("Action: createChoice (Oat Milk for Milk)");
    const oatMilkResult = await menu.createChoice({ option: milkOption, name: "Oat Milk" });
    // Type guard
    assertFalse("error" in oatMilkResult, `Expected no error, but got: ${oatMilkResult.error}`);
    assertExists(oatMilkResult.choice, "Choice ID for Oat Milk should be returned");
    oatMilkChoice = oatMilkResult.choice;
    console.log(`Created Oat Milk choice with ID: ${oatMilkChoice}`);

    console.log("Action: createChoice (Sugar for Sweetener)");
    const sugarResult = await menu.createChoice({ option: sweetenerOption, name: "Sugar" });
    // Type guard
    assertFalse("error" in sugarResult, `Expected no error, but got: ${sugarResult.error}`);
    assertExists(sugarResult.choice, "Choice ID for Sugar should be returned");
    sugarChoice = sugarResult.choice;
    console.log(`Created Sugar choice with ID: ${sugarChoice}`);

    console.log(`Action: createChoice (non-existent option)`);
    const errorResult = await menu.createChoice({ option: "non-existent-option" as ID, name: "Test" });
    assertExists(errorResult.error, "Expected an error for non-existent option");
    assertEquals(errorResult.error, "Option with ID non-existent-option not found.");
    console.log(`Correctly failed to create choice under non-existent option: ${errorResult.error}`);
  });

  await t.step("attachOption: should attach options to items", async () => {
    console.log(`Action: attachOption (Latte, Temperature)`);
    const result1 = await menu.attachOption({ item: latteItem, option: temperatureOption });
    // Type guard
    assertFalse("error" in result1, `Expected no error, but got: ${result1.error}`);
    let applicabilityCount = await menu.applicabilities.countDocuments({ item: latteItem, option: temperatureOption });
    assertEquals(applicabilityCount, 1, "Temperature option should be attached to Latte");
    console.log(`Temperature option attached to Latte.`);

    console.log(`Action: attachOption (Latte, Milk)`);
    const result2 = await menu.attachOption({ item: latteItem, option: milkOption });
    // Type guard
    assertFalse("error" in result2, `Expected no error, but got: ${result2.error}`);
    applicabilityCount = await menu.applicabilities.countDocuments({ item: latteItem, option: milkOption });
    assertEquals(applicabilityCount, 1, "Milk option should be attached to Latte");
    console.log(`Milk option attached to Latte.`);

    console.log(`Action: attachOption (Americano, Temperature)`);
    const result3 = await menu.attachOption({ item: americanoItem, option: temperatureOption });
    // Type guard
    assertFalse("error" in result3, `Expected no error, but got: ${result3.error}`);
    applicabilityCount = await menu.applicabilities.countDocuments({ item: americanoItem, option: temperatureOption });
    assertEquals(applicabilityCount, 1, "Temperature option should be attached to Americano");
    console.log(`Temperature option attached to Americano.`);

    console.log(`Action: attachOption (Latte, Temperature again - should error)`);
    const errorResult = await menu.attachOption({ item: latteItem, option: temperatureOption });
    assertExists(errorResult.error, "Expected an error for attaching an option already attached");
    assertEquals(errorResult.error, `Option ${temperatureOption} is already attached to item ${latteItem}.`);
    console.log(`Correctly failed to attach already attached option: ${errorResult.error}`);

    console.log(`Action: attachOption (non-existent item, Temperature)`);
    const errorResult2 = await menu.attachOption({ item: "non-existent-item" as ID, option: temperatureOption });
    assertExists(errorResult2.error, "Expected an error for non-existent item");
    assertEquals(errorResult2.error, "Item with ID non-existent-item not found.");
    console.log(`Correctly failed to attach option to non-existent item: ${errorResult2.error}`);
  });

  await t.step("disallowChoice: should disallow choices for an item's option", async () => {
    console.log(`Action: disallowChoice (Latte, Milk, Whole Milk)`);
    const result1 = await menu.disallowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice });
    // Type guard
    assertFalse("error" in result1, `Expected no error, but got: ${result1.error}`);
    let applicability = await menu.applicabilities.findOne({ item: latteItem, option: milkOption });
    assert(applicability?.disallowedChoices.includes(wholeMilkChoice), "Whole Milk should be disallowed for Latte's Milk option");
    console.log(`Whole Milk disallowed for Latte's Milk option.`);

    console.log(`Action: disallowChoice (Latte, Milk, Whole Milk again - should be no-op)`);
    const result2 = await menu.disallowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice });
    assertFalse("error" in result2, `Expected no error, but got: ${result2.error}`); // Idempotent, no error
    applicability = await menu.applicabilities.findOne({ item: latteItem, option: milkOption });
    assertEquals(applicability?.disallowedChoices.filter(c => c === wholeMilkChoice).length, 1, "Whole Milk should still be disallowed once");
    console.log(`Disallowing again was a no-op.`);

    console.log(`Action: disallowChoice (Latte, Milk, non-existent choice)`);
    const errorResult = await menu.disallowChoice({ item: latteItem, option: milkOption, choice: "non-existent-choice" as ID });
    assertExists(errorResult.error, "Expected an error for non-existent choice belonging to option");
    assertEquals(errorResult.error, `Choice non-existent-choice does not belong to option ${milkOption}.`);
    console.log(`Correctly failed to disallow non-existent choice: ${errorResult.error}`);

    console.log(`Action: disallowChoice (Latte, Temperature, Oat Milk - wrong option)`);
    const errorResult2 = await menu.disallowChoice({ item: latteItem, option: temperatureOption, choice: oatMilkChoice });
    assertExists(errorResult2.error, "Expected an error because Oat Milk does not belong to Temperature option");
    assertEquals(errorResult2.error, `Choice ${oatMilkChoice} does not belong to option ${temperatureOption}.`);
    console.log(`Correctly failed to disallow choice from wrong option: ${errorResult2.error}`);
  });

  await t.step("allowChoice: should allow choices for an item's option", async () => {
    console.log(`Action: allowChoice (Latte, Milk, Whole Milk)`);
    const result1 = await menu.allowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice });
    // Type guard
    assertFalse("error" in result1, `Expected no error, but got: ${result1.error}`);
    let applicability = await menu.applicabilities.findOne({ item: latteItem, option: milkOption });
    assertFalse(applicability?.disallowedChoices.includes(wholeMilkChoice), "Whole Milk should no longer be disallowed for Latte's Milk option");
    console.log(`Whole Milk allowed for Latte's Milk option.`);

    console.log(`Action: allowChoice (Latte, Milk, Whole Milk again - should be no-op)`);
    const result2 = await menu.allowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice });
    assertFalse("error" in result2, `Expected no error, but got: ${result2.error}`); // Idempotent, no error
    applicability = await menu.applicabilities.findOne({ item: latteItem, option: milkOption });
    assertFalse(applicability?.disallowedChoices.includes(wholeMilkChoice), "Whole Milk should still not be disallowed");
    console.log(`Allowing again was a no-op.`);

    console.log(`Action: allowChoice (non-existent applicability)`);
    const errorResult = await menu.allowChoice({ item: "non-existent-item" as ID, option: milkOption, choice: wholeMilkChoice });
    assertExists(errorResult.error, "Expected an error for non-existent applicability");
    assertEquals(errorResult.error, `Applicability for item non-existent-item and option ${milkOption} not found.`);
    console.log(`Correctly failed to allow choice for non-existent applicability: ${errorResult.error}`);
  });

  await t.step("detachOption: should detach options from items", async () => {
    console.log(`Action: detachOption (Americano, Temperature)`);
    const result1 = await menu.detachOption({ item: americanoItem, option: temperatureOption });
    // Type guard
    assertFalse("error" in result1, `Expected no error, but got: ${result1.error}`);
    const applicabilityCount = await menu.applicabilities.countDocuments({ item: americanoItem, option: temperatureOption });
    assertEquals(applicabilityCount, 0, "Temperature option should be detached from Americano");
    console.log(`Temperature option detached from Americano.`);

    console.log(`Action: detachOption (non-existent applicability)`);
    const errorResult = await menu.detachOption({ item: americanoItem, option: temperatureOption });
    assertExists(errorResult.error, "Expected an error for non-existent applicability");
    assertEquals(errorResult.error, `Applicability for item ${americanoItem} and option ${temperatureOption} not found.`);
    console.log(`Correctly failed to detach non-existent applicability: ${errorResult.error}`);
  });

  await t.step("_optionsForItem: should return attached options for an item", async () => {
    console.log(`Query: _optionsForItem (Latte)`);
    const optionsResult = await menu._optionsForItem({ item: latteItem });
    // Type guard for query result
    assertFalse("error" in optionsResult, `Expected no error, but got: ${optionsResult.error}`);
    assert(Array.isArray(optionsResult));
    assertEquals(optionsResult.length, 2, "Latte should have 2 options attached");

    const optionIds = optionsResult.map((o) => o.option.id);
    assert(optionIds.includes(temperatureOption), "Latte should have Temperature option");
    assert(optionIds.includes(milkOption), "Latte should have Milk option");
    console.log(`Latte has expected options.`);

    console.log(`Query: _optionsForItem (Americano) - now only 0 options`);
    const americanoOptionsResult = await menu._optionsForItem({ item: americanoItem });
    // Type guard for query result
    assertFalse("error" in americanoOptionsResult, `Expected no error, but got: ${americanoOptionsResult.error}`);
    assert(Array.isArray(americanoOptionsResult));
    assertEquals(americanoOptionsResult.length, 0, "Americano should have 0 options after detach");
    console.log(`Americano has 0 options as expected.`);

    console.log(`Query: _optionsForItem (non-existent item)`);
    const errorResult = await menu._optionsForItem({ item: "non-existent-item" as ID });
    assertExists(errorResult.error, "Expected an error for non-existent item");
    assertEquals(errorResult.error, "Item with ID non-existent-item not found.");
    console.log(`Correctly failed to query options for non-existent item: ${errorResult.error}`);
  });

  await t.step("_choicesFor: should return active choices excluding disallowed choices", async () => {
    console.log(`Query: _choicesFor (Latte, Temperature)`);
    const choicesResult = await menu._choicesFor({ item: latteItem, option: temperatureOption });
    // Type guard for query result
    assertFalse("error" in choicesResult, `Expected no error, but got: ${choicesResult.error}`);
    assert(Array.isArray(choicesResult));
    assertEquals(choicesResult.length, 2, "Temperature option for Latte should have 2 choices");
    const choiceIds = choicesResult.map((c) => c.choice.id);
    assert(choiceIds.includes(hotChoice), "Hot choice should be present");
    assert(choiceIds.includes(coldChoice), "Cold choice should be present");
    console.log(`Latte Temperature has expected choices.`);

    console.log(`Action: disallowChoice (Latte, Milk, Oat Milk)`);
    const disallowResult = await menu.disallowChoice({ item: latteItem, option: milkOption, choice: oatMilkChoice });
    assertFalse("error" in disallowResult, `Expected no error, but got: ${disallowResult.error}`);

    console.log(`Query: _choicesFor (Latte, Milk) after disallowing Oat Milk`);
    const milkChoicesResult = await menu._choicesFor({ item: latteItem, option: milkOption });
    // Type guard for query result
    assertFalse("error" in milkChoicesResult, `Expected no error, but got: ${milkChoicesResult.error}`);
    assert(Array.isArray(milkChoicesResult));
    assertEquals(milkChoicesResult.length, 1, "Milk option for Latte should have 1 choice (Whole Milk)");
    assertEquals(milkChoicesResult[0].choice.id, wholeMilkChoice, "Only Whole Milk should be available");
    console.log(`Latte Milk has expected choices after disallow.`);

    console.log(`Query: _choicesFor (non-existent applicability)`);
    const errorResult = await menu._choicesFor({ item: americanoItem, option: milkOption }); // Milk not attached to Americano
    assertExists(errorResult.error, "Expected an error for non-existent applicability");
    assertEquals(errorResult.error, `Applicability for item ${americanoItem} and option ${milkOption} not found.`);
    console.log(`Correctly failed to query choices for non-existent applicability: ${errorResult.error}`);
  });

  await t.step("Principle: Operators attach temperature and milk to Latte; only temperature to Americano. The POS shows the right choices and blocks disallowed combos.", async () => {
    console.log("--- Principle Trace ---");

    // Re-attach milk to Americano for demonstrating POS logic (as per initial principle setup)
    console.log(`Action: attachOption (Americano, Milk)`);
    let attachMilkToAmericano = await menu.attachOption({ item: americanoItem, option: milkOption });
    assertFalse("error" in attachMilkToAmericano, `Expected no error, but got: ${attachMilkToAmericano.error}`);
    console.log(`Milk option re-attached to Americano.`);

    console.log(`Action: disallowChoice (Americano, Milk, Oat Milk)`);
    let disallowOatMilk = await menu.disallowChoice({ item: americanoItem, option: milkOption, choice: oatMilkChoice });
    assertFalse("error" in disallowOatMilk, `Expected no error, but got: ${disallowOatMilk.error}`);
    console.log(`Oat Milk disallowed for Americano's Milk option.`);

    console.log(`Query: _optionsForItem (Latte) - check full list of options`);
    const latteOptionsResult = await menu._optionsForItem({ item: latteItem });
    assertFalse("error" in latteOptionsResult, `Expected no error, but got: ${latteOptionsResult.error}`);
    const latteOptions = latteOptionsResult as { option: { id: ID, required: boolean, maxChoices: number } }[];
    assertEquals(latteOptions.length, 2);
    assert(latteOptions.some(o => o.option.id === temperatureOption && o.option.required && o.option.maxChoices === 1));
    assert(latteOptions.some(o => o.option.id === milkOption && !o.option.required && o.option.maxChoices === 1));
    console.log(`Latte has Temperature (required, max 1) and Milk (optional, max 1).`);

    console.log(`Query: _optionsForItem (Americano) - check full list of options`);
    const americanoOptionsResult = await menu._optionsForItem({ item: americanoItem });
    assertFalse("error" in americanoOptionsResult, `Expected no error, but got: ${americanoOptionsResult.error}`);
    const americanoOptions = americanoOptionsResult as { option: { id: ID, required: boolean, maxChoices: number } }[];
    assertEquals(americanoOptions.length, 1); // Americano has Milk option (re-attached)
    assert(americanoOptions.some(o => o.option.id === milkOption && !o.option.required && o.option.maxChoices === 1));
    assertFalse(americanoOptions.some(o => o.option.id === temperatureOption), "Americano should NOT have Temperature option (detached earlier)");
    console.log(`Americano has Milk (optional, max 1).`);


    console.log(`Query: _choicesFor (Latte, Milk) - checking disallowed combo`);
    const latteMilkChoicesResult = await menu._choicesFor({ item: latteItem, option: milkOption });
    assertFalse("error" in latteMilkChoicesResult, `Expected no error, but got: ${latteMilkChoicesResult.error}`);
    const latteMilkChoices = latteMilkChoicesResult as { choice: { id: ID, name: string } }[];
    const latteMilkChoiceIds = latteMilkChoices.map(c => c.choice.id);
    assertFalse(latteMilkChoiceIds.includes(oatMilkChoice), "Oat Milk should be disallowed for Latte's Milk (from earlier disallow)");
    assert(latteMilkChoiceIds.includes(wholeMilkChoice), "Whole Milk should be allowed for Latte's Milk");
    console.log(`Latte's Milk choices correctly exclude disallowed Oat Milk.`);


    console.log(`Query: _isSelectionSetValid (Latte, selections: Hot, Oat Milk)`);
    let selections1 = [
      { option: temperatureOption, choice: hotChoice },
      { option: milkOption, choice: oatMilkChoice },
    ];
    const validation1Result = await menu._isSelectionSetValid({ item: latteItem, selections: selections1 });
    assertFalse("error" in validation1Result, `Expected no error, but got: ${validation1Result.error}`);
    const validation1 = validation1Result as { ok: boolean, reason?: string }[];
    assert(validation1.length > 0 && validation1[0].ok === false, "Latte selections (Hot, Oat Milk) should be invalid (Oat Milk is disallowed)");
    assertEquals(validation1[0].reason, `Choice ${oatMilkChoice} is disallowed for option ${milkOption} on item ${latteItem}.`);
    console.log(`Latte selections with disallowed Oat Milk correctly marked invalid: ${validation1[0].reason}`);

    console.log(`Query: _isSelectionSetValid (Latte, selections: Hot, Whole Milk)`);
    let selections2 = [
      { option: temperatureOption, choice: hotChoice },
      { option: milkOption, choice: wholeMilkChoice },
    ];
    const validation2Result = await menu._isSelectionSetValid({ item: latteItem, selections: selections2 });
    assertFalse("error" in validation2Result, `Expected no error, but got: ${validation2Result.error}`);
    const validation2 = validation2Result as { ok: boolean, reason?: string }[];
    assert(validation2.length > 0 && validation2[0].ok === true, "Latte selections (Hot, Whole Milk) should be valid");
    console.log(`Latte selections with allowed Whole Milk correctly marked valid.`);

    console.log(`Query: _isSelectionSetValid (Latte, selections: Whole Milk - missing required Temperature)`);
    let selections3 = [
      { option: milkOption, choice: wholeMilkChoice },
    ];
    const validation3Result = await menu._isSelectionSetValid({ item: latteItem, selections: selections3 });
    assertFalse("error" in validation3Result, `Expected no error, but got: ${validation3Result.error}`);
    const validation3 = validation3Result as { ok: boolean, reason?: string }[];
    assert(validation3.length > 0 && validation3[0].ok === false, "Latte selections (missing required Temperature) should be invalid");
    assertEquals(validation3[0].reason, `Required option ${temperatureOption} is missing for item ${latteItem}.`);
    console.log(`Latte selections missing required option correctly marked invalid: ${validation3[0].reason}`);

    console.log(`Query: _isSelectionSetValid (Latte, selections: Hot, Cold - maxChoices violated for Temperature)`);
    let selections4 = [
      { option: temperatureOption, choice: hotChoice },
      { option: temperatureOption, choice: coldChoice },
    ];
    const validation4Result = await menu._isSelectionSetValid({ item: latteItem, selections: selections4 });
    assertFalse("error" in validation4Result, `Expected no error, but got: ${validation4Result.error}`);
    const validation4 = validation4Result as { ok: boolean, reason?: string }[];
    assert(validation4.length > 0 && validation4[0].ok === false, "Latte selections (violating maxChoices for Temperature) should be invalid");
    assertEquals(validation4[0].reason, `Option ${temperatureOption} exceeds its maximum allowed choices (1).`);
    console.log(`Latte selections violating maxChoices correctly marked invalid: ${validation4[0].reason}`);
  });

  await client.close();
});

// trace:
// Concept: Menu
// Purpose: Define items and their configurable options/choices (no pricing).
// Principle: Operators attach **temperature** (required, maxChoices=1) and **milk** (optional, maxChoices=1) to **Latte**; only **temperature** to **Americano**. The POS shows the right choices and blocks disallowed combos.
//
// 1. **createItem** for "Latte" (ID: latteItem)
//    - result: { item: "latte:123" }
// 2. **createItem** for "Americano" (ID: americanoItem)
//    - result: { item: "americano:456" }
// 3. **createOption** for "Temperature" (required=true, maxChoices=1) (ID: temperatureOption)
//    - result: { option: "temp:1" }
// 4. **createOption** for "Milk" (required=false, maxChoices=1) (ID: milkOption)
//    - result: { option: "milk:2" }
// 5. **createChoice** for "Hot" under "Temperature" (ID: hotChoice)
//    - result: { choice: "hot:a" }
// 6. **createChoice** for "Cold" under "Temperature" (ID: coldChoice)
//    - result: { choice: "cold:b" }
// 7. **createChoice** for "Whole Milk" under "Milk" (ID: wholeMilkChoice)
//    - result: { choice: "whole:x" }
// 8. **createChoice** for "Oat Milk" under "Milk" (ID: oatMilkChoice)
//    - result: { choice: "oat:y" }
//
// 9. **attachOption** Latte, Temperature
//    - result: {} (Applicability(latteItem, temperatureOption) created)
// 10. **attachOption** Latte, Milk
//     - result: {} (Applicability(latteItem, milkOption) created)
// 11. **attachOption** Americano, Temperature
//     - result: {} (Applicability(americanoItem, temperatureOption) created)
//
// 12. **disallowChoice** Latte, Milk, Oat Milk
//     - result: {} (oatMilkChoice added to disallowedChoices for (latteItem, milkOption))
//
// 13. **_optionsForItem** Latte
//     - result: [{id: temperatureOption, required: true, maxChoices: 1}, {id: milkOption, required: false, maxChoices: 1}]
//     - This shows Latte has both Temperature (required) and Milk (optional).
//
// 14. **_optionsForItem** Americano
//     - result: [{id: temperatureOption, required: true, maxChoices: 1}]
//     - This shows Americano only has Temperature.
//
// 15. **_choicesFor** Latte, Milk
//     - result: [{id: wholeMilkChoice, name: "Whole Milk"}]
//     - This shows Oat Milk is correctly blocked/disallowed.
//
// 16. **_isSelectionSetValid** Latte, selections: [Temperature: Hot, Milk: Oat Milk]
//     - result: [{ok: false, reason: "Choice 'oat:y' is disallowed..."}]
//     - This validates that disallowed combos are blocked.
//
// 17. **_isSelectionSetValid** Latte, selections: [Temperature: Hot, Milk: Whole Milk]
//     - result: [{ok: true}]
//     - This validates a valid combination.
//
// 18. **_isSelectionSetValid** Latte, selections: [Milk: Whole Milk] (missing required Temperature)
//     - result: [{ok: false, reason: "Required option 'temp:1' is missing..."}]
//     - This validates that all required options are present.
//
// 19. **_isSelectionSetValid** Latte, selections: [Temperature: Hot, Temperature: Cold] (violating maxChoices)
//     - result: [{ok: false, reason: "Option 'temp:1' exceeds its maximum allowed choices (1)."}]
//     - This validates per-option maxChoices are respected.
```
