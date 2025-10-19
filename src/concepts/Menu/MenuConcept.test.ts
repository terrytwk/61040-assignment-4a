import { assertEquals, assertExists } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import MenuConcept from "./MenuConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("Menu Concept Principle and Actions", async (t) => {
  const [db, client] = await testDb();
  const menu = new MenuConcept(db);

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

  await t.step("Principle: Setup items and options", async () => {
    // Create Items
    const latteResult = await menu.createItem({ name: "Latte", description: "Classic espresso and steamed milk" });
    latteItem = latteResult.item;
    assertExists(latteItem, "Latte item ID should be returned");

    const americanoResult = await menu.createItem({ name: "Americano", description: "Espresso with hot water" });
    americanoItem = americanoResult.item;
    assertExists(americanoItem, "Americano item ID should be returned");

    console.log(`Created Items: Latte (${latteItem}), Americano (${americanoItem})`);

    // Create Options
    const tempResult = await menu.createOption({ name: "Temperature", required: true, maxChoices: 1 });
    if ('error' in tempResult) {
      throw new Error(`Failed to create Temperature option: ${tempResult.error}`);
    }
    assertExists(tempResult.option, "Option ID for Temperature should be returned");
    temperatureOption = tempResult.option;

    const milkResult = await menu.createOption({ name: "Milk", required: false, maxChoices: 1 });
    if ('error' in milkResult) {
      throw new Error(`Failed to create Milk option: ${milkResult.error}`);
    }
    assertExists(milkResult.option, "Option ID for Milk should be returned");
    milkOption = milkResult.option;

    const sweetenerResult = await menu.createOption({ name: "Sweetener", required: false, maxChoices: 1 });
    if ('error' in sweetenerResult) {
      throw new Error(`Failed to create Sweetener option: ${sweetenerResult.error}`);
    }
    assertExists(sweetenerResult.option, "Option ID for Sweetener should be returned");
    sweetenerOption = sweetenerResult.option;

    console.log(
      `Created Options: Temperature (${temperatureOption}), Milk (${milkOption}), Sweetener (${sweetenerOption})`,
    );

    // Create Choices
    const hotResult = await menu.createChoice({ option: temperatureOption, name: "Hot" });
    if ('error' in hotResult) {
      throw new Error(`Failed to create Hot choice: ${hotResult.error}`);
    }
    assertExists(hotResult.choice, "Choice ID for Hot should be returned");
    hotChoice = hotResult.choice;

    const coldResult = await menu.createChoice({ option: temperatureOption, name: "Cold" });
    if ('error' in coldResult) {
      throw new Error(`Failed to create Cold choice: ${coldResult.error}`);
    }
    assertExists(coldResult.choice, "Choice ID for Cold should be returned");
    coldChoice = coldResult.choice;

    const wholeMilkResult = await menu.createChoice({ option: milkOption, name: "Whole Milk" });
    if ('error' in wholeMilkResult) {
      throw new Error(`Failed to create Whole Milk choice: ${wholeMilkResult.error}`);
    }
    assertExists(wholeMilkResult.choice, "Choice ID for Whole Milk should be returned");
    wholeMilkChoice = wholeMilkResult.choice;

    const oatMilkResult = await menu.createChoice({ option: milkOption, name: "Oat Milk" });
    if ('error' in oatMilkResult) {
      throw new Error(`Failed to create Oat Milk choice: ${oatMilkResult.error}`);
    }
    assertExists(oatMilkResult.choice, "Choice ID for Oat Milk should be returned");
    oatMilkChoice = oatMilkResult.choice;

    const sugarResult = await menu.createChoice({ option: sweetenerOption, name: "Sugar" });
    if ('error' in sugarResult) {
      throw new Error(`Failed to create Sugar choice: ${sugarResult.error}`);
    }
    assertExists(sugarResult.choice, "Choice ID for Sugar should be returned");
    sugarChoice = sugarResult.choice;

    console.log(
      `Created Choices: Hot (${hotChoice}), Cold (${coldChoice}), Whole Milk (${wholeMilkChoice}), Oat Milk (${oatMilkChoice}), Sugar (${sugarChoice})`,
    );

    // Attach Options to Items
    await menu.attachOption({ item: latteItem, option: temperatureOption });
    await menu.attachOption({ item: latteItem, option: milkOption });
    await menu.attachOption({ item: latteItem, option: sweetenerOption });

    await menu.attachOption({ item: americanoItem, option: temperatureOption });

    console.log("Attached options to items.");

    // Principle: The POS shows the right choices and blocks disallowed combos.
    // Example: Latte with Hot/Cold and Whole/Oat milk. Americano only with Hot/Cold.
    const choicesForLatteTemp = await menu._choicesFor({ item: latteItem, option: temperatureOption });
    if ('error' in choicesForLatteTemp) {
      throw new Error(`Failed to get choices for Latte Temperature: ${choicesForLatteTemp.error}`);
    }
    assertEquals(choicesForLatteTemp.length, 2, "Latte should have 2 temperature choices");
    assertEquals(
      choicesForLatteTemp.map((c) => c.choice.id).sort(),
      [coldChoice, hotChoice].sort(),
      "Latte temperature choices should be Hot and Cold",
    );

    const choicesForLatteMilk = await menu._choicesFor({ item: latteItem, option: milkOption });
    if ('error' in choicesForLatteMilk) {
      throw new Error(`Failed to get choices for Latte Milk: ${choicesForLatteMilk.error}`);
    }
    assertEquals(choicesForLatteMilk.length, 2, "Latte should have 2 milk choices");
    assertEquals(
      choicesForLatteMilk.map((c) => c.choice.id).sort(),
      [wholeMilkChoice, oatMilkChoice].sort(),
      "Latte milk choices should be Whole Milk and Oat Milk",
    );

    const choicesForAmericanoTemp = await menu._choicesFor({ item: americanoItem, option: temperatureOption });
    if ('error' in choicesForAmericanoTemp) {
      throw new Error(`Failed to get choices for Americano Temperature: ${choicesForAmericanoTemp.error}`);
    }
    assertEquals(choicesForAmericanoTemp.length, 2, "Americano should have 2 temperature choices");
    assertEquals(
      choicesForAmericanoTemp.map((c) => c.choice.id).sort(),
      [coldChoice, hotChoice].sort(),
      "Americano temperature choices should be Hot and Cold",
    );

    // Verify that _choicesFor Americano for milk returns an error as it's not attached
    const choicesForAmericanoMilk = await menu._choicesFor({ item: americanoItem, option: milkOption });
    if (!('error' in choicesForAmericanoMilk)) {
      throw new Error("Expected error when querying choices for unattached option, but got success.");
    }
    assertExists(choicesForAmericanoMilk.error, "Querying choices for unattached option should return an error.");
    console.log(`Verified that Americano does not have milk options (error: ${choicesForAmericanoMilk.error})`);

    // Test _isSelectionSetValid for principle
    // Valid Latte selection: Hot temperature, Whole Milk
    let validLatteSelections = [{ option: temperatureOption, choice: hotChoice }, { option: milkOption, choice: wholeMilkChoice }];
    let validationResult = await menu._isSelectionSetValid({ item: latteItem, selections: validLatteSelections });
    if ('error' in validationResult) {
      throw new Error(`Validation failed with unexpected error: ${validationResult.error}`);
    }
    assertEquals(validationResult.length, 1);
    assertEquals(validationResult[0].ok, true, "Valid Latte selection should be OK");
    console.log("Verified valid Latte selection.");

    // Invalid Latte selection: Missing required Temperature
    const invalidLatteSelectionsMissingRequired: { option: ID; choice: ID }[] = [{ option: milkOption, choice: wholeMilkChoice }];
    validationResult = await menu._isSelectionSetValid({ item: latteItem, selections: invalidLatteSelectionsMissingRequired });
    if ('error' in validationResult) {
      throw new Error(`Validation failed with unexpected error: ${validationResult.error}`);
    }
    assertEquals(validationResult.length, 1);
    assertEquals(validationResult[0].ok, false, "Invalid Latte selection (missing required) should not be OK");
    assertExists(validationResult[0].reason, "Reason for invalid selection should be provided");
    console.log("Verified invalid Latte selection (missing required).");

    // Invalid Latte selection: Too many choices for Temperature (maxChoices=1)
    const invalidLatteSelectionsTooManyChoices = [{ option: temperatureOption, choice: hotChoice }, {
      option: temperatureOption,
      choice: coldChoice,
    }];
    validationResult = await menu._isSelectionSetValid({ item: latteItem, selections: invalidLatteSelectionsTooManyChoices });
    if ('error' in validationResult) {
      throw new Error(`Validation failed with unexpected error: ${validationResult.error}`);
    }
    assertEquals(validationResult.length, 1);
    assertEquals(validationResult[0].ok, false, "Invalid Latte selection (too many choices) should not be OK");
    assertExists(validationResult[0].reason, "Reason for invalid selection should be provided");
    console.log("Verified invalid Latte selection (too many choices).");

    // Invalid Americano selection: Has milk option (not attached)
    const invalidAmericanoSelections = [{ option: temperatureOption, choice: hotChoice }, { option: milkOption, choice: wholeMilkChoice }];
    validationResult = await menu._isSelectionSetValid({ item: americanoItem, selections: invalidAmericanoSelections });
    if ('error' in validationResult) {
      throw new Error(`Validation failed with unexpected error: ${validationResult.error}`);
    }
    assertEquals(validationResult.length, 1);
    assertEquals(validationResult[0].ok, false, "Invalid Americano selection (unattached option) should not be OK");
    assertExists(validationResult[0].reason, "Reason for invalid selection should be provided");
    console.log("Verified invalid Americano selection (unattached option).");
  });

  await t.step("Action: createItem", async () => {
    const itemResult = await menu.createItem({ name: "Coffee", description: "Black coffee" });
    assertExists(itemResult.item, "Item ID should be returned");
    const coffeeItem = itemResult.item;

    const options = await menu._optionsForItem({ item: coffeeItem });
    if ('error' in options) {
      throw new Error(`Failed to get options for Coffee: ${options.error}`);
    }
    assertEquals(options.length, 0, "New item should have no options initially");
    console.log(`Created Coffee item (${coffeeItem}) and verified no initial options.`);
  });

  await t.step("Action: setItemActive", async () => {
    const itemResult = await menu.createItem({ name: "Tea", description: "Hot water and tea bag" });
    const teaItem = itemResult.item;
    assertExists(teaItem, "Tea item should be created");

    const setInactiveResult = await menu.setItemActive({ item: teaItem, isActive: false });
    if ('error' in setInactiveResult) {
      throw new Error(`Failed to set Tea item inactive: ${setInactiveResult.error}`);
    }
    assertEquals(setInactiveResult, {}, "setItemActive should return empty object on success");

    // Try to set a non-existent item active
    const nonExistentId = "nonExistentItem" as ID;
    const errorResult = await menu.setItemActive({ item: nonExistentId, isActive: true });
    if (!('error' in errorResult)) { // Expecting an error
      throw new Error("Expected error for non-existent item, but got success.");
    }
    assertExists(errorResult.error, "Setting active for non-existent item should return an error");
    console.log("Verified setItemActive functionality including error case.");
  });

  await t.step("Action: createOption", async () => {
    const optionResult = await menu.createOption({ name: "Size", required: true, maxChoices: 1 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Size option: ${optionResult.error}`);
    }
    assertExists(optionResult.option, "Option ID should be returned");
    const sizeOption = optionResult.option;

    const invalidOptionResult = await menu.createOption({ name: "Invalid", required: false, maxChoices: 0 });
    if (!('error' in invalidOptionResult)) {
      throw new Error("Expected error for maxChoices < 1, but got success.");
    }
    assertExists(invalidOptionResult.error, "Creating option with maxChoices < 1 should return an error");
    console.log("Verified createOption functionality including error case for maxChoices.");
  });

  await t.step("Action: createChoice", async () => {
    const optionResult = await menu.createOption({ name: "Cup", required: false, maxChoices: 1 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Cup option: ${optionResult.error}`);
    }
    const cupOption = optionResult.option;

    const choiceResult = await menu.createChoice({ option: cupOption, name: "Small" });
    if ('error' in choiceResult) {
      throw new Error(`Failed to create Small choice: ${choiceResult.error}`);
    }
    assertExists(choiceResult.choice, "Choice ID should be returned");
    // const smallChoice = choiceResult.choice; // not used, so commented out

    const nonExistentOptionId = "nonExistentOption" as ID;
    const errorResult = await menu.createChoice({ option: nonExistentOptionId, name: "Large" });
    if (!('error' in errorResult)) {
      throw new Error("Expected error for non-existent option, but got success.");
    }
    assertExists(errorResult.error, "Creating choice for non-existent option should return an error");
    console.log("Verified createChoice functionality including error case.");
  });

  await t.step("Action: attachOption", async () => {
    const itemResult = await menu.createItem({ name: "Burger", description: "Grilled patty" });
    const burgerItem = itemResult.item;
    const optionResult = await menu.createOption({ name: "Cheese", required: false, maxChoices: 1 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Cheese option: ${optionResult.error}`);
    }
    const cheeseOption = optionResult.option;

    const attachResult = await menu.attachOption({ item: burgerItem, option: cheeseOption });
    if ('error' in attachResult) {
      throw new Error(`Failed to attach option: ${attachResult.error}`);
    }
    assertEquals(attachResult, {}, "attachOption should return empty object on success");

    // Verify attachment
    const optionsForBurger = await menu._optionsForItem({ item: burgerItem });
    if ('error' in optionsForBurger) {
      throw new Error(`Failed to get options for Burger: ${optionsForBurger.error}`);
    }
    assertEquals(optionsForBurger.length, 1, "Burger should have 1 option attached");
    assertEquals(optionsForBurger[0].option.id, cheeseOption, "Attached option should be Cheese");

    // Try to attach again
    const reAttachResult = await menu.attachOption({ item: burgerItem, option: cheeseOption });
    if (!('error' in reAttachResult)) {
      throw new Error("Expected error for re-attaching option, but got success.");
    }
    assertExists(reAttachResult.error, "Re-attaching an option should return an error");

    // Attach to non-existent item/option
    const nonExistentItemId = "nonExistentItem2" as ID;
    const errorResultItem = await menu.attachOption({ item: nonExistentItemId, option: cheeseOption });
    if (!('error' in errorResultItem)) {
      throw new Error("Expected error for attaching to non-existent item, but got success.");
    }
    assertExists(errorResultItem.error, "Attaching to non-existent item should return an error");

    const nonExistentOptionId = "nonExistentOption2" as ID;
    const errorResultOption = await menu.attachOption({ item: burgerItem, option: nonExistentOptionId });
    if (!('error' in errorResultOption)) {
      throw new Error("Expected error for attaching non-existent option, but got success.");
    }
    assertExists(errorResultOption.error, "Attaching non-existent option should return an error");

    console.log("Verified attachOption functionality.");
  });

  await t.step("Action: detachOption", async () => {
    const itemResult = await menu.createItem({ name: "Fries", description: "Fried potatoes" });
    const friesItem = itemResult.item;
    const optionResult = await menu.createOption({ name: "Salt", required: false, maxChoices: 1 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Salt option: ${optionResult.error}`);
    }
    const saltOption = optionResult.option;

    await menu.attachOption({ item: friesItem, option: saltOption }); // Assume success from previous test

    const detachResult = await menu.detachOption({ item: friesItem, option: saltOption });
    if ('error' in detachResult) {
      throw new Error(`Failed to detach option: ${detachResult.error}`);
    }
    assertEquals(detachResult, {}, "detachOption should return empty object on success");

    const optionsForFries = await menu._optionsForItem({ item: friesItem });
    if ('error' in optionsForFries) {
      throw new Error(`Failed to get options for Fries after detach: ${optionsForFries.error}`);
    }
    assertEquals(optionsForFries.length, 0, "Fries should have no options after detach");

    // Try to detach non-existent applicability
    const errorResult = await menu.detachOption({ item: friesItem, option: saltOption });
    if (!('error' in errorResult)) {
      throw new Error("Expected error for detaching non-existent applicability, but got success.");
    }
    assertExists(errorResult.error, "Detaching non-existent applicability should return an error");

    console.log("Verified detachOption functionality.");
  });

  await t.step("Action: disallowChoice and allowChoice", async () => {
    const itemResult = await menu.createItem({ name: "Soup", description: "Warm liquid dish" });
    const soupItem = itemResult.item;
    const optionResult = await menu.createOption({ name: "Topping", required: false, maxChoices: 3 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Topping option: ${optionResult.error}`);
    }
    const toppingOption = optionResult.option;

    const croutonResult = await menu.createChoice({ option: toppingOption, name: "Croutons" });
    if ('error' in croutonResult) {
      throw new Error(`Failed to create Croutons choice: ${croutonResult.error}`);
    }
    const croutonChoice = croutonResult.choice;

    const cheeseResult = await menu.createChoice({ option: toppingOption, name: "Shredded Cheese" });
    if ('error' in cheeseResult) {
      throw new Error(`Failed to create Shredded Cheese choice: ${cheeseResult.error}`);
    }
    const cheeseChoice = cheeseResult.choice;

    await menu.attachOption({ item: soupItem, option: toppingOption });

    // Disallow crouton choice
    const disallowResult = await menu.disallowChoice({ item: soupItem, option: toppingOption, choice: croutonChoice });
    if ('error' in disallowResult) {
      throw new Error(`Failed to disallow choice: ${disallowResult.error}`);
    }
    assertEquals(disallowResult, {}, "disallowChoice should return empty object on success");

    let choicesForSoup = await menu._choicesFor({ item: soupItem, option: toppingOption });
    if ('error' in choicesForSoup) {
      throw new Error(`Failed to get choices for Soup: ${choicesForSoup.error}`);
    }
    assertEquals(choicesForSoup.length, 1, "Soup should have 1 choice after disallowing Croutons");
    assertEquals(choicesForSoup[0].choice.id, cheeseChoice, "Remaining choice should be Shredded Cheese");

    // Test _isSelectionSetValid with disallowed choice
    const invalidSelections = [{ option: toppingOption, choice: croutonChoice }];
    let validationResult = await menu._isSelectionSetValid({ item: soupItem, selections: invalidSelections });
    if ('error' in validationResult) {
      throw new Error(`Validation failed with unexpected error: ${validationResult.error}`);
    }
    assertEquals(validationResult.length, 1);
    assertEquals(validationResult[0].ok, false, "Selecting disallowed choice should be invalid");
    assertExists(validationResult[0].reason, "Reason for invalid selection should be provided");
    console.log("Verified disallowChoice and validation with disallowed choices.");

    // Allow crouton choice again
    const allowResult = await menu.allowChoice({ item: soupItem, option: toppingOption, choice: croutonChoice });
    if ('error' in allowResult) {
      throw new Error(`Failed to allow choice: ${allowResult.error}`);
    }
    assertEquals(allowResult, {}, "allowChoice should return empty object on success");

    choicesForSoup = await menu._choicesFor({ item: soupItem, option: toppingOption });
    if ('error' in choicesForSoup) {
      throw new Error(`Failed to get choices for Soup after allowing: ${choicesForSoup.error}`);
    }
    assertEquals(choicesForSoup.length, 2, "Soup should have 2 choices after allowing Croutons");
    assertEquals(
      choicesForSoup.map((c) => c.choice.id).sort(),
      [croutonChoice, cheeseChoice].sort(),
      "Choices should be Croutons and Shredded Cheese",
    );

    // Test disallowing/allowing a choice that does not belong to the option
    const anotherItemResult = await menu.createItem({ name: "Salad", description: "Fresh greens" });
    const saladItem = anotherItemResult.item;
    const anotherOptionResult = await menu.createOption({ name: "Dressing", required: false, maxChoices: 1 });
    if ('error' in anotherOptionResult) {
      throw new Error(`Failed to create Dressing option: ${anotherOptionResult.error}`);
    }
    const dressingOption = anotherOptionResult.option;
    const ranchResult = await menu.createChoice({ option: dressingOption, name: "Ranch" });
    if ('error' in ranchResult) {
      throw new Error(`Failed to create Ranch choice: ${ranchResult.error}`);
    }
    const ranchChoice = ranchResult.choice;

    await menu.attachOption({ item: soupItem, option: dressingOption }); // Attach dressing to soup
    const disallowWrongChoiceResult = await menu.disallowChoice({ item: soupItem, option: toppingOption, choice: ranchChoice });
    if (!('error' in disallowWrongChoiceResult)) {
      throw new Error("Expected error when disallowing a choice that doesn't belong to the option, but got success.");
    }
    assertExists(disallowWrongChoiceResult.error, "Disallowing choice from wrong option should error");
    console.log("Verified error when disallowing choice from wrong option.");

    console.log("Verified disallowChoice and allowChoice functionality.");
  });

  await t.step("Query: _optionsForItem", async () => {
    const itemResult = await menu.createItem({ name: "Sandwich", description: "Bread and fillings" });
    const sandwichItem = itemResult.item;
    const optionResult1 = await menu.createOption({ name: "Bread", required: true, maxChoices: 1 });
    if ('error' in optionResult1) {
      throw new Error(`Failed to create Bread option: ${optionResult1.error}`);
    }
    const breadOption = optionResult1.option;
    const optionResult2 = await menu.createOption({ name: "Meat", required: false, maxChoices: 1 });
    if ('error' in optionResult2) {
      throw new Error(`Failed to create Meat option: ${optionResult2.error}`);
    }
    const meatOption = optionResult2.option;

    await menu.attachOption({ item: sandwichItem, option: breadOption });
    await menu.attachOption({ item: sandwichItem, option: meatOption });

    const options = await menu._optionsForItem({ item: sandwichItem });
    if ('error' in options) {
      throw new Error(`Failed to get options for Sandwich: ${options.error}`);
    }
    assertEquals(options.length, 2, "Sandwich should have 2 options");
    const optionIds = options.map((o) => o.option.id).sort();
    assertEquals(optionIds, [breadOption, meatOption].sort(), "Returned options should match attached ones");
    assertEquals(options.find(o => o.option.id === breadOption)?.option.required, true);
    assertEquals(options.find(o => o.option.id === breadOption)?.option.maxChoices, 1);

    const nonExistentId = "nonExistentItem3" as ID;
    const errorResult = await menu._optionsForItem({ item: nonExistentId });
    if (!('error' in errorResult)) {
      throw new Error("Expected error for non-existent item, but got success.");
    }
    assertExists(errorResult.error, "Querying options for non-existent item should return an error");

    console.log("Verified _optionsForItem functionality.");
  });

  await t.step("Query: _choicesFor", async () => {
    // This was already implicitly tested in the principle and disallow/allowChoice steps.
    // Adding an explicit edge case: query choices for an option not attached to the item.
    const itemResult = await menu.createItem({ name: "Juice", description: "Fruit drink" });
    const juiceItem = itemResult.item;
    const optionResult = await menu.createOption({ name: "Flavor", required: true, maxChoices: 1 });
    if ('error' in optionResult) {
      throw new Error(`Failed to create Flavor option: ${optionResult.error}`);
    }
    // const flavorOption = optionResult.option; // not used
    const appleResult = await menu.createChoice({ option: optionResult.option, name: "Apple" });
    if ('error' in appleResult) {
      throw new Error(`Failed to create Apple choice: ${appleResult.error}`);
    }
    const appleChoice = appleResult.choice;

    // Do NOT attach flavorOption to juiceItem
    const errorResult = await menu._choicesFor({ item: juiceItem, option: optionResult.option });
    if (!('error' in errorResult)) {
      throw new Error("Expected error for querying choices for unattached option, but got success.");
    }
    assertExists(errorResult.error, "Querying choices for unattached option should return an error");
    console.log("Verified _choicesFor returns error for unattached options.");
  });

  await t.step("Query: _isSelectionSetValid - comprehensive checks", async () => {
    // Reuse latteItem, temperatureOption, hotChoice, milkOption, wholeMilkChoice
    // (from principle setup)

    // Valid:
    let selections = [
      { option: temperatureOption, choice: hotChoice },
      { option: milkOption, choice: wholeMilkChoice },
    ];
    let result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, true, "Valid selections should pass.");

    // Invalid: Unattached option
    const unattachedOptionResult = await menu.createOption({ name: "Foo", required: false, maxChoices: 1 });
    if ('error' in unattachedOptionResult) {
      throw new Error(`Failed to create Foo option: ${unattachedOptionResult.error}`);
    }
    const unattachedOption = unattachedOptionResult.option;
    const fooChoiceResult = await menu.createChoice({ option: unattachedOption, name: "Bar" });
    if ('error' in fooChoiceResult) {
      throw new Error(`Failed to create Bar choice: ${fooChoiceResult.error}`);
    }
    const fooChoice = fooChoiceResult.choice;

    selections = [
      { option: temperatureOption, choice: hotChoice },
      { option: unattachedOption, choice: fooChoice },
    ];
    result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, false, "Selections with unattached option should fail.");
    assertEquals(result[0].reason, `Option ${unattachedOption} is not attached to item ${latteItem}.`);

    // Invalid: Choice not belonging to option
    selections = [
      { option: temperatureOption, choice: wholeMilkChoice }, // wholeMilkChoice belongs to milkOption, not temperatureOption
    ];
    result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, false, "Selections with choice not belonging to option should fail.");
    assertEquals(result[0].reason, `Choice ${wholeMilkChoice} does not belong to option ${temperatureOption}.`);

    // Invalid: Missing required option
    selections = [
      { option: milkOption, choice: wholeMilkChoice }, // temperatureOption is required and missing
    ];
    result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, false, "Selections missing required option should fail.");
    assertEquals(result[0].reason, `Required option ${temperatureOption} is missing for item ${latteItem}.`);

    // Invalid: Exceeds maxChoices
    selections = [
      { option: temperatureOption, choice: hotChoice },
      { option: temperatureOption, choice: coldChoice }, // maxChoices for temperatureOption is 1
    ];
    result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, false, "Selections exceeding maxChoices should fail.");
    assertEquals(result[0].reason, `Option ${temperatureOption} exceeds its maximum allowed choices (1).`);

    // Invalid: Disallowed choice (re-using disallow from earlier step, but re-run for consistency)
    await menu.disallowChoice({ item: latteItem, option: milkOption, choice: oatMilkChoice });
    selections = [
      { option: temperatureOption, choice: hotChoice },
      { option: milkOption, choice: oatMilkChoice }, // oatMilkChoice is now disallowed
    ];
    result = await menu._isSelectionSetValid({ item: latteItem, selections });
    if ('error' in result) {
      throw new Error(`Validation failed unexpectedly: ${result.error}`);
    }
    assertEquals(result[0].ok, false, "Selections with disallowed choice should fail.");
    assertEquals(result[0].reason, `Choice ${oatMilkChoice} is disallowed for option ${milkOption} on item ${latteItem}.`);
    await menu.allowChoice({ item: latteItem, option: milkOption, choice: oatMilkChoice }); // Clean up

    // Invalid: Non-existent item
    const nonExistentItem = "nonExistentItem4" as ID;
    const errorResult = await menu._isSelectionSetValid({ item: nonExistentItem, selections: [] });
    if (!('error' in errorResult)) {
      throw new Error("Expected error for non-existent item in validation, but got success.");
    }
    assertExists(errorResult.error, "Validation for non-existent item should return an error.");
    assertEquals(errorResult.error, `Item with ID ${nonExistentItem} not found.`);

    console.log("Verified _isSelectionSetValid with comprehensive checks.");
  });

  await client.close();
});