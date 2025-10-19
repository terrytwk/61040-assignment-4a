---
timestamp: 'Sat Oct 18 2025 19:50:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_195002.cfc252f0.md]]'
content_id: e64fb55d69be630810bde2e41ca1806aa53be554534225b981bb2de3ea103e1b
---

# response:

```typescript
// file: src/concepts/MenuConcept.ts
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * @concept Menu
 * @purpose Define items and their configurable options/choices (no pricing).
 * @principle Operators attach **temperature** (required, maxChoices=1) and **milk** (optional, maxChoices=1)
 *            to **Latte**; only **temperature** to **Americano**. The POS shows the right choices
 *            and blocks disallowed combos.
 */
const PREFIX = "Menu" + ".";

// Generic types of this concept
type Item = ID;
type Option = ID;
type Choice = ID;

/**
 * a set of Items with
 * – name String
 * – description String
 * – isActive Boolean
 */
interface ItemDoc {
  _id: Item;
  name: string;
  description: string;
  isActive: boolean;
}

/**
 * a set of Options with
 * – name String
 * – required Boolean
 * – maxChoices Number (≥1)
 */
interface OptionDoc {
  _id: Option;
  name: string;
  required: boolean;
  maxChoices: number;
}

/**
 * a set of Choices with
 * – option Option
 * – name String
 * – isActive Boolean
 */
interface ChoiceDoc {
  _id: Choice;
  option: Option; // Foreign key to OptionDoc
  name: string;
  isActive: boolean;
}

/**
 * a set of Applicabilities with
 * – item Item
 * – option Option
 * – disallowedChoices Set<Choice>
 */
interface ApplicabilityDoc {
  _id: ID; // Unique ID for this applicability record
  item: Item; // Foreign key to ItemDoc
  option: Option; // Foreign key to OptionDoc
  disallowedChoices: Choice[];
}

export default class MenuConcept {
  items: Collection<ItemDoc>;
  options: Collection<OptionDoc>;
  choices: Collection<ChoiceDoc>;
  applicabilities: Collection<ApplicabilityDoc>;

  constructor(private readonly db: Db) {
    this.items = this.db.collection(PREFIX + "items");
    this.options = this.db.collection(PREFIX + "options");
    this.choices = this.db.collection(PREFIX + "choices");
    this.applicabilities = this.db.collection(PREFIX + "applicabilities");
  }

  /**
   * createItem (name: String, description: String) : (item: Item)
   *
   * **requires** true
   *
   * **effects** creates active item
   */
  async createItem({ name, description }: { name: string; description: string }): Promise<{ item: Item }> {
    const newItemId = freshID();
    const newItem: ItemDoc = {
      _id: newItemId,
      name,
      description,
      isActive: true,
    };
    await this.items.insertOne(newItem);
    return { item: newItemId };
  }

  /**
   * setItemActive (item: Item, isActive: Boolean) : ( )
   *
   * **requires** item exists
   *
   * **effects** sets isActive
   */
  async setItemActive({ item, isActive }: { item: Item; isActive: boolean }): Promise<Empty | { error: string }> {
    const res = await this.items.updateOne(
      { _id: item },
      { $set: { isActive: isActive } },
    );
    if (res.matchedCount === 0) {
      return { error: `Item with ID ${item} not found.` };
    }
    return {};
  }

  /**
   * createOption (name: String, required: Boolean, maxChoices: Number) : (option: Option)
   *
   * **requires** maxChoices ≥ 1
   *
   * **effects** creates option
   */
  async createOption({ name, required, maxChoices }: {
    name: string;
    required: boolean;
    maxChoices: number;
  }): Promise<{ option: Option } | { error: string }> {
    if (maxChoices < 1) {
      return { error: "maxChoices must be greater than or equal to 1." };
    }
    const newOptionId = freshID();
    const newOption: OptionDoc = {
      _id: newOptionId,
      name,
      required,
      maxChoices,
    };
    await this.options.insertOne(newOption);
    return { option: newOptionId };
  }

  /**
   * createChoice (option: Option, name: String) : (choice: Choice)
   *
   * **requires** option exists
   *
   * **effects** creates active choice under option
   */
  async createChoice({ option, name }: { option: Option; name: string }): Promise<{ choice: Choice } | { error: string }> {
    const optionExists = await this.options.findOne({ _id: option });
    if (!optionExists) {
      return { error: `Option with ID ${option} not found.` };
    }

    const newChoiceId = freshID();
    const newChoice: ChoiceDoc = {
      _id: newChoiceId,
      option,
      name,
      isActive: true,
    };
    await this.choices.insertOne(newChoice);
    return { choice: newChoiceId };
  }

  /**
   * attachOption (item: Item, option: Option) : ( )
   *
   * **requires** item and option exist and not already attached
   *
   * **effects** adds Applicability(item, option) with empty disallowedChoices
   */
  async attachOption({ item, option }: { item: Item; option: Option }): Promise<Empty | { error: string }> {
    const itemExists = await this.items.findOne({ _id: item });
    if (!itemExists) return { error: `Item with ID ${item} not found.` };
    const optionExists = await this.options.findOne({ _id: option });
    if (!optionExists) return { error: `Option with ID ${option} not found.` };

    const existingApplicability = await this.applicabilities.findOne({ item, option });
    if (existingApplicability) {
      return { error: `Option ${option} is already attached to item ${item}.` };
    }

    const newApplicabilityId = freshID();
    const newApplicability: ApplicabilityDoc = {
      _id: newApplicabilityId,
      item,
      option,
      disallowedChoices: [],
    };
    await this.applicabilities.insertOne(newApplicability);
    return {};
  }

  /**
   * detachOption (item: Item, option: Option) : ( )
   *
   * **requires** Applicability(item, option) exists
   *
   * **effects** removes it
   */
  async detachOption({ item, option }: { item: Item; option: Option }): Promise<Empty | { error: string }> {
    const res = await this.applicabilities.deleteOne({ item, option });
    if (res.deletedCount === 0) {
      return { error: `Applicability for item ${item} and option ${option} not found.` };
    }
    return {};
  }

  /**
   * disallowChoice (item: Item, option: Option, choice: Choice) : ( )
   *
   * **requires** Applicability(item, option) exists and choice belongs to option
   *
   * **effects** adds choice to disallowedChoices
   */
  async disallowChoice({ item, option, choice }: { item: Item; option: Option; choice: Choice }): Promise<Empty | { error: string }> {
    const applicability = await this.applicabilities.findOne({ item, option });
    if (!applicability) {
      return { error: `Applicability for item ${item} and option ${option} not found.` };
    }

    const choiceDoc = await this.choices.findOne({ _id: choice, option: option });
    if (!choiceDoc) {
      return { error: `Choice ${choice} does not belong to option ${option}.` };
    }

    // Check if choice is already disallowed (optimization / idempotency)
    if (applicability.disallowedChoices.includes(choice)) {
      // It's already disallowed, consider it a successful no-op
      return {};
    }

    await this.applicabilities.updateOne(
      { _id: applicability._id },
      { $addToSet: { disallowedChoices: choice } }, // $addToSet ensures no duplicates
    );
    return {};
  }

  /**
   * allowChoice (item: Item, option: Option, choice: Choice) : ( )
   *
   * **requires** choice currently disallowed for Applicability(item, option)
   *
   * **effects** removes from disallowedChoices
   */
  async allowChoice({ item, option, choice }: { item: Item; option: Option; choice: Choice }): Promise<Empty | { error: string }> {
    const applicability = await this.applicabilities.findOne({ item, option });
    if (!applicability) {
      return { error: `Applicability for item ${item} and option ${option} not found.` };
    }

    // Check if choice is actually disallowed
    if (!applicability.disallowedChoices.includes(choice)) {
      // It's not disallowed, consider it a successful no-op
      return {};
    }

    await this.applicabilities.updateOne(
      { _id: applicability._id },
      { $pull: { disallowedChoices: choice } },
    );
    return {};
  }

  /**
   * _optionsForItem (item: Item) : (option: {id: Option, required: Boolean, maxChoices: Number})
   *
   * **requires** item exists
   *
   * **effects** returns attached options
   */
  async _optionsForItem({ item }: { item: Item }): Promise<{ option: { id: Option; required: boolean; maxChoices: number } }[] | { error: string }> {
    const itemExists = await this.items.findOne({ _id: item });
    if (!itemExists) {
      return { error: `Item with ID ${item} not found.` };
    }

    const applicabilities = await this.applicabilities.find({ item }).toArray();
    const optionIds = applicabilities.map(app => app.option);

    const options = await this.options.find({ _id: { $in: optionIds } }).toArray();

    return options.map(opt => ({
      option: {
        id: opt._id,
        required: opt.required,
        maxChoices: opt.maxChoices,
      },
    }));
  }

  /**
   * _choicesFor (item: Item, option: Option) : (choice: {id: Choice, name: String})
   *
   * **requires** Applicability(item, option) exists
   *
   * **effects** returns active choices excluding disallowedChoices
   */
  async _choicesFor({ item, option }: { item: Item; option: Option }): Promise<{ choice: { id: Choice; name: string } }[] | { error: string }> {
    const applicability = await this.applicabilities.findOne({ item, option });
    if (!applicability) {
      return { error: `Applicability for item ${item} and option ${option} not found.` };
    }

    const disallowedChoices = applicability.disallowedChoices;

    const choices = await this.choices.find({
      option: option,
      isActive: true,
      _id: { $nin: disallowedChoices },
    }).toArray();

    return choices.map(ch => ({
      choice: {
        id: ch._id,
        name: ch.name,
      },
    }));
  }

  /**
   * _isSelectionSetValid (item: Item, selections: {option: Option, choice: Choice}[]) : (ok: Boolean, reason: String)
   *
   * **requires** item exists
   *
   * **effects** true iff each selected option is attached to item; each choice belongs to its option and is not disallowed; all attached required options are present; per-option maxChoices respected
   */
  async _isSelectionSetValid({ item, selections }: {
    item: Item;
    selections: { option: Option; choice: Choice }[];
  }): Promise<{ ok: boolean; reason?: string }[] | { error: string }> {
    const itemDoc = await this.items.findOne({ _id: item });
    if (!itemDoc) {
      // This is a prerequisite failure, not a validation result
      return { error: `Item with ID ${item} not found.` };
    }

    const attachedApplicabilities = await this.applicabilities.find({ item }).toArray();
    const attachedOptionIds = new Set(attachedApplicabilities.map(app => app.option));

    // Fetch all relevant options and choices for validation
    const allOptionIdsInvolved = Array.from(new Set([
      ...attachedOptionIds,
      ...selections.map(s => s.option),
    ]));
    const allChoiceIdsInvolved = selections.map(s => s.choice);

    const [
      involvedOptions,
      involvedChoices,
    ] = await Promise.all([
      this.options.find({ _id: { $in: allOptionIdsInvolved } }).toArray(),
      this.choices.find({ _id: { $in: allChoiceIdsInvolved } }).toArray(),
    ]);

    const optionMap = new Map<Option, OptionDoc>(involvedOptions.map(o => [o._id, o]));
    const choiceMap = new Map<Choice, ChoiceDoc>(involvedChoices.map(c => [c._id, c]));
    const applicabilityMap = new Map<Option, ApplicabilityDoc>(attachedApplicabilities.map(app => [app.option, app]));

    // Group selections by option to easily count choices per option
    const selectionsByOption = new Map<Option, Choice[]>();
    for (const selection of selections) {
      const { option, choice } = selection;
      if (!selectionsByOption.has(option)) {
        selectionsByOption.set(option, []);
      }
      selectionsByOption.get(option)!.push(choice);
    }

    // 1. Validate each selected choice
    for (const selection of selections) {
      const { option, choice } = selection;

      // Check if selected option is attached to item
      if (!attachedOptionIds.has(option)) {
        return [{ ok: false, reason: `Option ${option} is not attached to item ${item}.` }];
      }

      // Check if choice belongs to its option, is active, and is not disallowed
      const choiceDoc = choiceMap.get(choice);
      if (!choiceDoc || choiceDoc.option !== option) {
        return [{ ok: false, reason: `Choice ${choice} does not belong to option ${option}.` }];
      }
      if (!choiceDoc.isActive) {
        return [{ ok: false, reason: `Choice ${choice} is not active.` }];
      }

      const applicability = applicabilityMap.get(option);
      if (applicability && applicability.disallowedChoices.includes(choice)) {
        return [{ ok: false, reason: `Choice ${choice} is disallowed for option ${option} on item ${item}.` }];
      }
    }

    // 2. Check all attached required options are present
    for (const applicability of attachedApplicabilities) {
      const optionDoc = optionMap.get(applicability.option);
      if (optionDoc?.required && !selectionsByOption.has(applicability.option)) {
        return [{ ok: false, reason: `Required option ${applicability.option} is missing for item ${item}.` }];
      }
    }

    // 3. Check per-option maxChoices respected
    for (const [option, selectedChoices] of selectionsByOption.entries()) {
      const optionDoc = optionMap.get(option);
      if (optionDoc && selectedChoices.length > optionDoc.maxChoices) {
        return [{ ok: false, reason: `Option ${option} exceeds its maximum allowed choices (${optionDoc.maxChoices}).` }];
      }
    }

    return [{ ok: true }];
  }
}
```
