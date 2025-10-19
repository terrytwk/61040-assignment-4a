---
timestamp: 'Sat Oct 18 2025 19:51:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_195137.1d00c79e.md]]'
content_id: 4077525206a1ec0955776ce0d55e55bf29cefc9c83d45ac3ce6773f5a71fd63b
---

# file: src/concepts/MenuConcept.test.ts

```typescript
import { assertEquals, assertExists, assertFalse, assertTrue } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import MenuConcept from "./MenuConcept.ts";
import { ID, Empty } from "@utils/types.ts";

Deno.test("Menu Concept: Action and Query Tests", async (t) => {
  const [db, client] = await testDb();
  const menuConcept = new MenuConcept(db);

  let latteItem: ID;
  let americanoItem: ID;
  let teaItem: ID;

  let temperatureOption: ID;
  let milkOption: ID;
  let sweetenerOption: ID;

  let hotChoice: ID;
  let coldChoice: ID;
  let wholeMilkChoice: ID;
  let oatMilkChoice: ID;
  let sugarChoice: ID;

  await t.step("createItem: should create an item successfully", async () => {
    console.log("--- Test: createItem ---");
    const result = await menuConcept.createItem({ name: "Latte", description: "Coffee with milk" });
    assertExists(result.item, "Item ID should be returned");
    latteItem = result.item;
    console.log(`Created Latte (ID: ${latteItem})`);

    const itemDoc = await menuConcept.items.findOne({ _id: latteItem });
    assertExists(itemDoc);
    assertEquals(itemDoc.name, "Latte");
    assertEquals(itemDoc.description, "Coffee with milk");
    assertTrue(itemDoc.isActive, "Item should be active by default");

    const americanoResult = await menuConcept.createItem({ name: "Americano", description: "Espresso with hot water" });
    americanoItem = americanoResult.item;
    console.log(`Created Americano (ID: ${americanoItem})`);

    const teaResult = await menuConcept.createItem({ name: "Tea", description: "Hot water with tea bag" });
    teaItem = teaResult.item;
    console.log(`Created Tea (ID: ${teaItem})`);
  });

  await t.step("setItemActive: should change item active status", async () => {
    console.log("--- Test: setItemActive ---");
    const initialItem = await menuConcept.items.findOne({ _id: latteItem });
    assertTrue(initialItem?.isActive, "Latte should initially be active");

    console.log(`Deactivating Latte (ID: ${latteItem})`);
    const deactivateResult = await menuConcept.setItemActive({ item: latteItem, isActive: false });
    assertEquals(deactivateResult, {}, "Deactivation should return empty object");
    const deactivatedItem = await menuConcept.items.findOne({ _id: latteItem });
    assertFalse(deactivatedItem?.isActive, "Latte should now be inactive");
    console.log(`Latte is now inactive.`);

    console.log(`Activating Latte (ID: ${latteItem})`);
    const activateResult = await menuConcept.setItemActive({ item: latteItem, isActive: true });
    assertEquals(activateResult, {}, "Activation should return empty object");
    const activatedItem = await menuConcept.items.findOne({ _id: latteItem });
    assertTrue(activatedItem?.isActive, "Latte should now be active again");
    console.log(`Latte is now active.`);

    console.log(`Attempting to set active status for non-existent item`);
    const errorResult = await menuConcept.setItemActive({ item: "nonExistentItem" as ID, isActive: true });
    assertEquals(errorResult, { error: "Item with ID nonExistentItem not found." });
  });

  await t.step("createOption: should create an option successfully", async () => {
    console.log("--- Test: createOption ---");
    const tempResult = await menuConcept.createOption({ name: "Temperature", required: true, maxChoices: 1 });
    assertExists(tempResult.option, "Option ID should be returned");
    temperatureOption = tempResult.option;
    console.log(`Created Temperature option (ID: ${temperatureOption})`);

    const milkResult = await menuConcept.createOption({ name: "Milk", required: false, maxChoices: 1 });
    assertExists(milkResult.option, "Option ID should be returned");
    milkOption = milkResult.option;
    console.log(`Created Milk option (ID: ${milkOption})`);

    const sweetenerResult = await menuConcept.createOption({ name: "Sweetener", required: false, maxChoices: 3 });
    assertExists(sweetenerResult.option, "Option ID should be returned");
    sweetenerOption = sweetenerResult.option;
    console.log(`Created Sweetener option (ID: ${sweetenerOption})`);

    const optionDoc = await menuConcept.options.findOne({ _id: temperatureOption });
    assertExists(optionDoc);
    assertEquals(optionDoc.name, "Temperature");
    assertTrue(optionDoc.required);
    assertEquals(optionDoc.maxChoices, 1);
  });

  await t.step("createOption: should fail if maxChoices is less than 1", async () => {
    console.log("--- Test: createOption (invalid maxChoices) ---");
    const errorResult = await menuConcept.createOption({ name: "Invalid", required: false, maxChoices: 0 });
    assertEquals(errorResult, { error: "maxChoices must be greater than or equal to 1." });
  });

  await t.step("createChoice: should create choices for options", async () => {
    console.log("--- Test: createChoice ---");
    const hotResult = await menuConcept.createChoice({ option: temperatureOption, name: "Hot" });
    assertExists(hotResult.choice, "Choice ID for Hot should be returned");
    hotChoice = hotResult.choice;
    console.log(`Created Hot choice (ID: ${hotChoice}) for Temperature option`);

    const coldResult = await menuConcept.createChoice({ option: temperatureOption, name: "Cold" });
    assertExists(coldResult.choice, "Choice ID for Cold should be returned");
    coldChoice = coldResult.choice;
    console.log(`Created Cold choice (ID: ${coldChoice}) for Temperature option`);

    const wholeMilkResult = await menuConcept.createChoice({ option: milkOption, name: "Whole Milk" });
    assertExists(wholeMilkResult.choice, "Choice ID for Whole Milk should be returned");
    wholeMilkChoice = wholeMilkResult.choice;
    console.log(`Created Whole Milk choice (ID: ${wholeMilkChoice}) for Milk option`);

    const oatMilkResult = await menuConcept.createChoice({ option: milkOption, name: "Oat Milk" });
    assertExists(oatMilkResult.choice, "Choice ID for Oat Milk should be returned");
    oatMilkChoice = oatMilkResult.choice;
    console.log(`Created Oat Milk choice (ID: ${oatMilkChoice}) for Milk option`);

    const sugarResult = await menuConcept.createChoice({ option: sweetenerOption, name: "Sugar" });
    assertExists(sugarResult.choice, "Choice ID for Sugar should be returned");
    sugarChoice = sugarResult.choice;
    console.log(`Created Sugar choice (ID: ${sugarChoice}) for Sweetener option`);

    const choiceDoc = await menuConcept.choices.findOne({ _id: hotChoice });
    assertExists(choiceDoc);
    assertEquals(choiceDoc.name, "Hot");
    assertEquals(choiceDoc.option, temperatureOption);
    assertTrue(choiceDoc.isActive, "Choice should be active by default");
  });

  await t.step("createChoice: should fail if option does not exist", async () => {
    console.log("--- Test: createChoice (invalid option) ---");
    const errorResult = await menuConcept.createChoice({ option: "nonExistentOption" as ID, name: "Invalid Choice" });
    assertEquals(errorResult, { error: "Option with ID nonExistentOption not found." });
  });

  await t.step("attachOption: should attach options to items", async () => {
    console.log("--- Test: attachOption ---");
    console.log(`Attaching Temperature to Latte`);
    let result: Empty | { error: string } = await menuConcept.attachOption({ item: latteItem, option: temperatureOption });
    assertEquals(result, {}, "Attachment should return empty object");
    assertExists(await menuConcept.applicabilities.findOne({ item: latteItem, option: temperatureOption }));

    console.log(`Attaching Milk to Latte`);
    result = await menuConcept.attachOption({ item: latteItem, option: milkOption });
    assertEquals(result, {}, "Attachment should return empty object");
    assertExists(await menuConcept.applicabilities.findOne({ item: latteItem, option: milkOption }));

    console.log(`Attaching Temperature to Americano`);
    result = await menuConcept.attachOption({ item: americanoItem, option: temperatureOption });
    assertEquals(result, {}, "Attachment should return empty object");
    assertExists(await menuConcept.applicabilities.findOne({ item: americanoItem, option: temperatureOption }));
  });

  await t.step("attachOption: should prevent attaching already attached options", async () => {
    console.log("--- Test: attachOption (already attached) ---");
    const errorResult = await menuConcept.attachOption({ item: latteItem, option: temperatureOption });
    assertEquals(errorResult, { error: `Option ${temperatureOption} is already attached to item ${latteItem}.` });
  });

  await t.step("attachOption: should fail for non-existent item or option", async () => {
    console.log("--- Test: attachOption (invalid item/option) ---");
    let errorResult = await menuConcept.attachOption({ item: "nonExistentItem" as ID, option: temperatureOption });
    assertEquals(errorResult, { error: `Item with ID nonExistentItem not found.` });

    errorResult = await menuConcept.attachOption({ item: latteItem, option: "nonExistentOption" as ID });
    assertEquals(errorResult, { error: `Option with ID nonExistentOption not found.` });
  });

  await t.step("disallowChoice: should disallow a choice for an item-option pair", async () => {
    console.log("--- Test: disallowChoice ---");
    console.log(`Disallowing Cold choice for Americano's Temperature option`);
    const result = await menuConcept.disallowChoice({ item: americanoItem, option: temperatureOption, choice: coldChoice });
    assertEquals(result, {}, "Disallow should return empty object");

    const applicability = await menuConcept.applicabilities.findOne({ item: americanoItem, option: temperatureOption });
    assertTrue(applicability?.disallowedChoices.includes(coldChoice), "Cold choice should be in disallowed choices");
    console.log(`Cold choice is now disallowed for Americano.`);
  });

  await t.step("disallowChoice: should be idempotent and fail for invalid inputs", async () => {
    console.log("--- Test: disallowChoice (idempotency & invalid) ---");
    console.log(`Attempting to disallow Cold choice for Americano again (should be no-op)`);
    let result = await menuConcept.disallowChoice({ item: americanoItem, option: temperatureOption, choice: coldChoice });
    assertEquals(result, {}, "Should be idempotent (return empty object)");

    console.log(`Attempting to disallow choice for non-existent applicability`);
    let errorResult = await menuConcept.disallowChoice({ item: teaItem, option: temperatureOption, choice: hotChoice });
    assertEquals(errorResult, { error: `Applicability for item ${teaItem} and option ${temperatureOption} not found.` });

    console.log(`Attempting to disallow choice that doesn't belong to option`);
    errorResult = await menuConcept.disallowChoice({ item: latteItem, option: temperatureOption, choice: wholeMilkChoice });
    assertEquals(errorResult, { error: `Choice ${wholeMilkChoice} does not belong to option ${temperatureOption}.` });
  });

  await t.step("allowChoice: should allow a previously disallowed choice", async () => {
    console.log("--- Test: allowChoice ---");
    console.log(`Allowing Cold choice for Americano's Temperature option`);
    const result = await menuConcept.allowChoice({ item: americanoItem, option: temperatureOption, choice: coldChoice });
    assertEquals(result, {}, "Allow should return empty object");

    const applicability = await menuConcept.applicabilities.findOne({ item: americanoItem, option: temperatureOption });
    assertFalse(applicability?.disallowedChoices.includes(coldChoice), "Cold choice should no longer be disallowed");
    console.log(`Cold choice is now allowed for Americano.`);
  });

  await t.step("allowChoice: should be idempotent and fail for non-existent applicability", async () => {
    console.log("--- Test: allowChoice (idempotency & invalid) ---");
    console.log(`Attempting to allow Cold choice for Americano again (should be no-op as it's already allowed)`);
    let result = await menuConcept.allowChoice({ item: americanoItem, option: temperatureOption, choice: coldChoice });
    assertEquals(result, {}, "Should be idempotent (return empty object)");

    console.log(`Attempting to allow choice for non-existent applicability`);
    let errorResult = await menuConcept.allowChoice({ item: teaItem, option: temperatureOption, choice: hotChoice });
    assertEquals(errorResult, { error: `Applicability for item ${teaItem} and option ${temperatureOption} not found.` });
  });

  await t.step("_optionsForItem: should return all options attached to an item", async () => {
    console.log("--- Query: _optionsForItem ---");
    const optionsForLatte = await menuConcept._optionsForItem({ item: latteItem });
    if ("error" in optionsForLatte) throw new Error(optionsForLatte.error);
    assertEquals(optionsForLatte.length, 2, "Latte should have 2 attached options");
    assertTrue(optionsForLatte.some(o => o.option.id === temperatureOption));
    assertTrue(optionsForLatte.some(o => o.option.id === milkOption));
    console.log(`Options for Latte: ${JSON.stringify(optionsForLatte.map(o => o.option.id))}`);

    const optionsForAmericano = await menuConcept._optionsForItem({ item: americanoItem });
    if ("error" in optionsForAmericano) throw new Error(optionsForAmericano.error);
    assertEquals(optionsForAmericano.length, 1, "Americano should have 1 attached option");
    assertTrue(optionsForAmericano.some(o => o.option.id === temperatureOption));
    console.log(`Options for Americano: ${JSON.stringify(optionsForAmericano.map(o => o.option.id))}`);

    const optionsForTea = await menuConcept._optionsForItem({ item: teaItem });
    if ("error" in optionsForTea) throw new Error(optionsForTea.error);
    assertEquals(optionsForTea.length, 0, "Tea should have 0 attached options");
    console.log(`Options for Tea: ${JSON.stringify(optionsForTea.map(o => o.option.id))}`);
  });

  await t.step("_optionsForItem: should return error for non-existent item", async () => {
    console.log("--- Query: _optionsForItem (invalid item) ---");
    const errorResult = await menuConcept._optionsForItem({ item: "nonExistentItem" as ID });
    assertEquals(errorResult, { error: "Item with ID nonExistentItem not found." });
  });

  await t.step("_choicesFor: should return available choices for an item-option pair", async () => {
    console.log("--- Query: _choicesFor ---");
    console.log(`Choices for Latte's Temperature option (Hot, Cold expected)`);
    const choicesForLatteTemp = await menuConcept._choicesFor({ item: latteItem, option: temperatureOption });
    if ("error" in choicesForLatteTemp) throw new Error(choicesForLatteTemp.error);
    assertEquals(choicesForLatteTemp.length, 2, "Should return Hot and Cold choices");
    assertTrue(choicesForLatteTemp.some(c => c.choice.id === hotChoice));
    assertTrue(choicesForLatteTemp.some(c => c.choice.id === coldChoice));
    console.log(`Choices: ${JSON.stringify(choicesForLatteTemp.map(c => c.choice.name))}`);

    // Disallow Hot for Latte's Temperature
    await menuConcept.disallowChoice({ item: latteItem, option: temperatureOption, choice: hotChoice });
    console.log(`Disallowed Hot for Latte's Temperature.`);
    const choicesForLatteTempAfterDisallow = await menuConcept._choicesFor({ item: latteItem, option: temperatureOption });
    if ("error" in choicesForLatteTempAfterDisallow) throw new Error(choicesForLatteTempAfterDisallow.error);
    assertEquals(choicesForLatteTempAfterDisallow.length, 1, "Should only return Cold choice after disallowing Hot");
    assertTrue(choicesForLatteTempAfterDisallow.some(c => c.choice.id === coldChoice));
    assertFalse(choicesForLatteTempAfterDisallow.some(c => c.choice.id === hotChoice));
    console.log(`Choices after disallow Hot: ${JSON.stringify(choicesForLatteTempAfterDisallow.map(c => c.choice.name))}`);

    await menuConcept.allowChoice({ item: latteItem, option: temperatureOption, choice: hotChoice }); // Reset for other tests
  });

  await t.step("_choicesFor: should return error for non-existent applicability", async () => {
    console.log("--- Query: _choicesFor (invalid applicability) ---");
    const errorResult = await menuConcept._choicesFor({ item: latteItem, option: sweetenerOption }); // Sweetener not attached to Latte
    assertEquals(errorResult, { error: `Applicability for item ${latteItem} and option ${sweetenerOption} not found.` });
  });

  await t.step("Principle: Operators attach options and disallowed choices correctly, POS shows right choices", async () => {
    console.log("\n--- Principle Test: Latte and Americano Configurations ---");

    // Trace: 1. Setup Latte
    console.log("1. Setting up Latte: Attached Temperature (required, 1 choice) and Milk (optional, 1 choice)");
    // _optionsForItem(latteItem) confirms this setup from previous tests.
    const latteOptionsResult = await menuConcept._optionsForItem({ item: latteItem });
    if ("error" in latteOptionsResult) throw new Error(latteOptionsResult.error);
    console.log(`Latte options: ${JSON.stringify(latteOptionsResult.map((o: any) => o.option.name))}`);
    assertEquals(latteOptionsResult.length, 2);
    assertTrue(latteOptionsResult.some((o: any) => o.option.id === temperatureOption && o.option.required && o.option.maxChoices === 1));
    assertTrue(latteOptionsResult.some((o: any) => o.option.id === milkOption && !o.option.required && o.option.maxChoices === 1));

    // Trace: 2. Setup Americano
    console.log("2. Setting up Americano: Attached Temperature (required, 1 choice)");
    // _optionsForItem(americanoItem) confirms this setup from previous tests.
    const americanoOptionsResult = await menuConcept._optionsForItem({ item: americanoItem });
    if ("error" in americanoOptionsResult) throw new Error(americanoOptionsResult.error);
    console.log(`Americano options: ${JSON.stringify(americanoOptionsResult.map((o: any) => o.option.name))}`);
    assertEquals(americanoOptionsResult.length, 1);
    assertTrue(americanoOptionsResult.some((o: any) => o.option.id === temperatureOption && o.option.required && o.option.maxChoices === 1));

    // Trace: 3. Disallow Cold for Americano (as stated in principle: "only temperature to Americano")
    // Let's re-disallow Cold choice for Americano for this specific trace to ensure the principle's exact state.
    await menuConcept.disallowChoice({ item: americanoItem, option: temperatureOption, choice: coldChoice });
    console.log("3. Disallowing Cold choice for Americano's Temperature (simulating 'only Hot')");
    const americanoTempChoices = await menuConcept._choicesFor({ item: americanoItem, option: temperatureOption });
    if ("error" in americanoTempChoices) throw new Error(americanoTempChoices.error);
    assertEquals(americanoTempChoices.length, 1);
    assertEquals(americanoTempChoices[0].choice.id, hotChoice);
    console.log(`Available Temperature choices for Americano: ${JSON.stringify(americanoTempChoices.map(c => c.choice.name))}`);

    // Trace: 4. Verify _isSelectionSetValid for Latte (valid selection)
    console.log("4. Verifying _isSelectionSetValid for Latte (Hot, Oat Milk)");
    let selectionsLatte1 = [{ option: temperatureOption, choice: hotChoice }, { option: milkOption, choice: oatMilkChoice }];
    let validationLatte1 = await menuConcept._isSelectionSetValid({ item: latteItem, selections: selectionsLatte1 });
    if ("error" in validationLatte1) throw new Error(validationLatte1.error);
    assertTrue(validationLatte1[0].ok, `Latte selection (Hot, Oat Milk) should be valid. Reason: ${validationLatte1[0].reason}`);
    console.log(`Latte selection (Hot, Oat Milk) is valid.`);

    // Trace: 5. Verifying _isSelectionSetValid for Latte (invalid: maxChoices=1 violation)
    console.log("5. Verifying _isSelectionSetValid for Latte (Hot, Cold - invalid, maxChoices=1)");
    let selectionsLatte2 = [{ option: temperatureOption, choice: hotChoice }, { option: temperatureOption, choice: coldChoice }];
    let validationLatte2 = await menuConcept._isSelectionSetValid({ item: latteItem, selections: selectionsLatte2 });
    if ("error" in validationLatte2) throw new Error(validationLatte2.error);
    assertFalse(validationLatte2[0].ok, "Latte selection (Hot, Cold) should be invalid (maxChoices violation)");
    assertEquals(validationLatte2[0].reason, `Option ${temperatureOption} exceeds its maximum allowed choices (1).`);
    console.log(`Latte selection (Hot, Cold) is invalid as expected: ${validationLatte2[0].reason}`);

    // Trace: 6. Verifying _isSelectionSetValid for Latte (invalid: missing required option)
    console.log("6. Verifying _isSelectionSetValid for Latte (missing required Temperature)");
    let selectionsLatte3 = [{ option: milkOption, choice: oatMilkChoice }];
    let validationLatte3 = await menuConcept._isSelectionSetValid({ item: latteItem, selections: selectionsLatte3 });
    if ("error" in validationLatte3) throw new Error(validationLatte3.error);
    assertFalse(validationLatte3[0].ok, "Latte selection (missing required Temperature) should be invalid");
    assertEquals(validationLatte3[0].reason, `Required option ${temperatureOption} is missing for item ${latteItem}.`);
    console.log(`Latte selection (missing Temperature) is invalid as expected: ${validationLatte3[0].reason}`);

    // Trace: 7. Verifying _isSelectionSetValid for Latte (invalid: disallowed choice)
    // Disallow whole milk for latte temporarily for this test
    await menuConcept.disallowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice });
    console.log("7. Temporarily disallowed Whole Milk for Latte's Milk option.");
    let selectionsLatte4 = [{ option: temperatureOption, choice: hotChoice }, { option: milkOption, choice: wholeMilkChoice }];
    let validationLatte4 = await menuConcept._isSelectionSetValid({ item: latteItem, selections: selectionsLatte4 });
    if ("error" in validationLatte4) throw new Error(validationLatte4.error);
    assertFalse(validationLatte4[0].ok, "Latte selection (disallowed Whole Milk) should be invalid");
    assertEquals(validationLatte4[0].reason, `Selected choice ${wholeMilkChoice} is disallowed for option ${milkOption} on item ${latteItem}.`);
    console.log(`Latte selection (disallowed Whole Milk) is invalid as expected: ${validationLatte4[0].reason}`);
    await menuConcept.allowChoice({ item: latteItem, option: milkOption, choice: wholeMilkChoice }); // Reset

    // Trace: 8. Verifying _isSelectionSetValid for Americano (valid selection)
    console.log("8. Verifying _isSelectionSetValid for Americano (Hot)");
    let selectionsAmericano1 = [{ option: temperatureOption, choice: hotChoice }];
    let validationAmericano1 = await menuConcept._isSelectionSetValid({ item: americanoItem, selections: selectionsAmericano1 });
    if ("error" in validationAmericano1) throw new Error(validationAmericano1.error);
    assertTrue(validationAmericano1[0].ok, `Americano selection (Hot) should be valid. Reason: ${validationAmericano1[0].reason}`);
    console.log(`Americano selection (Hot) is valid.`);

    // Trace: 9. Verifying _isSelectionSetValid for Americano (invalid: disallowed choice)
    console.log("9. Verifying _isSelectionSetValid for Americano (Cold - disallowed)");
    let selectionsAmericano2 = [{ option: temperatureOption, choice: coldChoice }];
    let validationAmericano2 = await menuConcept._isSelectionSetValid({ item: americanoItem, selections: selectionsAmericano2 });
    if ("error" in validationAmericano2) throw new Error(validationAmericano2.error);
    assertFalse(validationAmericano2[0].ok, "Americano selection (Cold) should be invalid (disallowed)");
    assertEquals(validationAmericano2[0].reason, `Selected choice ${coldChoice} is disallowed for option ${temperatureOption} on item ${americanoItem}.`);
    console.log(`Americano selection (Cold) is invalid as expected: ${validationAmericano2[0].reason}`);
  });

  await client.close();
});
```
